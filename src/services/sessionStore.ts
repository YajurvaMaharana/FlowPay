import { Product } from '../types';

export interface CrossSellImpression {
  id: string;
  sessionId: string;
  customerId: string;
  coreProductName: string;
  accessoryName: string;
  timestamp: string;
}

export interface CrossSellConversion {
  id: string;
  sessionId: string;
  customerId: string;
  coreProductName: string;
  accessoryName: string;
  amount: number;
  timestamp: string;
}

export interface SessionState {
  sessionId: string;
  customerId: string; // Test mode Razorpay Customer ID e.g. cust_rzp_test_99812
  purchasedItems: Product[];
  browsedCategories: string[];
  crossSellImpressions: CrossSellImpression[];
  crossSellConversions: CrossSellConversion[];
  lastActive: string;
}

const SESSION_STORAGE_KEY = 'veluno_session_state_v1';

function createNewSession(): SessionState {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return {
    sessionId: `sess_vln_${Date.now().toString(36)}_${randomSuffix}`,
    customerId: `cust_rzp_test_${Date.now().toString().slice(-6)}`,
    purchasedItems: [],
    browsedCategories: [],
    crossSellImpressions: [],
    crossSellConversions: [],
    lastActive: new Date().toISOString()
  };
}

export class SessionStore {
  private static memoryState: SessionState | null = null;

  public static getSession(): SessionState {
    if (this.memoryState) {
      return this.memoryState;
    }

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: SessionState = JSON.parse(stored);
        if (parsed && parsed.sessionId) {
          this.memoryState = parsed;
          return parsed;
        }
      }
    } catch {
      // Fallback to memory
    }

    const newSess = createNewSession();
    this.saveSession(newSess);
    return newSess;
  }

  public static saveSession(session: SessionState): void {
    session.lastActive = new Date().toISOString();
    this.memoryState = session;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Fallback
    }
  }

  public static getPurchasedItems(): Product[] {
    return this.getSession().purchasedItems || [];
  }

  public static addPurchasedItems(items: Product[]): void {
    const session = this.getSession();
    const existing = [...(session.purchasedItems || [])];

    for (const item of items) {
      if (!existing.some(p => p.id === item.id)) {
        existing.push(item);
      }
    }

    session.purchasedItems = existing;
    this.saveSession(session);
  }

  public static logImpression(coreProductName: string, accessoryName: string): CrossSellImpression {
    const session = this.getSession();
    const impression: CrossSellImpression = {
      id: `imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: session.sessionId,
      customerId: session.customerId,
      coreProductName,
      accessoryName,
      timestamp: new Date().toISOString()
    };

    session.crossSellImpressions = [impression, ...(session.crossSellImpressions || [])];
    this.saveSession(session);
    return impression;
  }

  public static logConversion(coreProductName: string, accessoryName: string, amount: number): CrossSellConversion {
    const session = this.getSession();
    const conversion: CrossSellConversion = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: session.sessionId,
      customerId: session.customerId,
      coreProductName,
      accessoryName,
      amount,
      timestamp: new Date().toISOString()
    };

    session.crossSellConversions = [conversion, ...(session.crossSellConversions || [])];
    this.saveSession(session);
    return conversion;
  }

  public static resetSession(): SessionState {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Fallback
    }
    this.memoryState = null;
    return this.getSession();
  }
}
