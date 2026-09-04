const fs = require('fs');
let code = fs.readFileSync('src/components/AlphaCartSidebar.tsx', 'utf8');

code = code.replace(
  "  onNextA2ATurn?: () => void;\n  activeTab:",
  "  onNextA2ATurn?: () => void;\n  onImageUpload?: (file: File) => void;\n  activeTab:"
);

code = code.replace(
  "  onNextA2ATurn,\n  activeTab,",
  "  onNextA2ATurn,\n  onImageUpload,\n  activeTab,"
);

code = code.replace(
  "            onNextA2ATurn={onNextA2ATurn}\n          />",
  "            onNextA2ATurn={onNextA2ATurn}\n            onImageUpload={onImageUpload}\n          />"
);

fs.writeFileSync('src/components/AlphaCartSidebar.tsx', code);
