import React, { useState, useEffect, useCallback } from 'react';
import { PaymentOrder } from '../types';

export type PaymentExpiryState = 'active' | 'expired';

export interface PaymentCardWrapperProps {
  order?: PaymentOrder | null;
  initialSeconds?: number;
  expireByTimestamp?: number;
  expiresAt?: string;
  onExpire?: () => void;
  onStatusChange?: (status: PaymentExpiryState) => void;
  className?: string;
  children: 
    | React.ReactNode 
    | ((state: {
        countdownSeconds: number;
        isExpired: boolean;
        expiryState: PaymentExpiryState;
        formatCountdown: (secs?: number) => string;
        resetCountdown: (newSeconds?: number) => void;
        triggerExpire: () => void;
      }) => React.ReactNode);
}

/**
 * State-managed wrapper that tracks `countdownSeconds` for ephemeral 5-minute payment sessions.
 * Triggers an 'expired' state update when `countdownSeconds` reaches 0.
 */
export const PaymentCardWrapper: React.FC<PaymentCardWrapperProps> = ({
  order,
  initialSeconds = 300,
  expireByTimestamp,
  expiresAt,
  onExpire,
  onStatusChange,
  className = '',
  children
}) => {
  // Compute initial remaining seconds
  const calculateRemainingSeconds = useCallback(() => {
    // Priority 1: Direct timestamp from order
    if (order?.expireByTimestamp) {
      const remaining = order.expireByTimestamp - Math.floor(Date.now() / 1000);
      return Math.max(0, remaining);
    }
    if (expireByTimestamp) {
      const remaining = expireByTimestamp - Math.floor(Date.now() / 1000);
      return Math.max(0, remaining);
    }
    // Priority 2: ISO string expiresAt
    const targetExpiresAt = order?.expiresAt || expiresAt;
    if (targetExpiresAt) {
      const remaining = Math.floor((new Date(targetExpiresAt).getTime() - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    // Default 5-minute ephemeral countdown (300 seconds)
    return initialSeconds;
  }, [order, expireByTimestamp, expiresAt, initialSeconds]);

  // Primary state variables
  const [countdownSeconds, setCountdownSeconds] = useState<number>(calculateRemainingSeconds);
  const [expiryState, setExpiryState] = useState<PaymentExpiryState>(() => 
    calculateRemainingSeconds() <= 0 ? 'expired' : 'active'
  );
  const [isExpired, setIsExpired] = useState<boolean>(() => 
    calculateRemainingSeconds() <= 0
  );

  // Sync when order or target timestamp updates
  useEffect(() => {
    const remaining = calculateRemainingSeconds();
    setCountdownSeconds(remaining);
    if (remaining <= 0) {
      setExpiryState('expired');
      setIsExpired(true);
      onStatusChange?.('expired');
      onExpire?.();
    } else {
      setExpiryState('active');
      setIsExpired(false);
      onStatusChange?.('active');
    }
  }, [order?.orderId, order?.expireByTimestamp, order?.expiresAt, calculateRemainingSeconds]);

  // Ticking effect: decrements countdownSeconds every second until 0
  useEffect(() => {
    if (countdownSeconds <= 0) {
      if (expiryState !== 'expired') {
        // Trigger the 'expired' state update
        setExpiryState('expired');
        setIsExpired(true);
        onStatusChange?.('expired');
        onExpire?.();
      }
      return;
    }

    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          // Trigger the 'expired' state update when countdownSeconds reaches 0
          setExpiryState('expired');
          setIsExpired(true);
          onStatusChange?.('expired');
          onExpire?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownSeconds, expiryState, onExpire, onStatusChange]);

  const formatCountdown = useCallback((secs?: number) => {
    const totalSecs = typeof secs === 'number' ? secs : countdownSeconds;
    const mins = Math.floor(Math.max(0, totalSecs) / 60);
    const seconds = Math.max(0, totalSecs) % 60;
    return `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [countdownSeconds]);

  const resetCountdown = useCallback((newSeconds = 300) => {
    setCountdownSeconds(newSeconds);
    setExpiryState('active');
    setIsExpired(false);
    onStatusChange?.('active');
  }, [onStatusChange]);

  const triggerExpire = useCallback(() => {
    setCountdownSeconds(0);
    setExpiryState('expired');
    setIsExpired(true);
    onStatusChange?.('expired');
    onExpire?.();
  }, [onExpire, onStatusChange]);

  return (
    <div 
      data-testid="payment-card-wrapper"
      data-expiry-state={expiryState}
      data-countdown-seconds={countdownSeconds}
      className={`payment-card-wrapper transition-all duration-300 relative ${className}`}
    >
      {typeof children === 'function'
        ? children({
            countdownSeconds,
            isExpired,
            expiryState,
            formatCountdown,
            resetCountdown,
            triggerExpire
          })
        : children}
    </div>
  );
};

export default PaymentCardWrapper;
