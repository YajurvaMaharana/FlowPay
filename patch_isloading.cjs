const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// First remove the old setIsLoading(true);
code = code.replace(
  "    setIsLoading(true);\n\n    try {",
  "    try {"
);

// Then add it at the top
code = code.replace(
  "    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');",
  "    setIsAgentSidebarOpen(true); setAgentSidebarTab('chat');\n    setIsLoading(true);"
);

fs.writeFileSync('src/App.tsx', code);
