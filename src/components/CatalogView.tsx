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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-neutral-600 text-white shadow-md'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
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
            className="rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-800 transition-all flex flex-col overflow-hidden shadow-lg group"
          >
            {/* Image Preview & Badge */}
            <div className="relative aspect-video bg-neutral-900 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                {product.badge && (
                  <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-800 text-[10px] font-bold">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-neutral-900 backdrop-blur-md text-[10px] text-neutral-400 flex items-center gap-1 border border-neutral-800">
                <Star className="w-3 h-3 fill-amber-400 text-neutral-400" />
                <span className="font-bold">{product.rating}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <h4 
                  onClick={() => onSelectProduct(product)}
                  className="font-bold text-sm text-white hover:text-neutral-300 cursor-pointer line-clamp-1 font-display"
                >
                  {product.name}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {product.tagline}
                </p>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline justify-between pt-1 border-t border-neutral-800">
                <div>
                  <div className="text-base font-bold font-display text-white">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  {product.originalPrice > product.price && (
                    <span className="text-[10px] text-neutral-500 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-neutral-400 font-mono bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                  {product.stockCount} in stock
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id={`btn-chat-product-${product.id}`}
                  onClick={() => onAskAgent(product)}
                  className="py-2 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3 h-3 text-neutral-400" />
                  <span>Ask Agent</span>
                </button>

                <button
                  id={`btn-add-product-${product.id}`}
                  onClick={() => onAddToCart(product)}
                  className="py-2 px-2 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-md shadow-neutral-900/30"
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
