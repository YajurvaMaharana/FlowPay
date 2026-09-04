const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove from the top
code = code.replace(
  "    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');\n    setIsLoading(true);",
  "    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');"
);

// Add it back before try {
code = code.replace(
  "    try {",
  "    setIsLoading(true);\n\n    try {"
);

fs.writeFileSync('src/App.tsx', code);
