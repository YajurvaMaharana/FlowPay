const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  "</form>\n        )}",
  "</form>\n        </div>\n        )}"
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
