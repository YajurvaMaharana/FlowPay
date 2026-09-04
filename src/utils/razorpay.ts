import React from 'react';

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface CheckoutConfig {
  amountPaise: number;
  orderId?: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  key?: string;
  currency?: string;
  onSuccess?: (response: RazorpayResponse) => void;
  onDismiss?: () => void;
  onError?: (error: any) => void;
  onFallback?: (reason: string) => void;
}

/**
 * Standard Razorpay checkout helper.
 * Attempts to launch native Razorpay Checkout if window.Razorpay SDK is available,
 * or delegates cleanly to the Razorpay modal / gateway handler.
 */
export const initializeRazorpayCheckout = async (
  config: CheckoutConfig,
  event?: React.MouseEvent | Event
): Promise<{ success: boolean; instance?: any; error?: string }> => {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }

  // If window.Razorpay is available, launch native SDK checkout
  if (typeof (window as any).Razorpay !== 'undefined') {
    try {
      const options = {
        key: config.key || (window as any).RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: config.amountPaise,
        currency: config.currency || 'INR',
        name: 'Veluno Tech',
        description: config.description || 'Order Payment',
        order_id: config.orderId?.startsWith('order_') ? config.orderId : undefined,
        handler: function (response: any) {
          if (config.onSuccess) {
            config.onSuccess(response);
          }
        },
        prefill: {
          name: config.customerName || 'Valentin',
          email: config.customerEmail || 'valentinine14feb@gmail.com'
        },
        theme: {
          color: '#0c83fd'
        },
        modal: {
          ondismiss: function () {
            config.onDismiss?.();
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        config.onError?.(response.error || response);
      });
      rzp.open();
      return { success: true, instance: rzp };
    } catch (err: any) {
      console.warn('Native Razorpay SDK launch encountered an issue, falling back to modal:', err);
      config.onFallback?.(err?.message || 'Native checkout failed');
      return { success: false, error: err?.message };
    }
  }

  config.onFallback?.('Razorpay SDK not loaded');
  return { success: false, error: 'Razorpay SDK not loaded' };
};
