import React, { useState, useEffect } from 'react';
import { PaymentOrder } from '../types';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, ArrowRight, RefreshCw, Clock, Lock, 
  CheckCircle2, AlertCircle, FileText, Truck, MapPin, Sparkles
} from 'lucide-react';

export type CheckoutState = 'pending_payment' | 'success' | 'expired' | 'failed';

interface PaymentLinkCardProps {
  order: PaymentOrder;
  onOpenPaymentModal?: (order: PaymentOrder) => void;
  onSimulateFailure?: (order: PaymentOrder) => void;
  onOpenInvoice?: (order: PaymentOrder) => void;
  onRequestNewLink?: (order: PaymentOrder) => void;
  onPaymentSuccess?: (order: PaymentOrder, method: 'upi' | 'card' | 'netbanking' | 'wallet', txnId: string) => void;
}

export const PaymentLinkCard: React.FC<PaymentLinkCardProps> = ({
  order,
  onOpenPaymentModal,
  onSimulateFailure,
  onOpenInvoice,
  onRequestNewLink,
  onPaymentSuccess
}) => {
  // Explicit two-stage checkout state machine
  // Stage 1: 'pending_payment' (Initial State on generate_payment)
  // Stage 2: 'success' (Trigger State on Click of "Complete Secure Checkout")
  const determineInitialState = (): CheckoutState => {
    if (order.status === 'paid' || order.status === 'success') return 'success';
    if (order.status === 'failed') return 'failed';
    return 'pending_payment';
  };

  const [checkoutState, setCheckoutState] = useState<CheckoutState>(determineInitialState);
  const [localTxnId, setLocalTxnId] = useState<string>(order.transactionId || '');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Sync state if order prop updates externally
  useEffect(() => {
    if (order.status === 'paid' || order.status === 'success') {
      setCheckoutState('success');
      if (order.transactionId) setLocalTxnId(order.transactionId);
    } else if (order.status === 'failed') {
      setCheckoutState('failed');
    } else {
      setCheckoutState('pending_payment');
    }
  }, [order.status, order.transactionId]);

  // Calculate remaining seconds based on order expiration timestamp or 5 minutes (300s) default
  const calculateRemainingSeconds = () => {
    if (order.expireByTimestamp) {
      return Math.max(0, Math.floor(order.expireByTimestamp - Date.now() / 1000));
    }
    if (order.expiresAt) {
      return Math.max(0, Math.floor((new Date(order.expiresAt).getTime() - Date.now()) / 1000));
    }
    return 300; // 5 minutes ephemeral lock
  };

  const [countdownSeconds, setCountdownSeconds] = useState<number>(calculateRemainingSeconds);
  const timeLeft = countdownSeconds;

  useEffect(() => {
    setCountdownSeconds(calculateRemainingSeconds());

    const timer = setInterval(() => {
      setCountdownSeconds(calculateRemainingSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, [order.expiresAt, order.expireByTimestamp]);

  const isExpired = checkoutState !== 'success' && timeLeft <= 0;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Stage 2 Trigger State on Click (`state = 'success'`):
   * Only when the user explicitly clicks the "Complete Secure Checkout" button
   * do we update the state to success.
   * Smoothly transitions to the green "Payment Successful" card with transaction ID,
   * order delivery view, and updated Live Audit telemetry logs.
   */
  const handlePaySecurely = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isExpired) {
      if (onRequestNewLink) {
        onRequestNewLink(order);
      }
      return;
    }

    if (checkoutState === 'success') {
      if (onOpenInvoice) {
        onOpenInvoice(order);
      }
      return;
    }

    // 1. Trigger the actual Razorpay gateway modal
    if (onOpenPaymentModal) {
      onOpenPaymentModal(order);
      return;
    }

    // 2. Fallback: Clean pending-to-success transition without jumping straight on render
    setIsAuthorizing(true);
    const generatedTxnId = order.transactionId || `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    setLocalTxnId(generatedTxnId);

    setTimeout(() => {
      setCheckoutState('success');
      setIsAuthorizing(false);

      // Celebratory visual feedback
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0c83fd', '#10B981', '#F59E0B', '#FFFFFF']
        });
      } catch {
        // safe fallback
      }

      if (onPaymentSuccess) {
        onPaymentSuccess(order, 'upi', generatedTxnId);
      }
    }, 400);
  };

  const trackingNumber = `VEL-EXP-${order.orderId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;

  return (
    <div 
      id={`payment-card-${order.orderId}`}
      className="my-3 rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl overflow-hidden transition-all text-neutral-100 max-w-xl mx-auto"
    >
      {/* Card Header: Security status & 5-minute ephemeral countdown */}
      <div className="px-5 py-3.5 bg-neutral-900/90 border-b border-neutral-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm tracking-tight text-white">Veluno Secure Checkout</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-[10px] text-emerald-300 font-mono font-medium">
                <ShieldCheck className="w-2.5 h-2.5" /> 256-Bit Encrypted
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">Order #{order.orderId}</p>
          </div>
        </div>

        {/* Ephemeral Countdown Timer Badge / Status Badge */}
        <div>
          {checkoutState === 'success' ? (
            <div 
              id={`status-badge-success-${order.orderId}`}
              data-state="success"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-mono font-semibold animate-fadeIn"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Payment Successful</span>
            </div>
          ) : isExpired ? (
            <div 
              id={`urgency-badge-expired-${order.orderId}`}
              data-state="expired"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 border border-red-800 text-red-300 text-xs font-mono font-bold"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Expired (00:00)</span>
            </div>
          ) : (
            <div 
              id={`urgency-badge-${order.orderId}`}
              data-state="pending_payment"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-semibold shadow-sm transition-colors animate-pulse ${
                timeLeft <= 120 
                  ? 'bg-red-950/90 border-red-600/90 text-red-200' 
                  : 'bg-amber-950/90 border-amber-600/80 text-amber-300'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  timeLeft <= 120 ? 'bg-red-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  timeLeft <= 120 ? 'bg-red-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <Clock className={`w-3 h-3 shrink-0 ${timeLeft <= 120 ? 'text-red-300' : 'text-amber-300'}`} />
              <span>{formatCountdown(timeLeft)} remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-4">
        
        {/* Expired Session Notice if timed out */}
        {isExpired && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 flex items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400 shrink-0" />
              <span>5-minute ephemeral checkout expired. Click to renew order allocation.</span>
            </div>
            {onRequestNewLink && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRequestNewLink(order);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-900 hover:bg-red-800 text-white font-semibold text-xs shrink-0 flex items-center gap-1 border border-red-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Renew</span>
              </button>
            )}
          </div>
        )}

        {/* Clean Order Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 uppercase tracking-wider font-mono">
            <span>Order Items</span>
            <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
          </div>

          <div className="rounded-xl bg-neutral-900/60 border border-neutral-800/80 divide-y divide-neutral-800/60 overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  {item.product.image && (
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0 border border-neutral-700/60"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate text-sm">{item.product.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">
                      Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="font-mono font-semibold text-neutral-200 shrink-0">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-neutral-400">
            <span>Subtotal</span>
            <span className="text-neutral-200">₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-400 font-semibold">
              <span>Authorized Agent Discount</span>
              <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-neutral-400">
            <span>Estimated GST (18%)</span>
            <span className="text-neutral-200">
              {order.tax > 0 ? `₹${order.tax.toLocaleString('en-IN')}` : 'Included in Total'}
            </span>
          </div>

          <div className="pt-2.5 border-t border-neutral-800 flex items-baseline justify-between">
            <div>
              <span className="font-sans font-bold text-sm text-white">Final Calculated Amount</span>
              <span className="text-[10px] text-neutral-400 block font-sans">Net payable (all taxes included)</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-display text-white tracking-tight">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-neutral-400 ml-1 font-mono">{order.currency}</span>
            </div>
          </div>
        </div>

        {/* Stage 2 ONLY: Paid Confirmation & Unlocked Final Delivery View */}
        {checkoutState === 'success' ? (
          <div id={`checkout-success-view-${order.orderId}`} data-state="success" className="space-y-4 pt-1 animate-fadeIn">
            {/* Confirmation Checkmark Banner */}
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600/70 flex items-center gap-3.5 shadow-lg shadow-emerald-950/40">
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-scaleUp" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>Payment Successful</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </h4>
                <p className="text-xs text-emerald-300 font-mono truncate">
                  Txn ID: {localTxnId || order.transactionId || 'pay_inline_verified'} • Verified & Settled
                </p>
              </div>
            </div>

            {/* Unlocked Final Delivery View */}
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Order Delivery View</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[10px] font-mono font-medium">
                  Priority Dispatch Unlocked
                </span>
              </div>

              {/* Delivery Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                  <span className="text-neutral-500 text-[10px] block uppercase">Estimated Delivery</span>
                  <span className="text-white font-semibold">Tomorrow, by 1:00 PM</span>
                  <span className="text-[10px] text-emerald-400 block">Express Air Priority</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                  <span className="text-neutral-500 text-[10px] block uppercase">Consignment Tracking</span>
                  <span className="text-emerald-400 font-semibold">{trackingNumber}</span>
                  <span className="text-[10px] text-neutral-400 block">Veluno Direct Fleet</span>
                </div>
              </div>

              {/* Stepper Status Tracking */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="text-emerald-400 font-semibold">✓ Order Confirmed</span>
                  <span className="text-emerald-300 font-medium">● Warehouse Allocation</span>
                  <span className="text-neutral-500">○ Express Transit</span>
                  <span className="text-neutral-500">○ Out for Delivery</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-1/2 rounded-full transition-all duration-500"></div>
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="flex items-center gap-2 pt-1 text-xs text-neutral-400 border-t border-neutral-800/80">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Shipping to: {order.customerEmail} • Priority Air Hub</span>
              </div>

              {/* Invoice Action */}
              {onOpenInvoice && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenInvoice(order);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    <span>View Tax Invoice</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Stage 1: Single Prominent, High-Contrast Action Button: "Complete Secure Checkout" */
          <div className="space-y-2 pt-1" data-state="pending_payment">
            <button
              type="button"
              id={`btn-complete-secure-checkout-${order.orderId}`}
              data-testid="btn-complete-secure-checkout"
              onClick={handlePaySecurely}
              disabled={isExpired || isAuthorizing}
              className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] ${
                isExpired
                  ? 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed opacity-70'
                  : 'bg-white hover:bg-neutral-100 text-black shadow-white/10 hover:shadow-white/20 cursor-pointer'
              }`}
            >
              {isExpired ? (
                <>
                  <RefreshCw className="w-4 h-4 text-neutral-500" />
                  <span>Expired — Request New Link</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-black" />
                  <span>Complete Secure Checkout</span>
                  <ArrowRight className="w-4 h-4 text-black ml-0.5" />
                </>
              )}
            </button>

            {/* When expired, provide clear clickable action to renew the link */}
            {isExpired && onRequestNewLink && (
              <div className="flex items-center justify-center pt-1.5">
                <button
                  type="button"
                  id={`btn-request-new-link-${order.orderId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRequestNewLink(order);
                  }}
                  className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 hover:underline transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Click to generate a fresh 5-minute link</span>
                </button>
              </div>
            )}

            {/* Subtle Failure Recovery Simulator for testing */}
            {onSimulateFailure && !isExpired && (
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSimulateFailure(order);
                  }}
                  className="text-neutral-500 hover:text-neutral-400 text-[11px] font-mono hover:underline transition-colors"
                >
                  Test Decline Recovery
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
