export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: 'audio' | 'wearables' | 'accessories' | 'workspace' | 'computing';
  price: number;
  originalPrice: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  crossSellProductId?: string;
  crossSellReason?: string;
  crossSellDiscount?: number; // e.g. 10%
  badge?: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface CartCalculation {
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  couponCode?: string;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  securityDiscountCapped: boolean;
  originalRequestedDiscount?: number;
}

export type PaymentStatus = 'created' | 'pending' | 'pending_payment' | 'processing' | 'paid' | 'success' | 'failed' | 'refunded';

export interface PaymentOrder {
  orderId: string;
  razorpayPaymentLinkId: string;
  razorpayShortUrl: string;
  qrCodeData: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  tax: number;
  totalAmount: number;
  amountInPaise?: number;
  razorpayKey?: string;
  razorpayOrderId?: string;
  currency: string;
  customerEmail: string;
  customerName?: string;
  status: PaymentStatus;
  createdAt: string;
  expiresAt?: string;
  expireByTimestamp?: number;
  ttlSeconds?: number;
  countdownSeconds?: number;
  paidAt?: string;
  paymentMethod?: 'upi' | 'card' | 'netbanking' | 'wallet';
  failureReason?: string;
  transactionId?: string;
  receiptNumber?: string;
}

export interface ToolCallEvent {
  id: string;
  name: 'check_catalog' | 'calculate_cart' | 'generate_payment' | 'handle_payment_failure' | 'scrub_pii' | 'analyze_workspace_vision' | 'eval_ecosystem_cross_sell' | 'cross_sell_converted';
  input: Record<string, any>;
  output: Record<string, any>;
  status: 'executing' | 'success' | 'blocked' | 'failed';
  timestamp: string;
  executionTimeMs?: number;
  executionGatePassed?: boolean;
  securityNote?: string;
}

export interface SecurityAlert {
  id: string;
  type: 
    | 'PROMPT_INJECTION_ATTEMPT'
    | 'DISCOUNT_LIMIT_ENFORCED'
    | 'PII_DETECTED_AND_MASKED'
    | 'UNAUTHORIZED_PAYMENT_GATE_BLOCKED'
    | 'OUT_OF_DOMAIN_REQUEST'
    | 'SUSPICIOUS_CART_MANIPULATION'
    | 'URGENCY_COST_PENALTY_APPLIED';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  details?: string;
  rawInput?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallEvent[];
  securityAlerts?: SecurityAlert[];
  paymentOrder?: PaymentOrder;
  attachment?: { type: 'image'; url: string };
  visionAnalysis?: {
    detectedIssue: string;
    products: Product[];
  };
  suggestedProducts?: Product[];
  crossSellOffer?: {
    mainProduct: Product;
    crossSellProduct: Product;
    discountPercentage: number;
    savings: number;
    bundleTotal: number;
  };
  ecosystemAwareness?: {
    purchasedCoreProduct: string;
    compatibleAccessories: Product[];
    contextTags: string[];
    recommendationNote: string;
  };
  cartCalculation?: CartCalculation;
  quickReplies?: string[];
  confirmationGated?: boolean;
  gatedAction?: {
    type: 'PROCEED_CHECKOUT';
    label: string;
    items: CartItem[];
    amount: number;
    email: string;
  };
  isPiiMasked?: boolean;
  isFailureRecovery?: boolean;
}

export interface SecurityMetrics {
  totalInteractions: number;
  attacksBlocked: number;
  piiMaskedCount: number;
  discountLimitsEnforced: number;
  gatedConfirmationsEnforced: number;
  zeroTrustStatus: 'OPTIMAL' | 'ELEVATED_THREAT' | 'ACTIVE_DEFENSE';
  yieldRetained: number;
}

export interface TestScenario {
  id: string;
  title: string;
  category: 'standard' | 'security' | 'pii' | 'failure' | 'edge_case';
  badge: string;
  description: string;
  initialPrompt: string;
  expectedOutcome: string;
  steps: string[];
}

export type NavigationTab = 'home' | 'about' | 'shop' | 'new-arrivals' | 'contact' | 'concierge';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAuthenticated: boolean;
  savedGearIds: string[];
  orders: PaymentOrder[];
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  preferences: {
    piiStrictMasking: boolean;
    autoApplyMaxDiscount: boolean;
    currency: string;
  };
}
