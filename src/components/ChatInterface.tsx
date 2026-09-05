import React, { useState, useEffect, useRef } from 'react';
import { CartCalculation, CartItem, Message, PaymentOrder, Product, TestScenario } from '../types';
import { MessageItem } from './MessageItem';
import { sanitizePii } from '../services/agentEngine';
import { 
  Send, Sparkles, ShieldCheck, AlertTriangle, EyeOff, 
  RotateCcw, ArrowRight, CornerDownLeft, Bot, HelpCircle,
  ShoppingCart, ChevronDown, ChevronUp, Lock, Trash2, Plus, Minus, X, Tag, Image as ImageIcon, Loader2
} from 'lucide-react';

interface ChatInterfaceProps {
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
  onSendMessage: (text: string, imageBase64?: string) => void;
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
  isA2AMode?: boolean;
  isA2ATyping?: boolean;
  onNextA2ATurn?: () => void;
  onAddBundleToCart?: (products: Product[]) => void;
  onRequestNewLink?: (order: PaymentOrder) => void;
  onPaymentSuccess?: (order: PaymentOrder, method: 'upi' | 'card' | 'netbanking' | 'wallet', txnId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  activeScenario,
  cart,
  purchasedItems = [],
  cartCalculation,
  appliedDiscount,
  couponCode,
  isAuthenticated = false,
  onRequireAuth,
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
  onClearScenario,
  isA2AMode,
  isA2ATyping,
  onNextA2ATurn,
  onAddBundleToCart,
  onRequestNewLink,
  onPaymentSuccess
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
    }
  };


  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [inputText, setInputText] = useState('');
  const [piiWarning, setPiiWarning] = useState<string | null>(null);
  const [inputCoupon, setInputCoupon] = useState('');
  const [turnDelayCountdown, setTurnDelayCountdown] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onNextA2ATurnRef = useRef(onNextA2ATurn);

  useEffect(() => {
    onNextA2ATurnRef.current = onNextA2ATurn;
  }, [onNextA2ATurn]);

  // Check if waiting for next turn (last message is Merchant Agent, not loading, not typing)
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const isWaitingForNextTurn = Boolean(
    isA2AMode &&
    !isLoading &&
    !isA2ATyping &&
    lastMessage &&
    lastMessage.sender === 'agent' &&
    !lastMessage.toolCalls?.some(tc => tc.name === 'generate_payment') &&
    !lastMessage.content?.includes("decline the offer and terminate") &&
    !lastMessage.content?.includes("I accept the price")
  );

  // 3-second delay timer when waiting for the next turn
  useEffect(() => {
    if (!isWaitingForNextTurn) {
      setTurnDelayCountdown(null);
      return;
    }

    setTurnDelayCountdown(3);

    const timer = setInterval(() => {
      setTurnDelayCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWaitingForNextTurn, lastMessage?.id]);

  // Auto-trigger next turn when countdown reaches 0
  useEffect(() => {
    if (turnDelayCountdown === 0 && isWaitingForNextTurn) {
      setTurnDelayCountdown(null);
      if (onNextA2ATurnRef.current) {
        onNextA2ATurnRef.current();
      }
    }
  }, [turnDelayCountdown, isWaitingForNextTurn]);

  const handleSkipDelay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setTurnDelayCountdown(null);
    if (onNextA2ATurn) {
      onNextA2ATurn();
    }
  };

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
    if ((!inputText.trim() && !selectedImage) || isLoading) return;
    
    onSendMessage(inputText, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
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

  const handleGatedConfirmWrapper = (
    action: NonNullable<Message['gatedAction']>,
    event?: React.MouseEvent
  ) => {
    // 1. Prevent Unmounting, Event Redirection & Message Resubmission
    if (event) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    // 2. Directly trigger gated confirm without submitting back into the chat model input queue
    onGatedConfirm(action);
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

      {/* Ecosystem Memory Active Session State Indicator */}
      {purchasedItems && purchasedItems.length > 0 && (
        <div className="px-4 py-2 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-300 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="text-[11px] text-neutral-400 font-mono">Ecosystem Context Active:</span>
            <span className="text-[11px] font-semibold text-white truncate max-w-[180px]">
              {purchasedItems.map(p => p.name).join(', ')}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono shrink-0 border border-neutral-700">
            {purchasedItems.length} purchased
          </span>
        </div>
      )}

      {/* Main Messages Scroll Container */}
      <div 
        id="messages-scroll-area"
        className="flex-1 overflow-y-auto p-4 sm:p-6"
      >
        <div className="max-w-5xl mx-auto space-y-4 w-full">
        {messages.map((message) => {
          const isLatestAgentWaiting = Boolean(
            isWaitingForNextTurn && 
            message.id === lastMessage?.id && 
            message.sender === 'agent'
          );

          return (
            <MessageItem
              key={message.id}
              message={message}
              isWaitingForNextTurn={isLatestAgentWaiting}
              nextTurnCountdown={turnDelayCountdown}
              isAuthenticated={isAuthenticated}
              onRequireAuth={onRequireAuth}
              onQuickReplyClick={onQuickReply}
              onGatedActionConfirm={handleGatedConfirmWrapper}
              onOpenProductDetail={onOpenProductDetail}
              onAddToCart={onAddToCart}
              onOpenPaymentModal={onOpenPaymentModal}
              onSimulateFailure={onSimulateFailure}
              onOpenInvoice={onOpenInvoice}
              onRequestNewLink={onRequestNewLink}
              onPaymentSuccess={onPaymentSuccess}
            />
          );
        })}

        {/* Typing indicator for A2A BuyerBot */}
        {isA2ATyping && (
          <div className="flex gap-3 my-4 animate-fadeIn justify-end">
            <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-800/30 rounded-tr-sm text-blue-400 text-xs flex items-center gap-2.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>BuyerBot is analyzing offer...</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Streaming / Loading Skeleton Bubble */}
        {isLoading && (
          <div className="flex gap-3 my-4 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 rounded-tl-sm text-neutral-400 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-neutral-500 animate-spin" />
              <span>Merchant Agent calculating yield...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area Form & PII Real-time Warning */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-800 shrink-0 space-y-2 z-10">
        <div className="max-w-5xl mx-auto w-full space-y-2">
        {/* Real-time PII Alert Banner */}
        {piiWarning && (
          <div className="px-3 py-2 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-200 text-xs flex items-center gap-2 animate-fadeIn font-mono">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{piiWarning}</span>
          </div>
        )}

        {/* Next A2A Turn Controller / Analyzing delay indicator */}
        {isA2AMode && !isLoading && !isA2ATyping && messages.length > 0 && messages[messages.length - 1].sender === 'agent' && !messages[messages.length - 1].toolCalls?.some(tc => tc.name === 'generate_payment') && (
          <div className="flex flex-col items-center gap-2 mb-2 animate-fadeIn">
            {isWaitingForNextTurn ? (
              <div 
                id="a2a-turn-delay-indicator" 
                className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 shadow-lg w-full max-w-md animate-fadeIn"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-blue-950 border border-blue-800/60 shrink-0">
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span className="absolute w-2 h-2 rounded-full bg-blue-400/30 animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-neutral-200">
                      <span>Analyzing...</span>
                      <span className="text-[11px] text-blue-400 font-mono font-semibold">
                        Next turn in {turnDelayCountdown ?? 3}s
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Simulating autonomous buyer agent counter-strategy
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden shrink-0 hidden sm:block">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((4 - (turnDelayCountdown ?? 3)) / 3) * 100}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    id="btn-skip-turn-delay"
                    onClick={handleSkipDelay}
                    className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 text-[11px] font-medium flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Trigger Now</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-trigger-next-a2a-turn"
                onClick={onNextA2ATurn}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Trigger Next Agent Turn
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        

        {/* Input Form */}
        {!isA2AMode && (
        <div className="flex flex-col gap-2">
          {selectedImage && (
            <div className="relative inline-block w-20 h-20 mb-2">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg border border-neutral-700" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-neutral-800 rounded-full p-1 border border-neutral-700 hover:bg-neutral-700 text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isA2AMode}
            className="p-3 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            title="Upload Workspace Photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <div className="relative flex-1">
            <input
              id="chat-user-input"
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={isA2AMode ? "Autonomous Buyer Mode Active..." : "Ask for gear recommendations..."}
              disabled={isLoading || isA2AMode}
              className="w-full pl-5 pr-10 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all font-sans disabled:opacity-50"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setPiiWarning(null);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            id="chat-send-btn"
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isLoading || isA2AMode}
            className="p-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-700 text-white transition-all flex items-center justify-center shrink-0 border border-neutral-700"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form></div>)}
        
        {/* Security & Protocol Footer Note */}
        <div className="flex justify-center pt-1.5">
          <span className="text-[10px] text-neutral-500 font-mono text-center">
            Protected by Razorpay Gated Flow • ≤10% Concession Bound
          </span>
        </div>

        </div>
      </div>

    </div>
  );
};
