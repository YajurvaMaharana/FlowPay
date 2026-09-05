import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Heart, ShoppingBag, Sparkles, User, Package, Bookmark, 
  Settings, LogOut, LogIn, ShieldCheck, ChevronRight, CheckCircle2,
  ExternalLink, X
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../types';
import { TactileMonogramLogo } from './TactileMonogramLogo';

interface GlobalNavbarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  cartCount: number;
  savedCount: number;
  user: UserProfile;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  onOpenCart: () => void;
  onOpenSavedGear: () => void;
  onOpenOrders: () => void;
  onOpenSettings: () => void;
  onOpenEditProfile?: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenAgent: (query?: string) => void;
}

export const GlobalNavbar: React.FC<GlobalNavbarProps> = ({
  currentTab,
  onNavigate,
  cartCount,
  savedCount,
  user,
  searchQuery: externalSearchQuery = '',
  onSearch,
  onOpenCart,
  onOpenSavedGear,
  onOpenOrders,
  onOpenSettings,
  onOpenEditProfile,
  onOpenAuthModal,
  onLogout,
  onOpenAgent
}) => {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Synchronize internal state if external search query changes
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (currentTab === 'shop' && onSearch) {
      onSearch(val);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const navItems: { tab: NavigationTab; label: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'about', label: 'About' },
    { tab: 'shop', label: 'Shop' },
    { tab: 'new-arrivals', label: 'New Arrivals' },
    { tab: 'contact', label: 'Contact Us' }
  ];

  return (
    <header 
      id="global-navbar"
      className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 sm:py-4 bg-neutral-950/85 backdrop-blur-2xl border-b border-neutral-800/80 shadow-lg shadow-black/50 transition-all"
    >
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* Left Brand: Tactile Monogram "V" Logo + "Veluno" */}
        <div className="flex items-center gap-3 shrink-0">
          <TactileMonogramLogo 
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            size="md"
            showSubtitle={true}
            subtitleText="AI Commerce"
          />
        </div>

        {/* Center Navigation Links (Home, About, Shop, New Arrivals, Contact Us) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-medium tracking-wide text-neutral-300">
          {navItems.map((item) => (
            <button
              key={item.tab}
              id={`nav-link-${item.tab}`}
              onClick={() => onNavigate(item.tab)}
              className={`transition-colors py-1 relative ${
                currentTab === item.tab 
                  ? 'text-white font-semibold' 
                  : 'text-neutral-400 hover:text-neutral-100'
              }`}
            >
              {item.label}
              {currentTab === item.tab && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full transition-all" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          
          {/* Search Input Bar & Interactive Button */}
          <form onSubmit={handleSearchSubmit} role="search" className="relative hidden md:flex items-center">
            <button
              type="submit"
              id="navbar-search-btn"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 transition-colors cursor-pointer z-10 flex items-center justify-center"
              title="Search gear & acoustics"
              aria-label="Search gear & acoustics"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <input
              id="navbar-search-input"
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search gear & acoustics..."
              className="w-40 lg:w-52 py-1.5 pl-8 pr-7 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:w-60 focus:bg-neutral-900 focus:border-neutral-500 transition-all backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                id="navbar-clear-search-btn"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Saved Gear / Wishlist Button */}
          <button
            id="navbar-wishlist-btn"
            onClick={onOpenSavedGear}
            title="Saved Gear"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center text-neutral-200 hover:text-white transition-all backdrop-blur-md"
          >
            <Heart className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                {savedCount}
              </span>
            )}
          </button>

          {/* Cart Bag Button with Count Badge */}
          <button
            id="navbar-cart-btn"
            onClick={onOpenCart}
            title="View Cart"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center text-neutral-200 hover:text-white transition-all backdrop-blur-md"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neutral-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {/* Unified Authentication Trigger or Profile Avatar */}
          {!user.isAuthenticated ? (
            <button
              id="navbar-signin-btn"
              onClick={() => onOpenAuthModal('login')}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-200 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1.5 group"
            >
              <User className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative" ref={profileMenuRef}>
              <button
                id="navbar-profile-avatar-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-neutral-600 shadow-md ring-1 ring-black/40 hover:scale-105 transition-all flex items-center justify-center bg-neutral-800"
                title={`${user.name} Profile`}
              >
                {user.avatar ? (
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
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-neutral-900 bg-green-400" />

              {/* Glassmorphic Profile Popover Menu */}
              {isProfileOpen && (
                <div 
                  id="profile-dropdown-popover"
                  className="absolute right-0 mt-3 w-72 rounded-2xl bg-neutral-900/95 border border-neutral-700/80 shadow-2xl p-2.5 z-50 backdrop-blur-2xl animate-fadeIn space-y-2 text-neutral-100"
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
                          {user.name}
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate font-mono">
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-[9px] text-zinc-500 font-mono truncate">
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="flex items-center gap-1 text-green-400 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      Zero-Trust Active
                    </span>
                    <span>Session: 256-Bit</span>
                  </div>

                  {/* Popover Action Links */}
                  <div className="space-y-0.5 text-xs">
                    <button
                      id="profile-menu-orders"
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
                      id="profile-menu-saved"
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
                      id="profile-menu-edit-profile"
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (onOpenEditProfile) {
                          onOpenEditProfile();
                        } else {
                          onOpenSettings();
                        }
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-neutral-800/80 text-neutral-200 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-white">Edit Profile</span>
                    </button>

                    <button
                      id="profile-menu-settings"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-neutral-800/80 text-neutral-200 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-400" />
                      <span className="font-medium font-sans">Account Settings</span>
                    </button>
                  </div>

                  {/* Auth Button: Sign Out */}
                  <div className="pt-1.5 border-t border-neutral-800">
                    <button
                      id="profile-menu-logout"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-red-950/40 text-red-300 hover:text-red-200 flex items-center gap-2.5 transition-colors text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* AI Assistant Quick Toggle Button */}
          <button
            id="navbar-open-agent-pill"
            onClick={() => onOpenAgent()}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-black/40 active:scale-95 transition-all ${
              currentTab === 'concierge'
                ? 'bg-neutral-100 text-neutral-950 ring-2 ring-neutral-400 font-extrabold'
                : 'bg-white text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-950 fill-neutral-950" />
            <span className="hidden sm:inline">AI Concierge</span>
            <span className="sm:hidden">AI</span>
          </button>

        </div>

      </div>

      {/* Mobile Navigation Drawer Links */}
      <div className="flex lg:hidden items-center justify-around pt-3 border-t border-neutral-800/60 mt-3 text-xs text-neutral-400">
        {navItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => onNavigate(item.tab)}
            className={`py-1 relative ${currentTab === item.tab ? 'text-white font-bold' : 'hover:text-neutral-200'}`}
          >
            {item.label}
            {currentTab === item.tab && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
};

