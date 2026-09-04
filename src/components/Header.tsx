import React, { useState } from 'react';
import { SecurityMetrics, TestScenario } from '../types';
import { TEST_SCENARIOS } from '../data/scenarios';
import { TOOL_SCHEMAS, ToolSchemaDefinition } from '../data/toolSchemas';
import { 
  Zap, ShieldCheck, ShoppingCart, Terminal, Play, 
  ChevronDown, Sparkles, AlertOctagon, RefreshCw, User, EyeOff,
  Wrench, Code2, Copy, FileJson, Check
} from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  securityMetrics: SecurityMetrics;
  userEmail: string;
  activeTab: 'chat' | 'audit' | 'catalog' | 'cart' | 'security' | 'tools';
  setActiveTab: (tab: 'chat' | 'audit' | 'catalog' | 'cart' | 'security' | 'tools') => void;
  onSelectScenario: (scenario: TestScenario) => void;
  onOpenToolsModal: () => void;
  onSelectToolPrompt: (toolName: string, prompt: string) => void;
  onResetSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  securityMetrics,
  userEmail,
  activeTab,
  setActiveTab,
  onSelectScenario,
  onOpenToolsModal,
  onSelectToolPrompt,
  onResetSession
}) => {
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [copiedTool, setCopiedTool] = useState<string | null>(null);

  const handleCopySchema = (e: React.MouseEvent, tool: ToolSchemaDefinition) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(tool.schema, null, 2));
    setCopiedTool(tool.name);
    setTimeout(() => setCopiedTool(null), 2000);
  };

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('chat')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neutral-600 to-neutral-400 flex items-center justify-center text-white shadow-lg shadow-neutral-900/30">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-extrabold text-base tracking-tight text-white">FlowPay</h1>
              <span className="px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-300 border border-neutral-700/50 text-[10px] font-bold font-mono">
                Veluno Concierge
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 hidden sm:block">Zero-Trust Merchant AI Sales & Instant Razorpay Checkout</p>
          </div>
        </div>

        {/* Zero-Trust Shield Pill */}
        <button
          id="btn-nav-security-pill"
          onClick={() => setActiveTab('security')}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            securityMetrics.attacksBlocked > 0 || securityMetrics.piiMaskedCount > 0
              ? 'bg-amber-950/60 text-amber-300 border-amber-600/50 animate-pulse'
              : 'bg-green-950/40 text-green-300 border-green-500/40'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Trust Sentinel</span>
          {(securityMetrics.attacksBlocked > 0 || securityMetrics.piiMaskedCount > 0) && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[9px] font-bold flex items-center justify-center">
              {securityMetrics.attacksBlocked + securityMetrics.piiMaskedCount}
            </span>
          )}
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tools Menu Dropdown */}
        <div className="relative">
          <button
            id="btn-tools-menu"
            onClick={() => {
              setShowToolsMenu(!showToolsMenu);
              setShowScenarioMenu(false);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              showToolsMenu || activeTab === 'tools'
                ? 'bg-neutral-950/80 border-neutral-500/60 text-neutral-200'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold">Tools</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showToolsMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl p-2 z-50 animate-scaleUp space-y-1.5">
              <div className="px-3 py-1.5 flex items-center justify-between border-b border-neutral-800/80">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Agent Tool JSON Schemas (3)
                </span>
                <button
                  id="btn-open-full-tools-modal"
                  onClick={() => {
                    onOpenToolsModal();
                    setShowToolsMenu(false);
                  }}
                  className="text-[10px] text-neutral-400 hover:text-neutral-300 font-semibold flex items-center gap-1"
                >
                  <FileJson className="w-3 h-3" />
                  <span>Open Full Inspector</span>
                </button>
              </div>

              {/* 1. check_catalog */}
              {TOOL_SCHEMAS.map((tool) => (
                <div
                  key={tool.name}
                  id={`tool-menu-item-${tool.name}`}
                  onClick={() => {
                    setActiveTab('tools');
                    setShowToolsMenu(false);
                  }}
                  className="w-full p-2.5 rounded-xl text-left bg-neutral-950/50 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-500/40 transition-all flex flex-col gap-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                      <span className="font-mono font-bold text-xs text-white group-hover:text-neutral-200">
                        {tool.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        title="Copy JSON Schema"
                        onClick={(e) => handleCopySchema(e, tool)}
                        className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] flex items-center gap-1 transition-colors"
                      >
                        {copiedTool === tool.name ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-neutral-300/90 pl-4">
                    {tool.signature}
                  </div>

                  <p className="text-[10px] text-neutral-400 line-clamp-1 pl-4">
                    {tool.description}
                  </p>
                </div>
              ))}

              <div className="pt-1 flex gap-1 border-t border-neutral-800/80">
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    setShowToolsMenu(false);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold text-center transition-colors"
                >
                  View in Tab
                </button>
                <button
                  onClick={() => {
                    onOpenToolsModal();
                    setShowToolsMenu(false);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-semibold text-center transition-colors"
                >
                  Open JSON Inspector
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scenarios Dropdown */}
        <div className="relative">
          <button
            id="btn-scenarios-menu"
            onClick={() => {
              setShowScenarioMenu(!showScenarioMenu);
              setShowToolsMenu(false);
            }}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Play className="w-3 h-3 text-neutral-400 fill-neutral-400" />
            <span className="hidden sm:inline">Scenarios</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl p-2 z-50 animate-scaleUp space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
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
                  className="w-full p-2 rounded-xl text-left hover:bg-neutral-800 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 text-xs shrink-0 mt-0.5 group-hover:border-neutral-500">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-white truncate">{scen.title}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-1">{scen.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            id="tab-btn-chat"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'chat' ? 'bg-neutral-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Chat
          </button>
          <button
            id="tab-btn-audit"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'audit' || activeTab === 'security' ? 'bg-neutral-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Audit Trail</span>
          </button>
          <button
            id="tab-btn-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all hidden sm:block ${
              activeTab === 'catalog' ? 'bg-neutral-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
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
              ? 'bg-neutral-600 text-white border-neutral-500 shadow-md'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-neutral-950">
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
              ? 'bg-neutral-600 text-white border-neutral-500 shadow-md'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
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
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

