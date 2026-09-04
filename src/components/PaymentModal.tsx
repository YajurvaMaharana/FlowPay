import React, { useState, useEffect } from 'react';
import { PaymentOrder } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  X, ShieldCheck, CreditCard, Smartphone, Building2, Wallet, 
  CheckCircle2, AlertCircle, ArrowRight, Lock, Loader2, Sparkles, RefreshCw 
} from 'lucide-react';

interface PaymentModalProps {
  order: PaymentOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (order: PaymentOrder, method: 'upi' | 'card' | 'netbanking' | 'wallet', txnId: string) => void;
  onPaymentFailed: (order: PaymentOrder, reason: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
  onPaymentFailed
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('valentinine@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8765 4321 9087');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('891');
  const [cardHolder, setCardHolder] = useState('Valentinine Test');
  const [testCardMode, setTestCardMode] = useState<'success' | 'otp' | 'decline'>('success');
  
  const [step, setStep] = useState<'form' | 'otp' | 'processing' | 'success' | 'failed'>('form');
  const [otpCode, setOtpCode] = useState('847291');
  const [failureReason, setFailureReason] = useState<string>('');
  const [countdown, setCountdown] = useState(180);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setCountdown(180);
    }
  }, [isOpen, order]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen || !order) return null;

  const handleTestCardPreset = (mode: 'success' | 'otp' | 'decline') => {
    setTestCardMode(mode);
    if (mode === 'success') {
      setCardNumber('4111 2222 3333 4444');
      setCardExpiry('08/29');
      setCardCvv('123');
    } else if (mode === 'otp') {
      setCardNumber('5200 8282 9191 7733');
      setCardExpiry('11/27');
      setCardCvv('456');
    } else {
      setCardNumber('4000 0000 0000 0002');
      setCardExpiry('05/26');
      setCardCvv('999');
    }
  };

  const handleProcessPayment = () => {
    if (activeTab === 'card' && testCardMode === 'otp') {
      setStep('otp');
      return;
    }

    setStep('processing');
    setTimeout(() => {
      if (activeTab === 'card' && testCardMode === 'decline') {
        const reason = 'BANK_DECLINED: Card issuer declined transaction (Insufficient test balance / security hold)';
        setFailureReason(reason);
        setStep('failed');
        onPaymentFailed(order, reason);
      } else {
        const txnId = `pay_${Math.random().toString(36).substring(2, 12)}`;
        setStep('success');
        triggerConfetti();
        onPaymentSuccess(order, activeTab, txnId);
      }
    }, 1600);
  };

  const handleVerifyOtp = () => {
    setStep('processing');
    setTimeout(() => {
      const txnId = `pay_${Math.random().toString(36).substring(2, 12)}`;
      setStep('success');
      triggerConfetti();
      onPaymentSuccess(order, 'card', txnId);
    }, 1400);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="razorpay-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="razorpay-modal-container" 
        className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-600 flex items-center justify-center text-white font-bold text-sm shadow">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">FlowPay Store</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-950 text-green-300 border border-green-800/60 font-mono">
                  Razorpay Live
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">{order.customerEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400">Total Amount</span>
              <div className="text-base font-bold text-green-400 font-display">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              id="btn-close-razorpay-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step: Success Screen */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 text-green-400 flex items-center justify-center mx-auto shadow-lg shadow-green-900/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold font-display text-white">Payment Successful!</h4>
              <p className="text-sm text-neutral-300">
                Transaction ID: <span className="font-mono text-green-300">pay_flw_{order.orderId.slice(-8)}</span>
              </p>
              <p className="text-xs text-neutral-400">
                An official receipt has been emailed to <span className="text-neutral-200">{order.customerEmail}</span>
              </p>
            </div>

            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Merchant</span>
                <span className="text-neutral-200 font-semibold">FlowPay Technologies Ltd.</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Amount Paid</span>
                <span className="text-green-400 font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Payment Mode</span>
                <span className="text-neutral-200 uppercase">{activeTab}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Order Reference</span>
                <span className="text-neutral-200 font-mono">{order.orderId}</span>
              </div>
            </div>

            <button
              id="btn-done-payment-success"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-all shadow-lg shadow-green-900/40"
            >
              Return to Chat & Store
            </button>
          </div>
        )}

        {/* Step: Failed Screen */}
        {step === 'failed' && (
          <div className="p-6 text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold font-display text-white">Payment Declined by Bank</h4>
              <p className="text-xs text-red-300 font-mono p-2 rounded bg-red-950/40 border border-red-800/40">
                {failureReason}
              </p>
              <p className="text-xs text-neutral-400 pt-1">
                Veluno AI agent is ready to assist you with an instant UPI switch or alternate card!
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                id="btn-switch-to-upi-fallback"
                onClick={() => {
                  setActiveTab('upi');
                  setStep('form');
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Switch to Instant UPI (GPay / PhonePe)</span>
              </button>

              <button
                id="btn-close-failure-modal"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
              >
                Ask Agent in Chat for Help
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing State */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-neutral-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-display">Authorizing Transaction...</h4>
              <p className="text-xs text-neutral-400">Connecting securely to Razorpay 256-bit bank gateway</p>
              <p className="text-[11px] text-neutral-300">Please do not refresh or close this window.</p>
            </div>
          </div>
        )}

        {/* Step: 3D Secure / OTP Simulation */}
        {step === 'otp' && (
          <div className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-400" />
                <span className="font-semibold text-neutral-200">Bank 3D Secure Verification</span>
              </div>
              <span className="font-mono text-neutral-300">{formatTime(countdown)}</span>
            </div>

            <div className="space-y-2 text-center py-2">
              <p className="text-xs text-neutral-300">
                A 6-digit one-time password (OTP) was sent to your registered mobile ending in <strong className="text-white">••89</strong>
              </p>
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-48 text-center text-xl tracking-widest font-mono font-bold px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-500/50 text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">Test OTP pre-filled: 847291</p>
            </div>

            <div className="flex gap-2">
              <button
                id="btn-submit-otp"
                onClick={handleVerifyOtp}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-xs transition-colors"
              >
                Verify & Complete Payment
              </button>
              <button
                id="btn-cancel-otp"
                onClick={() => setStep('form')}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step: Main Payment Selection Form */}
        {step === 'form' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 p-2 bg-neutral-950/60 border-b border-neutral-800 text-xs">
              <button
                id="tab-pay-upi"
                onClick={() => setActiveTab('upi')}
                className={`py-2.5 px-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'upi'
                    ? 'bg-neutral-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                id="tab-pay-card"
                onClick={() => setActiveTab('card')}
                className={`py-2.5 px-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'card'
                    ? 'bg-neutral-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cards</span>
              </button>

              <button
                id="tab-pay-netbanking"
                onClick={() => setActiveTab('netbanking')}
                className={`py-2.5 px-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'netbanking'
                    ? 'bg-neutral-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Netbanking</span>
              </button>

              <button
                id="tab-pay-wallet"
                onClick={() => setActiveTab('wallet')}
                className={`py-2.5 px-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'wallet'
                    ? 'bg-neutral-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Wallets</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-5 space-y-4 flex-1">
              {/* UPI Tab */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center flex-col space-y-2">
                    <QRCodeSVG
                      value={order.qrCodeData}
                      size={140}
                      level="H"
                      includeMargin={true}
                      className="rounded-lg shadow-sm"
                    />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-neutral-200">Scan QR with any UPI App</p>
                      <p className="text-[10px] text-neutral-400">GPay, PhonePe, Paytm, CRED, Amazon Pay</p>
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-neutral-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Or enter UPI ID</span>
                    <div className="flex-grow border-t border-neutral-800"></div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-300 font-medium">Virtual Payment Address (VPA)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="mobile@upi or user@okhdfcbank"
                        className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                      />
                      <button
                        id="btn-verify-upi"
                        onClick={handleProcessPayment}
                        className="px-4 py-2 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white font-semibold text-xs transition-colors shrink-0"
                      >
                        Request OTP
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards Tab */}
              {activeTab === 'card' && (
                <div className="space-y-3.5">
                  {/* Test Card Presets Selector */}
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-900/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-300 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-neutral-400" /> Test Card Presets:
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleTestCardPreset('success')}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          testCardMode === 'success'
                            ? 'bg-green-950/60 border-green-500/50 text-green-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        ✓ Instant Success
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestCardPreset('otp')}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          testCardMode === 'otp'
                            ? 'bg-neutral-950/60 border-neutral-500/50 text-neutral-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        ⚡ 3DS OTP Challenge
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestCardPreset('decline')}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          testCardMode === 'decline'
                            ? 'bg-red-950/60 border-red-500/50 text-red-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        ✕ Bank Decline
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-neutral-400">Card Number</label>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 pl-9 rounded-xl bg-neutral-950 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                        <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-neutral-400">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Netbanking Tab */}
              {activeTab === 'netbanking' && (
                <div className="space-y-3">
                  <span className="text-xs text-neutral-400">Popular Banks</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'Others'].map((bank, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={handleProcessPayment}
                        className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-500/60 text-neutral-200 text-center font-medium transition-all"
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet Tab */}
              {activeTab === 'wallet' && (
                <div className="space-y-3">
                  <span className="text-xs text-neutral-400">Select Digital Wallet</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Amazon Pay', 'Paytm Wallet', 'MobiKwik', 'PhonePe Wallet'].map((w, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={handleProcessPayment}
                        className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-500/60 text-neutral-200 text-left font-medium flex items-center justify-between transition-all"
                      >
                        <span>{w}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <Lock className="w-3.5 h-3.5 text-green-400" />
                <span>PCI-DSS Level 1 Encrypted</span>
              </div>

              <button
                id="btn-confirm-razorpay-pay"
                onClick={handleProcessPayment}
                className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-green-900/30"
              >
                <span>Pay ₹{order.totalAmount.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
