const fs = require('fs');

let code = fs.readFileSync('src/services/agentEngine.ts', 'utf8');

code = code.replace(
  "const isHardNegotiation = lowerText.includes('cancel') || lowerText.includes('leave') || lowerText.includes('abandon') || lowerText.includes('last offer') || (lowerText.includes('best price') && appliedDiscount > 0) || lowerText.includes('competitor');",
  "const isHardNegotiation = lowerText.includes('cancel') || lowerText.includes('leave') || lowerText.includes('abandon') || lowerText.includes('last offer') || (lowerText.includes('best price') && appliedDiscount > 0) || lowerText.includes('competitor') || lowerText.includes('final adjustment');"
);

fs.writeFileSync('src/services/agentEngine.ts', code);
