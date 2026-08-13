import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
  } = useStore();

  if (!isWishlistOpen) return null;

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h3 className="font-extrabold text-slate-900 text-base">Saved Wishlist ({savedProducts.length})</h3>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {savedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-400 flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Your wishlist is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Save your favorite tech, luxury apparel, and minimalist items to buy later.
                </p>
              </div>
            ) : (
              savedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 relative group"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-20 h-20 object-cover rounded-xl shrink-0 bg-white"
                  />

                  <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs truncate">{p.title}</h4>
                      <p className="text-xs font-black text-slate-900 mt-1">
                        ${p.flashSalePrice || p.price}{' '}
                        {p.compareAtPrice && (
                          <span className="line-through text-slate-400 text-[10px] font-normal ml-1">
                            ${p.compareAtPrice}
                          </span>
                        )}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] font-bold ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(p);
                        toggleWishlist(p.id);
                      }}
                      className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
