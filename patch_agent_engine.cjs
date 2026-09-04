const fs = require('fs');

let code = fs.readFileSync('src/services/agentEngine.ts', 'utf8');

code = code.replace(
  `    const isHardNegotiation = lowerText.includes('cancel') || lowerText.includes('leave') || lowerText.includes('abandon') || lowerText.includes('last offer') || lowerText.includes('best price') || lowerText.includes('competitor');

    if (isHardNegotiation || reqDiscount > 10) {
        if (appliedDiscount < 10) {
            appliedDiscount = 10;
            couponCode = 'MAX_YIELD_SAVE10';
        }
    } else {
        if (appliedDiscount === 0) {
            // Dynamic soft concession between 2% and 5%
            const softConcession = Math.floor(Math.random() * 4) + 2; 
            appliedDiscount = softConcession;
            couponCode = \`SOFT_SAVE\${softConcession}\`;
        } else if (appliedDiscount < 10) {
            appliedDiscount = Math.min(10, appliedDiscount + 3);
            couponCode = \`YIELD_SAVE\${appliedDiscount}\`;
        }
    }`,
  `    const isHardNegotiation = lowerText.includes('cancel') || lowerText.includes('leave') || lowerText.includes('abandon') || lowerText.includes('last offer') || (lowerText.includes('best price') && appliedDiscount > 0) || lowerText.includes('competitor');

    // Force a progressive curve: always do soft concession first, unless strictly demanded a huge specific %
    if (appliedDiscount === 0 && reqDiscount <= 10 && !lowerText.includes('cancel')) {
        appliedDiscount = 5;
        couponCode = 'SOFT_SAVE5';
    } else if (isHardNegotiation || reqDiscount > 10) {
        if (appliedDiscount < 10) {
            appliedDiscount = 10;
            couponCode = 'MAX_YIELD_SAVE10';
        }
    } else {
        if (appliedDiscount < 10) {
            appliedDiscount = Math.min(10, appliedDiscount + 5);
            couponCode = \`YIELD_SAVE\${appliedDiscount}\`;
        }
    }`
);

fs.writeFileSync('src/services/agentEngine.ts', code);
