import React from 'react';
import { Product } from '../types';
import { X, Star, ShieldCheck, Check, Sparkles, Plus, ShoppingCart, MessageSquare } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAskAgentAbout: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAskAgentAbout
}) => {
  if (!isOpen || !product) return null;

  return (
    <div id="product-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="product-modal-container"
        className="relative w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-neutral-950 text-neutral-300 border border-neutral-700/50 text-[10px] uppercase font-bold tracking-wider">
              {product.category}
            </span>
            {product.badge && (
              <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50 text-[10px] font-bold">
                {product.badge}
              </span>
            )}
          </div>
          <button
            id="btn-close-product-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-square">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-700/50 flex items-center gap-1.5 text-xs text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-neutral-400">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold font-display text-white">{product.name}</h3>
                <p className="text-xs text-neutral-300 font-medium mt-0.5">{product.tagline}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-display text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-neutral-500 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-green-400 font-semibold">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Off
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {product.description}
              </p>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Highlights</span>
                <div className="space-y-1 text-xs">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specs Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Technical Specifications</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex justify-between">
                  <span className="text-neutral-400">{key}</span>
                  <span className="text-neutral-200 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Sell Recommendation Hook */}
          {product.crossSellReason && (
            <div className="p-4 rounded-xl bg-neutral-950/30 border border-neutral-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-semibold">
                <Sparkles className="w-4 h-4 text-neutral-400" />
                <span>Smart Ecosystem Cross-Sell</span>
              </div>
              <p className="text-xs text-neutral-300">{product.crossSellReason}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>2-Year Official Merchant Warranty Included</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id={`btn-ask-agent-about-${product.id}`}
              onClick={() => {
                onAskAgentAbout(product);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ask Concierge</span>
            </button>

            <button
              id={`btn-modal-add-to-cart-${product.id}`}
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-neutral-900/40"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
