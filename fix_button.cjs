const fs = require('fs');

let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
code = code.replace(
  "{isA2AMode && !isLoading && !isA2ATyping && (",
  "{isA2AMode && !isLoading && !isA2ATyping && messages.length > 0 && messages[messages.length - 1].sender === 'agent' && !messages[messages.length - 1].toolCalls?.some(tc => tc.name === 'generate_payment') && ("
);
fs.writeFileSync('src/components/ChatInterface.tsx', code);
