import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Clock, QrCode, ShieldCheck, Copy, Check, ExternalLink, 
  RefreshCw, Smartphone, AlertCircle, Sparkles, CheckCircle2,
  Lock, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentOrder } from '../types';
import { PaymentCardWrapper, PaymentExpiryState } from './PaymentCardWrapper';

export interface UpiQrCardProps {
  order: PaymentOrder;
  onOpenPaymentModal?: (order: PaymentOrder) => void;
  onPaymentSuccess?: (order: PaymentOrder, method: 'upi' | 'card' | 'netbanking' | 'wallet', txnId: string) => void;
  onRequestNewLink?: (order: PaymentOrder) => void;
  onExpired?: () => void;
  className?: string;
}

/**
 * Stylized dark-themed UPI QR code card wrapped in a state-managed wrapper.
 * Renders `QRCodeCanvas` and payment card details with an ephemeral 5-minute countdown.
 * When `countdownSeconds` reaches 0, the state transitions to 'expired', overlaying/vanishing
 * the QR code with a prominent Expired notice.
 */
export const UpiQrCard: React.FC<UpiQrCardProps> = ({
  order,
  onOpenPaymentModal,
  onPaymentSuccess,
  onRequestNewLink,
  onExpired,
  className = ''
}) => {
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const upiId = 'velunotech@okhdfcbank';
  const upiPayUrl = order.qrCodeData && order.qrCodeData.startsWith('upi://')
    ? order.qrCodeData
    : `upi://pay?pa=${upiId}&pn=Veluno+Tech&am=${order.totalAmount}&cu=${order.currency || 'INR'}&tn=Order_${order.orderId}`;

  const handleCopyVpa = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(upiId);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleSimulatePayment = (e: React.MouseEvent, isExpired: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExpired) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const generatedTxnId = order.transactionId || `pay_upi_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      
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
    }, 700);
  };

  return (
    <PaymentCardWrapper
      order={order}
      onExpire={onExpired}
      className={`my-3 w-full max-w-md ${className}`}
    >
      {({ countdownSeconds, isExpired, expiryState, formatCountdown, triggerExpire }) => {
        return (
          <div 
            id={`upi-qr-card-${order.orderId}`}
            data-testid="upi-qr-card"
            data-expiry-status={expiryState}
            className={`w-full rounded-2xl bg-[#0d131f] border shadow-2xl p-5 text-neutral-100 overflow-hidden relative transition-all duration-300 ${
              isExpired 
                ? 'border-red-900/60 shadow-red-950/20' 
                : 'border-neutral-800/90 shadow-2xl'
            }`}
          >
            {/* Background Ambience Glow */}
            <div 
              className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
                isExpired ? 'bg-red-600/10' : 'bg-blue-600/10'
              }`} 
            />
            <div 
              className={`absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
                isExpired ? 'bg-amber-600/5' : 'bg-emerald-600/10'
              }`} 
            />

            {/* Header: Gateway Badge + Ephemeral 5-minute Timer */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
                  isExpired 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-wide">BHIM UPI</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition-colors ${
                      isExpired 
                        ? 'bg-neutral-800 text-neutral-400 border-neutral-700' 
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isExpired ? 'SESSION ENDED' : 'ZERO FEE'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono">Instant Bank Settlement</p>
                </div>
              </div>

              {/* Ephemeral 5-minute Countdown Timer */}
              <div 
                id={`upi-qr-timer-${order.orderId}`}
                data-countdown-seconds={countdownSeconds}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border transition-all duration-300 ${
                  isExpired 
                    ? 'bg-red-950/80 border-red-700 text-red-300 shadow-sm shadow-red-900/40'
                    : countdownSeconds <= 60
                      ? 'bg-red-950/90 border-red-600 text-red-300 animate-pulse'
                      : 'bg-amber-950/80 border-amber-600/80 text-amber-300'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isExpired || countdownSeconds <= 60 ? 'bg-red-400' : 'bg-amber-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isExpired || countdownSeconds <= 60 ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                </span>
                <Clock className="w-3.5 h-3.5" />
                <span>{isExpired ? '00:00 EXPIRED' : `${formatCountdown(countdownSeconds)} left`}</span>
              </div>
            </div>

            {/* Main Content Area: Payment Card Details Wrapped */}
            <div className="py-4 space-y-4 relative z-10">
              {/* Total Amount Payable Card Detail */}
              <div className={`flex items-baseline justify-between p-3.5 rounded-xl border transition-colors ${
                isExpired 
                  ? 'bg-neutral-900/60 border-neutral-800/80 opacity-80' 
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Total Amount Payable
                  </span>
                  <span className={`text-2xl font-bold font-mono tracking-tight ${
                    isExpired ? 'text-neutral-400 line-through decoration-red-500/70' : 'text-white'
                  }`}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {order.currency || 'INR'}
                  </span>
                  <span className="block text-[10px] text-neutral-400 mt-1 font-mono">
                    Order #{order.orderId.slice(-6)}
                  </span>
                </div>
              </div>

              {/* Scan & Pay Instruction Header */}
              <div className="text-center space-y-1">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  isExpired 
                    ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}>
                  {isExpired ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span>
                    {isExpired ? 'QR Code Expired & Voided' : 'Scan & Pay with any UPI App'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {isExpired 
                    ? 'The 5-minute secure checkout window has closed. Please request a new link.'
                    : 'Open GPay, PhonePe, Paytm, or BHIM to scan the QR code below'}
                </p>
              </div>

              {/* Stylized QR Code Display with State-Managed Expiry Overlay & QRCodeCanvas */}
              <div 
                id={`qr-container-${order.orderId}`}
                data-qr-expired={isExpired ? 'true' : 'false'}
                className="relative flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-950/90 border border-neutral-800/80 space-y-3 overflow-hidden"
              >
                {/* Canvas Container */}
                <div className="relative p-3.5 bg-white rounded-2xl shadow-xl border-2 border-neutral-200/20 flex items-center justify-center">
                  <QRCodeCanvas
                    id={`upi-qr-canvas-${order.orderId}`}
                    value={upiPayUrl}
                    size={160}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    includeMargin={false}
                    className={`transition-opacity duration-300 ${isExpired ? 'opacity-10 blur-[1px]' : 'opacity-100'}`}
                  />

                  {/* Overlaid 'Expired' Notice when the 5-minute window closes */}
                  {isExpired && (
                    <div 
                      id={`qr-expired-overlay-${order.orderId}`}
                      data-testid="qr-expired-overlay"
                      className="absolute inset-0 z-20 rounded-2xl bg-neutral-950/95 backdrop-blur-sm border-2 border-red-500/50 flex flex-col items-center justify-center p-3 text-center space-y-2 animate-fadeIn"
                    >
                      <div className="w-9 h-9 rounded-full bg-red-900/50 border border-red-500/60 flex items-center justify-center text-red-400 shadow-inner">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-700 tracking-wider">
                          EXPIRED
                        </span>
                        <p className="text-xs font-bold text-white mt-1">Payment Window Closed</p>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-tight">
                        5-minute timer reached 0s. This QR code has been safely invalidated.
                      </p>
                    </div>
                  )}
                </div>

                {/* Supported UPI Apps Pills */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1 text-[10px] font-mono text-neutral-400">
                  <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">Google Pay</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">PhonePe</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">Paytm</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">BHIM</span>
                </div>

                {/* UPI ID / VPA with One-Click Copy */}
                <div className="w-full pt-1">
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                    <span className="text-neutral-400 font-mono text-[11px]">UPI ID:</span>
                    <button
                      type="button"
                      id={`btn-copy-upi-vpa-${order.orderId}`}
                      disabled={isExpired}
                      onClick={handleCopyVpa}
                      className={`font-mono flex items-center gap-1.5 transition-colors ${
                        isExpired 
                          ? 'text-neutral-500 cursor-not-allowed' 
                          : 'text-neutral-200 hover:text-white cursor-pointer group/copy'
                      }`}
                      title={isExpired ? 'Session expired' : 'Click to copy UPI ID'}
                    >
                      <span className={`text-[11px] ${!isExpired ? 'underline underline-offset-2 decoration-neutral-700 group-hover/copy:decoration-white' : ''}`}>
                        {upiId}
                      </span>
                      {copiedVpa ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className={`w-3.5 h-3.5 ${isExpired ? 'text-neutral-600' : 'text-neutral-400 group-hover/copy:text-white'}`} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="space-y-2 pt-1">
                {isExpired ? (
                  onRequestNewLink ? (
                    <button
                      type="button"
                      id={`btn-renew-expired-qr-${order.orderId}`}
                      onClick={() => onRequestNewLink(order)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/50 cursor-pointer active:scale-[0.99]"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Generate New QR Code & Payment Link</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-center text-xs">
                      Payment session expired. Please type "renew payment link" in chat.
                    </div>
                  )
                ) : (
                  <>
                    {onOpenPaymentModal && (
                      <button
                        type="button"
                        id={`btn-open-payment-modal-${order.orderId}`}
                        onClick={() => onOpenPaymentModal(order)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#0c83fd] hover:bg-[#0070e0] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/30 cursor-pointer active:scale-[0.99]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Or Open Razorpay Direct Gateway</span>
                      </button>
                    )}

                    {onPaymentSuccess && (
                      <button
                        type="button"
                        id={`btn-simulate-upi-confirm-${order.orderId}`}
                        disabled={isVerifying}
                        onClick={(e) => handleSimulatePayment(e, isExpired)}
                        className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                            <span>Verifying UPI webhook settlement...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>I Have Paid (Simulate Instant Confirm)</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer Security Badges */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500 font-mono relative z-10">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <ShieldCheck className={`w-3.5 h-3.5 ${isExpired ? 'text-neutral-500' : 'text-emerald-400'}`} />
                <span>NPCI 256-bit Encrypted</span>
              </div>
              <span className={isExpired ? 'text-red-400 font-bold' : ''}>
                {isExpired ? 'Session Invalidated' : 'Auto-expires in 5 mins'}
              </span>
            </div>
          </div>
        );
      }}
    </PaymentCardWrapper>
  );
};

// Resilient alias exports
export const UpiQrCodeCard = UpiQrCard;
export { PaymentCardWrapper };
export default UpiQrCard;
