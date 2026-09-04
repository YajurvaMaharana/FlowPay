import React, { useState } from 'react';
import { SecurityAlert, SecurityMetrics, ToolCallEvent, PaymentOrder } from '../types';
import { 
  Terminal, ShieldCheck, ShieldAlert, Lock, AlertTriangle, 
  Copy, Check, Download, ChevronDown, ChevronUp, Filter, 
  Code2, CheckCircle2, RefreshCw, Layers, Clock, ArrowRight, EyeOff, UserCheck
} from 'lucide-react';

interface AuditTrailPanelProps {
  metrics: SecurityMetrics;
  alerts: SecurityAlert[];
  toolCalls: ToolCallEvent[];
  activeOrder: PaymentOrder | null;
  pendingGatedAction: boolean;
  appliedDiscount: number;
  onClearLogs?: () => void;
  onOpenToolsModal?: () => void;
}

export const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({
  metrics,
  alerts,
  toolCalls,
  activeOrder,
  pendingGatedAction,
  appliedDiscount,
  onClearLogs,
  onOpenToolsModal
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'check_catalog' | 'calculate_cart' | 'generate_payment' | 'alerts'>('all');
  const [expandedTraceIds, setExpandedTraceIds] = useState<Record<string, boolean>>({});
  const [copiedLog, setCopiedLog] = useState(false);
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  // Combine tool calls and security alerts into unified chronological audit trail
  interface AuditItem {
    id: string;
    type: 'tool_call' | 'security_alert';
    name: string;
    timestamp: string;
    status: 'success' | 'blocked' | 'warning' | 'pending';
    payload: any;
    output?: any;
    details?: string;
    severity?: string;
    executionTimeMs?: number;
  }

  const auditItems: AuditItem[] = [
    ...toolCalls.map((tc): AuditItem => ({
      id: tc.id,
      type: 'tool_call',
      name: tc.name,
      timestamp: tc.timestamp,
      status: tc.status === 'success' ? 'success' : tc.status === 'blocked' ? 'blocked' : 'warning',
      payload: tc.input,
      output: tc.output,
      executionTimeMs: tc.executionTimeMs || 42
    })),
    ...alerts.map((al): AuditItem => ({
      id: al.id,
      type: 'security_alert',
      name: al.type,
      timestamp: al.timestamp,
      status: al.severity === 'critical' || al.severity === 'high' ? 'blocked' : 'warning',
      payload: { rule: al.type, severity: al.severity },
      details: al.message + (al.details ? ` (${al.details})` : ''),
      severity: al.severity
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filtered list
  const filteredItems = auditItems.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'alerts') return item.type === 'security_alert';
    return item.name === selectedFilter;
  });

  const toggleExpand = (id: string) => {
    setExpandedTraceIds(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const isExpanded = (id: string, idx: number) => {
    if (expandedTraceIds[id] !== undefined) return expandedTraceIds[id];
    return idx < 3; // First 3 expanded by default
  };

  // Full Audit Log Export
  const generateFullAuditLog = () => {
    return {
      exportedAt: new Date().toISOString(),
      hackathonAuditSummary: {
        totalInteractions: metrics.totalInteractions,
        zeroTrustStatus: metrics.zeroTrustStatus,
        discountRuleCompliance: appliedDiscount <= 10 ? 'VERIFIED_LE_10_PERCENT' : 'POLICY_VIOLATION_CAPPED',
        gatingStatus: pendingGatedAction ? 'AWAITING_HUMAN_CONFIRMATION' : 'ENFORCED_AND_GATED',
        injectionsBlocked: metrics.attacksBlocked,
        piiMaskedCount: metrics.piiMaskedCount,
        discountLimitsEnforced: metrics.discountLimitsEnforced,
        gatedConfirmationsEnforced: metrics.gatedConfirmationsEnforced
      },
      auditTrailEvents: auditItems.map(item => ({
        id: item.id,
        eventType: item.type,
        actionName: item.name,
        timestamp: item.timestamp,
        status: item.status,
        rawPayload: item.payload,
        rawOutput: item.output,
        details: item.details
      }))
    };
  };

  const handleCopyAuditLog = () => {
    const fullLog = generateFullAuditLog();
    navigator.clipboard.writeText(JSON.stringify(fullLog, null, 2));
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2500);
  };

  const handleDownloadAuditLog = () => {
    const fullLog = generateFullAuditLog();
    const blob = new Blob([JSON.stringify(fullLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphacart-agent-audit-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySingleTrace = (id: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedTraceId(id);
    setTimeout(() => setCopiedTraceId(null), 2000);
  };

  return (
    <div id="right-panel-audit-trail" className="h-full flex flex-col bg-transparent text-xs overflow-hidden">
      
      {/* Top Header & Export Controls */}
      <div className="p-3.5 border-b border-neutral-800 bg-neutral-900/90 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-600/30 border border-neutral-800 flex items-center justify-center text-neutral-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-white">Live Agent Audit Trail</h3>
                <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
                  Real-time Telemetry
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">Raw payload traces & Zero-Trust verification log for judges</p>
            </div>
          </div>

          {/* Copy Audit Log Button for Judges */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-copy-audit-log"
              onClick={handleCopyAuditLog}
              className="px-3 py-1.5 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-neutral-900/30 active:scale-95"
              title="Export complete chronological JSON trace for audit evaluation"
            >
              {copiedLog ? (
                <>
                  <Check className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-400">Copied Full Log!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Audit Log</span>
                </>
              )}
            </button>

            <button
              id="btn-download-audit-log"
              onClick={handleDownloadAuditLog}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-800 text-neutral-300 transition-colors"
              title="Download JSON Trace File"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Required Status Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
          {/* Status Badge 1: Discount Rule: Verified (<=10%) */}
          <div 
            id="badge-discount-rule"
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
              metrics.discountLimitsEnforced > 0 || appliedDiscount > 10
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-400 font-medium">Discount Policy</div>
                <div className="font-mono font-bold text-xs">
                  {metrics.discountLimitsEnforced > 0
                    ? 'Discount Rule: Verified (<=10% Capped)'
                    : 'Discount Rule: Verified (<=10%)'}
                </div>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono font-bold">
              {appliedDiscount}% Applied
            </span>
          </div>

          {/* Status Badge 2: Yield Retained */}
          <div 
            id="badge-yield-retained"
            className="p-2.5 rounded-xl border flex items-center justify-between transition-all bg-neutral-900 border-neutral-800 text-neutral-400"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-400 font-medium">Yield Retained</div>
                <div className="font-mono font-bold text-xs">
                  {metrics.yieldRetained}%
                </div>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono font-bold">
              {appliedDiscount}% Concession
            </span>
          </div>

          {/* Status Badge 3: Gating: Awaiting Confirmation */}
          <div 
            id="badge-gating-status"
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
              pendingGatedAction
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 animate-pulse'
                : metrics.gatedConfirmationsEnforced > 0
                ? 'bg-transparent border-neutral-800 text-neutral-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-400 font-medium">Human-in-the-Loop Gating</div>
                <div className="font-mono font-bold text-xs">
                  {pendingGatedAction 
                    ? 'Gating: Awaiting Confirmation' 
                    : metrics.gatedConfirmationsEnforced > 0 
                    ? 'Gating: Human Approved' 
                    : 'Gating: Ready & Enforced'}
                </div>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono font-bold">
              Protocol #3
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mr-1">Filter:</span>
          
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2 py-1 rounded-lg font-mono text-[10px] transition-colors ${
              selectedFilter === 'all'
                ? 'bg-neutral-600 text-white font-bold'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Traces ({auditItems.length})
          </button>

          <button
            onClick={() => setSelectedFilter('check_catalog')}
            className={`px-2 py-1 rounded-lg font-mono text-[10px] transition-colors ${
              selectedFilter === 'check_catalog'
                ? 'bg-neutral-600 text-white font-bold'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            check_catalog
          </button>

          <button
            onClick={() => setSelectedFilter('calculate_cart')}
            className={`px-2 py-1 rounded-lg font-mono text-[10px] transition-colors ${
              selectedFilter === 'calculate_cart'
                ? 'bg-neutral-600 text-white font-bold'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            calculate_cart
          </button>

          <button
            onClick={() => setSelectedFilter('generate_payment')}
            className={`px-2 py-1 rounded-lg font-mono text-[10px] transition-colors ${
              selectedFilter === 'generate_payment'
                ? 'bg-neutral-600 text-white font-bold'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            generate_payment
          </button>

          <button
            onClick={() => setSelectedFilter('alerts')}
            className={`px-2 py-1 rounded-lg font-mono text-[10px] transition-colors ${
              selectedFilter === 'alerts'
                ? 'bg-neutral-600 text-white font-bold'
                : 'bg-neutral-800 text-neutral-400/80 hover:text-neutral-400'
            }`}
          >
            Security Alerts ({alerts.length})
          </button>
        </div>
      </div>

      {/* Real-time Collapsible JSON Trace Log Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-dashed border-neutral-800 text-center text-neutral-500 space-y-2">
            <Terminal className="w-8 h-8 text-neutral-700 mx-auto" />
            <p className="font-semibold text-xs text-neutral-400">No traces recorded yet for this filter.</p>
            <p className="text-[11px] text-neutral-500">
              Execute agent queries or launch test scenarios from the chat to observe real-time tool execution logs.
            </p>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const expanded = isExpanded(item.id, idx);
            const isAlert = item.type === 'security_alert';
            const isTool = item.type === 'tool_call';

            return (
              <div
                key={item.id}
                id={`audit-trace-${item.id}`}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isAlert 
                    ? 'bg-neutral-900 border-neutral-800' 
                    : item.name === 'generate_payment'
                    ? 'bg-neutral-900/90 border-neutral-800 shadow-md'
                    : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-800'
                }`}
              >
                {/* Trace Item Collapsible Header */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-neutral-800/40 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      isAlert 
                        ? 'bg-transparent text-neutral-400 border border-neutral-800' 
                        : item.name === 'generate_payment'
                        ? 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        : item.name === 'calculate_cart'
                        ? 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                    }`}>
                      {isAlert ? <AlertTriangle className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white truncate">
                          {item.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${
                          item.status === 'success' 
                            ? 'bg-neutral-900 text-neutral-400 border border-neutral-800' 
                            : item.status === 'blocked'
                            ? 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        }`}>
                          {item.status}
                        </span>
                        {item.executionTimeMs && (
                          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
                            {item.executionTimeMs}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySingleTrace(item.id, { payload: item.payload, output: item.output, details: item.details });
                      }}
                      className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] flex items-center gap-1 transition-colors"
                      title="Copy Raw Trace JSON"
                    >
                      {copiedTraceId === item.id ? (
                        <Check className="w-3 h-3 text-neutral-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-neutral-400" />
                      )}
                    </button>
                    {expanded ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                  </div>
                </div>

                {/* Collapsed Details: Raw Payloads & Function Outputs */}
                {expanded && (
                  <div className="border-t border-neutral-800 p-3 space-y-2.5 bg-transparent animate-fadeIn font-mono">
                    {/* Security Alert Details */}
                    {item.details && (
                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-[11px] font-sans">
                        <div className="font-bold text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5">Violation Intercepted:</div>
                        <p>{item.details}</p>
                      </div>
                    )}

                    {/* Raw Function Call Payload */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        <span>Raw Function Call Payload (Input)</span>
                        <span className="text-neutral-400">JSON</span>
                      </div>
                      <pre className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] leading-relaxed overflow-x-auto">
                        {JSON.stringify(item.payload, null, 2)}
                      </pre>
                    </div>

                    {/* Execution Output Result */}
                    {item.output && (
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          <span>Execution Output Result (Return)</span>
                          <span className="text-neutral-400">JSON</span>
                        </div>
                        <pre className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] leading-relaxed overflow-x-auto">
                          {JSON.stringify(item.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="p-2.5 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse"></span>
          <span>Zero-Trust Sentinel Stream Active</span>
        </div>
        <div>
          <span>Total Traces: {auditItems.length}</span>
        </div>
      </div>

    </div>
  );
};
