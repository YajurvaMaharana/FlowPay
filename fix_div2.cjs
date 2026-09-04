const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(/<\/form>\s*\)\}/, "</form></div>)}");

fs.writeFileSync('src/components/ChatInterface.tsx', code);
