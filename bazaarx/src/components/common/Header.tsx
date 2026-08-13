import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomerAuthModal } from '../storefront/CustomerAuthModal';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Sparkles,
  LayoutDashboard,
  Store,
  Scale,
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
  LogIn,
  UserCheck,
} from 'lucide-react';

export const Header: React.FC<{ onNavigateCustomerTab?: (tab: string) => void }> = ({ onNavigateCustomerTab }) => {
  const {
    viewMode,
    setViewMode,
    cart,
    wishlist,
    compareList,
    currentUser,
    setCurrentUser,
    switchUserRole,
    setIsCartOpen,
    setIsWishlistOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    settings,
    ads,
    recordAdClick,
    addToast,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const topHeaderAd = ads?.find(
    (a) =>
      a.status === 'ACTIVE' &&
      (a.type === 'TOP_HEADER_BAR' || a.placement === 'HEADER_ANNOUNCEMENT')
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {topHeaderAd ? (
            <div className="flex items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded-md text-[11px] border border-amber-400/30">
                PROMO
              </span>
              <span className="font-bold text-white">{topHeaderAd.title}</span>
              {topHeaderAd.subtitle && <span className="hidden md:inline text-slate-400">— {topHeaderAd.subtitle}</span>}
              <a
                href={topHeaderAd.targetUrl}
                onClick={() => recordAdClick(topHeaderAd.id)}
                className="ml-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md transition-all shadow-xs"
              >
                {topHeaderAd.ctaText || 'Learn More'}
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded-md text-[11px] border border-amber-400/30">
                FLASH SALE
              </span>
              <span>Free Express Shipping on Orders Over ${settings?.freeShippingThreshold || 99}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-slate-400 hidden sm:inline">Support: {settings?.supportPhone}</span>
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <span className="text-slate-400">Account Role:</span>
              <button
                onClick={() => switchUserRole('admin@enterprise.com')}
                className={`px-2 py-0.5 rounded transition-all ${
                  currentUser?.role === 'SUPER_ADMIN'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchUserRole('customer@example.com')}
                className={`px-2 py-0.5 rounded transition-all ${
                  currentUser?.role === 'CUSTOMER'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode('storefront');
                onNavigateCustomerTab?.('shop');
              }}
              className="flex items-center gap-2 text-slate-900 font-black text-2xl tracking-tighter uppercase hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                {(settings?.storeName || 'Aura')[0].toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="leading-none text-slate-900 font-black text-xl tracking-tighter">
                  {settings?.storeName || 'AURA'}
                  <span className="text-blue-600">.</span>
                </span>
              </div>
            </button>

            {/* Mode Toggle Switcher (Only visible to Admin / Manager users) */}
            {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'STORE_ADMIN' || currentUser?.role === 'MANAGER') && (
              <div className="hidden lg:flex items-center p-1 bg-slate-100 rounded-xl ml-4 border border-slate-200/80">
                <button
                  onClick={() => {
                    setViewMode('storefront');
                    onNavigateCustomerTab?.('shop');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'storefront'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  Storefront
                </button>
                <button
                  onClick={() => setViewMode('admin')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'admin'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Live Admin Panel
                </button>
              </div>
            )}

            {viewMode === 'storefront' && (
              <div className="hidden lg:flex items-center gap-1.5 ml-6 border-l border-slate-200 pl-6 space-x-1">
                <button
                  onClick={() => onNavigateCustomerTab?.('shop')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1"
                >
                  Shop
                </button>
                <button
                  onClick={() => onNavigateCustomerTab?.('categories')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1"
                >
                  Categories
                </button>
                <button
                  onClick={() => onNavigateCustomerTab?.('blog')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1"
                >
                  Blog
                </button>
              </div>
            )}
          </div>

          {/* Search Bar (Storefront View) */}
          {viewMode === 'storefront' && (
            <div className="hidden md:flex flex-1 max-w-lg items-center relative">
              <div className="relative w-full flex items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-r-0 border-slate-200 text-slate-700 text-xs font-bold rounded-l-xl py-2.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search catalog assets, brands, SKUs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-r-xl py-2.5 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-28 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions & Customer Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {viewMode === 'storefront' && (
              <>
                {/* Compare */}
                <button
                  onClick={() => onNavigateCustomerTab?.('compare')}
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-colors hidden sm:flex items-center gap-1"
                  title="Product Compare"
                >
                  <Scale className="w-4 h-4" />
                  {compareList.length > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {compareList.length}
                    </span>
                  )}
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-colors"
                  title="Wishlist"
                >
                  <Heart className="w-4 h-4" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                {/* Cart Drawer Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 border border-slate-800"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Bag</span>
                  <span className="bg-blue-600 text-white text-[11px] font-black px-1.5 py-0.5 rounded-md">
                    {totalCartCount}
                  </span>
                </button>
              </>
            )}

            {/* Customer Auth / Account Control */}
            {!currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="Customer Login / Register"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium leading-none">
                      {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Customer VIP'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-slate-400 text-[11px]">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigateCustomerTab?.('account');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Orders & Account
                      </button>

                      {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'STORE_ADMIN') && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setViewMode('admin');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-indigo-700 flex items-center gap-2 font-bold"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-600" />
                          Admin Control Panel
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1 px-4 py-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Quick Switch Persona
                      </p>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            switchUserRole('admin@enterprise.com');
                            setIsUserMenuOpen(false);
                          }}
                          className="text-left py-1 text-slate-600 hover:text-slate-900 font-medium"
                        >
                          ⚡ Switch to Admin
                        </button>
                        <button
                          onClick={() => {
                            switchUserRole('customer@example.com');
                            setIsUserMenuOpen(false);
                          }}
                          className="text-left py-1 text-slate-600 hover:text-slate-900 font-medium"
                        >
                          👤 Switch to Customer
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                      <button
                        onClick={() => {
                          setCurrentUser(null);
                          setIsUserMenuOpen(false);
                          addToast('Signed out successfully', 'info');
                          onNavigateCustomerTab?.('shop');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 font-bold"
                      >
                        <LogIn className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white p-4 space-y-4">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setViewMode('storefront');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg text-center ${
                viewMode === 'storefront' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Storefront
            </button>
            <button
              onClick={() => {
                setViewMode('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg text-center ${
                viewMode === 'admin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Admin Dashboard
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-xs py-2.5 px-3 rounded-xl border-none font-bold"
            />
          </div>

          {viewMode === 'storefront' && (
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Navigation Menu</p>
              <button
                onClick={() => {
                  onNavigateCustomerTab?.('shop');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs font-black text-slate-800 rounded-lg"
              >
                🛍️ Go To Shop
              </button>
              <button
                onClick={() => {
                  onNavigateCustomerTab?.('categories');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs font-black text-indigo-600 rounded-lg"
              >
                📂 Explore Categories
              </button>
              <button
                onClick={() => {
                  onNavigateCustomerTab?.('blog');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs font-black text-slate-800 rounded-lg"
              >
                📝 Blog Articles
              </button>
            </div>
          )}
        </div>
      )}

      </header>

      {/* Customer Login & Registration Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => {
          if (onNavigateCustomerTab) {
            onNavigateCustomerTab('shop');
          }
        }}
      />
    </>
  );
};
