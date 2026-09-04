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
import { PaymentModal } from './components/PaymentModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ToolsSchemaModal } from './components/ToolsSchemaModal';
import { AuthModal } from './components/AuthModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { SavedGearModal } from './components/SavedGearModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';

export function App() {
  // Navigation Routing State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');

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

  // Cart & Calculation State
  const [cart, setCart] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 1 } // Preloaded with Apex ANC Pro
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
    yieldRetained: 100,
    zeroTrustStatus: 'OPTIMAL'
  });

  // Modal States
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<PaymentOrder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
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

  // Handle User Message Submission
  const handleSendMessage = async (text: string) => {
    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');

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
        // Also sync with user orders
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

      // Stream text response smoothly for conversational commerce
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

    } catch (err) {
      console.error('Agent processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Human-in-the-Loop Gated Action Confirmation
  const handleGatedActionConfirm = (action: NonNullable<Message['gatedAction']>) => {
    setSecurityMetrics((prev) => ({
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
        id: `msg_reset_${Date.now()}`,
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
        cartCalculation={cartCalculation}
        appliedDiscount={appliedDiscount}
        couponCode={couponCode}
        securityMetrics={securityMetrics}
        securityAlerts={securityAlerts}
        toolCallsHistory={toolCallsHistory}
        activePaymentOrder={activePaymentOrder}
        pendingGatedAction={pendingGatedAction}
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
