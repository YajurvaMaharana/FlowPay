const fs = require('fs');
let code = fs.readFileSync('src/components/MessageItem.tsx', 'utf8');

code = code.replace(
  "  onOpenInvoice?: (order: PaymentOrder) => void;",
  "  onOpenInvoice?: (order: PaymentOrder) => void;\n  onAddBundleToCart?: (products: Product[]) => void;"
);

code = code.replace(
  "  onOpenInvoice\n}) => {",
  "  onOpenInvoice,\n  onAddBundleToCart\n}) => {"
);

// Insert Attachment Logic
code = code.replace(
  "{/* Formatted Text Content */}",
  `{message.attachment && message.attachment.type === 'image' && (
            <div className="mb-3">
              <img src={message.attachment.url} alt="Workspace upload" className="rounded-lg max-h-48 border border-neutral-700 object-cover w-full" />
            </div>
          )}
          {/* Formatted Text Content */}`
);

// Insert Vision Analysis Result Logic
const visionBlock = `
          {message.visionAnalysis && (
            <div className="mt-4 p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                Vision Analysis Result
              </div>
              
              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-neutral-300 text-xs">
                  <strong className="text-neutral-100">Detected:</strong> {message.visionAnalysis.detectedIssue}
                </span>
              </div>

              {message.visionAnalysis.products.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider font-bold">Recommended Bundle</div>
                  <div className="flex flex-col gap-2">
                    {message.visionAnalysis.products.map(p => (
                      <div key={p.id} className="flex gap-2 items-center bg-neutral-950 border border-neutral-800 p-2 rounded-lg">
                        <img src={p.image} className="w-10 h-10 rounded border border-neutral-800 object-cover" alt={p.name} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-neutral-500">₹{p.price.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {onAddBundleToCart && (
                    <button 
                      onClick={() => onAddBundleToCart(message.visionAnalysis.products)}
                      className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add Workspace Bundle to Cart
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
`;

code = code.replace(
  "          <div className=\"space-y-1\">{formatContent(message.content)}</div>",
  `          <div className="space-y-1">{formatContent(message.content)}</div>${visionBlock}`
);

fs.writeFileSync('src/components/MessageItem.tsx', code);
