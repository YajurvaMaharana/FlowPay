const fs = require('fs');

let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  `  isA2ATyping,
  onNextA2ATurn?: boolean;
  onNextA2ATurn?: () => void;`,
  `  isA2ATyping?: boolean;
  onNextA2ATurn?: () => void;`
);

code = code.replace(
  `  onClearScenario,
  isA2AMode,
  isA2ATyping
}) => {`,
  `  onClearScenario,
  isA2AMode,
  isA2ATyping,
  onNextA2ATurn
}) => {`
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
