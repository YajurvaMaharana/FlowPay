const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  "arguments: { action: 'ADD_BUNDLE', count: products.length },\n        status: 'completed',",
  "arguments: { action: 'ADD_BUNDLE', count: products.length },\n        input: JSON.stringify({ action: 'ADD_BUNDLE', count: products.length }),\n        output: JSON.stringify({ success: true, count: products.length }),\n        status: 'completed',"
);
fs.writeFileSync('src/App.tsx', appCode);

// Fix MessageItem.tsx
let msgCode = fs.readFileSync('src/components/MessageItem.tsx', 'utf8');
msgCode = msgCode.replace(
  "onClick={() => onAddBundleToCart(message.visionAnalysis.products)}",
  "onClick={() => onAddBundleToCart(message.visionAnalysis!.products)}"
);
fs.writeFileSync('src/components/MessageItem.tsx', msgCode);

