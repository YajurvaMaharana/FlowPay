import React from 'react';
import { PaymentOrder } from '../types';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  order: PaymentOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="invoice-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="invoice-modal-container"
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-base text-white">Official Tax Invoice & Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-invoice"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              id="btn-close-invoice"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-slate-950 text-slate-200 print:bg-white print:text-black">
          {/* Top Brand & Metadata */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-2xl font-black font-display text-white">FLOWPAY</h2>
              <p className="text-xs text-slate-400 mt-1">FlowPay Merchant Technologies Ltd.</p>
              <p className="text-xs text-slate-400">GSTIN: 29AAACH7409R1ZZ</p>
              <p className="text-xs text-slate-400">Bengaluru, Karnataka 560103</p>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-xs font-bold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAYMENT VERIFIED
              </span>
              <p className="text-xs text-slate-400">Invoice No: <strong className="text-white font-mono">{order.receiptNumber || 'REC-89421'}</strong></p>
              <p className="text-xs text-slate-400">Order ID: <strong className="text-white font-mono">{order.orderId}</strong></p>
              <p className="text-xs text-slate-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer & Gateway Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Billed To</span>
              <p className="text-sm font-bold text-white mt-1">{order.customerName || 'Valued Customer'}</p>
              <p className="text-slate-300 font-mono">{order.customerEmail}</p>
              <p className="text-slate-400 mt-0.5">Verified Merchant Account</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Payment Information</span>
              <p className="text-slate-300 mt-1">Gateway: <strong className="text-white">Razorpay 256-bit Secure</strong></p>
              <p className="text-slate-300">Method: <strong className="text-white uppercase">{order.paymentMethod || 'UPI / Card'}</strong></p>
              <p className="text-slate-300 font-mono text-[11px]">Link Ref: {order.razorpayPaymentLinkId}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Product Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/30">
                    <td className="p-3">
                      <div className="font-semibold text-white">{item.product.name}</div>
                      <div className="text-[10px] text-slate-400">{item.product.tagline}</div>
                    </td>
                    <td className="p-3 text-center font-mono">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">₹{item.product.price.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-white font-mono">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Summary */}
          <div className="flex justify-end text-xs">
            <div className="w-full sm:w-64 space-y-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Merchant Discount</span>
                  <span className="font-mono">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>CGST (9%) + SGST (9%)</span>
                <span className="text-white font-mono">₹{order.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Priority Insured Shipping</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-bold">
                <span className="text-white">Total Paid</span>
                <span className="text-emerald-400 font-mono">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>This is an electronically generated valid tax invoice.</span>
          <button
            id="btn-invoice-close-bottom"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
