const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const { imageBase64 } = req.body;",
  "const { imageBase64, textPrompt } = req.body;"
);

code = code.replace(
  `              { text: prompt }`,
  `              { text: \`System Instructions:\\n\${prompt}\\n\\nUser Request: \${textPrompt || "None"}\` }`
);

fs.writeFileSync('server.ts', code);
