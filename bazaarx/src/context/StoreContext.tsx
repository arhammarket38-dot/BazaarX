import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  User,
  Coupon,
  StoreSettings,
  Category,
  Order,
  AdCampaign,
} from '../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  // Navigation Mode
  viewMode: 'storefront' | 'admin';
  setViewMode: (mode: 'storefront' | 'admin') => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;

  // App Settings
  settings: StoreSettings | null;
  refreshSettings: () => void;

  // Auth User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUserRole: (email: string) => void;

  // Catalog Data
  products: Product[];
  categories: Category[];
  ads: AdCampaign[];
  loadingProducts: boolean;
  refreshProducts: () => void;
  refreshAds: () => void;
  recordAdClick: (adId: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;

  // Cart Management
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  cartSubtotal: number;
  cartGrandTotal: number;

  // Wishlist & Compare
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  compareList: Product[];
  toggleCompare: (product: Product) => void;

  // Quick Drawers/Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Order Placement callback trigger
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (o: Order | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('aura_token', `mock_jwt_token_${user.id}`);
    } else {
      localStorage.removeItem('aura_token');
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? JSON.parse(saved) : ['prod_1', 'prod_4'];
    } catch {
      return ['prod_1', 'prod_4'];
    }
  });

  const [compareList, setCompareList] = useState<Product[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Settings & Catalog
  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Failed fetching settings', e);
    }
  };

  const refreshProducts = async () => {
    setLoadingProducts(true);
    try {
      const [resProd, resCat, resAds] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/ads'),
      ]);
      if (resProd.ok) setProducts(await resProd.json());
      if (resCat.ok) setCategories(await resCat.json());
      if (resAds.ok) setAds(await resAds.json());
    } catch (e) {
      console.error('Failed fetching catalog', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const refreshAds = async () => {
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        setAds(await res.json());
      }
    } catch (e) {
      console.error('Failed fetching ads', e);
    }
  };

  const recordAdClick = async (adId: string) => {
    try {
      await fetch(`/api/ads/${adId}/click`, { method: 'POST' });
    } catch {
      // ignore
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const savedToken = localStorage.getItem('aura_token') || 'mock_jwt_token_usr_cust1';
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserState(data.user);
      }
    } catch (e) {
      console.error('Auth error', e);
    }
  };

  const switchUserRole = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'STORE_ADMIN') {
          setViewMode('admin');
        } else {
          setViewMode('storefront');
        }
        addToast(`Switched account to ${data.user.name} (${data.user.role})`, 'info');
      }
    } catch (e) {
      console.error('Failed switching user', e);
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshProducts();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (settings?.storeName) {
      document.title = settings.storeName;
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variantId?: string) => {
    const variant = variantId ? product.variants.find((v) => v.id === variantId) : undefined;
    const cartItemId = `${product.id}_${variantId || 'default'}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          product,
          variantId,
          variant,
          quantity,
        },
      ];
    });

    addToast(`Added "${product.title}" to your cart!`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    addToast('Item removed from cart.', 'info');
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.variant?.price || item.product.flashSalePrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSubtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount);
        addToast(`Coupon "${data.coupon.code}" applied successfully!`, 'success');
        return true;
      } else {
        addToast(data.error || 'Invalid coupon code', 'error');
        return false;
      }
    } catch {
      addToast('Failed validating coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    addToast('Coupon code removed', 'info');
  };

  const shippingFee = cartSubtotal >= (settings?.freeShippingThreshold || 99) ? 0 : (settings?.standardShippingFee || 9.99);
  const taxFee = Math.round(((cartSubtotal - couponDiscount) * (settings?.taxRate || 8.5)) / 100 * 100) / 100;
  const cartGrandTotal = Math.max(0, cartSubtotal - couponDiscount + shippingFee + taxFee);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed item from your wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast('Saved product to your wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        addToast(`Removed "${product.title}" from comparison`, 'info');
        return prev.filter((p) => p.id !== product.id);
      } else {
        if (prev.length >= 4) {
          addToast('You can compare up to 4 products at once', 'error');
          return prev;
        }
        addToast(`Added "${product.title}" to comparison`, 'success');
        return [...prev, product];
      }
    });
  };

  return (
    <StoreContext.Provider
      value={{
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,
        settings,
        refreshSettings,
        currentUser,
        setCurrentUser,
        switchUserRole,
        products,
        categories,
        ads,
        loadingProducts,
        refreshProducts,
        refreshAds,
        recordAdClick,
        selectedProduct,
        setSelectedProduct,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        couponDiscount,
        applyCouponCode,
        removeCoupon,
        cartSubtotal,
        cartGrandTotal,
        wishlist,
        toggleWishlist,
        compareList,
        toggleCompare,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        toasts,
        addToast,
        removeToast,
        lastCreatedOrder,
        setLastCreatedOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
