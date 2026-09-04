import React, { useState } from 'react';
import { SecurityAlert, SecurityMetrics, ToolCallEvent } from '../types';
import { TOOL_SCHEMAS, ToolSchemaDefinition } from '../data/toolSchemas';
import { 
  ShieldCheck, ShieldAlert, Lock, AlertTriangle, Cpu, Terminal, 
  CheckCircle2, FileText, Ban, EyeOff, Wrench, Code2, Copy, Check, ChevronDown, ChevronUp 
} from 'lucide-react';

interface SecurityConsoleProps {
  metrics: SecurityMetrics;
  alerts: SecurityAlert[];
  toolCalls: ToolCallEvent[];
  onClearAlerts?: () => void;
  onOpenToolsModal?: () => void;
}

export const SecurityConsole: React.FC<SecurityConsoleProps> = ({
  metrics,
  alerts,
  toolCalls,
  onOpenToolsModal
}) => {
  const [showToolsSection, setShowToolsSection] = useState(true);
  const [copiedTool, setCopiedTool] = useState<string | null>(null);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-neutral-900 border-neutral-800 text-neutral-400';
      case 'high':
        return 'bg-neutral-900 border-neutral-800 text-neutral-400';
      case 'medium':
        return 'bg-neutral-900 border-neutral-800 text-neutral-400';
      default:
        return 'bg-neutral-900 border-neutral-800 text-neutral-300';
    }
  };

  const handleCopySchema = (tool: ToolSchemaDefinition) => {
    navigator.clipboard.writeText(JSON.stringify(tool.schema, null, 2));
    setCopiedTool(tool.name);
    setTimeout(() => setCopiedTool(null), 2000);
  };

  return (
    <div id="security-console" className="space-y-4 p-4 text-xs">
      {/* Zero-Trust Engine Status Banner */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/50 border border-transparent flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-neutral-500 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-neutral-500"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-white">Zero-Trust Sentinel</h3>
              <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[10px]">
                {metrics.zeroTrustStatus}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Deterministic Prompt Defense & PII Redaction</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Security Score</span>
          <div className="text-neutral-400 font-display font-bold text-base">100% SECURE</div>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-medium">Injections Blocked</span>
            <Ban className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">{metrics.attacksBlocked}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-medium">PII Masked</span>
            <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">{metrics.piiMaskedCount}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-medium">10% Cap Enforced</span>
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">{metrics.discountLimitsEnforced}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-medium">Human Gated</span>
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">{metrics.gatedConfirmationsEnforced}</div>
        </div>
      </div>

      {/* Protocol Guardrails Summary */}
      <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Mandatory Security Protocols</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">1. Zero-Trust Architecture:</strong>
              <p className="text-neutral-400 text-[10px]">Strict 10% discount ceiling; overrides rejected.</p>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">2. PII Data Minimization:</strong>
              <p className="text-neutral-400 text-[10px]">Credit cards masked; only customer_email sent.</p>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">3. Execution Gating:</strong>
              <p className="text-neutral-400 text-[10px]">Explicit human confirmation required before payment.</p>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">4. Scope Limitation:</strong>
              <p className="text-neutral-400 text-[10px]">Restricted strictly to catalog and checkout flow.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Tool Schemas Section */}
      <div className="p-3 rounded-xl bg-neutral-900 border border-transparent space-y-2">
        <div 
          onClick={() => setShowToolsSection(!showToolsSection)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] font-semibold text-neutral-200 uppercase tracking-wider">
              Tool JSON Schemas (3 Available)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenToolsModal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenToolsModal();
                }}
                className="text-[10px] text-neutral-400 hover:text-neutral-300 font-semibold"
              >
                Inspect All
              </button>
            )}
            {showToolsSection ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
          </div>
        </div>

        {showToolsSection && (
          <div className="space-y-2 pt-1 animate-fadeIn">
            {TOOL_SCHEMAS.map((tool) => (
              <div key={tool.name} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-neutral-300">{tool.signature}</span>
                  <button
                    onClick={() => handleCopySchema(tool)}
                    className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] flex items-center gap-1 transition-colors"
                  >
                    {copiedTool === tool.name ? (
                      <>
                        <Check className="w-3 h-3 text-neutral-400" />
                        <span className="text-neutral-400 text-[9px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span className="text-[9px]">Copy Schema</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 leading-normal">{tool.description}</p>
                <pre className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 text-[9px] font-mono overflow-x-auto max-h-28">
                  {JSON.stringify(tool.schema, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Security & Telemetry Audit Log */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-neutral-300">Live Security Event Log</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">{alerts.length} Events</span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-6 rounded-xl bg-neutral-900 border border-dashed border-neutral-800 text-center text-neutral-500">
            <ShieldCheck className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="font-medium text-xs text-neutral-400">Zero security violations detected.</p>
            <p className="text-[11px] text-neutral-600">All agent queries and tools operating within safe parameters.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {alerts.slice().reverse().map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border ${getSeverityStyle(alert.severity)} transition-all space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono font-bold text-[11px] uppercase tracking-wide">
                      {alert.type}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-neutral-200 font-medium">{alert.message}</p>

                {alert.details && (
                  <p className="text-[10px] opacity-80 bg-neutral-900 p-1.5 rounded font-mono break-all">
                    {alert.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

