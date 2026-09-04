const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  "  onImageUpload?: (file: File) => void;",
  "  onImageUpload?: (file: File) => void;\n  onAddBundleToCart?: (products: Product[]) => void;"
);
code = code.replace(
  "  onImageUpload\n}) => {",
  "  onImageUpload,\n  onAddBundleToCart\n}) => {"
);
code = code.replace(
  "              onOpenInvoice={onOpenInvoice}",
  "              onOpenInvoice={onOpenInvoice}\n              onAddBundleToCart={onAddBundleToCart}"
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
