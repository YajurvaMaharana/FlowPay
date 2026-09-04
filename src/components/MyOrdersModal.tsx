import React from 'react';
import { 
  X, Package, CheckCircle2, Clock, AlertTriangle, FileText, 
  ExternalLink, ArrowRight, ShieldCheck, ShoppingBag, Lock 
} from 'lucide-react';
import { PaymentOrder } from '../types';

interface MyOrdersModalProps {
  isOpen: boolean;
  orders: PaymentOrder[];
  onClose: () => void;
  onViewInvoice: (order: PaymentOrder) => void;
  onOpenPaymentModal: (order: PaymentOrder) => void;
  onOpenAgent: (query?: string) => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  orders,
  onClose,
  onViewInvoice,
  onOpenPaymentModal,
  onOpenAgent
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Orders Modal Card */}
      <div 
        id="my-orders-modal-card"
        className="relative w-full max-w-2xl bg-neutral-900/95 border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 z-10 backdrop-blur-2xl animate-scaleUp text-neutral-100 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-600/20 border border-neutral-500/40 flex items-center justify-center text-neutral-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-white">My Orders & Purchases</h2>
              <p className="text-xs text-neutral-400 font-mono">
                Encrypted Razorpay transactions & tax invoices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders List Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {orders.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-500">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-base font-bold text-neutral-200">No Orders Yet</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Explore our curated acoustic and workspace catalog or chat with Veluno to build your dream setup.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAgent('Show me top flagship gear recommendations');
                }}
                className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-colors shadow-md mt-2 inline-flex items-center gap-2"
              >
                <span>Discover Gear with AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const isPaid = order.status === 'paid';
              const isFailed = order.status === 'failed';
              const isPending = order.status === 'created' || order.status === 'pending';

              return (
                <div
                  key={order.orderId}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-3"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">
                        {order.orderId}
                      </span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {isPaid && (
                        <span className="px-2.5 py-0.5 rounded-full bg-green-950/80 border border-green-500/50 text-green-300 font-mono text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          PAID & VERIFIED
                        </span>
                      )}
                      {isFailed && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          BANK DECLINED
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" />
                          GATEWAY PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-2 pt-1 border-t border-neutral-900">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-9 h-9 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate text-xs">{item.product.name}</p>
                            <p className="text-[10px] text-neutral-400 font-mono">Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <span className="font-mono font-medium text-neutral-200 shrink-0">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Actions */}
                  <div className="pt-2 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-400">Total Payable (incl. GST): </span>
                      <strong className="font-mono text-sm text-white">₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                      {order.discountAmount > 0 && (
                        <span className="text-[10px] text-green-400 font-mono ml-2">
                          (Saved ₹{order.discountAmount.toLocaleString('en-IN')})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewInvoice(order)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Tax Invoice</span>
                      </button>

                      {isPending && (
                        <button
                          onClick={() => onOpenPaymentModal(order)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                        >
                          <Lock className="w-3.5 h-3.5 text-neutral-800" />
                          <span>Complete Secure Checkout</span>
                          <ArrowRight className="w-3.5 h-3.5 text-black" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500 shrink-0">
          <div className="flex items-center gap-1 text-green-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Encrypted Payment Records</span>
          </div>
          <span>Razorpay Direct Protocol</span>
        </div>
      </div>
    </div>
  );
};
