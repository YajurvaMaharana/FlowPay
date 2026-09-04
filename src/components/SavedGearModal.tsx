import React from 'react';
import { 
  X, Bookmark, ShoppingBag, Trash2, ArrowRight, Sparkles, 
  CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Product } from '../types';

interface SavedGearModalProps {
  isOpen: boolean;
  savedProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onRemoveFromSaved: (productId: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenAgent: (query?: string) => void;
}

export const SavedGearModal: React.FC<SavedGearModalProps> = ({
  isOpen,
  savedProducts,
  onClose,
  onAddToCart,
  onRemoveFromSaved,
  onOpenProductDetail,
  onOpenAgent
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Saved Gear Modal Card */}
      <div 
        id="saved-gear-modal-card"
        className="relative w-full max-w-2xl bg-neutral-900/95 border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 z-10 backdrop-blur-2xl animate-scaleUp text-neutral-100 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-white">Saved Gear & Wishlist</h2>
              <p className="text-xs text-neutral-400 font-mono">
                {savedProducts.length} curated masterwork{savedProducts.length === 1 ? '' : 's'} saved
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {savedProducts.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-500">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-base font-bold text-neutral-200">No Saved Gear</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Explore the catalog and tap the bookmark or heart icon on any piece to save it for quick review.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAgent('Show me top flagship gear and acoustics in stock');
                }}
                className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-colors shadow-md mt-2 inline-flex items-center gap-2"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            savedProducts.map((product) => (
              <div
                key={product.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div 
                  onClick={() => {
                    onClose();
                    onOpenProductDetail(product);
                  }}
                  className="flex items-center gap-3 min-w-0 cursor-pointer group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-neutral-900 border border-neutral-800 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <h4 className="font-editorial font-bold text-sm text-white group-hover:text-neutral-300 transition-colors truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {product.tagline}
                    </p>
                    <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                      <span className="font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-neutral-500 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-[10px] text-green-400 font-semibold">• In Stock</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAgent(`I am interested in buying my saved ${product.name}. What bundle offer and 10% discount can you provide?`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700"
                    title="Ask AI Concierge"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </button>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromSaved(product.id)}
                    className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-300 flex items-center justify-center transition-colors border border-neutral-800"
                    title="Remove from Saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedProducts.length > 0 && (
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs shrink-0">
            <span className="text-neutral-400 font-mono text-[11px]">
              Tip: Veluno can apply up to a 10% concession on multi-item bundles.
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenAgent('I have saved items in my wishlist. Can you calculate a special bundle total with our 10% discount cap?');
              }}
              className="font-bold text-neutral-400 hover:text-neutral-300 flex items-center gap-1 transition-colors"
            >
              <span>Negotiate Bundle with AI</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
