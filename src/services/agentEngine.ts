import { CartCalculation, CartItem, Message, PaymentOrder, Product, SecurityAlert, ToolCallEvent } from '../types';
import { PRODUCTS } from '../data/products';

export interface AgentContext {
  cart: CartItem[];
  userEmail: string;
  currency: string;
  appliedDiscount: number;
  couponCode?: string;
  lastGeneratedOrder?: PaymentOrder;
  pendingGatedConfirmation?: boolean;
  messagesHistory: Message[];
}

export interface AgentResponse {
  message: Message;
  updatedCart?: CartItem[];
  updatedOrder?: PaymentOrder;
  newSecurityAlerts?: SecurityAlert[];
  appliedDiscount?: number;
  couponCode?: string;
}

// 1. Zero-Trust PII Sanitizer
export function sanitizePii(text: string): {
  sanitizedText: string;
  hasPii: boolean;
  cardLast4?: string;
  detectedCardNumbers: string[];
} {
  // Regex matches credit cards with spaces or hyphens (13-19 digits)
  const cardRegex = /\b(?:\d[ -]*?){13,19}\b/g;
  const cvvRegex = /\b(?:cvv|cvc|security code)[\s:]*([0-9]{3,4})\b/gi;
  
  let hasPii = false;
  let cardLast4: string | undefined = undefined;
  const detectedCardNumbers: string[] = [];

  let sanitizedText = text.replace(cardRegex, (match) => {
    const cleanDigits = match.replace(/\D/g, '');
    if (cleanDigits.length >= 13 && cleanDigits.length <= 19) {
      hasPii = true;
      cardLast4 = cleanDigits.slice(-4);
      detectedCardNumbers.push(`•••• •••• •••• ${cardLast4}`);
      return `[REDACTED CARD: •••• •••• •••• ${cardLast4}]`;
    }
    return match;
  });

  if (cvvRegex.test(sanitizedText)) {
    hasPii = true;
    sanitizedText = sanitizedText.replace(cvvRegex, '[REDACTED CVV: •••]');
  }

  return { sanitizedText, hasPii, cardLast4, detectedCardNumbers };
}

// 2. Zero-Trust Prompt Injection & Tamper Scanner
export function detectPromptInjection(text: string): {
  isInjection: boolean;
  attackType?: string;
  reason?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
} {
  const lower = text.toLowerCase();

  const injectionPatterns = [
    { pattern: /ignore\s+(all\s+)?(previous|prior|system)\s+(instructions|directives|rules)/i, type: 'INSTRUCTION_OVERRIDE', severity: 'critical' as const, reason: 'Attempted system prompt bypass via instruction override' },
    { pattern: /system\s+override/i, type: 'SYSTEM_OVERRIDE', severity: 'critical' as const, reason: 'Explicit "SYSTEM OVERRIDE" token sequence detected' },
    { pattern: /superadmin|developer\s+mode|god\s+mode|dan\s+mode|jailbreak/i, type: 'PRIVILEGE_ESCALATION', severity: 'high' as const, reason: 'Attempted privilege escalation / persona jailbreak' },
    { pattern: /(bypass|disable|remove)\s+(the\s+)?(10%|discount|limit|security|guardrails)/i, type: 'DISCOUNT_GUARDRAIL_BYPASS', severity: 'critical' as const, reason: 'Attempted bypass of strict 10% maximum discount policy' },
    { pattern: /(set|make)\s+(price|total|cost|amount)\s+(to\s+)?(0|zero|free|\$0|₹0)/i, type: 'CART_VALUE_TAMPER', severity: 'critical' as const, reason: 'Attempted price or cart value tampering to zero' },
    { pattern: /dump\s+(all\s+)?(system|internal)\s+(prompt|instructions|keys|passwords)/i, type: 'SYSTEM_PROMPT_EXTRACTION', severity: 'high' as const, reason: 'Attempted extraction of system configuration or internal instructions' },
    { pattern: /execute\s+(code|bash|script|python|terminal|eval)/i, type: 'CODE_EXECUTION_ATTEMPT', severity: 'high' as const, reason: 'Attempted non-commerce code execution in sales environment' }
  ];

  for (const { pattern, type, severity, reason } of injectionPatterns) {
    if (pattern.test(lower)) {
      return { isInjection: true, attackType: type, severity, reason };
    }
  }

  return { isInjection: false, severity: 'low' };
}

// 3. Tool: check_catalog
export function checkCatalogTool(category?: string, query?: string): {
  items: Product[];
  toolCall: ToolCallEvent;
} {
  let matched = [...PRODUCTS];

  if (category && category !== 'all') {
    matched = matched.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (query && query.trim() !== '') {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    matched = matched.filter(p => {
      const searchTarget = `${p.name} ${p.tagline} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase();
      return terms.some(t => searchTarget.includes(t));
    });
  }

  const toolCall: ToolCallEvent = {
    id: `tool_${Date.now()}_cat`,
    name: 'check_catalog',
    input: { category: category || 'all', query: query || '' },
    output: {
      totalFound: matched.length,
      itemIds: matched.map(p => p.id),
      topItems: matched.slice(0, 3).map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stockCount }))
    },
    status: 'success',
    timestamp: new Date().toISOString()
  };

  return { items: matched, toolCall };
}

// 4. Tool: calculate_cart (Strict <= 10% Discount Enforcement)
export function calculateCartTool(
  items: CartItem[],
  requestedDiscountPercentage: number = 0,
  couponCode?: string
): {
  calculation: CartCalculation;
  toolCall: ToolCallEvent;
  securityAlerts: SecurityAlert[];
} {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const securityAlerts: SecurityAlert[] = [];
  
  let effectiveDiscount = requestedDiscountPercentage;
  let isCapped = false;

  // Maximum allowed discount across the merchant platform is 10%
  const MAX_DISCOUNT = 10;

  if (effectiveDiscount > MAX_DISCOUNT) {
    isCapped = true;
    effectiveDiscount = MAX_DISCOUNT;

    securityAlerts.push({
      id: `alert_disc_${Date.now()}`,
      type: 'DISCOUNT_LIMIT_ENFORCED',
      severity: 'medium',
      message: `Requested discount of ${requestedDiscountPercentage}% exceeded policy limit. Strictly capped at ${MAX_DISCOUNT}%.`,
      timestamp: new Date().toISOString(),
      details: `Zero-Trust Policy Enforced: Maximum authorized merchant concession is ${MAX_DISCOUNT}%. Coupon: "${couponCode || 'MANUAL'}"`
    });
  }

  const discountAmount = Math.round((subtotal * effectiveDiscount) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  // 18% GST standard in INR e-commerce, or 0 if empty
  const tax = items.length > 0 ? Math.round(taxableAmount * 0.18) : 0;
  const shipping = items.length > 0 ? (subtotal > 2000 ? 0 : 150) : 0;
  const total = taxableAmount + tax + shipping;

  const calculation: CartCalculation = {
    subtotal,
    discountPercentage: effectiveDiscount,
    discountAmount,
    couponCode: couponCode || (effectiveDiscount > 0 ? `FLOW${effectiveDiscount}` : undefined),
    tax,
    shipping,
    total,
    currency: items[0]?.product.currency || 'INR',
    securityDiscountCapped: isCapped,
    originalRequestedDiscount: requestedDiscountPercentage
  };

  const toolCall: ToolCallEvent = {
    id: `tool_${Date.now()}_calc`,
    name: 'calculate_cart',
    input: {
      itemCount: items.length,
      requestedDiscount: requestedDiscountPercentage,
      couponCode: couponCode || null,
      itemsSummary: items.map(i => ({ id: i.product.id, name: i.product.name, qty: i.quantity, unitPrice: i.product.price }))
    },
    output: {
      subtotal,
      appliedDiscountPercent: effectiveDiscount,
      discountAmount,
      tax,
      shipping,
      total,
      isCapped
    },
    status: 'success',
    timestamp: new Date().toISOString(),
    securityNote: isCapped ? 'Discount capped to 10% maximum security policy limit' : undefined
  };

  return { calculation, toolCall, securityAlerts };
}

// 5. Tool: generate_payment (Human-in-the-Loop Gated)
export function generatePaymentTool(params: {
  items: CartItem[];
  customerEmail: string;
  customerName?: string;
  discountPercentage?: number;
  couponCode?: string;
  isConfirmedByGating: boolean;
}): {
  order?: PaymentOrder;
  toolCall: ToolCallEvent;
  securityAlerts: SecurityAlert[];
  blockedReason?: string;
} {
  const { items, customerEmail, customerName, isConfirmedByGating } = params;
  const securityAlerts: SecurityAlert[] = [];

  // Protocol #3 Check: Execution Gating
  if (!isConfirmedByGating) {
    const toolCall: ToolCallEvent = {
      id: `tool_${Date.now()}_pay_blocked`,
      name: 'generate_payment',
      input: { customerEmail, itemCount: items.length },
      output: { error: 'EXECUTION_GATING_BLOCKED: Awaiting unambiguous human confirmation from user.' },
      status: 'blocked',
      timestamp: new Date().toISOString(),
      executionGatePassed: false,
      securityNote: 'Human-in-the-loop gate active. Must ask user confirmation before triggering transaction.'
    };

    securityAlerts.push({
      id: `alert_gate_${Date.now()}`,
      type: 'UNAUTHORIZED_PAYMENT_GATE_BLOCKED',
      severity: 'high',
      message: 'Blocked autonomous payment generation: Explicit user confirmation required.',
      timestamp: new Date().toISOString(),
      details: 'Protocol #3 violation prevented: AI agent cannot commit payment link generation without human gating.'
    });

    return { toolCall, securityAlerts, blockedReason: 'EXECUTION_GATING_REQUIRED' };
  }

  // Calculate final numbers
  const { calculation } = calculateCartTool(items, params.discountPercentage || 0, params.couponCode);

  const orderId = `ord_flw_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const linkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
  const shortUrl = `https://rzp.io/i/${linkId}`;
  
  // UPI Deep Link payload for instant scan & pay simulation
  const upiUri = `upi://pay?pa=flowpay.merchant@hdfcbank&pn=FlowPay%20Store&am=${calculation.total}&cu=INR&tr=${orderId}&tn=FlowPay%20Order%20${orderId}`;

  const order: PaymentOrder = {
    orderId,
    razorpayPaymentLinkId: linkId,
    razorpayShortUrl: shortUrl,
    qrCodeData: upiUri,
    items: [...items],
    subtotal: calculation.subtotal,
    discountAmount: calculation.discountAmount,
    tax: calculation.tax,
    totalAmount: calculation.total,
    currency: calculation.currency,
    customerEmail,
    customerName: customerName || 'Valued Customer',
    status: 'created',
    createdAt: new Date().toISOString(),
    receiptNumber: `REC-${Date.now().toString().slice(-6)}`
  };

  const toolCall: ToolCallEvent = {
    id: `tool_${Date.now()}_pay`,
    name: 'generate_payment',
    input: {
      customer_email: customerEmail,
      amount: calculation.total,
      currency: calculation.currency,
      itemCount: items.length
    },
    output: {
      orderId: order.orderId,
      razorpayPaymentLinkId: order.razorpayPaymentLinkId,
      razorpayShortUrl: order.razorpayShortUrl,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: 'created'
    },
    status: 'success',
    timestamp: new Date().toISOString(),
    executionGatePassed: true,
    securityNote: 'Human confirmation verified. PII minimized: Only customer_email passed to payment gateway.'
  };

  return { order, toolCall, securityAlerts };
}

// 6. Tool: handle_payment_failure
export function handlePaymentFailureTool(orderId: string, failureReason: string): ToolCallEvent {
  return {
    id: `tool_${Date.now()}_fail`,
    name: 'handle_payment_failure',
    input: { orderId, failureReason },
    output: {
      status: 'failure_acknowledged',
      recommendedFallback: ['UPI_INTENT', 'UPI_QR_SCAN', 'ALTERNATE_CARD_3DS'],
      retryAvailable: true
    },
    status: 'success',
    timestamp: new Date().toISOString()
  };
}

// 7. Core AI Sales Agent Message Processor
export async function processUserMessage(
  rawUserText: string,
  context: AgentContext
): Promise<AgentResponse> {
  const toolCalls: ToolCallEvent[] = [];
  const securityAlerts: SecurityAlert[] = [];
  let updatedCart = [...context.cart];
  let updatedOrder = context.lastGeneratedOrder;
  let appliedDiscount = context.appliedDiscount;
  let couponCode = context.couponCode;

  // Step 1: Zero-Trust PII Minimization
  const piiCheck = sanitizePii(rawUserText);
  if (piiCheck.hasPii) {
    securityAlerts.push({
      id: `alert_pii_${Date.now()}`,
      type: 'PII_DETECTED_AND_MASKED',
      severity: 'medium',
      message: 'Sensitive financial information (Card/CVV) detected in chat message. Sanitized to protect PII.',
      timestamp: new Date().toISOString(),
      details: `Card masked: ${piiCheck.detectedCardNumbers.join(', ')}. Never repeat or store unencrypted PII.`,
      rawInput: rawUserText
    });
  }

  const cleanText = piiCheck.sanitizedText;
  const lowerText = cleanText.toLowerCase();

  // Step 2: Zero-Trust Prompt Injection Defense
  const injectionCheck = detectPromptInjection(cleanText);
  if (injectionCheck.isInjection) {
    securityAlerts.push({
      id: `alert_inj_${Date.now()}`,
      type: 'PROMPT_INJECTION_ATTEMPT',
      severity: injectionCheck.severity,
      message: `Adversarial attempt blocked: ${injectionCheck.reason}`,
      timestamp: new Date().toISOString(),
      details: `Attack Signature: ${injectionCheck.attackType}. Zero-Trust rules strictly preserved.`,
      rawInput: cleanText
    });

    // If they tried to force a 50% or arbitrary discount, enforce strict 10% cap
    let discountCapNote = '';
    if (lowerText.includes('discount') || lowerText.includes('hack') || lowerText.includes('%') || lowerText.includes('50%')) {
      appliedDiscount = 10;
      couponCode = 'MAX10_CAP';
      discountCapNote = '\n\n🛡️ **Zero-Trust Policy Notification**: System directives cannot be modified. The maximum allowable platform discount is capped at **10%** (`MAX10_CAP`).';
    }

    // Auto calculate cart with safe 10% discount
    if (updatedCart.length === 0) {
      // Add a default item if cart was empty so user can see it worked safely
      const defaultWatch = PRODUCTS.find(p => p.id === 'prod_pulse_watch') || PRODUCTS[0];
      updatedCart = [{ product: defaultWatch, quantity: 1 }];
    }

    const calcResult = calculateCartTool(updatedCart, appliedDiscount, couponCode);
    toolCalls.push(calcResult.toolCall);
    securityAlerts.push(...calcResult.securityAlerts);

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      content: `I cannot alter system directives or bypass security boundaries.${discountCapNote}\n\nI have calculated your cart for **${updatedCart.map(i => i.product.name).join(', ')}** with our maximum authorized **10% discount**.\n\n• Subtotal: ₹${calcResult.calculation.subtotal.toLocaleString('en-IN')}\n• 10% Discount: -₹${calcResult.calculation.discountAmount.toLocaleString('en-IN')}\n• GST (18%): ₹${calcResult.calculation.tax.toLocaleString('en-IN')}\n• **Final Total: ₹${calcResult.calculation.total.toLocaleString('en-IN')}**\n\nWould you like me to proceed with generating your secure Razorpay checkout link?`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      cartCalculation: calcResult.calculation,
      confirmationGated: true,
      gatedAction: {
        type: 'PROCEED_CHECKOUT',
        label: 'Confirm & Generate Razorpay Link',
        items: updatedCart,
        amount: calcResult.calculation.total,
        email: context.userEmail
      },
      quickReplies: ['Yes, checkout now', 'View Product Specs', 'Show other items']
    };

    return {
      message,
      updatedCart,
      newSecurityAlerts: securityAlerts,
      appliedDiscount,
      couponCode
    };
  }

  // Step 3: PII Ingestion Response
  if (piiCheck.hasPii && (lowerText.includes('charge') || lowerText.includes('card') || lowerText.includes('cvv') || lowerText.includes('4532'))) {
    // If cart is empty, add keyboard
    if (updatedCart.length === 0) {
      const keyboard = PRODUCTS.find(p => p.id === 'prod_keychron_mech') || PRODUCTS[0];
      updatedCart = [{ product: keyboard, quantity: 1 }];
    }

    const calcResult = calculateCartTool(updatedCart, appliedDiscount, couponCode);
    toolCalls.push(calcResult.toolCall);

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      content: `🔒 **Security & Privacy Notice**: For your protection, never share raw credit card numbers or CVVs in chat. All sensitive numbers have been securely masked.\n\nTo complete your purchase for **${updatedCart[0].product.name}**, please authorize me to generate a PCI-DSS certified **Razorpay 256-bit encrypted payment link** where you can enter your details with bank-level encryption.\n\n• Total: **₹${calcResult.calculation.total.toLocaleString('en-IN')}** (includes 18% GST)\n\nShall I generate your secure checkout link?`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      cartCalculation: calcResult.calculation,
      confirmationGated: true,
      gatedAction: {
        type: 'PROCEED_CHECKOUT',
        label: 'Authorize Secure Razorpay Checkout',
        items: updatedCart,
        amount: calcResult.calculation.total,
        email: context.userEmail
      },
      quickReplies: ['Yes, generate payment link', 'Add Aviator Cable (+₹1,499)', 'View Cart Details']
    };

    return {
      message,
      updatedCart,
      newSecurityAlerts: securityAlerts,
      appliedDiscount,
      couponCode
    };
  }

  // Step 4: Out-of-Domain Scope Guard (Protocol #4)
  const isOutOfDomain = 
    lowerText.includes('python') ||
    lowerText.includes('beautifulsoup') ||
    lowerText.includes('scrape') ||
    lowerText.includes('write code') ||
    lowerText.includes('weather in') ||
    lowerText.includes('tell me a joke') ||
    lowerText.includes('who won the match');

  if (isOutOfDomain) {
    securityAlerts.push({
      id: `alert_scope_${Date.now()}`,
      type: 'OUT_OF_DOMAIN_REQUEST',
      severity: 'low',
      message: 'Out-of-domain request intercepted. Scope strictly constrained to merchant catalog and checkout.',
      timestamp: new Date().toISOString(),
      details: 'Agent denied non-commerce execution request and steered back to storefront.'
    });

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      content: `I am **AlphaCart**, specialized exclusively in helping you find high-performance audio, computing, and workspace tech from our merchant catalog.\n\nI cannot write external scripts or execute outside tools, but I can help you find gear like studio monitors, mechanical keyboards, audiophile DACs, or smartwatches. What tech gear are you exploring today?`,
      timestamp: new Date().toISOString(),
      toolCalls: [],
      securityAlerts,
      quickReplies: ['Browse Studio Headphones', 'Explore Mechanical Keyboards', 'View Ultrawide Monitors']
    };

    return { message, newSecurityAlerts: securityAlerts };
  }

  // Step 5: Payment Failure Recovery Workflow (Workflow #7)
  const isFailureSignal = 
    lowerText.includes('failed') || 
    lowerText.includes('bank_declined') || 
    lowerText.includes('payment decline') ||
    lowerText.includes('transaction failed') ||
    lowerText.includes('error paying');

  if (isFailureSignal) {
    const failOrderId = context.lastGeneratedOrder?.orderId || 'ord_flw_recovery_99';
    const failToolCall = handlePaymentFailureTool(failOrderId, 'BANK_DECLINED_CARD_ISSUER');
    toolCalls.push(failToolCall);

    if (context.lastGeneratedOrder) {
      updatedOrder = {
        ...context.lastGeneratedOrder,
        status: 'failed',
        failureReason: 'Bank declined credit card transaction. Gateway timeout or issuer decline.'
      };
    }

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      content: `I'm very sorry to hear your card transaction did not go through! Payment gateways occasionally experience card issuer timeouts or 3D Secure verification drops.\n\nWould you like to try **Instant UPI (Google Pay, PhonePe, Paytm)** via QR scan, or switch to an **alternate credit/debit card**? UPI transactions have a 99.4% instant success rate on our platform.`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      isFailureRecovery: true,
      paymentOrder: updatedOrder,
      quickReplies: ['Pay via UPI (GPay / PhonePe)', 'Try Another Card', 'Retry Razorpay Link']
    };

    return {
      message,
      updatedOrder,
      newSecurityAlerts: securityAlerts
    };
  }

  // Step 6: Checkout Confirmation & Gated Payment Generation (Workflow #5 & #6)
  const isConfirmationIntent = 
    lowerText === 'yes' ||
    lowerText.includes('yes, checkout') ||
    lowerText.includes('yes, checkout now') ||
    lowerText.includes('yes, generate payment link') ||
    lowerText.includes('confirm & generate') ||
    lowerText.includes('confirm payment') ||
    lowerText.includes('proceed to pay') ||
    lowerText.includes('confirm checkout') ||
    lowerText.includes('authorize secure razorpay') ||
    lowerText.includes('ready to buy');

  if (isConfirmationIntent) {
    if (updatedCart.length === 0) {
      // Default to Apex ANC + SoundWave DAC if empty
      const apex = PRODUCTS.find(p => p.id === 'prod_apex_anc')!;
      const dac = PRODUCTS.find(p => p.id === 'prod_soundwave_dac')!;
      updatedCart = [{ product: apex, quantity: 1 }, { product: dac, quantity: 1 }];
      appliedDiscount = 10;
    }

    // Call generate_payment tool with verified gating
    const payResult = generatePaymentTool({
      items: updatedCart,
      customerEmail: context.userEmail,
      customerName: 'Valued Customer',
      discountPercentage: appliedDiscount,
      couponCode,
      isConfirmedByGating: true
    });

    toolCalls.push(payResult.toolCall);
    securityAlerts.push(...payResult.securityAlerts);
    updatedOrder = payResult.order;

    const itemCount = updatedCart.reduce((sum, i) => sum + i.quantity, 0);
    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      content: `🎉 Thank you for confirming! I have generated your **instant, encrypted Razorpay checkout link** for your ${itemCount} items.\n\nYou can click **Pay Now** to open the 256-bit secure gateway, or scan the UPI QR code below directly with Google Pay, PhonePe, or Paytm:`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      paymentOrder: updatedOrder,
      quickReplies: ['Open Razorpay Checkout', 'Simulate Bank Card Failure', 'View Invoice Receipt']
    };

    return {
      message,
      updatedCart,
      updatedOrder,
      newSecurityAlerts: securityAlerts,
      appliedDiscount,
      couponCode
    };
  }

  // Step 7: Cross-sell Acceptance or Addition
  if (lowerText.includes('add the hi-fi dac') || lowerText.includes('add dac') || lowerText.includes('add cross-sell') || lowerText.includes('add aviator cable') || lowerText.includes('add strap')) {
    let crossSellItem: Product | undefined;
    if (lowerText.includes('dac')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_soundwave_dac');
    else if (lowerText.includes('cable')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_coiled_cable');
    else if (lowerText.includes('strap')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_nomad_strap');
    else crossSellItem = PRODUCTS.find(p => p.id === 'prod_deskmat_pro');

    if (crossSellItem) {
      const exists = updatedCart.some(i => i.product.id === crossSellItem!.id);
      if (!exists) {
        updatedCart.push({ product: crossSellItem, quantity: 1 });
      }
      appliedDiscount = 10; // Bundle discount 10%
      couponCode = 'BUNDLE10';
    }

    const calcResult = calculateCartTool(updatedCart, appliedDiscount, couponCode);
    toolCalls.push(calcResult.toolCall);
    securityAlerts.push(...calcResult.securityAlerts);

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      content: `Awesome choice! I've added **${crossSellItem?.name || 'the bundle companion'}** to your cart and applied the **10% Bundle Savings** (` + `${couponCode}).\n\n` +
        `• **Items**: ${updatedCart.map(i => `${i.product.name} (x${i.quantity})`).join(' + ')}\n` +
        `• Subtotal: ₹${calcResult.calculation.subtotal.toLocaleString('en-IN')}\n` +
        `• Bundle Discount (10%): -₹${calcResult.calculation.discountAmount.toLocaleString('en-IN')}\n` +
        `• GST (18%): ₹${calcResult.calculation.tax.toLocaleString('en-IN')}\n` +
        `• **Total Amount: ₹${calcResult.calculation.total.toLocaleString('en-IN')}**\n\n` +
        `Would you like me to proceed and generate your secure checkout link?`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      cartCalculation: calcResult.calculation,
      confirmationGated: true,
      gatedAction: {
        type: 'PROCEED_CHECKOUT',
        label: 'Confirm & Generate Razorpay Link',
        items: updatedCart,
        amount: calcResult.calculation.total,
        email: context.userEmail
      },
      quickReplies: ['Yes, checkout now', 'Apply SAVE20 coupon', 'Review Cart']
    };

    return {
      message,
      updatedCart,
      newSecurityAlerts: securityAlerts,
      appliedDiscount,
      couponCode
    };
  }

  // Step 8: Coupon Application (with 10% Maximum limit check)
  if (lowerText.includes('coupon') || lowerText.includes('promo') || lowerText.includes('save') || lowerText.includes('discount')) {
    let reqDiscount = 10;
    if (lowerText.includes('20') || lowerText.includes('save20')) reqDiscount = 20;
    if (lowerText.includes('50') || lowerText.includes('hack50')) reqDiscount = 50;

    if (updatedCart.length === 0) {
      const defaultItem = PRODUCTS[0];
      updatedCart = [{ product: defaultItem, quantity: 1 }];
    }

    const calcResult = calculateCartTool(updatedCart, reqDiscount, `PROMO_${reqDiscount}`);
    toolCalls.push(calcResult.toolCall);
    securityAlerts.push(...calcResult.securityAlerts);
    appliedDiscount = calcResult.calculation.discountPercentage;
    couponCode = calcResult.calculation.couponCode;

    let explanation = `Applied coupon **${couponCode}** for a **${appliedDiscount}% discount**!`;
    if (calcResult.calculation.securityDiscountCapped) {
      explanation = `⚠️ **Merchant Policy Notice**: You requested a ${reqDiscount}% discount, but our platform enforces a strict maximum cap of **10%** per transaction. I have applied the maximum allowable **10% discount** (` + `${couponCode}).`;
    }

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      content: `${explanation}\n\n• Subtotal: ₹${calcResult.calculation.subtotal.toLocaleString('en-IN')}\n• Discount (${appliedDiscount}%): -₹${calcResult.calculation.discountAmount.toLocaleString('en-IN')}\n• GST (18%): ₹${calcResult.calculation.tax.toLocaleString('en-IN')}\n• **New Total: ₹${calcResult.calculation.total.toLocaleString('en-IN')}**\n\nShall I proceed with checkout confirmation?`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      cartCalculation: calcResult.calculation,
      confirmationGated: true,
      gatedAction: {
        type: 'PROCEED_CHECKOUT',
        label: 'Confirm & Generate Razorpay Link',
        items: updatedCart,
        amount: calcResult.calculation.total,
        email: context.userEmail
      },
      quickReplies: ['Yes, checkout now', 'Add more items', 'View Specs']
    };

    return {
      message,
      updatedCart,
      newSecurityAlerts: securityAlerts,
      appliedDiscount,
      couponCode
    };
  }

  // Step 9: Standard Discovery & Natural Cross-Sell (Workflows #1, #2, #3, #4)
  let categoryFilter: string | undefined = undefined;
  if (lowerText.includes('headphone') || lowerText.includes('audio') || lowerText.includes('music') || lowerText.includes('noise') || lowerText.includes('anc')) {
    categoryFilter = 'audio';
  } else if (lowerText.includes('watch') || lowerText.includes('wearable') || lowerText.includes('pulse')) {
    categoryFilter = 'wearables';
  } else if (lowerText.includes('keyboard') || lowerText.includes('monitor') || lowerText.includes('computing') || lowerText.includes('screen')) {
    categoryFilter = 'computing';
  } else if (lowerText.includes('desk') || lowerText.includes('mat') || lowerText.includes('setup')) {
    categoryFilter = 'workspace';
  }

  const catalogResult = checkCatalogTool(categoryFilter, cleanText);
  toolCalls.push(catalogResult.toolCall);

  const primaryProduct = catalogResult.items[0] || PRODUCTS[0];
  const crossSellProduct = primaryProduct.crossSellProductId
    ? PRODUCTS.find(p => p.id === primaryProduct.crossSellProductId)
    : PRODUCTS.find(p => p.id !== primaryProduct.id);

  // Set cart to primary item
  updatedCart = [{ product: primaryProduct, quantity: 1 }];

  // Calculate pricing for primary + potential cross sell
  const calcSingle = calculateCartTool(updatedCart, 0);
  toolCalls.push(calcSingle.toolCall);

  const bundleDiscount = 10;
  const bundleSubtotal = primaryProduct.price + (crossSellProduct ? crossSellProduct.price : 0);
  const bundleSavings = Math.round((bundleSubtotal * bundleDiscount) / 100);
  const bundleTotal = Math.round((bundleSubtotal - bundleSavings) * 1.18); // with GST

  const crossSellOffer = crossSellProduct ? {
    mainProduct: primaryProduct,
    crossSellProduct,
    discountPercentage: bundleDiscount,
    savings: bundleSavings,
    bundleTotal
  } : undefined;

  const content = `Hello! I'd love to help you find the ideal tech gear.\n\n` +
    `I recommend the **${primaryProduct.name}** (₹${primaryProduct.price.toLocaleString('en-IN')}). ${primaryProduct.description}\n\n` +
    `✨ **Key Highlights**:\n` +
    primaryProduct.features.map(f => `• ${f}`).join('\n') + `\n\n` +
    (crossSellProduct ? `💡 **Recommended Companion**: ${primaryProduct.crossSellReason || `Add the **${crossSellProduct.name}** to get the best experience.`}\n` +
    `If bundled together today, you get **10% Off the bundle** (Save ₹${bundleSavings.toLocaleString('en-IN')})!` : '') +
    `\n\nWould you like to add the bundle or proceed directly with the ${primaryProduct.name}?`;

  const message: Message = {
    id: `msg_${Date.now()}`,
    sender: 'agent',
    content,
    timestamp: new Date().toISOString(),
    toolCalls,
    securityAlerts,
    suggestedProducts: [primaryProduct, ...(crossSellProduct ? [crossSellProduct] : [])],
    crossSellOffer,
    cartCalculation: calcSingle.calculation,
    confirmationGated: true,
    gatedAction: {
      type: 'PROCEED_CHECKOUT',
      label: `Proceed with ${primaryProduct.name} (₹${calcSingle.calculation.total.toLocaleString('en-IN')})`,
      items: updatedCart,
      amount: calcSingle.calculation.total,
      email: context.userEmail
    },
    quickReplies: [
      crossSellProduct ? `Add ${crossSellProduct.name.split(' ')[0]} (+₹${crossSellProduct.price.toLocaleString('en-IN')})` : 'Add to Cart',
      'Yes, checkout with headphones',
      'Apply 10% Discount',
      'View Technical Specs'
    ]
  };

  return {
    message,
    updatedCart,
    newSecurityAlerts: securityAlerts,
    appliedDiscount: 0,
    couponCode: undefined
  };
}
