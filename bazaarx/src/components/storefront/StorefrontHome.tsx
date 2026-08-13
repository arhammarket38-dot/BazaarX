import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Star,
  ShoppingBag,
  Heart,
  Scale,
  Eye,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Grid,
  List,
  ChevronRight,
  Zap,
  X,
} from 'lucide-react';
import { Product } from '../../types';

export const StorefrontHome: React.FC = () => {
  const {
    products,
    categories,
    ads,
    recordAdClick,
    loadingProducts,
    setSelectedProduct,
    addToCart,
    toggleWishlist,
    wishlist,
    toggleCompare,
    compareList,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useStore();

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(600);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortOption, setSortOption] = useState<string>('best_selling');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'flash' | 'trending' | 'new'>('all');

  // Filter products
  let filteredProducts = products.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (selectedBrand && p.brand !== selectedBrand) return false;
    if (p.price > maxPriceFilter) return false;
    if (minRatingFilter > 0 && p.rating < minRatingFilter) return false;

    if (activeTab === 'flash' && !p.isFlashSale) return false;
    if (activeTab === 'trending' && !p.isTrending) return false;
    if (activeTab === 'new' && !p.isNewArrival) return false;

    return true;
  });

  // Sort
  if (sortOption === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (sortOption === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    filteredProducts.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  }

  const flashProducts = products.filter((p) => p.isFlashSale);

  const activeAds = ads?.filter((a) => a.status === 'ACTIVE') || [];
  const heroAd = activeAds.find((a) => a.type === 'HERO_BANNER' || a.placement === 'HOME_HERO');
  const promoAd = activeAds.find((a) => a.type === 'SIDEBAR_PROMO' || a.placement === 'PRODUCT_SIDEBAR');
  const popupAd = activeAds.find((a) => a.type === 'POPUP_INTERSTITIAL' || a.placement === 'CART_POPUP');

  const [dismissedPopup, setDismissedPopup] = useState(false);

  return (
    <div className="space-y-12 pb-16 relative">
      {/* Hero Showcase Slider / Dynamic Ad Banner */}
      {!searchQuery && !selectedCategory && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {heroAd ? (
            <div className="relative rounded-3xl bg-slate-950 text-white overflow-hidden shadow-2xl min-h-[420px] flex items-center border border-slate-800 group">
              <img
                src={heroAd.image}
                alt={heroAd.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent p-8 sm:p-12 md:p-14 max-w-2xl flex flex-col justify-center space-y-5">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest self-start backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" /> FEATURED CAMPAIGN
                </span>
                <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tighter text-white">
                  {heroAd.title}
                </h1>
                {heroAd.subtitle && (
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                    {heroAd.subtitle}
                  </p>
                )}
                <div className="pt-2">
                  <a
                    href={heroAd.targetUrl}
                    onClick={() => recordAdClick(heroAd.id)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {heroAd.ctaText || 'Shop Now'} <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl bg-slate-900 text-white overflow-hidden shadow-xl min-h-[400px] flex items-center border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80"
                alt="Hero Showcase"
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
              />
              <div className="relative z-10 p-8 sm:p-12 md:p-14 max-w-2xl space-y-5">
                <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" /> 2026 Architectural Hardware
                </span>
                <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tighter text-white">
                  Precision Hardware<span className="text-blue-500">.</span> <br />
                  <span className="text-slate-300 font-bold">
                    Bento Modular Craft.
                  </span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg font-medium">
                  Discover beryllium acoustics, full-grain Italian leather desk accessories, and high-CRI workspace lighting engineered for high performance.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('flash')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Shop Flash Clearance
                  </button>
                  <button
                    onClick={() => setSelectedCategory('cat_electronics')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3 rounded-xl backdrop-blur-md transition-all border border-white/10 cursor-pointer"
                  >
                    Explore Studio Headphones
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Featured Categories Grid */}
      {!searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Explore Catalog</span>
              <h2 className="text-xl font-extrabold text-slate-900">Curated Category Collections</h2>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
              >
                Clear Category Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCategory(isSelected ? '' : c.id)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-slate-900 ring-2 ring-slate-900/20 shadow-lg scale-102'
                      : 'border-slate-100 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="aspect-4/3 bg-slate-100 overflow-hidden relative">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-extrabold text-xs leading-tight">{c.name}</h4>
                      <p className="text-[10px] text-slate-300 font-medium">{c.itemCount || 4} Products</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Flash Sale Countdown Bar */}
      {flashProducts.length > 0 && !searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-rose-900/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/30 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase">
                  LIMITED TIME FLASH SALE
                </span>
                <h3 className="text-lg font-black text-white">Save Up To 45% On Select Bestsellers</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">Offer Ends In:</span>
              <div className="flex gap-2 text-center font-mono font-black text-xs">
                <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                  <span className="text-amber-300">08</span> <span className="text-[9px] text-slate-400 block font-sans">HRS</span>
                </div>
                <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                  <span className="text-amber-300">42</span> <span className="text-[9px] text-slate-400 block font-sans">MIN</span>
                </div>
                <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                  <span className="text-amber-300">18</span> <span className="text-[9px] text-slate-400 block font-sans">SEC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Catalog Toolbar & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Catalog Filter Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          {/* Tab Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('flash')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'flash' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Flash Sales
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'trending' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Trending Bestsellers
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'new' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              New Arrivals
            </button>
          </div>

          {/* Sort & Grid Layout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl py-2 px-3 focus:outline-none"
              >
                <option value="best_selling">Featured / Best Selling</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rated</option>
                <option value="newest">Newest Releases</option>
              </select>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg text-slate-600 ${
                  viewLayout === 'grid' ? 'bg-white shadow-xs text-slate-900' : ''
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-lg text-slate-600 ${
                  viewLayout === 'list' ? 'bg-white shadow-xs text-slate-900' : ''
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search status query bar */}
        {(searchQuery || selectedCategory || selectedBrand) && (
          <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900">
            <span>
              Showing results for:{' '}
              {searchQuery && <strong className="mr-2">"{searchQuery}"</strong>}
              {selectedCategory && (
                <span className="bg-indigo-200/60 px-2 py-0.5 rounded font-bold mr-2">
                  Cat: {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              )}
              ({filteredProducts.length} items found)
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedBrand('');
              }}
              className="font-bold text-indigo-700 hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Product Cards Listing */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-100 animate-pulse h-80 rounded-3xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
            <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-lg">No products match your active filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting search keywords or adjusting price range to view our complete collection.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedBrand('');
                setActiveTab('all');
              }}
              className="mt-2 bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewLayout === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredProducts.map((p) => {
              const isSavedInWishlist = wishlist.includes(p.id);
              const isComparing = compareList.some((cp) => cp.id === p.id);
              const effectivePrice = p.flashSalePrice || p.price;

              if (viewLayout === 'list') {
                return (
                  <div
                    key={p.id}
                    className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center"
                  >
                    <img src={p.images[0]} alt="" className="w-36 h-36 object-cover rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2 text-left">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600">{p.brand}</span>
                      <h3 className="font-extrabold text-slate-900 text-base">{p.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.shortDescription}</p>
                      <div className="flex items-center gap-2 text-amber-400">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="font-bold text-xs text-slate-800">{p.rating}</span>
                        <span className="text-xs text-slate-400">({p.reviewCount})</span>
                      </div>
                    </div>
                    <div className="text-right space-y-3 min-w-[160px]">
                      <div>
                        <span className="text-xl font-black text-slate-900">${effectivePrice.toFixed(2)}</span>
                        {p.compareAtPrice && (
                          <span className="block text-xs text-slate-400 line-through">${p.compareAtPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="Quick View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToCart(p)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={p.id}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                >
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
                    {p.isFlashSale && (
                      <span className="bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Flash Sale
                      </span>
                    )}
                    {p.isBestSeller && !p.isFlashSale && (
                      <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Best Seller
                      </span>
                    )}
                  </div>

                  {/* Top Wishlist / Compare float buttons */}
                  <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className={`p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${
                        isSavedInWishlist ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSavedInWishlist ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleCompare(p)}
                      className={`p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${
                        isComparing ? 'bg-indigo-600 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Scale className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image */}
                  <div
                    onClick={() => setSelectedProduct(p)}
                    className="aspect-square bg-slate-50 overflow-hidden relative cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600">{p.brand}</span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {p.rating}
                        </div>
                      </div>

                      <h3
                        onClick={() => setSelectedProduct(p)}
                        className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        {p.title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-slate-900">${effectivePrice.toFixed(2)}</span>
                        {p.compareAtPrice && (
                          <span className="text-[11px] text-slate-400 line-through font-medium ml-1.5">
                            ${p.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(p)}
                        className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl shadow-md active:scale-95 transition-all"
                        title="Add to Shopping Cart"
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Sidebar Promo / Catalog Ad Banner */}
        {promoAd && (
          <div className="mt-12 max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group">
              <img
                src={promoAd.image}
                alt={promoAd.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-102 transition-transform duration-500"
              />
              <div className="relative z-10 space-y-2 max-w-xl">
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  SPONSORED PROMO
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white">{promoAd.title}</h3>
                {promoAd.subtitle && <p className="text-xs text-slate-300 font-medium">{promoAd.subtitle}</p>}
              </div>
              <div className="relative z-10 shrink-0">
                <a
                  href={promoAd.targetUrl}
                  onClick={() => recordAdClick(promoAd.id)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {promoAd.ctaText || 'Explore Now'} <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Interactive Popup Ad */}
      {popupAd && !dismissedPopup && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl p-4 relative overflow-hidden group">
            <button
              onClick={() => setDismissedPopup(true)}
              className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black text-slate-300 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative h-28 rounded-2xl overflow-hidden mb-3">
              <img src={popupAd.image} alt={popupAd.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">EXCLUSIVE PROMO</span>
              <h4 className="font-extrabold text-xs text-white line-clamp-1">{popupAd.title}</h4>
              {popupAd.subtitle && <p className="text-[11px] text-slate-300 line-clamp-2">{popupAd.subtitle}</p>}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
              <a
                href={popupAd.targetUrl}
                onClick={() => {
                  recordAdClick(popupAd.id);
                  setDismissedPopup(true);
                }}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {popupAd.ctaText || 'Claim Offer'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
