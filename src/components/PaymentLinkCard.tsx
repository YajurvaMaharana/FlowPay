import React, { useState, useEffect } from 'react';
import { PaymentOrder } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink, Copy, Check, ShieldCheck, CreditCard, QrCode, AlertCircle, ArrowRight, Zap, RefreshCw, Clock, Coins } from 'lucide-react';

interface PaymentLinkCardProps {
  order: PaymentOrder;
  onOpenPaymentModal: (order: PaymentOrder) => void;
  onSimulateFailure: (order: PaymentOrder) => void;
  onOpenInvoice?: (order: PaymentOrder) => void;
}

export const PaymentLinkCard: React.FC<PaymentLinkCardProps> = ({
  order,
  onOpenPaymentModal,
  onSimulateFailure,
  onOpenInvoice
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  
  // 15-minute countdown timer for link expiry
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (order.expiresAt) {
      const remaining = Math.max(0, Math.floor((new Date(order.expiresAt).getTime() - Date.now()) / 1000));
      return remaining > 0 ? remaining : 900;
    }
    return 900; // 15 minutes = 900 seconds
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(order.razorpayShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaid = order.status === 'paid';
  const isFailed = order.status === 'failed';
  const amountPaise = order.amountInPaise || Math.round(order.totalAmount * 100);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div id={`payment-card-${order.orderId}`} className="my-3 rounded-2xl border border-neutral-500/40 bg-gradient-to-br from-neutral-900 via-neutral-950/30 to-neutral-900 overflow-hidden shadow-2xl">
      {/* Razorpay Brand Header */}
      <div className="px-4 py-3 bg-neutral-900/95 border-b border-neutral-500/30 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-neutral-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-neutral-900/50">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-neutral-100">Razorpay Smart Link</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-950/70 border border-green-500/40 text-[10px] text-green-300 font-medium">
                <ShieldCheck className="w-2.5 h-2.5" /> 256-Bit Encrypted
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">Order ID: {order.orderId} • Link: {order.razorpayPaymentLinkId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Expiry Timer Badge */}
          {!isPaid && (
            <div className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono flex items-center gap-1 ${
              timeLeft < 180 
                ? 'bg-red-950/60 border-red-700/50 text-red-300 animate-pulse' 
                : 'bg-neutral-950/80 border-neutral-700 text-amber-300'
            }`}>
              <Clock className="w-3 h-3" />
              <span>Expires in {formatCountdown(timeLeft)}</span>
            </div>
          )}

          {isPaid ? (
            <span className="px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> PAID
            </span>
          ) : isFailed ? (
            <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> FAILED
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-neutral-500/20 border border-neutral-500/40 text-neutral-300 text-xs font-semibold flex items-center gap-1 animate-pulse">
              <Zap className="w-3 h-3" /> ACTIVE LINK
            </span>
          )}
        </div>
      </div>

      {/* Main Payment Details */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Total Payable</span>
              {/* Paise breakdown badge */}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-950/70 border border-neutral-700/40 text-[10px] text-neutral-300 font-mono">
                <Coins className="w-2.5 h-2.5 text-neutral-400" />
                {amountPaise.toLocaleString('en-IN')} Paise
              </span>
            </div>
            <div className="text-2xl font-bold font-display text-white flex items-baseline gap-1 mt-0.5">
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              <span className="text-xs font-normal text-neutral-400">({order.currency})</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Includes 18% GST • Free Priority Shipping
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2">
            <button
              id={`btn-open-razorpay-${order.orderId}`}
              onClick={() => onOpenPaymentModal(order)}
              disabled={isPaid}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                isPaid
                  ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-600 hover:bg-neutral-500 text-white shadow-neutral-900/50 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{isPaid ? 'Payment Received' : 'Pay via Razorpay'}</span>
              {!isPaid && <ArrowRight className="w-3.5 h-3.5" />}
            </button>

            {isPaid && onOpenInvoice && (
              <button
                id={`btn-view-invoice-${order.orderId}`}
                onClick={() => onOpenInvoice(order)}
                className="px-4 py-2 rounded-xl font-semibold text-xs bg-green-950/60 hover:bg-green-900/80 text-green-300 border border-green-700/50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Tax Invoice</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Items Summary in Payment Link */}
        <div className="space-y-1.5 text-xs">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Cart Line Items</div>
          <div className="divide-y divide-neutral-800/60 bg-neutral-950/50 rounded-xl p-2 border border-neutral-800/50">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-1.5 px-2 flex items-center justify-between text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-400 text-[10px] flex items-center justify-center font-bold">
                    {item.quantity}x
                  </span>
                  <span className="truncate max-w-[180px] sm:max-w-[240px]">{item.product.name}</span>
                </div>
                <span className="font-semibold text-neutral-200">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Razorpay Short URL & UPI QR Switcher */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Direct Checkout URL:</span>
            <button
              id={`btn-toggle-qr-${order.orderId}`}
              onClick={() => setShowQr(!showQr)}
              className="text-neutral-400 hover:text-neutral-300 font-medium flex items-center gap-1 text-[11px] transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQr ? 'Hide UPI QR' : 'Show UPI QR Code'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              id={`link-rzp-url-${order.orderId}`}
              href={order.razorpayShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-500/50 text-neutral-300 hover:text-neutral-200 font-mono text-xs truncate flex items-center justify-between group transition-colors"
            >
              <span className="truncate">{order.razorpayShortUrl}</span>
              <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-neutral-400 shrink-0 ml-1" />
            </a>
            <button
              id={`btn-copy-razorpay-link-${order.orderId}`}
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors shrink-0 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {showQr && (
            <div className="p-4 bg-white rounded-xl flex flex-col items-center justify-center text-neutral-900 space-y-2 animate-fadeIn">
              <QRCodeSVG
                value={order.qrCodeData}
                size={160}
                level="H"
                includeMargin={true}
              />
              <div className="text-center">
                <p className="font-bold text-xs">Scan with any UPI App</p>
                <p className="text-[10px] text-neutral-600">Google Pay • PhonePe • Paytm • CRED • BHIM</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Testing Actions (Simulator Tooling) */}
        {!isPaid && (
          <div className="pt-2 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-neutral-500 font-medium">Testing & Recovery:</span>
            <button
              id={`btn-simulate-fail-${order.orderId}`}
              onClick={() => onSimulateFailure(order)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/50 font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Simulate Bank Decline (Test Graceful Recovery)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
