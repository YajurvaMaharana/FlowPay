import React, { useState, useEffect, useRef } from 'react';
import { CartCalculation, CartItem, Message, PaymentOrder, Product, TestScenario } from '../types';
import { MessageItem } from './MessageItem';
import { sanitizePii } from '../services/agentEngine';
import { 
  Send, Sparkles, ShieldCheck, AlertTriangle, EyeOff, 
  RotateCcw, ArrowRight, CornerDownLeft, Bot, HelpCircle,
  ShoppingCart, ChevronDown, ChevronUp, Lock, Trash2, Plus, Minus, X, Tag
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  activeScenario: TestScenario | null;
  cart: CartItem[];
  cartCalculation: CartCalculation;
  appliedDiscount: number;
  couponCode?: string;
  onSendMessage: (text: string) => void;
  onQuickReply: (reply: string) => void;
  onGatedConfirm: (action: NonNullable<Message['gatedAction']>) => void;
  onOpenProductDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQuantity?: (productId: string, delta: number) => void;
  onRemoveCartItem?: (productId: string) => void;
  onApplyCoupon?: (code: string) => void;
  onOpenPaymentModal: (order: PaymentOrder) => void;
  onSimulateFailure: (order: PaymentOrder) => void;
  onOpenInvoice?: (order: PaymentOrder) => void;
  onClearScenario?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  activeScenario,
  cart,
  cartCalculation,
  appliedDiscount,
  couponCode,
  onSendMessage,
  onQuickReply,
  onGatedConfirm,
  onOpenProductDetail,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onApplyCoupon,
  onOpenPaymentModal,
  onSimulateFailure,
  onOpenInvoice,
  onClearScenario
}) => {
  const [inputText, setInputText] = useState('');
  const [piiWarning, setPiiWarning] = useState<string | null>(null);
  const [inputCoupon, setInputCoupon] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToBottom = () => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.sender === 'agent');
    if (lastAssistantMessage) {
      const element = document.getElementById(`message-${lastAssistantMessage.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Real-time typing PII Scanner
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    const piiCheck = sanitizePii(val);
    if (piiCheck.hasPii) {
      setPiiWarning('Sensitive financial card data detected. It will be sanitized before submission.');
    } else {
      setPiiWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setPiiWarning(null);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim() || !onApplyCoupon) return;
    onApplyCoupon(inputCoupon.trim().toUpperCase());
    setInputCoupon('');
  };

  const sampleSuggestions = [
    'I need high quality noise cancelling headphones for travel',
    'Recommend a custom mechanical keyboard for coding',
    'Calculate my total with bundle concession',
    'Simulate a payment gateway bank decline'
  ];

  const handleGatedConfirmWrapper = async (action: NonNullable<Message['gatedAction']>) => {
    if (action.type === 'PROCEED_CHECKOUT') {
      try {
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: action.amount })
        });
        
        const data = await response.json();
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
          amount: data.amount,
          currency: data.currency,
          name: 'Veluno Tech',
          description: action.label,
          order_id: data.order_id,
          handler: function (response: any) {
            onSendMessage(`Payment Confirmed. Receipt ID: ${response.razorpay_payment_id}`);
            onGatedConfirm(action);
          },
          prefill: {
            name: 'Customer',
            email: action.email || 'valentinine14feb@gmail.com'
          },
          theme: {
            color: '#111111'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          onSendMessage('Payment Failed. Please try again.');
        });
        rzp.open();
        
      } catch (err) {
        console.error('Failed to initialize checkout', err);
        onSendMessage('Failed to initialize checkout. Please try again.');
      }
    } else {
      onGatedConfirm(action);
    }
  };

  return (
    <div id="customer-chat-panel" className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950/70 relative">
      
      {/* Active Scenario Indicator Banner */}
      {activeScenario && (
        <div className="px-4 py-2 bg-neutral-950/80 border-b border-neutral-500/40 flex items-center justify-between text-xs text-neutral-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-mono text-[10px] font-bold">
              {activeScenario.badge}
            </span>
            <span className="font-semibold">{activeScenario.title}</span>
          </div>
          {onClearScenario && (
            <button
              onClick={onClearScenario}
              className="text-[11px] text-neutral-300 hover:text-white underline font-mono"
            >
              Reset Test
            </button>
          )}
        </div>
      )}

      {/* Main Messages Scroll Container */}
      <div 
        id="messages-scroll-area"
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
      >
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onQuickReplyClick={onQuickReply}
            onGatedActionConfirm={handleGatedConfirmWrapper}
            onOpenProductDetail={onOpenProductDetail}
            onAddToCart={onAddToCart}
            onOpenPaymentModal={onOpenPaymentModal}
            onSimulateFailure={onSimulateFailure}
            onOpenInvoice={onOpenInvoice}
          />
        ))}

        {/* Streaming / Loading Skeleton Bubble */}
        {isLoading && (
          <div className="flex gap-3 my-4 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 rounded-tl-sm text-neutral-400 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-neutral-500 animate-spin" />
              <span>Analyzing catalog & calculating...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Form & PII Real-time Warning */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-800 shrink-0 space-y-2 z-10">
        
        {/* Real-time PII Alert Banner */}
        {piiWarning && (
          <div className="px-3 py-2 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-200 text-xs flex items-center gap-2 animate-fadeIn font-mono">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{piiWarning}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              id="chat-user-input"
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Ask for gear recommendations..."
              disabled={isLoading}
              className="w-full pl-5 pr-10 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all font-sans"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setPiiWarning(null);
                }}
                className="absolute right-4 top-1/2 -tranneutral-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-700 text-white transition-all flex items-center justify-center shrink-0 border border-neutral-700"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Security & Protocol Footer Note */}
        <div className="flex justify-center pt-1.5">
          <span className="text-[10px] text-neutral-500 font-mono text-center">
            Protected by Razorpay Gated Flow • ≤10% Concession Bound
          </span>
        </div>

      </div>

    </div>
  );
};
