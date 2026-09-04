import React from 'react';
import { Message, PaymentOrder, Product } from '../types';
import { ToolCallBadge } from './ToolCallBadge';
import { PaymentLinkCard } from './PaymentLinkCard';
import { 
  Bot, User, ShieldAlert, Sparkles, ShieldCheck, ArrowRight, 
  Plus, Check, EyeOff, AlertTriangle, ShoppingCart, Info, RotateCcw 
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onQuickReplyClick: (reply: string) => void;
  onGatedActionConfirm: (action: NonNullable<Message['gatedAction']>) => void;
  onOpenProductDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenPaymentModal: (order: PaymentOrder) => void;
  onSimulateFailure: (order: PaymentOrder) => void;
  onOpenInvoice?: (order: PaymentOrder) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onQuickReplyClick,
  onGatedActionConfirm,
  onOpenProductDetail,
  onAddToCart,
  onOpenPaymentModal,
  onSimulateFailure,
  onOpenInvoice
}) => {
  const isUser = message.sender === 'user';

  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Handle bold formatting **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px]">{part.slice(1, -1)}</code>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-neutral-200">
            <span className="text-neutral-400 font-bold">•</span>
            <div className="flex-1">{formattedLine}</div>
          </div>
        );
      }

      return <p key={idx} className="my-0.5 text-neutral-200">{formattedLine}</p>;
    });
  };

  return (
    <div 
      id={`message-${message.id}`} 
      className={`flex gap-3 my-4 animate-fadeIn ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 shadow-sm shrink-0 mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[92%] sm:max-w-[85%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Main Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-[13px] sm:text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tr-sm ml-auto'
              : 'bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-tl-sm'
          }`}
        >
          {/* Header Metadata */}
          <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-neutral-800 text-[10px] opacity-75">
            <span className="font-semibold text-neutral-400">{isUser ? 'You' : 'Veluno Concierge'}</span>
            <div className="flex items-center gap-1.5">
              {message.isPiiMasked && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/50 flex items-center gap-0.5 font-mono text-[9px]">
                  <EyeOff className="w-2.5 h-2.5" /> PII Masked
                </span>
              )}
              <span className="font-mono text-neutral-400">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Formatted Text Content */}
          <div className="space-y-1">{formatContent(message.content)}</div>
        </div>

        {/* Security Alerts Banner (Zero-Trust Feedback) */}
        {message.securityAlerts && message.securityAlerts.length > 0 && (
          <div className="space-y-1.5">
            {message.securityAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-start gap-2.5 shadow-md"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider font-mono">{alert.type}</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-300 text-[9px] font-mono uppercase">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-amber-100">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tool Call Traces */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
              <span>Agent Tool Telemetry:</span>
            </div>
            {message.toolCalls.map((tc) => (
              <ToolCallBadge key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Suggested Product Cards Grid */}
        {message.suggestedProducts && message.suggestedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {message.suggestedProducts.map((product) => (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-500/50 transition-all flex flex-col justify-between space-y-2.5 group shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-neutral-800 shrink-0 shadow-inner"
                  />
                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-white truncate">{product.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-300 border border-neutral-700/40 shrink-0 font-mono">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 line-clamp-1">{product.tagline}</div>
                    <div className="text-xs font-bold text-green-400 font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Key Product Specs / Features Chips */}
                {((product.features && product.features.length > 0) || (product.specs && Object.keys(product.specs).length > 0)) && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-neutral-800/60">
                    {product.features && product.features.slice(0, 2).map((feat, fIdx) => (
                      <span 
                        key={`feat-${fIdx}`} 
                        className="text-[9px] px-2 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-800 text-neutral-300 font-mono truncate max-w-[130px]"
                      >
                        {feat}
                      </span>
                    ))}
                    {!product.features && product.specs && Object.entries(product.specs).slice(0, 2).map(([key, val], sIdx) => (
                      <span 
                        key={`spec-${sIdx}`} 
                        className="text-[9px] px-2 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-800 text-neutral-300 font-mono truncate max-w-[130px]"
                      >
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
                  <button
                    id={`btn-view-card-${product.id}`}
                    onClick={() => onOpenProductDetail(product)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <Info className="w-3 h-3 text-neutral-400" />
                    <span>Specs</span>
                  </button>

                  <button
                    id={`btn-add-card-${product.id}`}
                    onClick={() => onAddToCart(product)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-all shadow-md shadow-neutral-900/30 hover:scale-[1.02]"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cross-Sell Bundle Special Offer Card */}
        {message.crossSellOffer && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-neutral-950/40 via-neutral-900 to-neutral-900 border border-neutral-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
                <Sparkles className="w-4 h-4 text-neutral-400" />
                <span>Special 10% Bundle Discount Offer</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-950 text-green-300 border border-green-700/40 text-[10px] font-bold">
                Save ₹{message.crossSellOffer.savings.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={message.crossSellOffer.crossSellProduct.image}
                  alt={message.crossSellOffer.crossSellProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <div className="font-semibold text-neutral-100">{message.crossSellOffer.crossSellProduct.name}</div>
                  <div className="text-[10px] text-neutral-400">Regular: ₹{message.crossSellOffer.crossSellProduct.price.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <button
                id={`btn-add-cross-sell-${message.crossSellOffer.crossSellProduct.id}`}
                onClick={() => onQuickReplyClick(`Add the ${message.crossSellOffer?.crossSellProduct.name}`)}
                className="px-3 py-1.5 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Companion</span>
              </button>
            </div>
          </div>
        )}

        {/* Human-in-the-Loop Gated Execution Confirmation Button */}
        {message.confirmationGated && message.gatedAction && (
          <div className="p-3.5 rounded-2xl bg-green-950/30 border border-green-500/40 space-y-2 shadow-lg">
            <div className="flex items-center gap-1.5 text-xs text-green-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Protocol #3: Execution Gating Confirmation Required</span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Veluno Concierge requires your explicit human approval before generating the binding payment link and processing cart data:
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                id="btn-gated-confirm-action"
                onClick={(e) => {
                  e.preventDefault();
                  onGatedActionConfirm(message.gatedAction!);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-green-900/40"
              >
                <Check className="w-4 h-4" />
                <span>{message.gatedAction.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Payment Link Card Embed */}
        {message.paymentOrder && (
          <PaymentLinkCard
            order={message.paymentOrder}
            onOpenPaymentModal={onOpenPaymentModal}
            onSimulateFailure={onSimulateFailure}
            onOpenInvoice={onOpenInvoice}
          />
        )}

        {/* Quick Action / Reply Chips */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.quickReplies.map((reply, idx) => (
              <button
                key={idx}
                id={`chip-quick-reply-${idx}`}
                onClick={() => onQuickReplyClick(reply)}
                className="px-3.5 py-1.5 rounded-full bg-transparent border border-neutral-700 hover:border-neutral-400 text-neutral-300 text-[13px] sm:text-sm transition-all"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 shadow shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
