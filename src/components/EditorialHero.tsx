import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Heart, ShoppingBag, ArrowLeft, ArrowRight, Sparkles, 
  ShieldCheck, MessageSquare, Compass, ChevronRight, Zap,
  User, Package, Bookmark, Settings, LogOut, LogIn, CheckCircle2,
  X
} from 'lucide-react';
import { NavigationTab, Product, UserProfile } from '../types';

interface EditorialHeroProps {
  onOpenAgent: (initialQuery?: string) => void;
  onSelectProduct: (product: Product) => void;
  cartCount: number;
  savedCount: number;
  user: UserProfile;
  featuredProducts: Product[];
  searchQuery?: string;
  onSearch?: (query: string) => void;
  onOpenCart: () => void;
  onOpenSavedGear: () => void;
  onOpenOrders: () => void;
  onOpenSettings: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onNavigate: (tab: NavigationTab) => void;
  securityStatus: string;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({
  onOpenAgent,
  onSelectProduct,
  cartCount,
  savedCount,
  user,
  featuredProducts,
  searchQuery: externalSearchQuery = '',
  onSearch,
  onOpenCart,
  onOpenSavedGear,
  onOpenOrders,
  onOpenSettings,
  onOpenAuthModal,
  onLogout,
  onNavigate,
  securityStatus
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Sync external search query
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const slides = [
    {
      id: 'slide_01',
      title: 'Spaces That Mirror You',
      subtitle: 'Discover timeless acoustic acoustics, precision workspace gear, and tactile masterworks tailored for discerning creators.',
      number: '01',
      featuredProduct: featuredProducts[0] || {
        id: 'prod_apex_anc',
        name: 'Apex Acoustic ANC Pro',
        price: 14999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        tagline: 'Flagship 48dB Hybrid Noise-Cancelling Studio Headphones'
      },
      category: 'Lasting Luxury Gear',
      cardDescription: 'Discover timeless acoustic fidelity and workspace precision crafted for creators.'
    },
    {
      id: 'slide_02',
      title: 'Acoustic Sanctum',
      subtitle: 'Immerse in bit-perfect 32-bit audio fidelity and masterclass soundscapes crafted in CNC aerospace titanium.',
      number: '02',
      featuredProduct: featuredProducts[1] || {
        id: 'prod_soundwave_dac',
        name: 'SoundWave Hi-Fi 32-Bit DAC',
        price: 3499,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        tagline: 'Ultra-Compact Dual ESS Sabre Master Audio Amplifier'
      },
      category: 'Master Audio Fidelity',
      cardDescription: 'Dual ESS Sabre decoding for pure, distortion-free studio acoustics.'
    },
    {
      id: 'slide_03',
      title: 'Tactile Architecture',
      subtitle: 'Every keypress tuned to mechanical perfection with gasket mount dampening and custom oiled linear switches.',
      number: '03',
      featuredProduct: featuredProducts[4] || {
        id: 'prod_keychron_mech',
        name: 'AeroType Carbon Mechanical',
        price: 8999,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        tagline: 'Custom 75% Gasket Mount Wireless Keyboard'
      },
      category: 'Tactile Workspace',
      cardDescription: 'Custom tuned Gateron Oil King linear switches with deep acoustic thock.'
    },
    {
      id: 'slide_04',
      title: 'Panoramic Vision',
      subtitle: 'Ultrawide 34-inch 1000R curved panoramic display calibrated to 98% DCI-P3 cinematic studio fidelity.',
      number: '04',
      featuredProduct: featuredProducts[7] || {
        id: 'prod_lumina_monitor',
        name: 'Lumina Curve 34" Studio Monitor',
        price: 38999,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        tagline: '1000R Curved IPS Quantum Dot Display with 90W USB-C PD'
      },
      category: 'Studio Displays',
      cardDescription: 'WQHD 21:9 curved color accuracy with integrated 90W USB-C docking.'
    }
  ];

  const currentSlide = slides[currentSlideIndex];
  const nextSlide = slides[(currentSlideIndex + 1) % slides.length];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery.trim());
    } else if (searchQuery.trim()) {
      onOpenAgent(`Search catalog for "${searchQuery.trim()}"`);
    } else {
      onNavigate('shop');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const navMenuItems: { tab: NavigationTab; label: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'about', label: 'About' },
    { tab: 'shop', label: 'Shop' },
    { tab: 'new-arrivals', label: 'New Arrivals' },
    { tab: 'contact', label: 'Contact Us' }
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 lg:p-12 overflow-hidden bg-neutral-950">
      
      {/* Editorial Texture Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Floating Circular Badge '03' (Matching Reference Composition) */}
      <div className="relative z-10 mb-5 md:mb-6">
        <div 
          id="editorial-badge-03"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-neutral-800/80 border border-neutral-700/60 backdrop-blur-md flex items-center justify-center text-neutral-300 font-semibold text-sm md:text-base tracking-widest shadow-lg shadow-black/40 select-none animate-pulse-subtle"
        >
          03
        </div>
      </div>

      {/* Main Architectural Editorial Showcase Card */}
      <div 
        id="editorial-main-frame"
        className="relative w-full max-w-7xl h-[82vh] min-h-[640px] max-h-[860px] rounded-[28px] sm:rounded-[36px] overflow-hidden border border-neutral-700/40 shadow-2xl shadow-black/80 flex flex-col justify-between"
      >
        {/* Background Architectural Scene with Interior Concrete, Monstera Plant & Modern Curated Tech Workspace */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1920&auto=format&fit=crop&q=85" 
            alt="Veluno Architectural Space"
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Moody Editorial Dark Overlays & Gradient Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-neutral-950/80" />
          <div className="absolute inset-0 bg-radial-vignette opacity-70" />
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />
        </div>

        {/* TOP NAVBAR */}
        <header className="relative z-20 w-full px-6 sm:px-10 py-5 sm:py-7 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-neutral-950/20">
          
          {/* Left Brand: Pinwheel Swirl Logo + "Veluno" */}
          <div className="flex items-center gap-3">
            <button 
              id="brand-logo-btn"
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2.5 text-white group text-left transition-transform active:scale-95"
            >
              {/* Reference Pinwheel Swirl Logo */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-500">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
                  Veluno
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono -mt-0.5">
                  AI Commerce
                </span>
              </div>
            </button>
          </div>

          {/* Center Menu Links (Home, About, Shop, New Arrivals, Contact Us) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs sm:text-sm font-medium tracking-wide text-neutral-300">
            {navMenuItems.map((item) => (
              <button
                key={item.tab}
                id={`hero-nav-link-${item.tab}`}
                onClick={() => onNavigate(item.tab)}
                className={`transition-colors py-1 relative ${
                  item.tab === 'home'
                    ? 'text-white font-semibold' 
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {item.label}
                {item.tab === 'home' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full transition-all" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Controls: Search bar, Wishlist, Cart, Profile Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Interactive Search Bar */}
            <form onSubmit={handleSearchSubmit} role="search" className="relative hidden md:flex items-center">
              <button
                type="submit"
                id="hero-search-btn"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-white p-0.5 transition-colors cursor-pointer z-10 flex items-center justify-center"
                title="Search gear & acoustics"
                aria-label="Search gear & acoustics"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <input
                id="hero-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gear & acoustics..."
                className="w-40 lg:w-52 py-1.5 pl-8 pr-7 rounded-full bg-white/10 border border-white/15 text-xs text-white placeholder:text-neutral-300 focus:outline-none focus:w-60 focus:bg-neutral-900/90 focus:border-white/40 transition-all backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="hero-clear-search-btn"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-white p-0.5 transition-colors"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Wishlist Button */}
            <button
              id="hero-wishlist-btn"
              onClick={onOpenSavedGear}
              title="Saved Gear"
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-neutral-200 hover:text-white transition-all backdrop-blur-md"
            >
              <Heart className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Cart Button with Count Badge */}
            <button
              id="hero-cart-btn"
              onClick={onOpenCart}
              title="Cart"
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-neutral-200 hover:text-white transition-all backdrop-blur-md"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neutral-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar with Popover */}
            <div className="relative" ref={profileMenuRef}>
              <button
                id="hero-profile-avatar-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-neutral-400/60 shadow-md ring-2 ring-black/40 hover:scale-105 transition-all flex items-center justify-center bg-neutral-800"
                title={user.isAuthenticated ? `${user.name} Profile` : 'Sign In'}
              >
                {user.isAuthenticated && user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-neutral-300" />
                )}
              </button>
              {/* Zero-Trust indicator dot on avatar */}
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-neutral-900 ${
                user.isAuthenticated ? 'bg-green-400' : 'bg-neutral-500'
              }`} />

              {/* Glassmorphic Profile Popover Menu */}
              {isProfileOpen && (
                <div 
                  id="hero-profile-dropdown-popover"
                  className="absolute right-0 mt-3 w-72 rounded-2xl bg-neutral-900/95 border border-neutral-700/80 shadow-2xl p-2.5 z-50 backdrop-blur-2xl animate-fadeIn space-y-2"
                >
                  {/* User Identity Header Card */}
                  <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-600 shrink-0">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white truncate">
                          {user.isAuthenticated ? user.name : 'Guest User'}
                        </span>
                        {user.isAuthenticated && (
                          <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate font-mono">
                        {user.isAuthenticated ? user.email : 'guest@veluno.com'}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="flex items-center gap-1 text-green-400 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      Zero-Trust Verified
                    </span>
                    <span>Session: 256-Bit</span>
                  </div>

                  {/* Popover Action Links */}
                  <div className="space-y-0.5 text-xs">
                    <button
                      id="hero-profile-menu-orders"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenOrders();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-neutral-800/80 text-neutral-200 hover:text-white flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-neutral-400" />
                        <span className="font-medium">My Orders</span>
                      </div>
                      {user.orders.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-neutral-950 text-neutral-300 text-[10px] font-mono font-bold border border-neutral-700">
                          {user.orders.length}
                        </span>
                      )}
                    </button>

                    <button
                      id="hero-profile-menu-saved"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenSavedGear();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-neutral-800/80 text-neutral-200 hover:text-white flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-red-400" />
                        <span className="font-medium">Saved Gear</span>
                      </div>
                      {savedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-950 text-red-300 text-[10px] font-mono font-bold border border-red-800">
                          {savedCount}
                        </span>
                      )}
                    </button>

                    <button
                      id="hero-profile-menu-settings"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-neutral-800/80 text-neutral-200 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-400" />
                      <span className="font-medium">Account Settings</span>
                    </button>
                  </div>

                  {/* Auth Button: Logout or Login */}
                  <div className="pt-1.5 border-t border-neutral-800">
                    {user.isAuthenticated ? (
                      <button
                        id="hero-profile-menu-logout"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-red-950/40 text-red-300 hover:text-red-200 flex items-center gap-2.5 transition-colors text-xs font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        id="hero-profile-menu-login"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenAuthModal('login');
                        }}
                        className="w-full px-2.5 py-2 rounded-xl text-left bg-neutral-600 hover:bg-neutral-500 text-white flex items-center justify-between transition-colors text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2">
                          <LogIn className="w-4 h-4" />
                          <span>Sign In / Register</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* AI Assistant Quick Toggle Button */}
            <button
              id="hero-open-agent-pill"
              onClick={() => onOpenAgent()}
              className="ml-1 sm:ml-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-black/40 hover:bg-neutral-100 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-600 fill-neutral-600 animate-spin-slow" />
              <span className="hidden sm:inline">Ask AI Agent</span>
              <span className="sm:hidden">AI</span>
            </button>

          </div>
        </header>

        {/* HERO MAIN BODY: Big Editorial Typography + Right Side Interactive Card */}
        <div className="relative z-10 flex-1 px-6 sm:px-12 md:px-16 lg:px-20 py-8 flex flex-col justify-end">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end w-full pb-4 sm:pb-6">
            
            {/* Left/Middle Column: Huge Editorial Display Title ("Spaces That Mirror You") */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-4">
              
              {/* Zero-Trust Security Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-700/60 backdrop-blur-md text-xs text-neutral-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider">Zero-Trust Sentinel Active</span>
                <span className="text-neutral-500">•</span>
                <span className="text-[11px] text-neutral-300 font-medium">≤10% Concession Policy</span>
              </div>

              {/* Large Editorial Headline */}
              <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-md">
                {currentSlide.title}
              </h1>

              <p className="text-neutral-300 text-sm sm:text-base max-w-lg font-light leading-relaxed drop-shadow">
                {currentSlide.subtitle}
              </p>

              {/* Pagination Slider Line & Arrow Controls (01 ─────── 04) */}
              <div className="flex items-center gap-6 pt-4 sm:pt-6">
                
                {/* Numbered Pagination Indicator */}
                <div className="flex items-center gap-3 font-editorial text-base sm:text-lg font-bold text-white tracking-widest">
                  <span className="text-white">{currentSlide.number}</span>
                  <div className="w-16 sm:w-24 h-[2px] bg-neutral-700 relative overflow-hidden rounded-full">
                    <div 
                      className="absolute top-0 left-0 h-full bg-white transition-all duration-500" 
                      style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-neutral-400">04</span>
                </div>

                {/* Circular Slider Arrow Controls */}
                <div className="flex items-center gap-2">
                  <button
                    id="slider-prev-btn"
                    onClick={handlePrev}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
                    title="Previous Slide"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    id="slider-next-btn"
                    onClick={handleNext}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 flex items-center justify-center transition-all active:scale-90 shadow-md"
                    title="Next Slide"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: Interactive Card Component Overlay */}
            <div className="lg:col-span-6 xl:col-span-5 flex justify-end relative">
              
              {/* Main Interactive Card */}
              <div 
                id="hero-featured-interactive-card"
                className="relative z-10 w-full max-w-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 bg-neutral-900/85 border border-white/15 backdrop-blur-xl shadow-2xl shadow-black/80 flex items-center gap-4 group hover:border-white/30 transition-all cursor-pointer"
                onClick={() => onOpenAgent(`Tell me about the ${currentSlide.featuredProduct.name} and what discount you can apply`)}
              >
                {/* Product Thumbnail inside Card */}
                <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-neutral-950 border border-white/10 relative shadow-inner">
                  <img 
                    src={currentSlide.featuredProduct.image} 
                    alt={currentSlide.featuredProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-green-400 font-semibold">
                    In Stock
                  </div>
                </div>

                {/* Text Content & "Chat to Buy" CTA Button */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                  <div>
                    <h3 className="font-editorial text-sm sm:text-base font-bold text-white truncate leading-tight group-hover:text-neutral-200 transition-colors">
                      {currentSlide.category}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-2 mt-1 leading-snug font-light">
                      {currentSlide.cardDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                    <span className="font-mono text-xs sm:text-sm font-bold text-white">
                      ₹{currentSlide.featuredProduct.price.toLocaleString('en-IN')}
                    </span>
                    
                    {/* "Chat to Buy" Pill Button */}
                    <button
                      id="btn-chat-to-buy-hero"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAgent(`I would like to purchase the ${currentSlide.featuredProduct.name}. Can you check inventory and calculate my total?`);
                      }}
                      className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md group-hover:shadow-neutral-500/20 active:scale-95 transition-all"
                    >
                      <span>Chat to Buy</span>
                      <ChevronRight className="w-3 h-3 text-neutral-950" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Peeking Next Slide Card Edge on the Right */}
              <div 
                onClick={handleNext}
                className="hidden xl:block absolute -right-16 top-1/2 -translate-y-1/2 w-28 h-28 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-md opacity-40 hover:opacity-75 transition-opacity cursor-pointer overflow-hidden pointer-events-auto"
                title="Next featured piece"
              >
                <img 
                  src={nextSlide.featuredProduct.image} 
                  alt="Next Product" 
                  className="w-full h-full object-cover blur-[1px]"
                />
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Subtle Footer Meta Badges */}
      <div className="relative z-10 w-full max-w-7xl px-4 mt-4 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <span>FlowPay Commerce Engine</span>
          <span>•</span>
          <span>Razorpay Direct Gateway</span>
          <span>•</span>
          <span>256-Bit TLS Encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>Agent Protocol: Zero-Trust Strict</span>
        </div>
      </div>

    </div>
  );
};
