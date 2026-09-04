const fs = require('fs');

let code = fs.readFileSync('src/services/agentEngine.ts', 'utf8');

code = code.replace(
  "    let explanation = `I completely understand your budget concerns. To help you out, I've immediately applied a **${appliedDiscount}% soft concession** (Code: ${couponCode}) to your active item to bring the price down for you.`;\n    if (appliedDiscount === 10 && (isHardNegotiation || reqDiscount > 10)) {",
  "    let explanation = `I completely understand your budget concerns. To help you out, I've immediately applied a **${appliedDiscount}% soft concession** (Code: ${couponCode}) to your active item to bring the price down for you.`;\n    if (appliedDiscount === 10 && (isHardNegotiation || reqDiscount > 10 || lowerText.includes('final adjustment'))) {"
);

fs.writeFileSync('src/services/agentEngine.ts', code);
