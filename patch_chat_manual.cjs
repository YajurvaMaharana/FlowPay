const fs = require('fs');

let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  "  isA2ATyping?: boolean;",
  "  isA2ATyping?: boolean;\n  onNextA2ATurn?: () => void;"
);

code = code.replace(
  "  isA2ATyping",
  "  isA2ATyping,\n  onNextA2ATurn"
);

// We'll place the button right above the form input when isA2AMode is true.
// Actually, let's put it at the bottom. Wait, how to check if there is a next turn available?
// If isA2AMode is true and !isLoading and !isA2ATyping and the last message is from agent.
// Instead of complex logic, just show it if isA2AMode && !isLoading && !isA2ATyping.

const buttonUI = `        {/* Next A2A Turn Button */}
        {isA2AMode && !isLoading && !isA2ATyping && (
          <div className="flex justify-center mb-4">
            <button
              onClick={onNextA2ATurn}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Trigger Next Agent Turn
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Input Form */}`;

code = code.replace(
  "        {/* Input Form */}",
  buttonUI
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
