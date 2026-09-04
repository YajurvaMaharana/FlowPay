const fs = require('fs');
let code = fs.readFileSync('src/components/AlphaCartSidebar.tsx', 'utf8');

code = code.replace(
  "  onImageUpload?: (file: File) => void;",
  "  onImageUpload?: (file: File) => void;\n  onAddBundleToCart?: (products: Product[]) => void;"
);
code = code.replace(
  "  onImageUpload,\n  activeTab,",
  "  onImageUpload,\n  onAddBundleToCart,\n  activeTab,"
);
code = code.replace(
  "            onImageUpload={onImageUpload}\n          />",
  "            onImageUpload={onImageUpload}\n            onAddBundleToCart={onAddBundleToCart}\n          />"
);

fs.writeFileSync('src/components/AlphaCartSidebar.tsx', code);
