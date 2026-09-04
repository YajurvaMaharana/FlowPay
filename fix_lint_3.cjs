const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  "status: 'completed',",
  "status: 'success',"
);
fs.writeFileSync('src/App.tsx', appCode);
