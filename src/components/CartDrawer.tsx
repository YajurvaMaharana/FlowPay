import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { CartItem, CartCalculation } from '../types';

interface CartDrawerProps {
  items: CartItem[];
  calculation: CartCalculation;
  appliedDiscount: number;
  couponCode: string | null;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
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
  isAuthenticated = false,
  onRequireAuth,
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

  const handleRazorpayCheckout = async () => {
    if (!isAuthenticated) {
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: calculation.total })
      });
      
      const data = await response.json();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: data.amount,
        currency: data.currency,
        name: 'Veluno Tech',
        description: 'Cart Checkout',
        order_id: data.order_id,
        handler: function (response: any) {
          alert(`Payment Confirmed. Receipt ID: ${response.razorpay_payment_id}`);
          onProceedCheckout(); // Or you could dispatch a message indicating success if needed
        },
        prefill: {
          name: 'Customer',
          email: 'valentinine14feb@gmail.com'
        },
        theme: {
          color: '#111111'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert('Payment Failed. Please try again.');
      });
      rzp.open();
      
    } catch (err) {
      console.error('Failed to initialize checkout', err);
      alert('Failed to initialize checkout. Please try again.');
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto p-4 gap-4 bg-[#0a0a0a]">
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-2">
          <ShoppingCart className="w-12 h-12 text-neutral-700 mx-auto" />
          <p className="font-semibold text-neutral-300 text-sm">Your cart is empty</p>
          <p className="text-xs text-neutral-500 max-w-[200px]">
            Browse our catalog or ask Veluno in chat for tailored recommendations!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between bg-[#121212] border border-neutral-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h5 className="text-white font-medium">{item.product.name}</h5>
                    <p className="text-neutral-400 text-sm">₹{item.product.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-black rounded-lg px-3 py-1 border border-neutral-800">
                    <button onClick={() => onUpdateQuantity(item.product.id, -1)} className="text-neutral-400 hover:text-white transition-colors">-</button>
                    <span className="text-white text-sm font-mono">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.product.id, 1)} className="text-neutral-400 hover:text-white transition-colors">+</button>
                  </div>
                  <button onClick={() => onRemoveItem(item.product.id)} className="text-neutral-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-[#121212] border border-neutral-800 rounded-xl p-4 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Subtotal</span>
              <span>₹{calculation.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {calculation.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Discount ({calculation.discountPercentage}%)</span>
                <span>-₹{calculation.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-neutral-400">
              <span>GST (18%)</span>
              <span>₹{calculation.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Shipping</span>
              <span>{calculation.shipping === 0 ? 'FREE' : `₹${calculation.shipping}`}</span>
            </div>
            <div className="flex justify-between text-white text-lg font-bold mt-2 pt-2 border-t border-neutral-800">
              <span>Total Amount</span>
              <span>₹{calculation.total.toLocaleString('en-IN')}</span>
            </div>

            <button 
              type="button" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all mt-4" 
              onClick={(e) => {
                e.preventDefault();
                handleRazorpayCheckout();
              }}
            >
              Proceed to Checkout (₹{calculation.total.toLocaleString('en-IN')})
            </button>
          </div>
        </>
      )}
    </div>
  );
};
