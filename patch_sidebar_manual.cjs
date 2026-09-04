const fs = require('fs');

let code = fs.readFileSync('src/components/AlphaCartSidebar.tsx', 'utf8');

code = code.replace(
  "  onToggleA2A?: () => void;",
  "  onToggleA2A?: () => void;\n  onNextA2ATurn?: () => void;"
);

code = code.replace(
  "  onToggleA2A,",
  "  onToggleA2A,\n  onNextA2ATurn,"
);

code = code.replace(
  "            isA2ATyping={isA2ATyping}",
  "            isA2ATyping={isA2ATyping}\n            onNextA2ATurn={onNextA2ATurn}"
);

fs.writeFileSync('src/components/AlphaCartSidebar.tsx', code);
