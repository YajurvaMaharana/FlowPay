import React, { useState } from 'react';
import { PaymentOrder } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink, Copy, Check, ShieldCheck, CreditCard, QrCode, AlertCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(order.razorpayShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaid = order.status === 'paid';
  const isFailed = order.status === 'failed';

  return (
    <div id={`payment-card-${order.orderId}`} className="my-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 overflow-hidden shadow-xl">
      {/* Razorpay Brand Header */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-slate-100">Razorpay Smart Link</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300">
                <ShieldCheck className="w-2.5 h-2.5" /> 256-Bit Encrypted
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">ID: {order.razorpayPaymentLinkId}</p>
          </div>
        </div>

        <div>
          {isPaid ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> PAID
            </span>
          ) : isFailed ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> FAILED
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1 animate-pulse">
              <Zap className="w-3 h-3" /> ACTIVE LINK
            </span>
          )}
        </div>
      </div>

      {/* Main Payment Details */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400">Total Payable Amount</span>
            <div className="text-2xl font-bold font-display text-white flex items-baseline gap-1">
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              <span className="text-xs font-normal text-slate-400">({order.currency})</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Includes 18% GST • Free Priority Shipping
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2">
            <button
              id={`btn-open-razorpay-${order.orderId}`}
              onClick={() => onOpenPaymentModal(order)}
              disabled={isPaid}
              className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                isPaid
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50 hover:scale-[1.02]'
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
                className="px-4 py-2 rounded-xl font-semibold text-xs bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Tax Invoice</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Items Summary in Payment Link */}
        <div className="space-y-1.5 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cart Line Items</div>
          <div className="divide-y divide-slate-800/60 bg-slate-950/40 rounded-xl p-2 border border-slate-800/40">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-1.5 px-2 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-bold">
                    {item.quantity}x
                  </span>
                  <span className="truncate max-w-[180px] sm:max-w-[240px]">{item.product.name}</span>
                </div>
                <span className="font-semibold text-slate-200">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Razorpay Short URL & UPI QR Switcher */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Direct Payment Link:</span>
            <button
              id={`btn-toggle-qr-${order.orderId}`}
              onClick={() => setShowQr(!showQr)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQr ? 'Hide UPI QR' : 'Show UPI QR Code'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs truncate select-all">
              {order.razorpayShortUrl}
            </div>
            <button
              id={`btn-copy-razorpay-link-${order.orderId}`}
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {showQr && (
            <div className="p-4 bg-white rounded-xl flex flex-col items-center justify-center text-slate-900 space-y-2 animate-fadeIn">
              <QRCodeSVG
                value={order.qrCodeData}
                size={160}
                level="H"
                includeMargin={true}
              />
              <div className="text-center">
                <p className="font-bold text-xs">Scan with any UPI App</p>
                <p className="text-[10px] text-slate-600">Google Pay • PhonePe • Paytm • CRED • BHIM</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Testing Actions (Simulator Tooling) */}
        {!isPaid && (
          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-500 font-medium">Developer / Testing Hooks:</span>
            <button
              id={`btn-simulate-fail-${order.orderId}`}
              onClick={() => onSimulateFailure(order)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Simulate Gateway Failure (Test Recovery #7)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
