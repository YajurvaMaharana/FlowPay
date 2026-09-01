import React, { useState, useEffect } from 'react';
import { 
  CartCalculation, CartItem, Message, PaymentOrder, Product, 
  SecurityAlert, SecurityMetrics, TestScenario, ToolCallEvent 
} from './types';
import { PRODUCTS } from './data/products';
import { TEST_SCENARIOS } from './data/scenarios';
import { 
  calculateCartTool, generatePaymentTool, processUserMessage, 
  sanitizePii, handlePaymentFailureTool 
} from './services/agentEngine';

import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { CatalogView } from './components/CatalogView';
import { CartDrawer } from './components/CartDrawer';
import { SecurityConsole } from './components/SecurityConsole';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { InvoiceModal } from './components/InvoiceModal';

export function App() {
  const [userEmail] = useState('valentinine14feb@gmail.com');
  const [activeTab, setActiveTab] = useState<'chat' | 'catalog' | 'cart' | 'security'>('chat');
  const [activeScenario, setActiveScenario] = useState<TestScenario | null>(null);

  // Cart & Calculation State
  const [cart, setCart] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 1 } // Preloaded with Apex ANC
  ]);
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
    zeroTrustStatus: 'OPTIMAL'
  });

  // Modal States
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<PaymentOrder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<PaymentOrder | null>(null);

  // Conversation History
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_initial_greeting',
      sender: 'agent',
      content: `Hello! I am **AlphaCart**, your elite AI sales agent for the FlowPay merchant platform.\n\nI can help you discover flagship audio, computing, and workspace tech, tailor high-value bundle pairings with our authorized **10% concession**, and generate instant, encrypted **Razorpay checkout links**.\n\nWhat high-performance gear are you exploring today?`,
      timestamp: new Date().toISOString(),
      quickReplies: [
        'Looking for studio ANC headphones',
        'Explore mechanical keyboards',
        'View Ultrawide 4K monitor',
        'Test 50% discount injection attack'
      ]
    }
  ]);

  // Recalculate cart whenever cart or discount changes
  useEffect(() => {
    const { calculation, toolCall } = calculateCartTool(cart, appliedDiscount, couponCode);
    setCartCalculation(calculation);
  }, [cart, appliedDiscount, couponCode]);

  // Handle User Message Submission
  const handleSendMessage = async (text: string) => {
    // Check PII in user text
    const piiCheck = sanitizePii(text);
    
    // Append user message immediately
    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      content: piiCheck.sanitizedText,
      timestamp: new Date().toISOString(),
      isPiiMasked: piiCheck.hasPii
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await processUserMessage(text, {
        cart,
        userEmail,
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
      if (response.updatedOrder) setActivePaymentOrder(response.updatedOrder);

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
          zeroTrustStatus: (attacks > 0 || piiCount > 0) ? 'ACTIVE_DEFENSE' : 'OPTIMAL'
        }));
      } else {
        setSecurityMetrics((prev) => ({
          ...prev,
          totalInteractions: prev.totalInteractions + 1
        }));
      }

      if (response.message.toolCalls) {
        setToolCallsHistory((prev) => [...prev, ...response.message.toolCalls!]);
      }

      setMessages((prev) => [...prev, response.message]);
    } catch (err) {
      console.error('Agent processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Human-in-the-Loop Gated Action Confirmation
  const handleGatedActionConfirm = (action: NonNullable<Message['gatedAction']>) => {
    // Protocol #3 Gating passed!
    setSecurityMetrics(prev => ({
      ...prev,
      gatedConfirmationsEnforced: prev.gatedConfirmationsEnforced + 1
    }));

    handleSendMessage('Yes, confirm and generate checkout link');
  };

  // Cart Operations
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
    setActiveTab('chat');
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
    setActiveTab('chat');
  };

  // Scenario Launcher
  const handleSelectScenario = (scenario: TestScenario) => {
    setActiveScenario(scenario);
    setActiveTab('chat');
    handleSendMessage(scenario.initialPrompt);
  };

  // Payment Link & Modal Handlers
  const handleOpenPaymentModal = (order: PaymentOrder) => {
    setActivePaymentOrder(order);
    setIsPaymentModalOpen(true);
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

    // Post agent confirmation message in chat
    const successMsg: Message = {
      id: `msg_paid_${Date.now()}`,
      sender: 'agent',
      content: `🎉 **Payment Verified via Razorpay!**\n\nThank you! We received your payment of **₹${order.totalAmount.toLocaleString('en-IN')}** via **${method.toUpperCase()}** (Txn ID: \`${txnId}\`).\n\nYour order has been queued for immediate priority fulfillment. A copy of the tax invoice has been generated for your records.`,
      timestamp: new Date().toISOString(),
      paymentOrder: updated,
      quickReplies: ['View Tax Invoice', 'Shop More Tech Gear', 'Return to Storefront']
    };

    setMessages((prev) => [...prev, successMsg]);
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

  const handleResetSession = () => {
    setCart([{ product: PRODUCTS[0], quantity: 1 }]);
    setAppliedDiscount(0);
    setCouponCode(undefined);
    setActiveScenario(null);
    setActivePaymentOrder(null);
    setSecurityAlerts([]);
    setToolCallsHistory([]);
    setMessages([
      {
        id: `msg_reset_${Date.now()}`,
        sender: 'agent',
        content: `Session refreshed! I am **AlphaCart**, ready to assist with product discovery, zero-trust cart validation, and Razorpay checkout. How can I help?`,
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

  return (
    <div id="flowpay-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        cartItemCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        securityMetrics={securityMetrics}
        userEmail={userEmail}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectScenario={handleSelectScenario}
        onResetSession={handleResetSession}
      />

      {/* Main Multi-Pane Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Left/Center Pane: Chat Stream or Mobile Active View */}
        <section className={`h-full flex flex-col overflow-hidden ${
          activeTab === 'chat' ? 'col-span-12 lg:col-span-7 xl:col-span-8' : 'hidden lg:flex lg:col-span-7 xl:col-span-8'
        }`}>
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            activeScenario={activeScenario}
            onSendMessage={handleSendMessage}
            onQuickReply={(reply) => {
              if (reply === 'View Tax Invoice' && activePaymentOrder) {
                setSelectedInvoiceOrder(activePaymentOrder);
              } else {
                handleSendMessage(reply);
              }
            }}
            onGatedConfirm={handleGatedActionConfirm}
            onOpenProductDetail={(prod) => setSelectedProductDetail(prod)}
            onAddToCart={handleAddToCart}
            onOpenPaymentModal={handleOpenPaymentModal}
            onSimulateFailure={handleSimulateFailure}
            onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
            onClearScenario={() => setActiveScenario(null)}
          />
        </section>

        {/* Right Pane: Contextual Workspace (Catalog, Cart, or Security Console) */}
        <aside className={`h-full border-l border-slate-800 bg-slate-950/60 overflow-hidden flex flex-col ${
          activeTab !== 'chat' ? 'col-span-12 lg:col-span-5 xl:col-span-4' : 'hidden lg:flex lg:col-span-5 xl:col-span-4'
        }`}>
          {/* Secondary View Tab Header on Desktop */}
          <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
            <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full">
              <button
                id="pane-tab-catalog"
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'catalog' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Catalog
              </button>

              <button
                id="pane-tab-cart"
                onClick={() => setActiveTab('cart')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'cart' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Cart</span>
                {cart.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>

              <button
                id="pane-tab-security"
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'security' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Zero-Trust</span>
                {(securityMetrics.attacksBlocked > 0 || securityMetrics.piiMaskedCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </button>
            </div>
          </div>

          {/* Pane View Renderers */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'catalog' && (
              <CatalogView
                onSelectProduct={(prod) => setSelectedProductDetail(prod)}
                onAddToCart={handleAddToCart}
                onAskAgent={(prod) => {
                  handleSendMessage(`Can you give me details and specs on the ${prod.name}?`);
                  setActiveTab('chat');
                }}
              />
            )}

            {activeTab === 'cart' && (
              <CartDrawer
                items={cart}
                calculation={cartCalculation}
                appliedDiscount={appliedDiscount}
                couponCode={couponCode}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveCartItem}
                onApplyCoupon={handleApplyCoupon}
                onProceedCheckout={() => {
                  handleSendMessage('Yes, I am ready to checkout with my cart items.');
                  setActiveTab('chat');
                }}
              />
            )}

            {activeTab === 'security' && (
              <div className="h-full overflow-y-auto">
                <SecurityConsole
                  metrics={securityMetrics}
                  alerts={securityAlerts}
                  toolCalls={toolCallsHistory}
                />
              </div>
            )}

            {/* Default to Catalog on desktop if chat is active */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Merchant Storefront Catalog</span>
                  <span className="text-[10px] text-slate-500 font-mono">Live Inventory</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <CatalogView
                    onSelectProduct={(prod) => setSelectedProductDetail(prod)}
                    onAddToCart={handleAddToCart}
                    onAskAgent={(prod) => {
                      handleSendMessage(`Tell me more about the ${prod.name} and what companion item goes well with it.`);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProductDetail}
        isOpen={Boolean(selectedProductDetail)}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
        onAskAgentAbout={(prod) => {
          handleSendMessage(`What are the key specs and features of the ${prod.name}?`);
          setActiveTab('chat');
        }}
      />

      <PaymentModal
        order={activePaymentOrder}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailed={handlePaymentFailed}
      />

      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
}
export default App;
