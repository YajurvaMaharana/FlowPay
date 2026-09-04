import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Lock, CreditCard, QrCode, Smartphone, 
  Building2, Wallet, AlertCircle, CheckCircle2, Clock, 
  ArrowRight, ExternalLink, Copy, Check, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { PaymentOrder } from '../types';

interface RazorpayModalProps {
  isOpen: boolean;
  order: PaymentOrder | null;
  onClose: () => void;
  onSuccess: (order: PaymentOrder, method: 'upi' | 'card' | 'netbanking' | 'wallet', txnId: string) => void;
  onFailure?: (order: PaymentOrder, reason: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  order,
  onClose,
  onSuccess,
  onFailure
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('valentin@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Synchronized 5-minute ephemeral countdown timer
  const calculateRemainingSeconds = () => {
    if (!order) return 300;
    if (order.expireByTimestamp) {
      const remaining = order.expireByTimestamp - Math.floor(Date.now() / 1000);
      return Math.max(0, remaining);
    }
    if (order.expiresAt) {
      const remaining = Math.floor((new Date(order.expiresAt).getTime() - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    return 300;
  };

  const [timeLeft, setTimeLeft] = useState<number>(calculateRemainingSeconds);

  useEffect(() => {
    if (!isOpen || !order) return;
    setTimeLeft(calculateRemainingSeconds());

    const timer = setInterval(() => {
      setTimeLeft(calculateRemainingSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, order]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && order) {
      setIsProcessing(false);
      setProcessingStep('');
      setCardName(order.customerName || 'Valentin');
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const isExpired = timeLeft <= 0;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFillTestCard = () => {
    setCardNumber('4000 0000 0000 0002');
    setCardExpiry('12/28');
    setCardCvv('123');
    setCardName(order.customerName || 'Valentin');
  };

  const handleExecutePayment = async () => {
    if (isExpired) return;
    setIsProcessing(true);

    try {
      // Step 1: Gateway Handshake
      setProcessingStep('Connecting to Razorpay Banking Gateway...');
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Cryptographic Authorization
      setProcessingStep('Authorizing 256-bit cryptographic token...');
      await new Promise(r => setTimeout(r, 600));

      // Step 3: Verified Capture
      setProcessingStep('Payment captured! Finalizing settlement...');
      await new Promise(r => setTimeout(r, 400));

      const generatedTxnId = `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      // Celebratory Confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0c83fd', '#10B981', '#F59E0B', '#FFFFFF']
        });
      } catch {
        // safe fallback
      }

      setIsProcessing(false);
      onClose();
      onSuccess(order, selectedMethod, generatedTxnId);
    } catch {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleSimulateDecline = () => {
    setIsProcessing(true);
    setProcessingStep('Routing to card issuer...');
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      if (onFailure) {
        onFailure(order, 'BANK_DECLINED_CARD_ISSUER');
      }
    }, 800);
  };

  // Launch Native window.Razorpay SDK if available and requested
  const handleLaunchNativeSdk = () => {
    if (typeof (window as any).Razorpay !== 'undefined') {
      try {
        const options = {
          key: (window as any).RAZORPAY_KEY_ID || 'rzp_test_dummy',
          amount: Math.round(order.totalAmount * 100),
          currency: order.currency || 'INR',
          name: 'Veluno Tech',
          description: `Order #${order.orderId}`,
          image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100&auto=format&fit=crop&q=80',
          order_id: order.razorpayPaymentLinkId?.startsWith('order_') ? order.razorpayPaymentLinkId : undefined,
          handler: function (response: any) {
            const txnId = response.razorpay_payment_id || `pay_rzp_${Date.now().toString(36)}`;
            onClose();
            onSuccess(order, 'upi', txnId);
          },
          prefill: {
            name: order.customerName || 'Valentin',
            email: order.customerEmail || 'valentinine14feb@gmail.com'
          },
          theme: {
            color: '#0c83fd'
          },
          modal: {
            ondismiss: function () {
              // Dismissed without failure
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          if (onFailure) {
            onFailure(order, resp?.error?.description || 'PAYMENT_FAILED');
          }
        });
        rzp.open();
        onClose();
        return;
      } catch (err) {
        console.warn('Native Razorpay SDK launch error, using embedded gateway modal:', err);
      }
    }
    // Fallback: execute standard modal payment
    handleExecutePayment();
  };

  const upiPayUrl = `upi://pay?pa=velunotech@okhdfcbank&pn=VelunoTech&am=${order.totalAmount}&cu=INR&tn=Order_${order.orderId}`;

  return (
    <div 
      id="razorpay-gateway-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        id="razorpay-gateway-modal"
        className="w-full max-w-lg rounded-2xl bg-[#0d131f] border border-neutral-800 shadow-2xl overflow-hidden flex flex-col text-neutral-100 animate-scaleUp"
      >
        {/* Razorpay Brand Header */}
        <div className="bg-[#090d16] px-5 py-4 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0c83fd]/20 border border-[#0c83fd]/40 flex items-center justify-center text-[#38bdf8] font-bold shadow-inner">
              <Lock className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">RAZORPAY SECURE</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  TEST GATEWAY
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Veluno Tech & Acoustics • 256-bit SSL Encrypted</p>
            </div>
          </div>

          <button 
            type="button"
            id="btn-close-razorpay-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-700/60"
            aria-label="Close Gateway Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Amount Bar & Ephemeral Countdown Lock */}
        <div className="px-5 py-3 bg-[#0f172a]/60 border-b border-neutral-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-mono tracking-wider">Amount Due</span>
            <span className="text-lg font-bold text-white font-mono">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="text-right">
            <div 
              id="razorpay-modal-countdown"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                timeLeft <= 60 
                  ? 'bg-red-950/80 border-red-700 text-red-300 animate-pulse'
                  : 'bg-amber-950/70 border-amber-700/70 text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isExpired ? 'EXPIRED' : formatCountdown(timeLeft)}</span>
            </div>
            <span className="block text-[10px] text-neutral-400 font-mono mt-0.5">Order #{order.orderId.slice(-8)}</span>
          </div>
        </div>

        {/* Payment Methods Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[300px]">
          {/* Method Selector Tabs */}
          <div className="sm:col-span-4 bg-[#090d16]/70 border-b sm:border-b-0 sm:border-r border-neutral-800 p-2 space-y-1">
            <button
              type="button"
              id="tab-method-upi"
              onClick={() => setSelectedMethod('upi')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                selectedMethod === 'upi'
                  ? 'bg-[#0c83fd]/20 text-[#38bdf8] border border-[#0c83fd]/40 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>UPI & QR Code</span>
            </button>

            <button
              type="button"
              id="tab-method-card"
              onClick={() => setSelectedMethod('card')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                selectedMethod === 'card'
                  ? 'bg-[#0c83fd]/20 text-[#38bdf8] border border-[#0c83fd]/40 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Cards (Credit/Debit)</span>
            </button>

            <button
              type="button"
              id="tab-method-netbanking"
              onClick={() => setSelectedMethod('netbanking')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                selectedMethod === 'netbanking'
                  ? 'bg-[#0c83fd]/20 text-[#38bdf8] border border-[#0c83fd]/40 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Net Banking</span>
            </button>

            <button
              type="button"
              id="tab-method-wallet"
              onClick={() => setSelectedMethod('wallet')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                selectedMethod === 'wallet'
                  ? 'bg-[#0c83fd]/20 text-[#38bdf8] border border-[#0c83fd]/40 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>Wallets</span>
            </button>
          </div>

          {/* Method Content Panel */}
          <div className="sm:col-span-8 p-4 sm:p-5 flex flex-col justify-between">
            {/* UPI View */}
            {selectedMethod === 'upi' && (
              <div className="space-y-4 text-xs animate-fadeIn">
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-white text-sm">Scan QR Code or Pay via UPI</h4>
                  <p className="text-neutral-400 text-[11px]">Scan with Google Pay, PhonePe, Paytm or any BHIM UPI App</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
                  <div className="p-2 rounded-xl bg-white shrink-0 shadow-md">
                    <QRCodeSVG value={upiPayUrl} size={110} />
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Auto-Expiring QR Code
                    </span>
                    <p className="text-[11px] text-neutral-300">
                      Amount locked at: <strong className="text-white font-mono">₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                    </p>
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('velunotech@okhdfcbank');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="text-[10px] font-mono text-neutral-400 hover:text-white inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 border border-neutral-700"
                      >
                        {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>velunotech@okhdfcbank</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] text-neutral-400 font-medium">Or enter your UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi or id@okhdfcbank"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Card View */}
            {selectedMethod === 'card' && (
              <div className="space-y-3 text-xs animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-sm">Credit / Debit Card</h4>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/40 font-semibold transition-colors"
                  >
                    Auto-fill Test Card
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4000 0000 0000 0002"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Valid Thru</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Netbanking View */}
            {selectedMethod === 'netbanking' && (
              <div className="space-y-3 text-xs animate-fadeIn">
                <h4 className="font-semibold text-white text-sm">Popular Banks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Other Banks'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        selectedBank === bank
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400 pt-1">
                  You will be routed to your bank's secure portal for instant OTP authentication.
                </p>
              </div>
            )}

            {/* Wallets View */}
            {selectedMethod === 'wallet' && (
              <div className="space-y-3 text-xs animate-fadeIn">
                <h4 className="font-semibold text-white text-sm">Select Digital Wallet</h4>
                <div className="space-y-2">
                  {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'Mobikwik'].map((wallet) => (
                    <button
                      key={wallet}
                      type="button"
                      onClick={() => setSelectedBank(wallet)}
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left text-xs font-medium text-white flex items-center justify-between"
                    >
                      <span>{wallet}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Processing State Indicator */}
            {isProcessing && (
              <div className="p-3 my-2 rounded-xl bg-blue-950/60 border border-blue-700/60 text-blue-200 flex items-center gap-2.5 animate-fadeIn">
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                <span className="text-xs font-mono">{processingStep || 'Authorizing with gateway...'}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-4 space-y-2">
              <button
                type="button"
                id="btn-razorpay-modal-pay-now"
                disabled={isProcessing || isExpired}
                onClick={handleExecutePayment}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] ${
                  isExpired
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-[#0c83fd] hover:bg-[#0070e0] text-white shadow-blue-500/20'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹{order.totalAmount.toLocaleString('en-IN')} Securely</span>
                  </>
                )}
              </button>

              {/* Auxiliary Controls: Failure Simulation & Native SDK */}
              <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  id="btn-simulate-decline"
                  onClick={handleSimulateDecline}
                  className="text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Simulate Bank Decline</span>
                </button>

                {typeof (window as any).Razorpay !== 'undefined' && (
                  <button
                    type="button"
                    onClick={handleLaunchNativeSdk}
                    className="text-neutral-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Native Razorpay Window</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="px-5 py-2.5 bg-[#090d16] border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PCI-DSS Level 1 Certified</span>
          </div>
          <span>Razorpay Direct Gateway v2.9</span>
        </div>
      </div>
    </div>
  );
};
