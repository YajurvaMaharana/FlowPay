import React, { useState } from 'react';
import { TOOL_SCHEMAS, ToolSchemaDefinition } from '../data/toolSchemas';
import { 
  Wrench, Code2, Copy, Check, ShieldCheck, Play, 
  ExternalLink, Sparkles, X, Terminal, ChevronRight, FileJson, Layers 
} from 'lucide-react';

interface ToolsSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToolToChat?: (toolName: string, samplePrompt: string) => void;
}

export const ToolsSchemaModal: React.FC<ToolsSchemaModalProps> = ({
  isOpen,
  onClose,
  onSelectToolToChat
}) => {
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'schema' | 'parameters' | 'example'>('schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentTool = TOOL_SCHEMAS[selectedToolIndex];

  const handleCopySchema = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getToolSamplePrompt = (name: string) => {
    switch (name) {
      case 'check_catalog':
        return 'Check the catalog for premium mechanical keyboards and noise cancelling headphones';
      case 'calculate_cart':
        return 'Calculate my cart total with an attempted 25% discount to test the Zero-Trust 10% ceiling';
      case 'generate_payment':
        return 'Yes, confirm order and generate Razorpay payment link';
      default:
        return 'List all available tools and schema definitions';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-600 to-neutral-400 flex items-center justify-center text-white shadow-lg shadow-neutral-900/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-display">Agent Tools & JSON Schemas</h2>
                <span className="px-2 py-0.5 rounded-full bg-neutral-950 border border-neutral-500/40 text-neutral-300 font-mono text-[10px] font-bold">
                  OpenAPI / Function Calling
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Official JSON schema definitions governing AlphaCart agent tool execution
              </p>
            </div>
          </div>

          <button
            id="btn-close-tools-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-column layout (Tool selector on left, Schema inspector on right) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[420px]">
          
          {/* Tool Navigation Sidebar */}
          <div className="md:col-span-4 border-r border-neutral-800 bg-neutral-950/40 p-3 space-y-2 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Registered Tool Schemas (3)
            </div>

            {TOOL_SCHEMAS.map((tool, idx) => {
              const isSelected = selectedToolIndex === idx;
              return (
                <button
                  key={tool.name}
                  id={`tool-nav-btn-${tool.name}`}
                  onClick={() => {
                    setSelectedToolIndex(idx);
                    setCopied(false);
                  }}
                  className={`w-full p-3 rounded-xl text-left transition-all flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-neutral-950/60 border-neutral-500/60 text-white shadow-md'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-neutral-300">{tool.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                      tool.category === 'payment' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' :
                      tool.category === 'pricing' ? 'bg-green-950/80 text-green-300 border border-green-500/30' :
                      'bg-neutral-950/80 text-neutral-300 border border-neutral-500/30'
                    }`}>
                      {tool.category}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400 truncate">
                    {tool.signature}
                  </div>
                  <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                    {tool.description}
                  </p>
                </button>
              );
            })}

            {/* Zero-Trust Notice */}
            <div className="p-3 mt-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-green-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Trust Verification</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                All parameters undergo validation, 10% discount cap checks, and PII masking before execution.
              </p>
            </div>
          </div>

          {/* Tool Inspector Panel */}
          <div className="md:col-span-8 flex flex-col bg-neutral-900/90 overflow-hidden">
            
            {/* Tool Detail Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-white bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-700">
                    {currentTool.signature}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-schema-json"
                    onClick={() => handleCopySchema(currentTool.schema)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400 text-[11px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-[11px]">Copy JSON Schema</span>
                      </>
                    )}
                  </button>

                  {onSelectToolToChat && (
                    <button
                      id="btn-test-tool-in-chat"
                      onClick={() => {
                        onSelectToolToChat(currentTool.name, getToolSamplePrompt(currentTool.name));
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span className="text-[11px]">Test in Chat</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-300">{currentTool.description}</p>

              {/* Security Rule Pill */}
              <div className="p-2 rounded-lg bg-neutral-950/40 border border-neutral-500/30 text-neutral-200 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-[10px] leading-tight">{currentTool.securityRule}</span>
              </div>

              {/* Sub-view Switcher Tabs */}
              <div className="flex items-center gap-1 pt-1">
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'schema'
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5 text-neutral-400" />
                  <span>JSON Schema</span>
                </button>

                <button
                  onClick={() => setActiveTab('parameters')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'parameters'
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-green-400" />
                  <span>Parameter Table</span>
                </button>

                <button
                  onClick={() => setActiveTab('example')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'example'
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Payload & Response</span>
                </button>
              </div>
            </div>

            {/* Sub-view Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
              {activeTab === 'schema' && (
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-[11px] leading-relaxed overflow-x-auto selection:bg-neutral-600 selection:text-white">
                    {JSON.stringify(currentTool.schema, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === 'parameters' && (
                <div className="space-y-3 font-sans">
                  <div className="overflow-x-auto rounded-xl border border-neutral-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold text-[11px]">
                          <th className="p-2.5">Parameter</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Required</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-[11px]">
                        {Object.entries(currentTool.schema.parameters.properties).map(([paramName, paramDef]) => {
                          const isReq = currentTool.schema.parameters.required.includes(paramName);
                          return (
                            <tr key={paramName} className="hover:bg-neutral-800/40">
                              <td className="p-2.5 font-mono font-bold text-neutral-300">{paramName}</td>
                              <td className="p-2.5 font-mono text-amber-300">
                                {paramDef.type}{paramDef.format ? ` (${paramDef.format})` : ''}
                                {paramDef.items ? `<${paramDef.items.type}>` : ''}
                              </td>
                              <td className="p-2.5">
                                {isReq ? (
                                  <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-600/40 font-mono text-[10px] font-bold">
                                    YES
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[10px]">
                                    OPTIONAL
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-neutral-300 leading-normal">{paramDef.description}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'example' && (
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Sample Invocational Payload
                    </div>
                    <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-green-300 text-[11px] overflow-x-auto">
                      {JSON.stringify(currentTool.samplePayload, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Sample Execution Output
                    </div>
                    <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px] overflow-x-auto">
                      {JSON.stringify(currentTool.sampleResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-mono text-[11px]">3 Standard Merchant Agent Tools Registered</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
