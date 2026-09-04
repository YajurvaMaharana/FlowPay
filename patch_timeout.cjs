const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "        }, 3500); // Well-paced 3.5-second interval",
  "        }, 3000); // Well-paced 3-second interval"
);

fs.writeFileSync('src/App.tsx', code);
