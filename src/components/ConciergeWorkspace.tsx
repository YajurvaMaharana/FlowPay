import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Terminal, ShoppingBag, ShieldAlert, 
  Layers, RefreshCw, ChevronDown, CheckCircle2, Lock, Flame,
  AlertTriangle, Copy, Download, Code, Play, Eye, SlidersHorizontal, 
  Shield, ArrowLeft, Bot, Wrench, ExternalLink, Zap
} from 'lucide-react';
import { 
  CartCalculation, CartItem, Message, PaymentOrder, Product, 
  SecurityAlert, SecurityMetrics, TestScenario, ToolCallEvent, NavigationTab 
} from '../types';
import { TEST_SCENARIOS } from '../data/scenarios';
import { ChatInterface } from './ChatInterface';
import { AuditTrailPanel } from './AuditTrailPanel';
import { CatalogView } from './CatalogView';
import { CartDrawer } from './CartDrawer';
import { SecurityConsole } from './SecurityConsole';
import { TactileMonogramIcon } from './TactileMonogramLogo';

export interface ConciergeWorkspaceProps {
  messages: Message[];
  isLoading: boolean;
  activeScenario: TestScenario | null;
  cart: CartItem[];
  purchasedItems?: Product[];
  cartCalculation: CartCalculation;
  appliedDiscount: number;
  couponCode?: string;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
  securityMetrics: SecurityMetrics;
  securityAlerts: SecurityAlert[];
  toolCallsHistory: ToolCallEvent[];
  activePaymentOrder: PaymentOrder | null;
  pendingGatedAction: boolean;
  isA2AMode?: boolean;
  isA2ATyping?: boolean;
  onToggleA2A?: () => void;
  onNextA2ATurn?: () => void;
  onAddBundleToCart?: (products: Product[]) => void;
  activeTab: 'chat' | 'audit' | 'catalog' | 'cart' | 'security';
  onTabChange: (tab: 'chat' | 'audit' | 'catalog' | 'cart' | 'security') => void;
  onSendMessage: (text: string, imageBase64?: string) => void;
  onGatedConfirm: (action: NonNullable<Message['gatedAction']>) => void;
  onOpenProductDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQuantity: (productId: string, delta: number) => void;
  onRemoveCartItem: (productId: string) => void;
  onApplyCoupon: (code: string) => void;
  onOpenPaymentModal: (order: PaymentOrder) => void;
  onSimulateFailure: (order: PaymentOrder) => void;
  onOpenInvoice: (order: PaymentOrder) => void;
  onSelectScenario: (scenario: TestScenario) => void;
  onOpenToolsModal: () => void;
  onResetSession: () => void;
  onRequestNewLink?: (order: PaymentOrder) => void;
  onPaymentSuccess?: (order: PaymentOrder, method: 'upi' | 'card' | 'netbanking' | 'wallet', txnId: string) => void;
  onNavigateToStore?: (tab?: NavigationTab) => void;
}

export const ConciergeWorkspace: React.FC<ConciergeWorkspaceProps> = ({
  messages,
  isLoading,
  activeScenario,
  cart,
  purchasedItems,
  cartCalculation,
  appliedDiscount,
  couponCode,
  isAuthenticated = false,
  onRequireAuth,
  securityMetrics,
  securityAlerts,
  toolCallsHistory,
  activePaymentOrder,
  pendingGatedAction,
  isA2AMode,
  isA2ATyping,
  onToggleA2A,
  onNextA2ATurn,
  onAddBundleToCart,
  activeTab,
  onTabChange,
  onSendMessage,
  onGatedConfirm,
  onOpenProductDetail,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onApplyCoupon,
  onOpenPaymentModal,
  onSimulateFailure,
  onOpenInvoice,
  onSelectScenario,
  onOpenToolsModal,
  onResetSession,
  onRequestNewLink,
  onPaymentSuccess,
  onNavigateToStore
}) => {
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [isSecurityPopoverOpen, setIsSecurityPopoverOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="concierge-fullscreen-workspace" className="w-full flex-1 flex flex-col min-h-[calc(100vh-73px)] bg-neutral-950 text-neutral-100">
      
      {/* Top Workspace Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-2xl px-4 sm:px-8 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-black/50">
        
        {/* Left: Brand Identity & Enclave Status */}
        <div className="flex items-center gap-3">
          {onNavigateToStore && (
            <button
              onClick={() => onNavigateToStore('home')}
              className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors flex items-center gap-1 text-xs"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </button>
          )}

          <div 
            onClick={() => onTabChange('chat')}
            className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity"
            title="Go to AI Concierge Dashboard"
          >
            <TactileMonogramIcon className="w-8 h-8 group-hover:scale-105 transition-transform shrink-0 drop-shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-neutral-200 transition-colors">
                  Veluno Concierge
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Zero-Trust Enclave</span>
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono hidden md:block">
                Full-Screen AI Merchant Journey • Max 10% Discount Limit • Razorpay 256-Bit Link Locks
              </p>
            </div>
          </div>
        </div>

        {/* Center: Primary Navigation Tabs */}
        <nav className="flex items-center bg-neutral-950/90 p-1 rounded-full border border-neutral-800/90 shadow-inner">
          <button
            id="concierge-tab-chat"
            onClick={() => onTabChange('chat')}
            className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Concierge</span>
          </button>

          <button
            id="concierge-tab-audit"
            onClick={() => onTabChange('audit')}
            className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Audit</span>
            {toolCallsHistory.length > 0 && (
              <span className="bg-neutral-900 text-neutral-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-neutral-700">
                {toolCallsHistory.length}
              </span>
            )}
          </button>

          <button
            id="concierge-tab-catalog"
            onClick={() => onTabChange('catalog')}
            className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>

          <button
            id="concierge-tab-cart"
            onClick={() => onTabChange('cart')}
            className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cart'
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="bg-neutral-900 text-neutral-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-neutral-700">
                {totalCartCount}
              </span>
            )}
          </button>

          <button
            id="concierge-tab-security"
            onClick={() => onTabChange('security')}
            className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all rounded-full flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security</span>
          </button>
        </nav>

        {/* Right: Quick Action Controls, Test Scenarios & Reset */}
        <div className="flex items-center gap-2">
          
          {/* Autonomous A2A Mode Toggle */}
          {onToggleA2A && (
            <button
              id="btn-workspace-toggle-a2a"
              onClick={onToggleA2A}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all ${
                isA2AMode
                  ? 'bg-blue-950/80 text-blue-300 border-blue-600/70 shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
              }`}
              title="Toggle Autonomous Buyer-to-Seller A2A Negotiation"
            >
              <Zap className={`w-3.5 h-3.5 ${isA2AMode ? 'text-blue-400 fill-blue-400' : 'text-neutral-400'}`} />
              <span className="hidden lg:inline">{isA2AMode ? 'A2A Mode Active' : 'Enable A2A'}</span>
            </button>
          )}

          {/* Test Scenarios Dropdown */}
          <div className="relative">
            <button
              id="btn-workspace-scenarios-menu"
              onClick={() => {
                setIsScenarioDropdownOpen(!isScenarioDropdownOpen);
                setIsSecurityPopoverOpen(false);
              }}
              className="px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Test Scenarios</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isScenarioDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 space-y-1 animate-fadeIn backdrop-blur-2xl"
                onClick={() => setIsScenarioDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-neutral-800 text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Attack & Commerce Scenarios</span>
                  <span className="text-[10px] font-mono text-emerald-400">Zero-Trust Enforced</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 p-1">
                  {TEST_SCENARIOS.map((scen) => (
                    <button
                      key={scen.id}
                      onClick={() => {
                        onSelectScenario(scen);
                        onTabChange('chat');
                      }}
                      className="w-full p-2.5 rounded-xl text-left hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-start gap-2.5 transition-colors group"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-700 font-mono text-[9px] font-bold mt-0.5 shrink-0">
                        {scen.badge}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium group-hover:text-white truncate">{scen.title}</div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1">{scen.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tool Schemas Modal Trigger */}
          <button
            onClick={onOpenToolsModal}
            className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
            title="Inspect Model Tool Schemas"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          {/* Reset Session Button */}
          <button
            onClick={onResetSession}
            className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors"
            title="Reset Active Session"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

        </div>

      </header>

      {/* Main Full-Screen Workspace Body */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden bg-neutral-950">
        {activeTab === 'chat' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              activeScenario={activeScenario}
              cart={cart}
              purchasedItems={purchasedItems}
              cartCalculation={cartCalculation}
              appliedDiscount={appliedDiscount}
              couponCode={couponCode}
              isAuthenticated={isAuthenticated}
              onRequireAuth={onRequireAuth}
              onSendMessage={onSendMessage}
              onQuickReply={(reply) => {
                if (reply === 'View Tax Invoice' && activePaymentOrder) {
                  onOpenInvoice(activePaymentOrder);
                } else if ((reply === 'Complete Secure Checkout' || reply === 'Open Razorpay Link') && activePaymentOrder) {
                  onOpenPaymentModal(activePaymentOrder);
                } else {
                  onSendMessage(reply);
                }
              }}
              onGatedConfirm={onGatedConfirm}
              onOpenProductDetail={onOpenProductDetail}
              onAddToCart={onAddToCart}
              onUpdateCartQuantity={onUpdateCartQuantity}
              onRemoveCartItem={onRemoveCartItem}
              onApplyCoupon={onApplyCoupon}
              onOpenPaymentModal={onOpenPaymentModal}
              onSimulateFailure={onSimulateFailure}
              onOpenInvoice={onOpenInvoice}
              onClearScenario={() => {}}
              isA2AMode={isA2AMode}
              isA2ATyping={isA2ATyping}
              onNextA2ATurn={onNextA2ATurn}
              onAddBundleToCart={onAddBundleToCart}
              onRequestNewLink={onRequestNewLink}
              onPaymentSuccess={onPaymentSuccess}
            />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <AuditTrailPanel
              metrics={securityMetrics}
              alerts={securityAlerts}
              toolCalls={toolCallsHistory}
              activeOrder={activePaymentOrder}
              pendingGatedAction={pendingGatedAction}
              appliedDiscount={appliedDiscount}
              onOpenToolsModal={onOpenToolsModal}
            />
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <CatalogView
              onSelectProduct={onOpenProductDetail}
              onAddToCart={onAddToCart}
              onAskAgent={(prod) => {
                onSendMessage(`Tell me more about the ${prod.name} and what companion item goes well with it.`);
                onTabChange('chat');
              }}
            />
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full">
            <CartDrawer
              items={cart}
              calculation={cartCalculation}
              appliedDiscount={appliedDiscount}
              couponCode={couponCode || null}
              isAuthenticated={isAuthenticated}
              onRequireAuth={onRequireAuth}
              onUpdateQuantity={onUpdateCartQuantity}
              onRemoveItem={onRemoveCartItem}
              onApplyCoupon={onApplyCoupon}
              onProceedCheckout={() => {
                onSendMessage('Yes, I am ready to checkout with my cart items.');
                onTabChange('chat');
              }}
            />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <SecurityConsole
              metrics={securityMetrics}
              alerts={securityAlerts}
              toolCalls={toolCallsHistory}
              onOpenToolsModal={onOpenToolsModal}
              isA2AMode={isA2AMode}
              onToggleA2A={onToggleA2A}
            />
          </div>
        )}
      </main>

    </div>
  );
};
