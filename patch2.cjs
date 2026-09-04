const fs = require('fs');

// 1. AlphaCartSidebar.tsx
let alphaCode = fs.readFileSync('src/components/AlphaCartSidebar.tsx', 'utf8');

alphaCode = alphaCode.replace(
  "isA2AMode?: boolean;",
  "isA2AMode?: boolean;\n  isA2ATyping?: boolean;"
);

alphaCode = alphaCode.replace(
  "isA2AMode,",
  "isA2AMode,\n  isA2ATyping,"
);

alphaCode = alphaCode.replace(
  "isA2AMode={isA2AMode}",
  "isA2AMode={isA2AMode}\n            isA2ATyping={isA2ATyping}"
);

fs.writeFileSync('src/components/AlphaCartSidebar.tsx', alphaCode);

// 2. ChatInterface.tsx
let chatCode = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

chatCode = chatCode.replace(
  "isA2AMode?: boolean;",
  "isA2AMode?: boolean;\n  isA2ATyping?: boolean;"
);

chatCode = chatCode.replace(
  "isA2AMode",
  "isA2AMode,\n  isA2ATyping"
);

chatCode = chatCode.replace(
  `        {/* Streaming / Loading Skeleton Bubble */}
        {isLoading && (
          <div className="flex gap-3 my-4 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 rounded-tl-sm text-neutral-400 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-neutral-500 animate-spin" />
              <span>Analyzing catalog & calculating...</span>
            </div>
          </div>
        )}`,
  `        {/* Typing indicator for A2A BuyerBot */}
        {isA2ATyping && (
          <div className="flex gap-3 my-4 animate-fadeIn justify-end">
            <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-800/30 rounded-tr-sm text-blue-400 text-xs flex items-center gap-2.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>BuyerBot is analyzing offer...</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Streaming / Loading Skeleton Bubble */}
        {isLoading && (
          <div className="flex gap-3 my-4 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 rounded-tl-sm text-neutral-400 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-neutral-500 animate-spin" />
              <span>Merchant Agent calculating yield...</span>
            </div>
          </div>
        )}`
);

fs.writeFileSync('src/components/ChatInterface.tsx', chatCode);
