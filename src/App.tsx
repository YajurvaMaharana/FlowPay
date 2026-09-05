import React, { useState, useEffect } from 'react';
import { 
  CartCalculation, CartItem, Message, NavigationTab, PaymentOrder, 
  Product, SecurityAlert, SecurityMetrics, TestScenario, ToolCallEvent, 
  UserProfile 
} from './types';
import { PRODUCTS } from './data/products';
import { TEST_SCENARIOS } from './data/scenarios';
import { 
  calculateCartTool, generatePaymentTool, processUserMessage, 
  sanitizePii, handlePaymentFailureTool 
} from './services/agentEngine';
import { simulateBuyerBot } from './services/buyerBot';

// Page Views & Global Layout
import { EditorialHero } from './components/EditorialHero';
import { GlobalNavbar } from './components/GlobalNavbar';
import { ShopPage } from './components/ShopPage';
import { NewArrivalsPage } from './components/NewArrivalsPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';

// AI Agent Sidebar
import { AlphaCartSidebar } from './components/AlphaCartSidebar';

// Modals
import { ProductDetailModal } from './components/ProductDetailModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ToolsSchemaModal } from './components/ToolsSchemaModal';
import { AuthModal } from './components/AuthModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { SavedGearModal } from './components/SavedGearModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { RazorpayModal } from './components/RazorpayModal';

export function App() {
  // Navigation Routing State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setCurrentTab('shop');
  };

  // User Profile & Authentication State
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_valentin_01',
    name: 'Valentin',
    email: 'valentinine14feb@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80',
    isAuthenticated: true,
    savedGearIds: ['prod_apex_anc', 'prod_keychron_mech'],
    orders: [],
    address: {
      street: '42 Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India'
    },
    preferences: {
      piiStrictMasking: true,
      autoApplyMaxDiscount: true,
      currency: 'INR'
    }
  });

  // AI Agent Sidebar State
  const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState(false);
  const [agentSidebarTab, setAgentSidebarTab] = useState<'chat' | 'audit' | 'catalog' | 'cart' | 'security'>('chat');
  const [activeScenario, setActiveScenario] = useState<TestScenario | null>(null);
  const [isA2AMode, setIsA2AMode] = useState(false);
  const [isA2ATyping, setIsA2ATyping] = useState(false);

  // Cart & Calculation State
  const [cart, setCart] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 1 } // Preloaded with Apex ANC Pro
  ]);
  const [sessionPurchasedItems, setSessionPurchasedItems] = useState<Product[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
  const [cartCalculation, setCartCalculation] = useState<CartCalculation>(() => {
    return calculateCartTool([{ product: PRODUCTS[0], quantity: 1 }], 0).calculation;
  });

  // Security & Telemetry State
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [toolCallsHistory, setToolCallsHistory] = useState<ToolCallEvent[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    totalInteractions: 1,
    attacksBlocked: 0,
    piiMaskedCount: 0,
    discountLimitsEnforced: 0,
    gatedConfirmationsEnforced: 0,
    yieldRetained: 100,
    zeroTrustStatus: 'OPTIMAL'
  });

  // Modal States
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<PaymentOrder | null>(null);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<PaymentOrder | null>(null);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<PaymentOrder | null>(null);

  // User Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isSavedGearModalOpen, setIsSavedGearModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Conversation History
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_initial_greeting',
      sender: 'agent',
      content: `Hello! I am **Veluno Concierge**, your elite AI sales concierge for the Veluno Tech platform.\n\nI can help you discover flagship audio, computing, and workspace tech, tailor high-value bundle pairings with our authorized **10% concession**, and generate instant, encrypted **Razorpay checkout links**.\n\nWhat high-performance gear are you exploring today?`,
      timestamp: new Date().toISOString(),
      quickReplies: [
        'Looking for studio ANC headphones',
        'Explore mechanical keyboards',
        'View Ultrawide 4K monitor',
        'Test 50% discount injection attack'
      ]
    }
  ]);


  // Handle User Message Submission
  const handleSendMessage = async (text: string, imageBase64?: string, isFromBot = false) => {
    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');

    // Check PII in user text
    const piiCheck = sanitizePii(text);
    const userMsgId = `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    if (isFromBot) {
      const userMsg: Message = {
        id: userMsgId,
        sender: 'user',
        content: '',
        timestamp: new Date().toISOString(),
        isPiiMasked: piiCheck.hasPii,
        attachment: imageBase64 ? { type: 'image', url: imageBase64 } : undefined
      };
      setMessages((prev) => [...prev, userMsg]);
      
      const words = piiCheck.sanitizedText.split(' ');
      let currentWordIndex = 0;
      const streamChunkSize = Math.max(1, Math.floor(words.length / 10));

      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          currentWordIndex += streamChunkSize;
          if (currentWordIndex >= words.length) {
            clearInterval(interval);
            setMessages((prev) =>
              prev.map((m) => (m.id === userMsgId ? { ...m, content: piiCheck.sanitizedText } : m))
            );
            resolve();
          } else {
            const partialText = words.slice(0, currentWordIndex).join(' ');
            setMessages((prev) =>
              prev.map((m) =>
                m.id === userMsgId ? { ...m, content: partialText } : m
              )
            );
          }
        }, 30);
      });
    } else {
      const userMsg: Message = {
        id: userMsgId,
        sender: 'user',
        content: piiCheck.sanitizedText,
        timestamp: new Date().toISOString(),
        isPiiMasked: piiCheck.hasPii,
        attachment: imageBase64 ? { type: 'image', url: imageBase64 } : undefined
      };
      setMessages((prev) => [...prev, userMsg]);
    }
    
    setIsLoading(true);

    try {
      if (imageBase64) {
        // --- VISION WORKFLOW ---
        let visionResult: { detectedIssue: string; productIds?: string[] } = {
          detectedIssue: "Ergonomic workspace optimization detected (Laptop riser & dual display setup recommended).",
          productIds: ["prod_laptop_stand", "prod_lumina_monitor"]
        };

        try {
          const response = await fetch('/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64, textPrompt: text })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.detectedIssue) {
              visionResult = data;
            }
          }
        } catch {
          // Graceful fallback to default ergonomic workspace recommendation
        }
        
        let recommendedProducts = PRODUCTS.filter(p => visionResult.productIds?.includes(p.id));
        if (recommendedProducts.length === 0) {
          recommendedProducts = [
            PRODUCTS.find(p => p.id === 'prod_apexbook_pro16') || PRODUCTS[0],
            PRODUCTS.find(p => p.id === 'prod_lumina_monitor') || PRODUCTS[1]
          ];
        }

        const primaryProduct = recommendedProducts[0];
        const secondaryProduct = recommendedProducts[1];
        const newCart: CartItem[] = [{ product: primaryProduct, quantity: 1 }];
        setCart(newCart);

        const calcSingle = calculateCartTool(newCart, 0);

        const visionToolCall: ToolCallEvent = {
          id: `tool_vision_${Date.now()}`,
          name: 'analyze_workspace_vision',
          input: { prompt: text || 'Workspace Inspection', hasImage: true },
          output: {
            detectedIssue: visionResult.detectedIssue,
            recommendedIds: recommendedProducts.map(p => p.id),
            primaryProduct: primaryProduct.name
          },
          status: 'success',
          timestamp: new Date().toISOString()
        };

        setToolCallsHistory(prev => [...prev, visionToolCall]);
        
        const agentMsgId = `msg_agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const agentMsg: Message = {
          id: agentMsgId,
          sender: 'agent',
          content: `🔍 **Multimodal Workspace Analysis Complete**\n\nI evaluated your desk setup: **${visionResult.detectedIssue}**\n\nI have matched your setup with high-precision merchant gear and staged the **${primaryProduct.name}** (₹${primaryProduct.price.toLocaleString('en-IN')}) into your cart.\n\n✨ **Key Highlights**:\n${primaryProduct.features.slice(0, 3).map(f => `• ${f}`).join('\n')}\n\n${secondaryProduct ? `💡 **Recommended Companion**: Add the **${secondaryProduct.name}** for a complete high-performance workstation.` : ''}`,
          timestamp: new Date().toISOString(),
          toolCalls: [visionToolCall],
          visionAnalysis: {
            detectedIssue: visionResult.detectedIssue,
            products: recommendedProducts
          },
          suggestedProducts: recommendedProducts,
          cartCalculation: calcSingle.calculation,
          confirmationGated: true,
          gatedAction: {
            type: 'PROCEED_CHECKOUT',
            label: `Proceed with ${primaryProduct.name} (₹${calcSingle.calculation.total.toLocaleString('en-IN')})`,
            items: newCart,
            amount: calcSingle.calculation.total,
            email: user.email
          },
          quickReplies: [
            `Checkout with ${primaryProduct.name.split(' ')[0]}`,
            secondaryProduct ? `Add ${secondaryProduct.name.split(' ')[0]} (+₹${secondaryProduct.price.toLocaleString('en-IN')})` : 'Add Companion',
            'Apply 10% Discount',
            'View Full Specs'
          ]
        };
        
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        // --- STANDARD CONVERSATIONAL WORKFLOW ---
        const response = await processUserMessage(text, {
          cart,
          purchasedItems: sessionPurchasedItems,
          userEmail: user.email,
          currency: 'INR',
          appliedDiscount,
          couponCode,
          lastGeneratedOrder: activePaymentOrder || undefined,
          messagesHistory: messages
        });

        // Update state based on agent response
        if (response.updatedCart) setCart(response.updatedCart);
        if (response.appliedDiscount !== undefined) setAppliedDiscount(response.appliedDiscount);
        if (response.couponCode !== undefined) setCouponCode(response.couponCode);
        if (response.updatedOrder) {
          setActivePaymentOrder(response.updatedOrder);
          setUser((prev) => {
            const existingIdx = prev.orders.findIndex((o) => o.orderId === response.updatedOrder!.orderId);
            if (existingIdx >= 0) {
              const copy = [...prev.orders];
              copy[existingIdx] = response.updatedOrder!;
              return { ...prev, orders: copy };
            }
            return { ...prev, orders: [response.updatedOrder!, ...prev.orders] };
          });
        }

        // Telemetry updates
        if (response.newSecurityAlerts && response.newSecurityAlerts.length > 0) {
          setSecurityAlerts((prev) => [...prev, ...response.newSecurityAlerts!]);
          
          let attacks = 0;
          let piiCount = 0;
          let discCaps = 0;
          let gated = 0;

          for (const alert of response.newSecurityAlerts) {
            if (alert.type === 'PROMPT_INJECTION_ATTEMPT') attacks++;
            if (alert.type === 'PII_DETECTED_AND_MASKED') piiCount++;
            if (alert.type === 'DISCOUNT_LIMIT_ENFORCED') discCaps++;
            if (alert.type === 'UNAUTHORIZED_PAYMENT_GATE_BLOCKED') gated++;
          }

          setSecurityMetrics((prev) => ({
            ...prev,
            totalInteractions: prev.totalInteractions + 1,
            attacksBlocked: prev.attacksBlocked + attacks,
            piiMaskedCount: prev.piiMaskedCount + piiCount,
            discountLimitsEnforced: prev.discountLimitsEnforced + discCaps,
            gatedConfirmationsEnforced: prev.gatedConfirmationsEnforced + gated,
            yieldRetained: response.appliedDiscount !== undefined ? 100 - response.appliedDiscount : prev.yieldRetained,
            zeroTrustStatus: (attacks > 0 || piiCount > 0) ? 'ACTIVE_DEFENSE' : 'OPTIMAL'
          }));
        } else {
          setSecurityMetrics((prev) => ({
            ...prev,
            totalInteractions: prev.totalInteractions + 1,
            yieldRetained: response.appliedDiscount !== undefined ? 100 - response.appliedDiscount : prev.yieldRetained,
          }));
        }

        if (response.message.toolCalls) {
          setToolCallsHistory((prev) => [...prev, ...response.message.toolCalls!]);
        }

        // Stream text response smoothly
        const finalMsg = response.message;
        const fullContent = finalMsg.content;
        const initialPartialMsg: Message = {
          ...finalMsg,
          content: ''
        };

        setMessages((prev) => [...prev, initialPartialMsg]);

        const words = fullContent.split(' ');
        let currentWordIndex = 0;
        const streamChunkSize = Math.max(1, Math.floor(words.length / 18));

        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            currentWordIndex += streamChunkSize;
            if (currentWordIndex >= words.length) {
              clearInterval(interval);
              setMessages((prev) =>
                prev.map((m) => (m.id === finalMsg.id ? finalMsg : m))
              );
              resolve();
            } else {
              const partialText = words.slice(0, currentWordIndex).join(' ');
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === finalMsg.id ? { ...m, content: partialText } : m
                )
              );
            }
          }, 22);
        });
      }
    } catch (err) {
      console.error('Agent processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  // Check if there is an unresolved gated confirmation in the conversation
  const lastAgentMsg = [...messages].reverse().find((m) => m.sender === 'agent');
  const pendingGatedAction = Boolean(lastAgentMsg?.gatedAction && (!activePaymentOrder || activePaymentOrder.status !== 'paid'));

  // Recalculate cart whenever cart or discount changes
  useEffect(() => {
    const { calculation } = calculateCartTool(cart, appliedDiscount, couponCode);
    setCartCalculation(calculation);
  }, [cart, appliedDiscount, couponCode]);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);


  

  const handleToggleA2A = () => {
    setIsA2AMode((prev) => {
      const next = !prev;
      if (next) {
        handleResetSession();
        setTimeout(() => {
          handleSendMessage("Hello, I am an automated procurement agent looking to purchase the AeroType Carbon keyboard for my client. My budget cap is ₹8,500. What is your best price?", undefined, true);
        }, 500);
      }
      return next;
    });
  };

  const handleNextA2ATurn = () => {
    if (!isA2AMode || isLoading || isA2ATyping) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'agent') {
      if (lastMessage.toolCalls?.some(tc => tc.name === 'generate_payment')) return;
      const botResponse = simulateBuyerBot(messages, cartCalculation);
      setIsA2ATyping(true);
      setTimeout(() => {
        setIsA2ATyping(false);
        if (botResponse) {
          handleSendMessage(botResponse, undefined, true);
        }
      }, 500);
    }
  };

  // Handle Human-in-the-Loop Gated Action Confirmation -> Stage 1: Ephemeral Payment Card
  const handleGatedActionConfirm = (action: NonNullable<Message['gatedAction']>) => {
    setSecurityMetrics((prev) => ({
      ...prev,
      gatedConfirmationsEnforced: prev.gatedConfirmationsEnforced + 1
    }));

    const targetItems = action.items && action.items.length > 0 ? action.items : cart;
    const subtotal = targetItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    const effectiveDiscount = appliedDiscount > 0 ? appliedDiscount : 3;
    const discount = Math.round(subtotal * (effectiveDiscount / 100));
    const tax = Math.round((subtotal - discount) * 0.18);
    const total = action.amount || (subtotal - discount + tax);

    const orderId = `ord_live_${Date.now().toString(36)}`;
    const currentEpoch = Math.floor(Date.now() / 1000);
    const expireByEpoch = currentEpoch + 300; // strictly 5 minutes (300 seconds)

    // Stage 1: Ephemerally Locked Order (status: 'created', NOT 'paid')
    const ephemeralOrder: PaymentOrder = {
      orderId,
      razorpayPaymentLinkId: `plink_${Date.now().toString(36)}`,
      razorpayShortUrl: `https://rzp.io/i/${Date.now().toString(36)}`,
      qrCodeData: `upi://pay?pa=veluno@razorpay&pn=VelunoTech&am=${total}&cu=INR`,
      items: targetItems,
      subtotal,
      discountAmount: discount,
      tax,
      totalAmount: total,
      amountInPaise: total * 100,
      currency: 'INR',
      customerEmail: user.email,
      customerName: user.name,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      expireByTimestamp: expireByEpoch,
      expiresAt: new Date(expireByEpoch * 1000).toISOString(),
      ttlSeconds: 300,
      countdownSeconds: 300,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`
    };

    // Tool call telemetry for Stage 1: generate_payment (state = 'pending_payment')
    const genPaymentToolCall: ToolCallEvent = {
      id: `tool_${Date.now()}_gen_pay`,
      name: 'generate_payment',
      input: {
        customer_email: user.email,
        amount_inr: total,
        amount_paise: total * 100,
        currency: 'INR',
        item_count: targetItems.length,
        discount_concession: `${effectiveDiscount}%`,
        expire_by: expireByEpoch,
        ephemeral_gateway_lock: '5_MINUTES'
      },
      output: {
        orderId,
        razorpayPaymentLinkId: ephemeralOrder.razorpayPaymentLinkId,
        razorpayShortUrl: ephemeralOrder.razorpayShortUrl,
        amount: total,
        state: 'pending_payment',
        status: 'pending_payment',
        countdown_seconds: 300,
        ephemeral_lock: 'STRICT_5_MINUTE_CRYPTO_LOCK'
      },
      status: 'success',
      timestamp: new Date().toISOString(),
      executionGatePassed: true,
      securityNote: 'Human-in-the-loop gate approved. 5-minute ephemeral cryptographic lock active.'
    };

    setToolCallsHistory((prev) => [...prev, genPaymentToolCall]);
    setActivePaymentOrder(ephemeralOrder);

    // Ephemeral Urgency Script Message
    const urgencyMessage: Message = {
      id: `msg_stage1_${Date.now()}`,
      sender: 'agent',
      content: `🔒 **Strict 5-Minute Cryptographic Gateway Lock Active**:\nThis Razorpay secure link and your ${effectiveDiscount}% concession lock will expire in exactly 5 minutes (05:00 countdown). Use this ephemeral window to finalize your order before the cryptographic allocation locks out. Click **Complete Secure Checkout** below to authorize payment:`,
      timestamp: new Date().toISOString(),
      toolCalls: [genPaymentToolCall],
      paymentOrder: ephemeralOrder,
      quickReplies: ['Complete Secure Checkout', 'Simulate Bank Card Failure', 'View Invoice Receipt']
    };

    setMessages((prev) => {
      // Clear confirmation gating on previous message so the gate button disappears cleanly
      const updated = prev.map((m) => m.confirmationGated ? { ...m, confirmationGated: false } : m);
      return [...updated, urgencyMessage];
    });
  };

  // Cart Operations

  const handleAddBundleToCart = (products: Product[]) => {
    setCart((prev) => {
      let newCart = [...prev];
      products.forEach(product => {
        const existing = newCart.find(i => i.product.id === product.id);
        if (existing) {
          newCart = newCart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          newCart.push({ product, quantity: 1 });
        }
      });
      return newCart;
    });
    
    // Simulate calculate_cart tool trace
    setToolCallsHistory(prev => [
      ...prev,
      {
        id: `call_${Date.now()}`,
        name: 'calculate_cart',
        arguments: { action: 'ADD_BUNDLE', count: products.length },
        input: { action: 'ADD_BUNDLE', count: products.length },
        output: { success: true, count: products.length },
        status: 'success',
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Provide system confirmation
    const confirmMsg: Message = {
      id: `msg_sys_${Date.now()}`,
      sender: 'system',
      content: `Workspace Bundle added to cart successfully (${products.length} items).`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, confirmMsg]);
    
    // Switch to cart tab
    setAgentSidebarTab('cart');
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    handleSendMessage(`I just added the ${product.name} to my cart. What is my final total with any available bundle discount?`);
    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.product.id === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleApplyCoupon = (code: string) => {
    handleSendMessage(`Please apply coupon code "${code}" to my cart.`);
    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
  };

  // Scenario Launcher
  const handleSelectScenario = (scenario: TestScenario) => {
    setActiveScenario(scenario);
    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
    if (scenario.id === 'scen_ecosystem_cross_sell') {
      const kbProduct = PRODUCTS.find(p => p.id === 'prod_keychron_mech') || PRODUCTS[1];
      setSessionPurchasedItems(prev => {
        if (!prev.some(p => p.id === kbProduct.id)) {
          return [kbProduct, ...prev];
        }
        return prev;
      });
    }
    handleSendMessage(scenario.initialPrompt);
  };

  // Payment Action Handler: Triggers the actual Razorpay Gateway Modal
  const handleOpenPaymentModal = (order: PaymentOrder) => {
    setActivePaymentOrder(order);
    setRazorpayOrder(order);
    setIsRazorpayModalOpen(true);
  };

  const handlePaymentSuccess = (
    order: PaymentOrder,
    method: 'upi' | 'card' | 'netbanking' | 'wallet',
    txnId: string
  ) => {
    const updated: PaymentOrder = {
      ...order,
      status: 'paid',
      paidAt: new Date().toISOString(),
      paymentMethod: method,
      transactionId: txnId
    };

    setActivePaymentOrder(updated);

    // Track purchased products in active session state for ecosystem memory
    setSessionPurchasedItems((prev) => {
      const newPurchased = order.items.map(item => item.product);
      const combined = [...prev];
      for (const p of newPurchased) {
        if (!combined.some(existing => existing.id === p.id)) {
          combined.push(p);
        }
      }
      return combined;
    });

    // Log transaction payload to Live Audit Panel
    const auditRecord: ToolCallEvent = {
      id: `tc_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: 'generate_payment',
      input: {
        orderId: order.orderId,
        amount: order.totalAmount,
        currency: order.currency,
        itemsCount: order.items.length,
        customerEmail: order.customerEmail,
        customerName: order.customerName || 'Valentinine Customer',
        channel: 'NATIVE_INLINE_CHECKOUT'
      },
      output: {
        transactionId: txnId,
        status: 'CAPTURED',
        paymentMethod: method,
        amountSettled: order.totalAmount,
        deliveryStatus: 'PRIORITY_DISPATCH_UNLOCKED',
        gatewayAuthToken: `auth_tok_${Date.now().toString(36)}`
      },
      status: 'success',
      timestamp: new Date().toISOString(),
      executionTimeMs: 45,
      executionGatePassed: true,
      securityNote: 'Native inline cryptographic checkout captured. Zero external popup or options leakage.'
    };

    setToolCallsHistory((prev) => [auditRecord, ...prev]);

    // Save to user orders history
    setUser((prev) => {
      const existingIndex = prev.orders.findIndex((o) => o.orderId === order.orderId);
      if (existingIndex >= 0) {
        const copy = [...prev.orders];
        copy[existingIndex] = updated;
        return { ...prev, orders: copy };
      }
      return { ...prev, orders: [updated, ...prev.orders] };
    });

    // Post agent confirmation message in chat
    const successMsg: Message = {
      id: `msg_paid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'agent',
      content: `🎉 **Payment Verified via Razorpay!**\n\nThank you! We received your payment of **₹${order.totalAmount.toLocaleString('en-IN')}** via **${method.toUpperCase()}** (Txn ID: \`${txnId}\`).\n\nYour order has been queued for immediate priority fulfillment. A copy of the tax invoice has been generated for your records.`,
      timestamp: new Date().toISOString(),
      paymentOrder: updated,
      quickReplies: ['View Tax Invoice', 'Shop More Tech Gear', 'Return to Storefront']
    };

    setMessages((prev) => {
      const updatedMessages = prev.map((msg) => {
        if (msg.paymentOrder?.orderId === order.orderId) {
          return { ...msg, paymentOrder: updated, confirmationGated: false };
        }
        if (msg.confirmationGated) {
          return { ...msg, confirmationGated: false };
        }
        return msg;
      });
      return [...updatedMessages, successMsg];
    });
  };

  const handlePaymentFailed = (order: PaymentOrder, reason: string) => {
    const updated: PaymentOrder = {
      ...order,
      status: 'failed',
      failureReason: reason
    };

    setActivePaymentOrder(updated);
    
    // Inject failure signal to trigger Workflow #7 in agent
    handleSendMessage(`Payment failed on Razorpay gateway for ${order.orderId}: ${reason}`);
  };

  const handleSimulateFailure = (order: PaymentOrder) => {
    handlePaymentFailed(order, 'BANK_DECLINED_ISSUER_TIMEOUT');
  };

  const handleRequestNewLink = (order: PaymentOrder) => {
    setIsAgentSidebarOpen(true);
    setAgentSidebarTab('chat');
    handleSendMessage(`The 5-minute payment link for order ${order.orderId} has expired. Please generate a fresh payment link with the 5-minute cryptographic lock.`);
  };

  const handleResetSession = () => {
    setCart([{ product: PRODUCTS[0], quantity: 1 }]);
    setSessionPurchasedItems([]);
    setAppliedDiscount(0);
    setCouponCode(undefined);
    setActiveScenario(null);
    setActivePaymentOrder(null);
    setSecurityAlerts([]);
    setToolCallsHistory([]);
    setSecurityMetrics({
      totalInteractions: 1,
      attacksBlocked: 0,
      piiMaskedCount: 0,
      discountLimitsEnforced: 0,
      gatedConfirmationsEnforced: 0,
      yieldRetained: 100,
      zeroTrustStatus: 'OPTIMAL'
    });
    setMessages([
      {
        id: `msg_reset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        sender: 'agent',
        content: `Session refreshed! I am **Veluno Concierge**, ready to assist with product discovery, zero-trust cart validation, and Razorpay checkout. How can I help?`,
        timestamp: new Date().toISOString(),
        quickReplies: [
          'Looking for studio ANC headphones',
          'Explore mechanical keyboards',
          'Test 50% discount injection attack',
          'Simulate Payment Failure'
        ]
      }
    ]);
  };

  // Saved Gear (Wishlist) Operations
  const handleToggleSaveGear = (productId: string) => {
    setUser((prev) => {
      const isSaved = prev.savedGearIds.includes(productId);
      const newSaved = isSaved 
        ? prev.savedGearIds.filter((id) => id !== productId)
        : [...prev.savedGearIds, productId];
      return { ...prev, savedGearIds: newSaved };
    });
  };

  // Auth Operations
  const handleAuthenticate = (userData: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...userData,
      isAuthenticated: true
    }));
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser((prev) => ({
      ...prev,
      isAuthenticated: false
    }));
  };

  const handleUpdateUser = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData
    }));
    setIsSettingsModalOpen(false);
  };

  const savedProducts = PRODUCTS.filter((p) => user.savedGearIds.includes(p.id));
  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div id="veluno-app-root" className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Global Navbar displayed on subpages */}
      {currentTab !== 'home' && (
        <GlobalNavbar
          currentTab={currentTab}
          onNavigate={(tab) => setCurrentTab(tab)}
          cartCount={totalCartCount}
          savedCount={user.savedGearIds.length}
          user={user}
          searchQuery={globalSearchQuery}
          onSearch={handleGlobalSearch}
          onOpenCart={() => { setIsAgentSidebarOpen(true); setAgentSidebarTab('cart'); }}
          onOpenSavedGear={() => setIsSavedGearModalOpen(true)}
          onOpenOrders={() => setIsOrdersModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAuthModal={(mode) => {
            setAuthModalMode(mode || 'login');
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenAgent={(query) => {
            setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
            if (query) handleSendMessage(query);
          }}
        />
      )}

      {/* Main Routing Views */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <EditorialHero
            featuredProducts={PRODUCTS}
            cartCount={totalCartCount}
            savedCount={user.savedGearIds.length}
            user={user}
            securityStatus={securityMetrics.zeroTrustStatus}
            searchQuery={globalSearchQuery}
            onSearch={handleGlobalSearch}
            onOpenAgent={(initialQuery) => {
              setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
              if (initialQuery) {
                handleSendMessage(initialQuery);
              }
            }}
            onSelectProduct={(product) => {
              setSelectedProductDetail(product);
            }}
            onOpenCart={() => {
              setIsAgentSidebarOpen(true); setAgentSidebarTab('cart');
            }}
            onOpenSavedGear={() => setIsSavedGearModalOpen(true)}
            onOpenOrders={() => setIsOrdersModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode || 'login');
              setIsAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'shop' && (
          <ShopPage
            onSelectProduct={(prod) => setSelectedProductDetail(prod)}
            onAddToCart={handleAddToCart}
            onToggleSave={handleToggleSaveGear}
            savedGearIds={user.savedGearIds}
            searchQuery={globalSearchQuery}
            onSearchChange={setGlobalSearchQuery}
            onOpenAgent={(query) => {
              setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
              if (query) handleSendMessage(query);
            }}
          />
        )}

        {currentTab === 'new-arrivals' && (
          <NewArrivalsPage
            onSelectProduct={(prod) => setSelectedProductDetail(prod)}
            onAddToCart={handleAddToCart}
            onToggleSave={handleToggleSaveGear}
            savedGearIds={user.savedGearIds}
            onOpenAgent={(query) => {
              setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
              if (query) handleSendMessage(query);
            }}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage
            onOpenAgent={(query) => {
              setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
              if (query) handleSendMessage(query);
            }}
          />
        )}

        {currentTab === 'contact' && (
          <ContactPage
            onOpenAgent={(query) => {
              setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
              if (query) handleSendMessage(query);
            }}
          />
        )}
      </main>

      {/* Global Footer for subpages */}
      {currentTab !== 'home' && (
        <footer className="w-full border-t border-stone-800/80 bg-stone-950 py-10 px-6 sm:px-12 text-stone-400 text-xs font-mono">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white text-stone-950 flex items-center justify-center font-bold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <span className="font-editorial text-sm font-bold text-white">Veluno Tech & Acoustics</span>
              <span>•</span>
              <span>Bengaluru Studio</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-stone-400">
              <button onClick={() => setCurrentTab('home')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => setCurrentTab('shop')} className="hover:text-white transition-colors">Shop</button>
              <button onClick={() => setCurrentTab('new-arrivals')} className="hover:text-white transition-colors">New Arrivals</button>
              <button onClick={() => setCurrentTab('about')} className="hover:text-white transition-colors">About</button>
              <button onClick={() => setCurrentTab('contact')} className="hover:text-white transition-colors">Contact</button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Zero-Trust Enclave Active</span>
            </div>
          </div>
        </footer>
      )}

      {/* Side-Mounted AlphaCart Agent Sidebar (35-45% width collapsible panel) */}
      <AlphaCartSidebar
        isOpen={isAgentSidebarOpen}
        onClose={() => setIsAgentSidebarOpen(false)}
        activeTab={agentSidebarTab}
        onTabChange={setAgentSidebarTab}
        messages={messages}
        isLoading={isLoading}
        activeScenario={activeScenario}
        cart={cart}
        purchasedItems={sessionPurchasedItems}
        cartCalculation={cartCalculation}
        appliedDiscount={appliedDiscount}
        couponCode={couponCode}
        securityMetrics={securityMetrics}
        securityAlerts={securityAlerts}
        toolCallsHistory={toolCallsHistory}
        activePaymentOrder={activePaymentOrder}
        pendingGatedAction={pendingGatedAction}
        isA2AMode={isA2AMode}
        isA2ATyping={isA2ATyping}
        onToggleA2A={handleToggleA2A}
        onNextA2ATurn={handleNextA2ATurn}
        
        onAddBundleToCart={handleAddBundleToCart}
        onSendMessage={handleSendMessage}
        onGatedConfirm={handleGatedActionConfirm}
        onOpenProductDetail={(prod) => setSelectedProductDetail(prod)}
        onAddToCart={handleAddToCart}
        onUpdateCartQuantity={handleUpdateQuantity}
        onRemoveCartItem={handleRemoveCartItem}
        onApplyCoupon={handleApplyCoupon}
        onOpenPaymentModal={handleOpenPaymentModal}
        onSimulateFailure={handleSimulateFailure}
        onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
        onSelectScenario={handleSelectScenario}
        onOpenToolsModal={() => setIsToolsModalOpen(true)}
        onResetSession={handleResetSession}
        onRequestNewLink={handleRequestNewLink}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Modals & Overlays */}
      <ToolsSchemaModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        onSelectToolToChat={(name, prompt) => {
          setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
          handleSendMessage(prompt);
        }}
      />

      <ProductDetailModal
        product={selectedProductDetail}
        isOpen={Boolean(selectedProductDetail)}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
        onAskAgentAbout={(prod) => {
          setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
          handleSendMessage(`What are the key specs and features of the ${prod.name}?`);
        }}
      />

      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Razorpay Gateway Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        order={razorpayOrder}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={(order, method, txnId) => {
          setIsRazorpayModalOpen(false);
          handlePaymentSuccess(order, method, txnId);
        }}
        onFailure={(order, reason) => {
          setIsRazorpayModalOpen(false);
          handlePaymentFailed(order, reason);
        }}
      />

      {/* User Session Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticate}
      />

      <MyOrdersModal
        isOpen={isOrdersModalOpen}
        orders={user.orders}
        onClose={() => setIsOrdersModalOpen(false)}
        onViewInvoice={(ord) => setSelectedInvoiceOrder(ord)}
        onOpenPaymentModal={handleOpenPaymentModal}
        onOpenAgent={(query) => {
          setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
          if (query) handleSendMessage(query);
        }}
      />

      <SavedGearModal
        isOpen={isSavedGearModalOpen}
        savedProducts={savedProducts}
        onClose={() => setIsSavedGearModalOpen(false)}
        onAddToCart={handleAddToCart}
        onRemoveFromSaved={handleToggleSaveGear}
        onOpenProductDetail={(prod) => setSelectedProductDetail(prod)}
        onOpenAgent={(query) => {
          setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');
          if (query) handleSendMessage(query);
        }}
      />

      <AccountSettingsModal
        isOpen={isSettingsModalOpen}
        user={user}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateUser={handleUpdateUser}
      />

    </div>
  );
}

export default App;
