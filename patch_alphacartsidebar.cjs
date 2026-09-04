const fs = require('fs');
let code = fs.readFileSync('src/components/AlphaCartSidebar.tsx', 'utf8');

// Update onSendMessage
code = code.replace(
  "  onSendMessage: (text: string) => void;",
  "  onSendMessage: (text: string, imageBase64?: string) => void;"
);

// Remove onImageUpload
code = code.replace(
  "  onImageUpload?: (file: File) => void;\n",
  ""
);

code = code.replace(
  "  onImageUpload,\n",
  ""
);

code = code.replace(
  "            onImageUpload={onImageUpload}\n",
  ""
);

fs.writeFileSync('src/components/AlphaCartSidebar.tsx', code);
