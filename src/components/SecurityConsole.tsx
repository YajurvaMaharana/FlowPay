import React from 'react';
import { SecurityAlert, SecurityMetrics, ToolCallEvent } from '../types';
import { ShieldCheck, ShieldAlert, Lock, AlertTriangle, Cpu, Terminal, CheckCircle2, FileText, Ban, EyeOff } from 'lucide-react';

interface SecurityConsoleProps {
  metrics: SecurityMetrics;
  alerts: SecurityAlert[];
  toolCalls: ToolCallEvent[];
  onClearAlerts?: () => void;
}

export const SecurityConsole: React.FC<SecurityConsoleProps> = ({
  metrics,
  alerts,
  toolCalls
}) => {
  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-950/60 border-rose-600/60 text-rose-300';
      case 'high':
        return 'bg-amber-950/60 border-amber-600/60 text-amber-300';
      case 'medium':
        return 'bg-yellow-950/60 border-yellow-600/60 text-yellow-300';
      default:
        return 'bg-indigo-950/60 border-indigo-600/60 text-indigo-300';
    }
  };

  return (
    <div id="security-console" className="space-y-4 p-4 text-xs">
      {/* Zero-Trust Engine Status Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-white">Zero-Trust Sentinel</h3>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                {metrics.zeroTrustStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Deterministic Prompt Defense & PII Redaction</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Security Score</span>
          <div className="text-emerald-400 font-display font-bold text-base">100% SECURE</div>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-medium">Injections Blocked</span>
            <Ban className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">{metrics.attacksBlocked}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-medium">PII Masked</span>
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">{metrics.piiMaskedCount}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-medium">10% Cap Enforced</span>
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">{metrics.discountLimitsEnforced}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-medium">Human Gated</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">{metrics.gatedConfirmationsEnforced}</div>
        </div>
      </div>

      {/* Protocol Guardrails Summary */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mandatory Security Protocols</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">1. Zero-Trust Architecture:</strong>
              <p className="text-slate-400 text-[10px]">Strict 10% discount ceiling; overrides rejected.</p>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">2. PII Data Minimization:</strong>
              <p className="text-slate-400 text-[10px]">Credit cards masked; only customer_email sent.</p>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">3. Execution Gating:</strong>
              <p className="text-slate-400 text-[10px]">Explicit human confirmation required before payment.</p>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">4. Scope Limitation:</strong>
              <p className="text-slate-400 text-[10px]">Restricted strictly to catalog and checkout flow.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Security & Telemetry Audit Log */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-300">Live Security Event Log</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{alerts.length} Events</span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-slate-500">
            <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-medium text-xs text-slate-400">Zero security violations detected.</p>
            <p className="text-[11px] text-slate-600">All agent queries and tools operating within safe parameters.</p>
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

                <p className="text-slate-200 font-medium">{alert.message}</p>

                {alert.details && (
                  <p className="text-[10px] opacity-80 bg-slate-950/50 p-1.5 rounded font-mono break-all">
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
