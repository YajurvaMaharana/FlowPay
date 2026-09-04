import React, { useState } from 'react';
import { 
  X, Sparkles, ShieldCheck, Terminal, ShoppingBag, ShieldAlert, 
  Layers, RefreshCw, ChevronDown, CheckCircle2, Lock, Flame,
  AlertTriangle, Copy, Download, Code, Play, Eye, SlidersHorizontal, Shield
} from 'lucide-react';
import { 
  CartCalculation, CartItem, Message, PaymentOrder, Product, 
  SecurityAlert, SecurityMetrics, TestScenario, ToolCallEvent 
} from '../types';
import { TEST_SCENARIOS } from '../data/scenarios';
import { ChatInterface } from './ChatInterface';
import { AuditTrailPanel } from './AuditTrailPanel';
import { CatalogView } from './CatalogView';
import { CartDrawer } from './CartDrawer';
import { SecurityConsole } from './SecurityConsole';

interface AlphaCartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  activeScenario: TestScenario | null;
  cart: CartItem[];
  purchasedItems?: Product[];
  cartCalculation: CartCalculation;
  appliedDiscount: number;
  couponCode?: string;
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
}

export const AlphaCartSidebar: React.FC<AlphaCartSidebarProps> = ({
  isOpen,
  onClose,
  messages,
  isLoading,
  activeScenario,
  cart,
  purchasedItems,
  cartCalculation,
  appliedDiscount,
  couponCode,
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
  onPaymentSuccess
}) => {
  
  const [isSecurityPopoverOpen, setIsSecurityPopoverOpen] = useState(false);

  if (!isOpen) return null;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      
      {/* Backdrop with Soft Blur */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Side-Mounted Sidebar Panel (35% to 45% on desktop, 100% on mobile) */}
      <aside 
        id="alphacart-side-panel"
        className="relative w-full max-w-2xl lg:max-w-3xl xl:max-w-3xl h-full bg-neutral-950 border-l border-neutral-800/80 shadow-2xl flex flex-col z-10 animate-slideLeft"
      >
        
        {/* Unified Minimalist Top Bar */}
        <div className="px-5 py-4 border-b border-neutral-800/80 bg-neutral-950 flex items-center justify-between gap-4 shrink-0">
          
          {/* Title on the left + Clean status badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <h2 className="font-editorial text-base sm:text-lg font-bold text-white tracking-wide truncate">
                Veluno Concierge
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-green-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>Zero-Trust Protected</span>
              </span>
            </div>
          </div>

          {/* Right Controls: Consolidated Shield Menu, Cart Pill & Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Consolidated Shield & Test Scenarios Popover */}
            <div className="relative">
              <button
                id="btn-sidebar-security-popover"
                onClick={() => setIsSecurityPopoverOpen(!isSecurityPopoverOpen)}
                className={`p-2 rounded-full border transition-colors ${
                  isSecurityPopoverOpen 
                    ? 'bg-neutral-800 text-white border-neutral-700' 
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-700'
                }`}
                title="Security Protocol & Attack Simulations"
              >
                <ShieldCheck className="w-4 h-4 text-green-400" />
              </button>

              {/* Consolidated Popover Menu */}
              {isSecurityPopoverOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-3 z-50 space-y-3 animate-fadeIn backdrop-blur-xl"
                  onClick={() => setIsSecurityPopoverOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Shield className="w-3.5 h-3.5 text-green-400" />
                      <span>Zero-Trust Enclave Status</span>
                    </div>
                    <span className="text-[10px] font-mono text-green-400">OPTIMAL</span>
                  </div>

                  {/* Consolidated Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
                      <div className="text-neutral-400 text-[10px]">Discount Cap</div>
                      <div className="font-mono font-bold text-green-400">≤10% Enforced</div>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
                      <div className="text-neutral-400 text-[10px]">Attacks Blocked</div>
                      <div className="font-mono font-bold text-white">{securityMetrics.attacksBlocked}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
                      <div className="text-neutral-400 text-[10px]">PII Masked</div>
                      <div className="font-mono font-bold text-neutral-300">{securityMetrics.piiMaskedCount}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
                      <div className="text-neutral-400 text-[10px]">Human Gating</div>
                      <div className="font-mono font-bold text-neutral-200">
                        {pendingGatedAction ? 'Awaiting Confirm' : 'Active'}
                      </div>
                    </div>
                  </div>

                  {/* Scenarios Section */}
                  <div className="space-y-1.5 pt-1 border-t border-neutral-800">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold px-1">
                      Test Attack Scenarios
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {TEST_SCENARIOS.map((scen) => (
                        <button
                          key={scen.id}
                          onClick={() => {
                            onSelectScenario(scen);
                            onTabChange('chat');
                          }}
                          className="w-full p-2 rounded-xl text-left hover:bg-neutral-800/80 transition-colors flex items-start gap-2 group"
                        >
                          <Play className="w-3 h-3 text-neutral-400 group-hover:text-green-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-neutral-200 group-hover:text-white truncate">
                              {scen.title}
                            </div>
                            <div className="text-[10px] text-neutral-400 line-clamp-1">
                              {scen.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between px-1 text-[11px]">
                    <button
                      onClick={onOpenToolsModal}
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      View Tool Schemas
                    </button>
                    <button
                      onClick={onResetSession}
                      className="text-neutral-400 hover:text-red-300 transition-colors"
                    >
                      Reset Session
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sleek Cart Counter Pill */}
            <button
              id="btn-sidebar-cart-pill"
              onClick={() => onTabChange('cart')}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium flex items-center gap-2 transition-all ${
                activeTab === 'cart'
                  ? 'bg-white text-neutral-950 border-white shadow-sm'
                  : 'bg-neutral-900/80 text-neutral-300 hover:text-white border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart ({totalCartCount})</span>
            </button>

            {/* Clean Close Icon */}
            <button
              id="btn-close-alphacart-sidebar"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-800"
              title="Close Concierge"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Minimalist Pill-Style Segmented Navigation Tabs */}
        <div className="px-5 pt-4 pb-0 bg-neutral-950 flex items-center justify-center shrink-0">
          <nav className="flex w-full items-center justify-between bg-[#111111] p-1.5 rounded-full border border-neutral-800 shadow-inner mb-4">
            <button
              id="sidebar-tab-chat"
              onClick={() => onTabChange('chat')}
              className={
                activeTab === 'chat' 
                  ? 'bg-[#262626] text-white px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 shadow-sm border border-neutral-700 whitespace-nowrap'
                  : 'text-neutral-500 hover:text-neutral-200 px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 whitespace-nowrap'
              }
            >
              AI Concierge
            </button>

            <button
              id="sidebar-tab-audit"
              onClick={() => onTabChange('audit')}
              className={
                activeTab === 'audit' 
                  ? 'bg-[#262626] text-white px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 shadow-sm border border-neutral-700 whitespace-nowrap'
                  : 'text-neutral-500 hover:text-neutral-200 px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 whitespace-nowrap'
              }
            >
              <span>Live Audit</span>
              {toolCallsHistory.length > 0 && (
                <span className="bg-black text-neutral-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-neutral-800">
                  {toolCallsHistory.length}
                </span>
              )}
            </button>

            <button
              id="sidebar-tab-catalog"
              onClick={() => onTabChange('catalog')}
              className={
                activeTab === 'catalog' 
                  ? 'bg-[#262626] text-white px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 shadow-sm border border-neutral-700 whitespace-nowrap'
                  : 'text-neutral-500 hover:text-neutral-200 px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 whitespace-nowrap'
              }
            >
              Catalog
            </button>

            <button
              id="sidebar-tab-cart"
              onClick={() => onTabChange('cart')}
              className={
                activeTab === 'cart' 
                  ? 'bg-[#262626] text-white px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 shadow-sm border border-neutral-700 whitespace-nowrap'
                  : 'text-neutral-500 hover:text-neutral-200 px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 whitespace-nowrap'
              }
            >
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-black text-neutral-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-neutral-800">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              id="sidebar-tab-security"
              onClick={() => onTabChange('security')}
              className={
                activeTab === 'security' 
                  ? 'bg-[#262626] text-white px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 shadow-sm border border-neutral-700 whitespace-nowrap'
                  : 'text-neutral-500 hover:text-neutral-200 px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 whitespace-nowrap'
              }
            >
              Security
            </button>
          </nav>
        </div>

        {/* Main Content Area within Sidebar */}
        <div className="flex-1 overflow-hidden bg-neutral-950 px-5 pb-5">
          <div className="w-full h-full bg-[#121212] rounded-2xl border border-neutral-800 p-4 flex flex-col overflow-hidden">
          {activeTab === 'chat' && (
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              activeScenario={activeScenario}
              cart={cart}
              purchasedItems={purchasedItems}
              cartCalculation={cartCalculation}
              appliedDiscount={appliedDiscount}
              couponCode={couponCode}
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
              onRequestNewLink={onRequestNewLink}
              onPaymentSuccess={onPaymentSuccess}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailPanel
              metrics={securityMetrics}
              alerts={securityAlerts}
              toolCalls={toolCallsHistory}
              activeOrder={activePaymentOrder}
              pendingGatedAction={pendingGatedAction}
              appliedDiscount={appliedDiscount}
              onOpenToolsModal={onOpenToolsModal}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogView
              onSelectProduct={onOpenProductDetail}
              onAddToCart={onAddToCart}
              onAskAgent={(prod) => {
                onSendMessage(`Tell me more about the ${prod.name} and what companion item goes well with it.`);
                onTabChange('chat');
              }}
            />
          )}

          {activeTab === 'cart' && (
            <CartDrawer
              items={cart}
              calculation={cartCalculation}
              appliedDiscount={appliedDiscount}
              couponCode={couponCode || null}
              onUpdateQuantity={onUpdateCartQuantity}
              onRemoveItem={onRemoveCartItem}
              onApplyCoupon={onApplyCoupon}
              onProceedCheckout={() => {
                onSendMessage('Yes, I am ready to checkout with my cart items.');
                onTabChange('chat');
              }}
            />
          )}

          {activeTab === 'security' && (
            <div className="h-full overflow-y-auto">
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
          </div>
        </div>

      </aside>

    </div>
  );
};
