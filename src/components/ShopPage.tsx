import React, { useState, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Sparkles, ShoppingBag, 
  Heart, Check, ChevronRight, Star, ShieldCheck, Filter, RotateCcw,
  Zap, Info
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

interface ShopPageProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleSave: (productId: string) => void;
  savedGearIds: string[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenAgent: (query?: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onSelectProduct,
  onAddToCart,
  onToggleSave,
  savedGearIds,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  onOpenAgent
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(externalSearchQuery);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Sync external search query
  React.useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  const categories = [
    { id: 'all', label: 'All Masterworks' },
    { id: 'computing', label: 'Laptops, PCs & Displays' },
    { id: 'audio', label: 'Studio Acoustics' },
    { id: 'workspace', label: 'Workspace Gear' },
    { id: 'accessories', label: 'Precision DACs & Mounts' },
    { id: 'wearables', label: 'Tactile Wearables' }
  ];

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Price
      if (item.price > maxPrice) {
        return false;
      }
      // In-stock
      if (onlyInStock && !item.inStock) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesTagline = item.tagline.toLowerCase().includes(q);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesTagline && !matchesTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [selectedCategory, searchQuery, maxPrice, onlyInStock, sortBy]);

  const handleAddToCartWithAnimation = (product: Product) => {
    onAddToCart(product);
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  return (
    <div id="shop-page-view" className="w-full min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6 md:px-10 lg:px-12 animate-fadeIn">
      
      {/* Shop Page Editorial Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span>Full Precision Catalog • {PRODUCTS.length} Curated Models</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Tactile Masterworks
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl font-light">
              Bit-perfect acoustics, CNC aerospace chassis, and ergonomic workspace architecture engineered for high-performance creative flow.
            </p>
          </div>

          {/* AI Bundle Concierge Quick CTA Banner */}
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md flex items-center gap-3.5 shadow-xl shrink-0 max-w-md">
            <div className="w-10 h-10 rounded-xl bg-neutral-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-white">Veluno Bundle Concession</span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-300 text-[9px] font-mono font-bold">≤10% OFF</span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-1">Pair audio with custom cables or DACs for instant savings.</p>
            </div>
            <button
              onClick={() => onOpenAgent('Can you build a high-performance studio bundle with the 10% authorized discount?')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs shrink-0 transition-colors shadow"
            >
              Build Bundle
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Product Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Filtering Sidebar (3 Cols on Desktop) */}
        <aside className="lg:col-span-3 space-y-6 bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 backdrop-blur-xl sticky top-24">
          
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 font-editorial font-bold text-sm text-white">
              <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
              <span>Filters & Specs</span>
            </div>
            {(selectedCategory !== 'all' || maxPrice < 300000 || onlyInStock || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setMaxPrice(300000);
                  setOnlyInStock(false);
                  setSearchQuery('');
                }}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search in Catalog */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Keyword Search
            </label>
            <div className="relative">
              <input
                id="shop-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                placeholder="Search models, DACs, ANC..."
                className="w-full py-2 pl-8 pr-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-neutral-800 text-white font-bold border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/60'
                  }`}
                >
                  <span>{cat.label}</span>
                  {selectedCategory === cat.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Max Price
              </label>
              <span className="font-mono text-xs font-bold text-white">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={2000}
              max={300000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-neutral-500 bg-neutral-950 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
              <span>₹2,000</span>
              <span>₹3,00,000</span>
            </div>
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-white block">Ready to Ship Only</span>
              <span className="text-[10px] text-neutral-400">Exclude backorders</span>
            </div>
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="w-4 h-4 rounded text-neutral-600 focus:ring-neutral-500 bg-neutral-950 border-neutral-700 cursor-pointer"
            />
          </div>

          {/* Ask Agent In-Context Box */}
          <div className="pt-3 border-t border-neutral-800">
            <button
              onClick={() => onOpenAgent('I need help selecting the perfect studio gear setup for my workspace.')}
              className="w-full py-2.5 px-3 rounded-xl bg-neutral-600/20 hover:bg-neutral-600/30 border border-neutral-500/40 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>Consult AI Concierge</span>
            </button>
          </div>

        </aside>

        {/* Right Product Grid (9 Cols on Desktop) */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Top Sort & Results Count Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md text-xs">
            <div className="text-neutral-400 font-mono">
              Showing <strong className="text-white">{filteredProducts.length}</strong> masterwork{filteredProducts.length === 1 ? '' : 's'}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-[11px]">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-neutral-500"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/40 rounded-3xl border border-neutral-800 p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-500">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-white">No Matching Gear Found</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Try widening your price range or clearing active filters to browse our complete collection.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setMaxPrice(45000);
                  setOnlyInStock(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-colors shadow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const isSaved = savedGearIds.includes(product.id);
                const isJustAdded = addedAnimationId === product.id;

                return (
                  <div
                    key={product.id}
                    className="group relative rounded-3xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700/80 p-4 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-black/60 backdrop-blur-md"
                  >
                    {/* Top Image Container */}
                    <div 
                      onClick={() => onSelectProduct(product)}
                      className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/80 cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Floating Badge (e.g. Flagship / Limited) */}
                      {product.badge && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-[10px] font-mono text-neutral-300 font-bold">
                          {product.badge}
                        </div>
                      )}

                      {/* Bookmark / Wishlist Heart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(product.id);
                        }}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${
                          isSaved 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-neutral-900/80 text-neutral-300 hover:text-white border border-neutral-700'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      {/* Stock indicator badge */}
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-neutral-950/90 backdrop-blur-sm text-[9px] font-mono text-green-400 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span>{product.stockCount} In Stock</span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="pt-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                          <span className="font-mono uppercase tracking-wider text-[10px] text-neutral-500">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{product.rating}</span>
                            <span className="text-neutral-600">({product.reviewsCount})</span>
                          </div>
                        </div>

                        <h3 
                          onClick={() => onSelectProduct(product)}
                          className="font-editorial text-base font-bold text-white group-hover:text-neutral-200 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {product.name}
                        </h3>

                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1 font-light leading-relaxed">
                          {product.tagline}
                        </p>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="pt-4 mt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-mono text-base font-bold text-white">
                            ₹{product.price.toLocaleString('en-IN')}
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="text-[10px] text-neutral-500 line-through font-mono">
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Chat to Buy / Negotiate with AI */}
                          <button
                            onClick={() => onOpenAgent(`I would like to purchase the ${product.name}. What bundle offer and 10% discount can you provide?`)}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700 text-xs font-semibold"
                            title="Chat to Buy / Negotiate with AI"
                          >
                            <Sparkles className="w-4 h-4 text-neutral-400" />
                          </button>

                          {/* Quick Add to Cart Button */}
                          <button
                            onClick={() => handleAddToCartWithAnimation(product)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                              isJustAdded
                                ? 'bg-green-600 text-white'
                                : 'bg-white hover:bg-neutral-100 text-neutral-950'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

      </div>

    </div>
  );
};
