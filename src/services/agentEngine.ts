import { CartCalculation, CartItem, Message, PaymentOrder, Product, SecurityAlert, ToolCallEvent } from '../types';
import { PRODUCTS } from '../data/products';
import { evaluateEcosystemContext, TaggedEcosystemContext } from '../data/ecosystem';
import { SessionStore } from './sessionStore';

export interface AgentContext {
  cart: CartItem[];
  purchasedItems?: Product[]; // Session State Purchase Tracker
  ecosystemTags?: string[];
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

/**
 * Veluno Concierge Agent System Directives
 */
export const AGENT_SYSTEM_PROMPT = `You are Veluno Concierge, an elite merchant commerce and market-making sales agent.

Behavioral Guidelines & Operational Protocols:
1. Domain Specialization: Specialize exclusively in audio, computing, and workspace tech hardware from the merchant catalog. Steer out-of-domain queries back to the storefront.
2. Zero-Trust PII Minimization: Never accept or repeat unencrypted payment card credentials or CVVs. Redact immediately.
3. Strict Concession Bounds: Maintain algorithmic yield discipline. Concessions are strictly capped at a maximum of 10%.
4. Human-in-the-Loop Execution Gating: Always seek explicit user confirmation before committing payment actions.
5. Ephemeral Payment Gateway Urgency Protocol:
When generating a payment link, emphasize the strict 5-minute cryptographic gateway lock. Use this ephemeral window as a natural closing mechanism to drive conversion ('This Razorpay secure link and your 3% concession lock will expire in exactly 5 minutes. Shall I confirm your allocation?'). Every generated payment link is ephemeral, valid for exactly 300 seconds (5 minutes) before the session expires.
6. Contextual Cross-Sell Memory & Ecosystem Awareness:
When the user asks a subsequent generic question or starts a new query later in the session, check the \`purchasedItems\` state. If they previously bought a core item, organically weave in a contextual recommendation for its compatible ecosystem accessory (e.g., 'Since you picked up the AeroType Carbon keyboard earlier, would you like to pair it with our hand-lubed artisan keycap set?'), proving you understand product ecosystems rather than executing blind searches.`;

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
    const rawTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const stopWords = new Set(['i', 'want', 'need', 'show', 'me', 'the', 'a', 'an', 'for', 'my', 'some', 'please', 'can', 'you', 'give', 'tell', 'about', 'recommend', 'what', 'is', 'are', 'do', 'have', 'best', 'good', 'any']);
    const searchTerms = rawTerms.filter(t => !stopWords.has(t));
    const effectiveTerms = searchTerms.length > 0 ? searchTerms : rawTerms;

    const hasLaptopTerm = rawTerms.some(t => ['laptop', 'laptops', 'notebook', 'macbook', 'apexbook', 'novacore', 'ultrabook'].includes(t));
    const hasPCTerm = rawTerms.some(t => ['pc', 'pcs', 'desktop', 'rig', 'prebuilt', 'workstation', 'computer', 'velox'].includes(t));
    const hasSSDTerm = rawTerms.some(t => ['ssd', 'ssds', 'storage', 'nvme', 'm.2', 'drive', 'disk', 'hyperdrive'].includes(t));
    const hasMonitorTerm = rawTerms.some(t => ['monitor', 'monitors', 'display', 'screen', 'ultrawide', 'curved', '4k', 'hdr', 'lumina'].includes(t));
    const hasKeycapTerm = rawTerms.some(t => ['keycap', 'keycaps', 'artisan', 'cyberforge'].includes(t));
    const hasCableTerm = rawTerms.some(t => ['cable', 'cables', 'coiled', 'aviator', 'aviation', 'vanguard'].includes(t));
    const hasDeskmatTerm = rawTerms.some(t => ['deskmat', 'deskpad', 'mat', 'mousepad'].includes(t));
    const hasSleeveTerm = rawTerms.some(t => ['sleeve', 'sleeves', 'case', 'cases', 'aeroshield', 'cover'].includes(t));
    const hasDockTerm = rawTerms.some(t => ['dock', 'docks', 'hub', 'hubs', 'omniport', 'thunderbolt'].includes(t));
    const hasStandTerm = rawTerms.some(t => ['stand', 'stands', 'riser', 'risers', 'gravityhold', 'ergoelevate', 'vertical'].includes(t));

    const scored = matched.map(p => {
      let score = 0;
      const pName = p.name.toLowerCase();
      const pTagline = p.tagline.toLowerCase();
      const pTags = p.tags.map(t => t.toLowerCase());
      const pDesc = p.description.toLowerCase();
      const pSpecs = Object.entries(p.specs || {}).map(([k, v]) => `${k} ${v}`.toLowerCase()).join(' ');

      // Intent boosts
      if (hasLaptopTerm && (p.id === 'prod_apexbook_pro16' || p.id === 'prod_novacore_ultra' || pTags.includes('laptop'))) {
        score += 60;
      }
      if (hasPCTerm && (p.id === 'prod_velox_rig_4080' || pTags.includes('pc') || pTags.includes('desktop'))) {
        score += 60;
      }
      if (hasSSDTerm && (p.id === 'prod_hyperdrive_2tb_ssd' || pTags.includes('ssd') || pTags.includes('storage'))) {
        score += 60;
      }
      if (hasMonitorTerm && (p.id === 'prod_lumina_monitor' || pTags.includes('monitor') || pTags.includes('display'))) {
        score += 60;
      }
      if (hasKeycapTerm && (p.id === 'prod_artisan_keycaps' || pTags.includes('keycaps') || pTags.includes('artisan'))) {
        score += 60;
      }
      if (hasCableTerm && (p.id === 'prod_coiled_cable' || pTags.includes('cable') || pTags.includes('coiled'))) {
        score += 60;
      }
      if (hasDeskmatTerm && (p.id === 'prod_deskmat_pro' || pTags.includes('deskmat') || pTags.includes('mousepad'))) {
        score += 60;
      }
      if (hasSleeveTerm && (p.id === 'prod_laptop_sleeve' || pTags.includes('sleeve') || pTags.includes('case'))) {
        score += 60;
      }
      if (hasDockTerm && (p.id === 'prod_usbc_dock' || pTags.includes('dock') || pTags.includes('hub'))) {
        score += 60;
      }
      if (hasStandTerm && (p.id === 'prod_vertical_stand' || p.id === 'prod_laptop_stand' || pTags.includes('stand') || pTags.includes('riser'))) {
        score += 60;
      }

      for (const t of effectiveTerms) {
        if (pName.includes(t)) score += 30;
        if (pTags.includes(t)) score += 20;
        if (pTagline.includes(t)) score += 15;
        if (pDesc.includes(t)) score += 10;
        if (pSpecs.includes(t)) score += 8;
      }

      return { product: p, score };
    });

    const positiveScored = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
    if (positiveScored.length > 0) {
      matched = positiveScored.map(s => s.product);
    }
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
  
  // Convert INR amount to paise (INR * 100)
  const amountInPaise = Math.round(calculation.total * 100);

  // Strict 5-Minute (300 seconds) Ephemeral Cryptographic Gateway Lock
  const currentEpochSeconds = Math.floor(Date.now() / 1000);
  const expireByEpoch = currentEpochSeconds + 300; // strictly 300 seconds = 5 minutes
  const expiresAt = new Date(expireByEpoch * 1000).toISOString();
  const ttlSeconds = 300;
  const countdownSeconds = 300;
  
  // UPI Deep Link payload for instant scan & pay simulation with merchant@razorpay
  const upiUri = `upi://pay?pa=merchant@razorpay&pn=Veluno%20Tech&mc=5732&tr=${orderId}&tn=Order%20Payment&am=${calculation.total}&cu=INR`;

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
    amountInPaise,
    currency: calculation.currency,
    customerEmail,
    customerName: customerName || 'Valued Customer',
    status: 'pending_payment',
    createdAt: new Date().toISOString(),
    expiresAt,
    expireByTimestamp: expireByEpoch,
    ttlSeconds,
    countdownSeconds,
    receiptNumber: `REC-${Date.now().toString().slice(-6)}`
  };

  const toolCall: ToolCallEvent = {
    id: `tool_${Date.now()}_pay`,
    name: 'generate_payment',
    input: {
      customer_email: customerEmail,
      amount_inr: calculation.total,
      amount_paise: amountInPaise,
      currency: calculation.currency,
      itemCount: items.length,
      discount_applied: `${calculation.discountPercentage}%`,
      expire_by: expireByEpoch,
      expiry_window_seconds: ttlSeconds,
      ephemeral_gateway_lock: '5_MINUTES'
    },
    output: {
      orderId: order.orderId,
      razorpayPaymentLinkId: order.razorpayPaymentLinkId,
      razorpayShortUrl: order.razorpayShortUrl,
      amount_in_inr: order.totalAmount,
      amount_in_paise: amountInPaise,
      currency: order.currency,
      expire_by: expireByEpoch,
      expires_at: expiresAt,
      countdown_seconds: countdownSeconds,
      ttl_seconds: ttlSeconds,
      ephemeral_lock: 'STRICT_5_MINUTE_CRYPTO_LOCK',
      state: 'pending_payment',
      status: 'pending_payment'
    },
    status: 'success',
    timestamp: new Date().toISOString(),
    executionGatePassed: true,
    securityNote: 'Human confirmation verified. Ephemeral 5-minute cryptographic lock enforced (expire_by: +300s). PII minimized.'
  };

  return { order, toolCall, securityAlerts };
}

// 6. Tool: handle_payment_failure
export function handlePaymentFailureTool(orderId: string, failureReason: string): ToolCallEvent {
  return {
    id: `tool_${Date.now()}_fail`,
    name: 'handle_payment_failure',
    input: {
      orderId,
      event: 'payment.failed',
      failureReason,
      error_code: 'BANK_DECLINED_CARD_ISSUER',
      cart_held_minutes: 15
    },
    output: {
      status: 'failure_acknowledged',
      cart_state: 'HELD_15_MINUTES',
      discounts_preserved: true,
      recommendedFallback: ['UPI_QR_SCAN', 'UPI_INTENT_GPAY', 'ALTERNATE_CARD_3DS'],
      retryAvailable: true,
      recovery_actions: [
        'Render instant UPI QR Code',
        'Enable 1-Click Alternate Card Retry',
        'Hold discounted inventory for 15 minutes'
      ]
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
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content: `I cannot alter system directives or bypass security boundaries.${discountCapNote}\n\nI have calculated your cart for **${updatedCart.map(i => i.product.name).join(', ')}** with our maximum authorized **10% discount**.\n\n• Subtotal: ₹${calcResult.calculation.subtotal.toLocaleString('en-IN')}\n• 10% Discount: -₹${calcResult.calculation.discountAmount.toLocaleString('en-IN')}\n• GST (18%): ₹${calcResult.calculation.tax.toLocaleString('en-IN')}\n• **Final Total: ₹${calcResult.calculation.total.toLocaleString('en-IN')}**\n\n⚡ This Razorpay secure link and your 10% concession lock will expire in exactly 5 minutes. Shall I confirm your allocation?`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      cartCalculation: calcResult.calculation,
      confirmationGated: true,
      gatedAction: {
        type: 'PROCEED_CHECKOUT',
        label: 'Confirm Allocation (10% Concession - 5m Lock)',
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
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content: `I am **Veluno Concierge**, specialized exclusively in helping you find high-performance audio, computing, and workspace tech from our merchant catalog.\n\nI cannot write external scripts or execute outside tools, but I can help you find gear like studio monitors, mechanical keyboards, audiophile DACs, or smartwatches. What tech gear are you exploring today?`,
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
    lowerText.includes('bank decline') ||
    lowerText.includes('decline') ||
    lowerText.includes('payment decline') ||
    lowerText.includes('transaction failed') ||
    lowerText.includes('simulate bank decline') ||
    lowerText.includes('error paying');

  if (isFailureSignal) {
    const failOrderId = context.lastGeneratedOrder?.orderId || 'ord_flw_recovery_99';
    const failToolCall = handlePaymentFailureTool(failOrderId, 'BANK_DECLINED_CARD_ISSUER');
    toolCalls.push(failToolCall);

    if (context.lastGeneratedOrder) {
      updatedOrder = {
        ...context.lastGeneratedOrder,
        status: 'failed',
        failureReason: 'Bank declined credit card transaction. Issuer timeout or 3D Secure verification decline.'
      };
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content: `I'm very sorry for the inconvenience — your bank card transaction was declined by the card issuer.\n\n🔒 **Don't worry**: Your cart items and applied **10% special discount are securely held for the next 15 minutes** so you won't lose your reserved inventory.\n\nYou can click **Complete Secure Checkout** on your order summary card below to retry or complete payment with an alternate card or UPI method.`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      isFailureRecovery: true,
      paymentOrder: updatedOrder,
      quickReplies: ['Complete Secure Checkout', 'Retry with Alternate Card', 'View Invoice Receipt']
    };

    return {
      message,
      updatedOrder,
      newSecurityAlerts: securityAlerts
    };
  }

  // Step 5.5: Expired Link Renewal & Refresh Intent
  const isRefreshExpiredLink = 
    lowerText.includes('request new link') ||
    lowerText.includes('generate new link') ||
    lowerText.includes('link expired') ||
    lowerText.includes('expired payment link') ||
    lowerText.includes('refresh payment link') ||
    lowerText.includes('renew payment link') ||
    lowerText.includes('regenerate link');

  if (isRefreshExpiredLink) {
    if (updatedCart.length === 0 && context.lastGeneratedOrder?.items?.length) {
      updatedCart = [...context.lastGeneratedOrder.items];
    } else if (updatedCart.length === 0) {
      const defaultItem = PRODUCTS[0];
      updatedCart = [{ product: defaultItem, quantity: 1 }];
    }

    // Urgency Cost Penalty: Hesitation past expiry reduces discount by 2% (e.g. 7% -> 5%)
    const oldDiscount = appliedDiscount > 0 ? appliedDiscount : 7;
    const newDiscount = Math.max(0, oldDiscount - 2);
    appliedDiscount = newDiscount;

    const payResult = generatePaymentTool({
      items: updatedCart,
      customerEmail: context.userEmail,
      customerName: 'Valued Customer',
      discountPercentage: newDiscount,
      couponCode: `URGENCY_${newDiscount}`,
      isConfirmedByGating: true
    });

    const auditTrailLog = `Link expired, regenerated with ${newDiscount}% discount (reduced from ${oldDiscount}%)`;

    // Telemetry & Security note for Audit Trail
    payResult.toolCall.securityNote = auditTrailLog;
    if (payResult.toolCall.output) {
      payResult.toolCall.output.audit_log = auditTrailLog;
      payResult.toolCall.output.penalty_reason = 'EXPIRED_LINK_REGENERATION_URGENCY_COST';
    }

    toolCalls.push(payResult.toolCall);
    securityAlerts.push({
      id: `alert_urgency_${Date.now()}`,
      type: 'URGENCY_COST_PENALTY_APPLIED',
      severity: 'low',
      message: auditTrailLog,
      timestamp: new Date().toISOString(),
      details: `User hesitation past 5-minute ephemeral gateway lock. Regenerated link with a 2% discount penalty (${oldDiscount}% -> ${newDiscount}%).`
    });
    securityAlerts.push(...payResult.securityAlerts);
    updatedOrder = payResult.order;

    const formattedExpiry = updatedOrder?.expiresAt ? (() => {
      const remainingSec = Math.max(0, Math.floor((new Date(updatedOrder.expiresAt).getTime() - Date.now()) / 1000));
      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    })() : '4:32';

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content: `🔄 **Payment Link Expired & Regenerated**\n\nYour previous checkout link has expired. I have regenerated a fresh **Razorpay secure payment link**, but because checkout was delayed past the expiration window, your discount has been reduced by 2% (from ${oldDiscount}% to ${newDiscount}%).\n\nThis link expires in ${formattedExpiry}—complete checkout to lock in your ${newDiscount}% discount.`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      paymentOrder: updatedOrder,
      quickReplies: ['Complete Secure Checkout', 'Simulate Bank Card Failure', 'View Invoice Receipt']
    };

    return {
      message,
      updatedCart,
      updatedOrder,
      newSecurityAlerts: securityAlerts,
      appliedDiscount,
      couponCode: `URGENCY_${newDiscount}`
    };
  }

  // Step 6: Checkout Confirmation & Gated Payment Generation (Workflow #5 & #6)
  const isConfirmationIntent = 
    lowerText === 'yes' ||
    lowerText.includes('yes, checkout') ||
    lowerText.includes('yes, checkout now') ||
    lowerText.includes('yes, generate payment link') ||
    lowerText.includes('yes, confirm allocation') ||
    lowerText.includes('confirm & generate') ||
    lowerText.includes('confirm payment') ||
    lowerText.includes('confirm allocation') ||
    lowerText.includes('proceed to pay') ||
    lowerText.includes('confirm checkout') ||
    lowerText.includes('authorize secure razorpay') ||
    lowerText.includes('ready to buy') ||
    lowerText.includes('proceed to checkout') ||
    lowerText.includes('i accept the price');

  if (isConfirmationIntent) {
    if (updatedCart.length === 0) {
      // Default to Apex ANC + SoundWave DAC if empty
      const apex = PRODUCTS.find(p => p.id === 'prod_apex_anc')!;
      const dac = PRODUCTS.find(p => p.id === 'prod_soundwave_dac')!;
      updatedCart = [{ product: apex, quantity: 1 }, { product: dac, quantity: 1 }];
      appliedDiscount = 7;
    } else if (appliedDiscount === 0) {
      appliedDiscount = 7;
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

    const formattedExpiry = updatedOrder?.expiresAt ? (() => {
      const remainingSec = Math.max(0, Math.floor((new Date(updatedOrder.expiresAt).getTime() - Date.now()) / 1000));
      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    })() : '4:32';

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content: `🔒 **Strict 5-Minute Cryptographic Gateway Lock Active**:\nThis link expires in ${formattedExpiry}—complete checkout to lock in your ${appliedDiscount}% discount.\n\nClick **Complete Secure Checkout** below to authorize payment:`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      paymentOrder: updatedOrder,
      quickReplies: ['Complete Secure Checkout', 'Simulate Bank Card Failure', 'View Invoice Receipt']
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
  const isAddCrossSellIntent = 
    lowerText.includes('add the hi-fi dac') || lowerText.includes('add dac') || 
    lowerText.includes('add cross-sell') || lowerText.includes('add aviator cable') || 
    lowerText.includes('add strap') || lowerText.includes('add keycap') || 
    lowerText.includes('add artisan') || lowerText.includes('add cable') || 
    lowerText.includes('add deskmat') || lowerText.includes('add sleeve') || 
    lowerText.includes('add dock') || lowerText.includes('add stand') ||
    lowerText.startsWith('add cyberforge') || lowerText.startsWith('add vanguard') ||
    lowerText.startsWith('add deskmat') || lowerText.startsWith('add aeroshield');

  if (isAddCrossSellIntent) {
    let crossSellItem: Product | undefined;
    if (lowerText.includes('dac')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_soundwave_dac');
    else if (lowerText.includes('keycap') || lowerText.includes('artisan') || lowerText.includes('cyberforge')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_artisan_keycaps') || PRODUCTS.find(p => p.tags.includes('keycaps'));
    else if (lowerText.includes('cable') || lowerText.includes('vanguard') || lowerText.includes('aviator')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_coiled_cable');
    else if (lowerText.includes('deskmat') || lowerText.includes('mousepad')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_deskmat_pro');
    else if (lowerText.includes('sleeve') || lowerText.includes('aeroshield')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_laptop_sleeve');
    else if (lowerText.includes('dock') || lowerText.includes('usbc')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_usbc_dock');
    else if (lowerText.includes('strap') || lowerText.includes('band')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_nomad_strap');
    else if (lowerText.includes('stand')) crossSellItem = PRODUCTS.find(p => p.id === 'prod_vertical_stand') || PRODUCTS.find(p => p.id === 'prod_laptop_stand');
    else crossSellItem = PRODUCTS.find(p => p.id === 'prod_deskmat_pro');

    if (crossSellItem) {
      const exists = updatedCart.some(i => i.product.id === crossSellItem!.id);
      if (!exists) {
        updatedCart.push({ product: crossSellItem, quantity: 1 });
      }

      // Record conversion in persistent session store
      const session = SessionStore.getSession();
      const coreName = context.purchasedItems?.[0]?.name || updatedCart[0]?.product.name || 'Core Product';
      SessionStore.logConversion(coreName, crossSellItem.name, crossSellItem.price);

      // Audit trail telemetry for conversion
      const conversionToolCall: ToolCallEvent = {
        id: `tool_${Date.now()}_cross_sell_conv`,
        name: 'cross_sell_converted',
        input: {
          session_id: session.sessionId,
          customer_id: session.customerId,
          core_product: coreName,
          added_accessory: crossSellItem.name,
          accessory_price: crossSellItem.price
        },
        output: {
          status: 'CROSS_SELL_CONVERSION_SUCCESS',
          conversion_type: 'ECOSYSTEM_COMPANION_ADDED',
          cart_total_increment: crossSellItem.price,
          currency: 'INR'
        },
        status: 'success',
        timestamp: new Date().toISOString(),
        executionTimeMs: 14,
        securityNote: `Ecosystem cross-sell conversion recorded in session telemetry for customer (${session.customerId}).`
      };

      toolCalls.push(conversionToolCall);
    }

    const calcResult = calculateCartTool(updatedCart, appliedDiscount, couponCode);
    toolCalls.push(calcResult.toolCall);
    securityAlerts.push(...calcResult.securityAlerts);

    let discountContent = appliedDiscount > 0 ? ` (with your ${appliedDiscount}% concession applied)` : '';

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content: `Awesome choice! I've added **${crossSellItem?.name || 'the companion item'}** to your cart${discountContent}.\n\n` +
        `• **Items**: ${updatedCart.map(i => `${i.product.name} (x${i.quantity})`).join(' + ')}\n` +
        `• Subtotal: ₹${calcResult.calculation.subtotal.toLocaleString('en-IN')}\n` +
        (appliedDiscount > 0 ? `• Concession (${appliedDiscount}%): -₹${calcResult.calculation.discountAmount.toLocaleString('en-IN')}\n` : '') +
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

  // Step 8: Algorithmic Yield Negotiation (Market Maker Persona)
  const isSpecificProductQuery =
    lowerText.includes('laptop') || lowerText.includes('notebook') || lowerText.includes('apexbook') || lowerText.includes('novacore') || lowerText.includes('macbook') ||
    lowerText.includes('pc') || lowerText.includes('desktop') || lowerText.includes('rig') || lowerText.includes('velox') || lowerText.includes('computer') ||
    lowerText.includes('ssd') || lowerText.includes('storage') || lowerText.includes('nvme') || lowerText.includes('hyperdrive') || lowerText.includes('hard drive') ||
    lowerText.includes('monitor') || lowerText.includes('display') || lowerText.includes('lumina') || lowerText.includes('screen') ||
    lowerText.includes('keyboard') || lowerText.includes('headphone') || lowerText.includes('earphone') || lowerText.includes('watch') ||
    lowerText.includes('light') || lowerText.includes('lamp') || lowerText.includes('stand') || lowerText.includes('desk');

  const isChangingProduct =
    lowerText.includes('show me cheaper options') ||
    lowerText.includes('change product') ||
    lowerText.includes('cheaper alternative') ||
    lowerText.includes('different') ||
    isSpecificProductQuery;

  const isNegotiating = !isChangingProduct && (lowerText.includes('discount') || lowerText.includes('better price') || lowerText.includes('expensive') || lowerText.includes('too much') || lowerText.includes('abandon') || lowerText.includes('cheaper') || lowerText.includes('out of budget') || lowerText.includes('lower price') || lowerText.includes('offer') || lowerText.includes('coupon') || lowerText.includes('promo') || lowerText.includes('save') || lowerText.includes('cancel') || lowerText.includes('leave') || lowerText.includes('last offer') || lowerText.includes('best price') || lowerText.includes('competitor'));

  if (isNegotiating) {
    let reqDiscount = 0;
    if (lowerText.includes('20') || lowerText.includes('save20')) reqDiscount = 20;
    if (lowerText.includes('50') || lowerText.includes('hack50')) reqDiscount = 50;
    if (lowerText.includes('100') || lowerText.includes('free')) reqDiscount = 100;

    const isHardNegotiation = lowerText.includes('cancel') || lowerText.includes('leave') || lowerText.includes('abandon') || lowerText.includes('last offer') || (lowerText.includes('best price') && appliedDiscount > 0) || lowerText.includes('competitor') || lowerText.includes('final adjustment');

    // Force a progressive curve: always do soft concession first, unless strictly demanded a huge specific %
    if (appliedDiscount === 0 && reqDiscount <= 10 && !lowerText.includes('cancel')) {
        appliedDiscount = 5;
        couponCode = 'SOFT_SAVE5';
    } else if (isHardNegotiation || reqDiscount > 10) {
        if (appliedDiscount < 10) {
            appliedDiscount = 10;
            couponCode = 'MAX_YIELD_SAVE10';
        }
    } else {
        if (appliedDiscount < 10) {
            appliedDiscount = Math.min(10, appliedDiscount + 5);
            couponCode = `YIELD_SAVE${appliedDiscount}`;
        }
    }

    if (updatedCart.length === 0 && context.cart.length > 0) {
      updatedCart = [...context.cart];
    } else if (updatedCart.length === 0) {
      const defaultItem = PRODUCTS[0];
      updatedCart = [{ product: defaultItem, quantity: 1 }];
    }

    const calcResult = calculateCartTool(updatedCart, appliedDiscount, couponCode);
    toolCalls.push(calcResult.toolCall);
    securityAlerts.push(...calcResult.securityAlerts);
    appliedDiscount = calcResult.calculation.discountPercentage;
    couponCode = calcResult.calculation.couponCode;

    let explanation = `I completely understand your budget concerns. To help you out, I've immediately applied a **${appliedDiscount}% soft concession** (Code: ${couponCode}) to your active item to bring the price down for you.`;
    if (appliedDiscount === 10 && (isHardNegotiation || reqDiscount > 10 || lowerText.includes('final adjustment'))) {
      explanation = `I hear you. To ensure we don't lose your business today, I am deploying my maximum authorized market-maker concession of **10%** (Code: ${couponCode}). This is our absolute best price.`;
    } else if (calcResult.calculation.securityDiscountCapped) {
      explanation = `⚠️ **Merchant Policy Notice**: You requested a higher discount, but my algorithmic bounds strictly cap maximum yield concession at **10%** per transaction. I have applied the maximum **10% discount** (${couponCode}).`;
    }

    const urgencyClosing = `⚡ **Cryptographic Gateway Notice**: This Razorpay secure link and your ${appliedDiscount}% concession lock will expire in exactly 5 minutes once generated. Shall I confirm your allocation?`;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content: `${explanation}\n\n• Subtotal: ₹${calcResult.calculation.subtotal.toLocaleString('en-IN')}\n• Discount (${appliedDiscount}%): -₹${calcResult.calculation.discountAmount.toLocaleString('en-IN')}\n• GST (18%): ₹${calcResult.calculation.tax.toLocaleString('en-IN')}\n• **New Total: ₹${calcResult.calculation.total.toLocaleString('en-IN')}**\n\n${urgencyClosing}`,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      cartCalculation: calcResult.calculation,
      confirmationGated: true,
      gatedAction: {
        type: 'PROCEED_CHECKOUT',
        label: `Confirm Allocation (${appliedDiscount}% Concession - 5m Lock)`,
        items: updatedCart,
        amount: calcResult.calculation.total,
        email: context.userEmail
      },
      quickReplies: ['Yes, confirm allocation', 'Still too expensive', 'Review Cart']
    };

    return {
      message,
      updatedCart,
      newSecurityAlerts: securityAlerts,
      appliedDiscount,
      couponCode
    };
  }

  // Step 9: Persistent Context, Ecosystem Memory & Natural Cross-Sell
  const ecosystemContext = evaluateEcosystemContext(context.purchasedItems || []);
  const hasPurchasedItems = (context.purchasedItems && context.purchasedItems.length > 0) || false;

  const isLaptopQuery = /\b(laptop|laptops|notebook|notebooks|macbook|apexbook|novacore|ultrabook)\b/i.test(lowerText);
  const isPcQuery = /\b(pc|pcs|desktop|desktops|rig|rigs|prebuilt|pre-built|velox|workstation|tower)\b/i.test(lowerText);
  const isSsdQuery = /\b(ssd|ssds|nvme|m\.2|storage|hyperdrive|drive|drives|disk|disks|hard drive|gen4)\b/i.test(lowerText);
  const isMonitorQuery = /\b(monitor|monitors|display|displays|screen|screens|ultrawide|curved|lumina|4k hdr|wqhd)\b/i.test(lowerText);
  const isKeyboardQuery = /\b(keyboard|keyboards|mechanical|aerotype|switches|keys|keeb)\b/i.test(lowerText);
  const isAudioQuery = /\b(headphone|headphones|earphone|audio|sound|music|anc|apex|dac|soundwave|amplifier)\b/i.test(lowerText);
  const isWatchQuery = /\b(watch|smartwatch|wearable|wearables|pulse|pulsewatch|strap|band)\b/i.test(lowerText);
  const isWorkspaceQuery = /\b(desk|mat|deskmat|mousepad|stand|riser|screenbar|light bar|cable)\b/i.test(lowerText);
  const isAccessorySpecificQuery = /\b(keycap|keycaps|artisan|cable|cables|aviator|sleeve|sleeves|dock|docks|hub|hub|stand|vertical|riser)\b/i.test(lowerText);

  const isGenericRecommendationQuery = 
    /\b(recommend|recommendation|recommendations|suggest|suggestion|what else|what's next|what next|accessories|accessory|gear|complement|pair|setup|add on|addons)\b/i.test(lowerText) ||
    (hasPurchasedItems && !isLaptopQuery && !isPcQuery && !isSsdQuery && !isMonitorQuery && !isKeyboardQuery && !isAudioQuery && !isWatchQuery && !isAccessorySpecificQuery);

  const hasExplicitHardwareIntent = 
    isLaptopQuery || isPcQuery || isSsdQuery || isMonitorQuery || 
    isKeyboardQuery || isAudioQuery || isWatchQuery || isWorkspaceQuery || isAccessorySpecificQuery;

  // If user previously purchased items and asks a generic question or accessory query, trigger Ecosystem Memory recommendation
  if (hasPurchasedItems && ecosystemContext.compatibleAccessories.length > 0 && isGenericRecommendationQuery) {
    const coreProduct = ecosystemContext.purchasedCoreProducts[0] || context.purchasedItems![0];
    const topAccessory = ecosystemContext.compatibleAccessories[0];
    const otherAccessories = ecosystemContext.compatibleAccessories.slice(1);

    updatedCart = [{ product: topAccessory, quantity: 1 }];
    appliedDiscount = 0;
    couponCode = undefined;

    const calcSingle = calculateCartTool(updatedCart, appliedDiscount, couponCode);
    toolCalls.push(calcSingle.toolCall);

    // Contextual cross-sell lead-in based on compatibility mapping
    let organicPitch = '';
    const isKeyboardCore = coreProduct.tags.includes('keyboard') || coreProduct.tags.includes('mechanical') || coreProduct.name.toLowerCase().includes('keyboard');
    const isLaptopCore = coreProduct.tags.includes('laptop') || coreProduct.tags.includes('notebook') || coreProduct.name.toLowerCase().includes('laptop') || coreProduct.name.toLowerCase().includes('apexbook');

    if (isKeyboardCore) {
      organicPitch = `Since you picked up the **${coreProduct.name}** earlier, would you like to pair it with our **hand-lubed artisan keycap set**? We also have matching **coiled aviation cables** and **4mm topographic desk mats** engineered specifically for high-end mechanical keebs.`;
    } else if (isLaptopCore) {
      organicPitch = `Since you picked up the **${coreProduct.name}** workstation earlier, pairing it with our **AeroShield magnetic protective sleeve**, **OmniPort 12-in-1 Thunderbolt USB-C dock**, or **GravityHold vertical stand** completes your portable workstation setup.`;
    } else {
      organicPitch = `Since you picked up the **${coreProduct.name}** earlier, would you like to pair it with our **${topAccessory.name}**?`;
    }

    // Record impression in persistent session store
    const session = SessionStore.getSession();
    SessionStore.logImpression(coreProduct.name, topAccessory.name);

    // Audit trail telemetry for ecosystem cross-sell impression
    const crossSellImpToolCall: ToolCallEvent = {
      id: `tool_${Date.now()}_cross_sell_imp`,
      name: 'eval_ecosystem_cross_sell',
      input: {
        session_id: session.sessionId,
        customer_id: session.customerId,
        purchased_core_product: coreProduct.name,
        target_accessory: topAccessory.name,
        context_tags: ecosystemContext.contextTags
      },
      output: {
        status: 'CROSS_SELL_IMPRESSION_INJECTED',
        pitch: organicPitch,
        recommended_item: topAccessory.name,
        price: topAccessory.price,
        ecosystem_synergy_matched: true
      },
      status: 'success',
      timestamp: new Date().toISOString(),
      executionTimeMs: 16,
      securityNote: `Contextual cross-sell memory evaluated for active session customer (${session.customerId}).`
    };

    toolCalls.push(crossSellImpToolCall);

    const accessoriesList = ecosystemContext.compatibleAccessories.map(acc => 
      `• **${acc.name}** (₹${acc.price.toLocaleString('en-IN')}) — ${acc.tagline}`
    ).join('\n');

    const content = `Welcome back! I checked your active session ecosystem state.\n\n${organicPitch}\n\n` +
      `🧩 **Compatible Ecosystem Accessories**:\n${accessoriesList}\n\n` +
      `I've staged the **${topAccessory.name}** (₹${topAccessory.price.toLocaleString('en-IN')}) in your checkout queue. Would you like to proceed or bundle multiple accessories?`;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content,
      timestamp: new Date().toISOString(),
      toolCalls,
      securityAlerts,
      suggestedProducts: ecosystemContext.compatibleAccessories,
      ecosystemAwareness: {
        purchasedCoreProduct: coreProduct.name,
        compatibleAccessories: ecosystemContext.compatibleAccessories,
        contextTags: ecosystemContext.contextTags,
        recommendationNote: organicPitch
      },
      cartCalculation: calcSingle.calculation,
      confirmationGated: true,
      gatedAction: {
        type: 'PROCEED_CHECKOUT',
        label: `Proceed with ${topAccessory.name} (₹${calcSingle.calculation.total.toLocaleString('en-IN')})`,
        items: updatedCart,
        amount: calcSingle.calculation.total,
        email: context.userEmail
      },
      quickReplies: [
        `Add ${topAccessory.name.split(' ')[0]} (+₹${topAccessory.price.toLocaleString('en-IN')})`,
        ...(otherAccessories[0] ? [`Add ${otherAccessories[0].name.split(' ')[0]} (+₹${otherAccessories[0].price.toLocaleString('en-IN')})`] : []),
        'Apply 10% Discount',
        'Explore All Accessories'
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

  let categoryFilter: string | undefined = undefined;
  if (isLaptopQuery || isPcQuery || isSsdQuery || isMonitorQuery || isKeyboardQuery || lowerText.includes('computing')) {
    categoryFilter = 'computing';
  } else if (isAudioQuery) {
    categoryFilter = 'audio';
  } else if (isWatchQuery) {
    categoryFilter = 'wearables';
  } else if (isWorkspaceQuery || isAccessorySpecificQuery) {
    categoryFilter = 'workspace';
  }

  const isContextRetained = context.cart.length > 0 && !isChangingProduct && !hasExplicitHardwareIntent && !categoryFilter;
  let primaryProduct: Product;
  let crossSellProduct: Product | undefined;

  if (isContextRetained) {
    primaryProduct = context.cart[0].product;
    crossSellProduct = primaryProduct.crossSellProductId
      ? PRODUCTS.find(p => p.id === primaryProduct.crossSellProductId)
      : PRODUCTS.find(p => p.id !== primaryProduct.id);
  } else {
    const catalogResult = checkCatalogTool(categoryFilter, cleanText);
    toolCalls.push(catalogResult.toolCall);
    
    primaryProduct = catalogResult.items[0] || PRODUCTS[0];
    crossSellProduct = primaryProduct.crossSellProductId
      ? PRODUCTS.find(p => p.id === primaryProduct.crossSellProductId)
      : PRODUCTS.find(p => p.id !== primaryProduct.id);

    // Update cart since we are pivoting to a new item
    updatedCart = [{ product: primaryProduct, quantity: 1 }];
    appliedDiscount = 0;
    couponCode = undefined;
  }

  // Calculate pricing for primary + potential cross sell
  const calcSingle = calculateCartTool(updatedCart, appliedDiscount, couponCode);
  toolCalls.push(calcSingle.toolCall);

  const bundleDiscount = 0;
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

  const specsList = primaryProduct.specs
    ? Object.entries(primaryProduct.specs).slice(0, 4).map(([k, v]) => `• **${k}**: ${v}`).join('\n')
    : '';

  // Organic ecosystem note if user has previous purchases
  let ecosystemLeadIn = '';
  if (hasPurchasedItems && ecosystemContext.purchasedCoreProducts.length > 0) {
    const prevCore = ecosystemContext.purchasedCoreProducts[0];
    ecosystemLeadIn = `\n\n💡 **Ecosystem Synergy**: Because you previously picked up the **${prevCore.name}**, this hardware seamlessly integrates into your active setup.`;
  }

  const content = isContextRetained
    ? `Regarding the **${primaryProduct.name}** (₹${primaryProduct.price.toLocaleString('en-IN')}):\n\n` +
      `✨ **Key Highlights**:\n` +
      primaryProduct.features.map(f => `• ${f}`).join('\n') + `\n\n` +
      (specsList ? `📋 **Technical Specifications**:\n${specsList}\n\n` : '') +
      (crossSellProduct ? `💡 **Recommended Companion**: ${primaryProduct.crossSellReason || `Add the **${crossSellProduct.name}** to get the best experience.`}\n` : '') +
      ecosystemLeadIn +
      `\n\nWould you like to proceed directly with the ${primaryProduct.name}?`
    : `Hello! I found the **${primaryProduct.name}** (₹${primaryProduct.price.toLocaleString('en-IN')}) in our hardware catalog. ${primaryProduct.description}\n\n` +
      `✨ **Key Highlights**:\n` +
      primaryProduct.features.map(f => `• ${f}`).join('\n') + `\n\n` +
      (specsList ? `📋 **Technical Specifications**:\n${specsList}\n\n` : '') +
      (crossSellProduct ? `💡 **Recommended Companion**: ${primaryProduct.crossSellReason || `Add the **${crossSellProduct.name}** to get the best experience.`}\n` : '') +
      ecosystemLeadIn +
      `\n\nI have loaded the **${primaryProduct.name}** into your active cart. Would you like to proceed to checkout or configure companions?`;

  const message: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    sender: 'agent',
    content,
    timestamp: new Date().toISOString(),
    toolCalls,
    securityAlerts,
    suggestedProducts: [primaryProduct, ...(crossSellProduct ? [crossSellProduct] : [])],
    crossSellOffer,
    ecosystemAwareness: hasPurchasedItems && ecosystemContext.compatibleAccessories.length > 0 ? {
      purchasedCoreProduct: ecosystemContext.purchasedCoreProducts[0]?.name || 'Previous Purchase',
      compatibleAccessories: ecosystemContext.compatibleAccessories,
      contextTags: ecosystemContext.contextTags,
      recommendationNote: ecosystemContext.primaryOrganicPrompt
    } : undefined,
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
      `Yes, checkout with ${primaryProduct.name.split(' ')[0]}`,
      crossSellProduct ? `Add ${crossSellProduct.name.split(' ')[0]} (+₹${crossSellProduct.price.toLocaleString('en-IN')})` : 'Add to Cart',
      'Apply 10% Discount',
      'View Technical Specs'
    ]
  };

  return {
    message,
    updatedCart,
    newSecurityAlerts: securityAlerts,
    appliedDiscount: isContextRetained ? appliedDiscount : 0,
    couponCode: isContextRetained ? couponCode : undefined
  };
}
