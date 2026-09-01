import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { Search, Sparkles, MessageSquare, ShoppingCart, Info, Star, Check } from 'lucide-react';

interface CatalogViewProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAskAgent: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onSelectProduct,
  onAddToCart,
  onAskAgent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Tech' },
    { id: 'audio', label: 'Audio & ANC' },
    { id: 'wearables', label: 'Wearables' },
    { id: 'computing', label: 'Computing' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'accessories', label: 'Accessories' }
  ];

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCat = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div id="catalog-view" className="h-full flex flex-col p-4 space-y-4 text-xs overflow-y-auto">
      {/* Search and Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audio, watches, keyboards, monitors..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            id={`product-card-${product.id}`}
            className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col overflow-hidden shadow-lg group"
          >
            {/* Image Preview & Badge */}
            <div className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                {product.badge && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-950/90 text-indigo-300 border border-indigo-700/50 text-[10px] font-bold">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] text-amber-300 flex items-center gap-1 border border-slate-800">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold">{product.rating}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <h4 
                  onClick={() => onSelectProduct(product)}
                  className="font-bold text-sm text-white hover:text-indigo-300 cursor-pointer line-clamp-1 font-display"
                >
                  {product.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {product.tagline}
                </p>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/80">
                <div>
                  <div className="text-base font-bold font-display text-white">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  {product.originalPrice > product.price && (
                    <span className="text-[10px] text-slate-500 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  {product.stockCount} in stock
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id={`btn-chat-product-${product.id}`}
                  onClick={() => onAskAgent(product)}
                  className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3 h-3 text-indigo-400" />
                  <span>Ask Agent</span>
                </button>

                <button
                  id={`btn-add-product-${product.id}`}
                  onClick={() => onAddToCart(product)}
                  className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-md shadow-indigo-900/30"
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>Add Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
