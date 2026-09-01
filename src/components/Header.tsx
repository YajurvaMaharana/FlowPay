import React, { useState } from 'react';
import { SecurityMetrics, TestScenario } from '../types';
import { TEST_SCENARIOS } from '../data/scenarios';
import { 
  Zap, ShieldCheck, ShoppingCart, Terminal, Play, 
  ChevronDown, Sparkles, AlertOctagon, RefreshCw, User, EyeOff 
} from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  securityMetrics: SecurityMetrics;
  userEmail: string;
  activeTab: 'chat' | 'catalog' | 'cart' | 'security';
  setActiveTab: (tab: 'chat' | 'catalog' | 'cart' | 'security') => void;
  onSelectScenario: (scenario: TestScenario) => void;
  onResetSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  securityMetrics,
  userEmail,
  activeTab,
  setActiveTab,
  onSelectScenario,
  onResetSession
}) => {
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('chat')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-extrabold text-base tracking-tight text-white">FlowPay</h1>
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-[10px] font-bold font-mono">
                AlphaCart AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Zero-Trust Merchant AI Sales & Instant Razorpay Checkout</p>
          </div>
        </div>

        {/* Zero-Trust Shield Pill */}
        <button
          id="btn-nav-security-pill"
          onClick={() => setActiveTab('security')}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            securityMetrics.attacksBlocked > 0 || securityMetrics.piiMaskedCount > 0
              ? 'bg-amber-950/60 text-amber-300 border-amber-600/50 animate-pulse'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Trust Sentinel</span>
          {(securityMetrics.attacksBlocked > 0 || securityMetrics.piiMaskedCount > 0) && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
              {securityMetrics.attacksBlocked + securityMetrics.piiMaskedCount}
            </span>
          )}
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Scenarios Dropdown */}
        <div className="relative">
          <button
            id="btn-scenarios-menu"
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
            <span className="hidden sm:inline">Test Scenarios</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-scaleUp space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pre-Configured Scenarios & Attacks
              </div>
              {TEST_SCENARIOS.map((scen) => (
                <button
                  key={scen.id}
                  id={`scenario-item-${scen.id}`}
                  onClick={() => {
                    onSelectScenario(scen);
                    setShowScenarioMenu(false);
                  }}
                  className="w-full p-2 rounded-xl text-left hover:bg-slate-800 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 text-xs shrink-0 mt-0.5 group-hover:border-indigo-500">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-white truncate">{scen.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{scen.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            id="tab-btn-chat"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chat
          </button>
          <button
            id="tab-btn-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'catalog' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Catalog
          </button>
        </div>

        {/* Cart Drawer Trigger */}
        <button
          id="btn-header-cart"
          onClick={() => setActiveTab('cart')}
          className={`relative p-2 rounded-xl border transition-all ${
            activeTab === 'cart'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-950">
              {cartItemCount}
            </span>
          )}
        </button>

        {/* Security Audit Console Trigger */}
        <button
          id="btn-header-security"
          onClick={() => setActiveTab('security')}
          className={`p-2 rounded-xl border transition-all ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title="Security & Audit Console"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Reset Session */}
        <button
          id="btn-reset-session"
          onClick={onResetSession}
          title="Reset Session & Chat"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
