import React, { useState } from 'react';
import { CartCalculation, CartItem } from '../types';
import { ShoppingCart, Trash2, Plus, Minus, ShieldCheck, Lock, ArrowRight, Tag, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  items: CartItem[];
  calculation: CartCalculation;
  appliedDiscount: number;
  couponCode?: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onApplyCoupon: (code: string) => void;
  onProceedCheckout: () => void;
  onClose?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  items,
  calculation,
  appliedDiscount,
  couponCode,
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon,
  onProceedCheckout
}) => {
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    
    onApplyCoupon(inputCoupon.trim().toUpperCase());
    if (inputCoupon.toUpperCase().includes('50') || inputCoupon.toUpperCase().includes('90')) {
      setCouponMsg({
        text: 'Zero-Trust Protocol: Discounts capped to max 10% policy limit.',
        isError: true
      });
    } else {
      setCouponMsg({
        text: 'Coupon verified! 10% discount applied.',
        isError: false
      });
    }
  };

  return (
    <div id="cart-drawer" className="h-full flex flex-col p-4 text-xs space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-indigo-400" />
          <h3 className="font-display font-bold text-sm text-white">Your Shopping Cart</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
          {items.reduce((sum, i) => sum + i.quantity, 0)} items
        </span>
      </div>

      {/* Cart Items List */}
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
          <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto" />
          <p className="font-semibold text-slate-300 text-sm">Your cart is empty</p>
          <p className="text-xs text-slate-500 max-w-[200px]">
            Browse our catalog or ask AlphaCart in chat for tailored recommendations!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-slate-100 truncate text-xs">{item.product.name}</h5>
                <p className="text-[11px] text-emerald-400 font-display font-bold">
                  ₹{item.product.price.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  id={`btn-cart-minus-${item.product.id}`}
                  onClick={() => onUpdateQuantity(item.product.id, -1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <span className="w-6 text-center font-mono font-bold text-xs text-white">
                  {item.quantity}
                </span>

                <button
                  id={`btn-cart-plus-${item.product.id}`}
                  onClick={() => onUpdateQuantity(item.product.id, 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                id={`btn-cart-remove-${item.product.id}`}
                onClick={() => onRemoveItem(item.product.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Coupon Application Box */}
      {items.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                placeholder="Enter promo (e.g. SAVE10)"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white uppercase placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors shrink-0"
            >
              Apply
            </button>
          </form>

          {couponMsg && (
            <p className={`text-[10px] flex items-center gap-1 ${couponMsg.isError ? 'text-amber-400' : 'text-emerald-400'}`}>
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{couponMsg.text}</span>
            </p>
          )}

          {/* 10% Discount Policy Badge */}
          <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[10px] text-indigo-300 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Zero-Trust: Max authorized merchant discount is strictly 10%.</span>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {items.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="text-slate-200 font-mono">₹{calculation.subtotal.toLocaleString('en-IN')}</span>
          </div>

          {calculation.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount ({calculation.discountPercentage}%)</span>
              <span className="font-mono">-₹{calculation.discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>GST (18%)</span>
            <span className="text-slate-200 font-mono">₹{calculation.tax.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Shipping</span>
            <span className="text-emerald-400 font-semibold">
              {calculation.shipping === 0 ? 'FREE' : `₹${calculation.shipping}`}
            </span>
          </div>

          <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold">
            <span className="text-white">Total Amount</span>
            <span className="text-emerald-400 font-display">₹{calculation.total.toLocaleString('en-IN')}</span>
          </div>

          <button
            id="btn-cart-proceed-checkout"
            onClick={onProceedCheckout}
            className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-900/40 hover:scale-[1.01]"
          >
            <span>Proceed with AlphaCart Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
