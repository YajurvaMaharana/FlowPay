const fs = require('fs');

let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  `  paymentOrder?: PaymentOrder;`,
  `  paymentOrder?: PaymentOrder;
  attachment?: { type: 'image'; url: string };
  visionAnalysis?: {
    detectedIssue: string;
    products: Product[];
  };`
);

fs.writeFileSync('src/types.ts', code);
