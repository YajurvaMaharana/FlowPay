const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "handleSendMessage(\"Hello, I am an automated procurement agent looking to purchase the AeroType Carbon keyboard for my client. What is your best price?\", true);",
  "handleSendMessage(\"Hello, I am an automated procurement agent looking to purchase the AeroType Carbon keyboard for my client. My budget cap is ₹8,500. What is your best price?\", true);"
);

fs.writeFileSync('src/App.tsx', code);
