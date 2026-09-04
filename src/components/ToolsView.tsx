import React, { useState } from 'react';
import { TOOL_SCHEMAS, ToolSchemaDefinition } from '../data/toolSchemas';
import { 
  Wrench, Code2, Copy, Check, ShieldCheck, Play, 
  FileJson, Layers, ExternalLink, Sparkles, Terminal, ChevronDown, ChevronUp 
} from 'lucide-react';

interface ToolsViewProps {
  onTestToolInChat?: (toolName: string, samplePrompt: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ onTestToolInChat }) => {
  const [expandedTool, setExpandedTool] = useState<string>(TOOL_SCHEMAS[0].name);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [activeTabMap, setActiveTabMap] = useState<Record<string, 'schema' | 'parameters' | 'example'>>({
    check_catalog: 'schema',
    calculate_cart: 'schema',
    generate_payment: 'schema'
  });

  const handleCopy = (toolName: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedMap(prev => ({ ...prev, [toolName]: true }));
    setTimeout(() => {
      setCopiedMap(prev => ({ ...prev, [toolName]: false }));
    }, 2000);
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
    <div id="tools-view-container" className="h-full overflow-y-auto p-4 space-y-4 text-xs">
      {/* Header Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-950/40 to-neutral-900 border border-neutral-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-600/30 border border-neutral-400/40 flex items-center justify-center text-neutral-300">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-white">Agent Tools & JSON Schemas</h3>
              <span className="px-1.5 py-0.2 rounded bg-neutral-950 border border-neutral-500/40 text-neutral-300 font-mono text-[10px]">
                3 Registered
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Standardized function definitions for AlphaCart agent</p>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="space-y-3">
        {TOOL_SCHEMAS.map((tool) => {
          const isExpanded = expandedTool === tool.name;
          const currentTab = activeTabMap[tool.name] || 'schema';
          const isCopied = Boolean(copiedMap[tool.name]);

          return (
            <div
              key={tool.name}
              id={`tool-card-${tool.name}`}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-neutral-900/90 border-neutral-500/50 shadow-xl'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedTool(isExpanded ? '' : tool.name)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    tool.category === 'payment' ? 'bg-amber-950 text-amber-300 border border-amber-600/40' :
                    tool.category === 'pricing' ? 'bg-green-950 text-green-300 border border-green-600/40' :
                    'bg-neutral-950 text-neutral-300 border border-neutral-600/40'
                  }`}>
                    <Code2 className="w-3.5 h-3.5" />
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white truncate">{tool.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase bg-neutral-800 text-neutral-300">
                        {tool.category}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-neutral-400 truncate">
                      {tool.signature}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="border-t border-neutral-800 p-4 space-y-3 bg-neutral-950/40 animate-fadeIn">
                  <p className="text-neutral-300 text-xs leading-relaxed">{tool.description}</p>

                  {/* Security Protocol Tag */}
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-500/30 flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-neutral-200 leading-normal">{tool.securityRule}</p>
                  </div>

                  {/* Tab Selector & Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveTabMap(prev => ({ ...prev, [tool.name]: 'schema' }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          currentTab === 'schema'
                            ? 'bg-neutral-800 text-white border border-neutral-700'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <FileJson className="w-3 h-3 text-neutral-400" />
                        <span>Schema</span>
                      </button>

                      <button
                        onClick={() => setActiveTabMap(prev => ({ ...prev, [tool.name]: 'parameters' }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          currentTab === 'parameters'
                            ? 'bg-neutral-800 text-white border border-neutral-700'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Layers className="w-3 h-3 text-green-400" />
                        <span>Params</span>
                      </button>

                      <button
                        onClick={() => setActiveTabMap(prev => ({ ...prev, [tool.name]: 'example' }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          currentTab === 'example'
                            ? 'bg-neutral-800 text-white border border-neutral-700'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Code2 className="w-3 h-3 text-amber-400" />
                        <span>Payload</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-copy-${tool.name}`}
                        onClick={() => handleCopy(tool.name, tool.schema)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 text-[10px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-neutral-400" />
                            <span className="text-[10px]">Copy JSON</span>
                          </>
                        )}
                      </button>

                      {onTestToolInChat && (
                        <button
                          id={`btn-test-${tool.name}`}
                          onClick={() => onTestToolInChat(tool.name, getToolSamplePrompt(tool.name))}
                          className="px-2.5 py-1 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <Play className="w-2.5 h-2.5 fill-white" />
                          <span className="text-[10px]">Test</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tab Display */}
                  <div className="pt-2 font-mono">
                    {currentTab === 'schema' && (
                      <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] leading-relaxed overflow-x-auto">
                        {JSON.stringify(tool.schema, null, 2)}
                      </pre>
                    )}

                    {currentTab === 'parameters' && (
                      <div className="space-y-2 font-sans">
                        <div className="overflow-x-auto rounded-xl border border-neutral-800">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-semibold text-[10px]">
                                <th className="p-2">Name</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Required</th>
                                <th className="p-2">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800 text-[10px]">
                              {Object.entries(tool.schema.parameters.properties).map(([paramName, paramDef]) => {
                                const isReq = tool.schema.parameters.required.includes(paramName);
                                return (
                                  <tr key={paramName} className="hover:bg-neutral-800/40">
                                    <td className="p-2 font-mono font-bold text-neutral-300">{paramName}</td>
                                    <td className="p-2 font-mono text-amber-300">
                                      {paramDef.type}{paramDef.format ? ` (${paramDef.format})` : ''}
                                      {paramDef.items ? `<${paramDef.items.type}>` : ''}
                                    </td>
                                    <td className="p-2">
                                      {isReq ? (
                                        <span className="px-1 py-0.2 rounded bg-red-950 text-red-300 font-mono text-[9px] font-bold">
                                          YES
                                        </span>
                                      ) : (
                                        <span className="px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono text-[9px]">
                                          OPTIONAL
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-neutral-300 leading-normal">{paramDef.description}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {currentTab === 'example' && (
                      <div className="space-y-2">
                        <div>
                          <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                            Input Payload
                          </div>
                          <pre className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-green-300 text-[10px] overflow-x-auto">
                            {JSON.stringify(tool.samplePayload, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                            Output Result
                          </div>
                          <pre className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 text-[10px] overflow-x-auto">
                            {JSON.stringify(tool.sampleResponse, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
