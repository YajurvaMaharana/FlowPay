const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  "input: JSON.stringify({ action: 'ADD_BUNDLE', count: products.length }),",
  "input: { action: 'ADD_BUNDLE', count: products.length },"
);
appCode = appCode.replace(
  "output: JSON.stringify({ success: true, count: products.length }),",
  "output: { success: true, count: products.length },"
);
fs.writeFileSync('src/App.tsx', appCode);
