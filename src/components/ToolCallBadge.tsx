import React, { useState } from 'react';
import { ToolCallEvent } from '../types';
import { Wrench, CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ToolCallBadgeProps {
  toolCall: ToolCallEvent;
}

export const ToolCallBadge: React.FC<ToolCallBadgeProps> = ({ toolCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getToolDisplayName = (name: string) => {
    switch (name) {
      case 'check_catalog':
        return 'check_catalog(category, query)';
      case 'calculate_cart':
        return 'calculate_cart(items, discount, coupon)';
      case 'generate_payment':
        return 'generate_payment(items, amount, customer_email)';
      case 'handle_payment_failure':
        return 'handle_payment_failure(order_id, reason)';
      case 'scrub_pii':
        return 'scrub_pii(input_text)';
      default:
        return name;
    }
  };

  const getToolColor = (name: string, status: string) => {
    if (status === 'blocked') return 'border-amber-500/30 bg-amber-950/20 text-amber-300';
    if (status === 'failed') return 'border-red-500/30 bg-red-950/20 text-red-300';
    switch (name) {
      case 'generate_payment':
        return 'border-green-500/30 bg-green-950/20 text-green-300';
      case 'calculate_cart':
        return 'border-neutral-500/30 bg-neutral-950/20 text-neutral-300';
      case 'check_catalog':
        return 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300';
      case 'handle_payment_failure':
        return 'border-orange-500/30 bg-orange-950/20 text-orange-300';
      default:
        return 'border-neutral-700 bg-neutral-900/50 text-neutral-300';
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ input: toolCall.input, output: toolCall.output }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id={`tool-call-${toolCall.id}`} className="my-2 rounded-xl border border-neutral-800 bg-neutral-900/80 overflow-hidden text-xs shadow-md">
      <button
        id={`btn-toggle-tool-${toolCall.id}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-neutral-800/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={`p-1 rounded-md border ${getToolColor(toolCall.name, toolCall.status)}`}>
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono font-semibold text-neutral-200 truncate">
            {getToolDisplayName(toolCall.name)}
          </span>
          {toolCall.executionGatePassed && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-900/40 text-green-300 border border-green-700/50 text-[10px]">
              <ShieldCheck className="w-3 h-3" /> Gated Auth OK
            </span>
          )}
          {toolCall.status === 'blocked' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px]">
              <AlertTriangle className="w-3 h-3" /> Gate Blocked
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-neutral-400">
            {new Date(toolCall.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          {toolCall.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
          {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/70 space-y-2.5">
          {toolCall.securityNote && (
            <div className="p-2 rounded bg-neutral-950/40 border border-neutral-800/40 text-neutral-200 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{toolCall.securityNote}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="space-y-1">
              <span className="text-neutral-400 uppercase tracking-wider font-sans font-bold text-[10px]">Input Payload</span>
              <pre className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 overflow-x-auto max-h-40">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-400 uppercase tracking-wider font-sans font-bold text-[10px]">Tool Output</span>
              <pre className="p-2 rounded bg-neutral-900 border border-neutral-800 text-green-300 overflow-x-auto max-h-40">
                {JSON.stringify(toolCall.output, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              id={`btn-copy-tool-json-${toolCall.id}`}
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied JSON' : 'Copy Payload'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
