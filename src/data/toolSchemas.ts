export interface ToolSchemaDefinition {
  name: string;
  signature: string;
  description: string;
  category: 'discovery' | 'pricing' | 'payment';
  securityRule: string;
  schema: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description: string;
        format?: string;
        items?: {
          type: string;
        };
      }>;
      required: string[];
    };
  };
  samplePayload: Record<string, any>;
  sampleResponse: Record<string, any>;
}

export const TOOL_SCHEMAS: ToolSchemaDefinition[] = [
  {
    name: 'check_catalog',
    signature: 'check_catalog(search_query)',
    description: 'Searches the merchant product catalog for products matching keywords, specs, categories, prices, and live stock levels.',
    category: 'discovery',
    securityRule: 'Protocol #4: Scope Limitation — Queries must remain strictly within merchant consumer hardware and accessories domain.',
    schema: {
      name: 'check_catalog',
      description: 'Searches the merchant product catalog for matching tech hardware, specs, pricing, and stock levels.',
      parameters: {
        type: 'object',
        properties: {
          search_query: {
            type: 'string',
            description: 'Keywords or search term to query the product catalog (e.g., "headphones", "mechanical keyboard", "4k monitor").'
          }
        },
        required: ['search_query']
      }
    },
    samplePayload: {
      search_query: 'noise cancelling headphones'
    },
    sampleResponse: {
      totalFound: 1,
      items: [
        {
          id: 'prod_apex_anc',
          name: 'Apex Horizon ANC Wireless Headphones',
          price: 24999,
          stock: 14,
          inStock: true
        }
      ]
    }
  },
  {
    name: 'calculate_cart',
    signature: 'calculate_cart(item_ids, discount_percentage)',
    description: 'Calculates the cart subtotal, 18% GST tax, shipping fees, and final payable amount. Strictly enforces the 10% maximum discount ceiling under Zero-Trust rules.',
    category: 'pricing',
    securityRule: 'Protocol #1: Zero-Trust Architecture — Any requested discount >10% is mathematically capped to 10% and flagged as a security alert.',
    schema: {
      name: 'calculate_cart',
      description: 'Calculates the cart subtotal, 18% GST tax, shipping, and final total, enforcing the strict 10% discount ceiling under Zero-Trust policy.',
      parameters: {
        type: 'object',
        properties: {
          item_ids: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of product ID strings present in the customer cart.'
          },
          discount_percentage: {
            type: 'number',
            description: 'Requested discount percentage (0 to 100). Note: System strictly caps this at a maximum of 10%.'
          }
        },
        required: ['item_ids', 'discount_percentage']
      }
    },
    samplePayload: {
      item_ids: ['prod_apex_anc', 'prod_stand_pro'],
      discount_percentage: 10
    },
    sampleResponse: {
      subtotal: 28998,
      discountPercentage: 10,
      discountAmount: 2899.8,
      tax: 4697.68,
      shipping: 0,
      total: 30795.88,
      securityDiscountCapped: false
    }
  },
  {
    name: 'generate_payment',
    signature: 'generate_payment(final_amount, customer_email, order_description, expire_by)',
    description: 'Generates an ephemeral, encrypted Razorpay payment link with a strict 5-minute cryptographic gateway lock and dynamic UPI QR code. Requires explicit Human-in-the-loop user confirmation. Sensitive PII card numbers are strictly forbidden in this payload.',
    category: 'payment',
    securityRule: 'Protocol #2 & #3: PII Minimization & Human-in-the-Loop Gating — Requires user approval before call; credit card numbers/CVV must never be included in payload. Enforces 5-minute cryptographic lock.',
    schema: {
      name: 'generate_payment',
      description: 'Generates an encrypted Razorpay payment link with 5-minute gateway lock and dynamic UPI QR code. Requires explicit Human-in-the-loop user confirmation. PII credit card numbers are strictly forbidden.',
      parameters: {
        type: 'object',
        properties: {
          final_amount: {
            type: 'number',
            description: 'The exact final payable amount in INR after GST and capped discount.'
          },
          customer_email: {
            type: 'string',
            format: 'email',
            description: 'Verified customer email address for sending the Razorpay payment link and tax invoice.'
          },
          order_description: {
            type: 'string',
            description: 'Summary description of the items and order fulfillment terms.'
          },
          expire_by: {
            type: 'number',
            description: 'Explicit Unix epoch timestamp in seconds indicating when the payment link expires (strictly set to current epoch + 300 seconds for a 5-minute window).'
          }
        },
        required: ['final_amount', 'customer_email', 'order_description', 'expire_by']
      }
    },
    samplePayload: {
      final_amount: 30795.88,
      customer_email: 'valentinine14feb@gmail.com',
      order_description: 'FlowPay Order: Apex Horizon ANC Headphones + Pro Aluminum Headphone Stand',
      expire_by: 1772659800
    },
    sampleResponse: {
      orderId: 'ORD-RAZOR-92817',
      razorpayPaymentLinkId: 'plink_N9xQ84hV1',
      razorpayShortUrl: 'https://rzp.io/i/flowpay_N9xQ84hV1',
      qrCodeData: 'upi://pay?pa=flowpay.merchant@razorpay&pn=FlowPay%20Merchant&am=30795.88&cu=INR&tr=ORD-RAZOR-92817',
      expire_by: 1772659800,
      expires_at: '2026-03-04T18:55:00.000Z',
      ttl_seconds: 300,
      countdown_seconds: 300,
      gateway_lock: '5_MINUTE_CRYPTOGRAPHIC_LOCK',
      status: 'created',
      totalAmount: 30795.88
    }
  }
];
