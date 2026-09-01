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
  const isSystem = message.sender === 'system';

  const formatContent = (content: string) => {
    // Split by newlines and format bold / bullets
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
          return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-[11px]">{part.slice(1, -1)}</code>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-slate-200">
            <span className="text-indigo-400 font-bold">•</span>
            <div className="flex-1">{formattedLine}</div>
          </div>
        );
      }

      return <p key={idx} className="my-0.5 text-slate-200">{formattedLine}</p>;
    });
  };

  return (
    <div 
      id={`message-${message.id}`} 
      className={`flex gap-3 my-4 animate-fadeIn ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shrink-0 mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[92%] sm:max-w-[85%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Main Message Bubble */}
        <div
          className={`p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm ml-auto'
              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
          }`}
        >
          {/* Header Metadata */}
          <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/10 text-[10px] opacity-75">
            <span className="font-semibold">{isUser ? 'You' : 'AlphaCart AI Sales Agent'}</span>
            <div className="flex items-center gap-1.5">
              {message.isPiiMasked && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/50 flex items-center gap-0.5">
                  <EyeOff className="w-2.5 h-2.5" /> PII Masked
                </span>
              )}
              <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <span>Agent Tool Telemetry:</span>
            </div>
            {message.toolCalls.map((tc) => (
              <ToolCallBadge key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Suggested Product Cards Grid */}
        {message.suggestedProducts && message.suggestedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {message.suggestedProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2 group shadow-md"
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-white truncate">{product.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{product.tagline}</div>
                    <div className="text-xs font-bold text-emerald-400 font-display">
                      ₹{product.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                  <button
                    id={`btn-view-card-${product.id}`}
                    onClick={() => onOpenProductDetail(product)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <Info className="w-3 h-3 text-indigo-400" />
                    <span>Specs</span>
                  </button>

                  <button
                    id={`btn-add-card-${product.id}`}
                    onClick={() => onAddToCart(product)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cross-Sell Bundle Special Offer Card */}
        {message.crossSellOffer && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Special 10% Bundle Discount Offer</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/40 text-[10px] font-bold">
                Save ₹{message.crossSellOffer.savings.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={message.crossSellOffer.crossSellProduct.image}
                  alt={message.crossSellOffer.crossSellProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <div className="font-semibold text-slate-100">{message.crossSellOffer.crossSellProduct.name}</div>
                  <div className="text-[10px] text-slate-400">Regular: ₹{message.crossSellOffer.crossSellProduct.price.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <button
                id={`btn-add-cross-sell-${message.crossSellOffer.crossSellProduct.id}`}
                onClick={() => onQuickReplyClick(`Add the ${message.crossSellOffer?.crossSellProduct.name}`)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Companion</span>
              </button>
            </div>
          </div>
        )}

        {/* Human-in-the-Loop Gated Execution Confirmation Button */}
        {message.confirmationGated && message.gatedAction && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 shadow-lg">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protocol #3: Execution Gating Confirmation Required</span>
            </div>
            <p className="text-[11px] text-slate-300">
              AlphaCart requires your explicit human approval before generating the binding payment link and processing cart data:
            </p>
            <div className="flex gap-2 pt-1">
              <button
                id="btn-gated-confirm-action"
                onClick={() => onGatedActionConfirm(message.gatedAction!)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/40"
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
                className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-all hover:scale-[1.02] active:scale-95"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
