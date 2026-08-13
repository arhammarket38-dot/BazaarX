import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  Check,
  ShoppingBag,
  Heart,
  Scale,
  Truck,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  Share2,
} from 'lucide-react';
import { Review } from '../../types';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    toggleWishlist,
    wishlist,
    toggleCompare,
    setIsCheckoutOpen,
    addToast,
  } = useStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [zipInput, setZipInput] = useState('');
  const [zipResult, setZipResult] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  // Review submission state
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIdx(0);
      setSelectedVariantId(selectedProduct.variants[0]?.id || '');
      setQuantity(1);

      // Fetch reviews
      fetch(`/api/products/${selectedProduct.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.reviews) setReviewsList(data.reviews);
        })
        .catch((e) => console.error('Failed fetching reviews', e));
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isSavedInWishlist = wishlist.includes(selectedProduct.id);
  const activeVariant = selectedProduct.variants.find((v) => v.id === selectedVariantId);
  const effectivePrice = activeVariant?.price || selectedProduct.flashSalePrice || selectedProduct.price;

  const handleAddToCart = (buyNow = false) => {
    addToCart(selectedProduct, quantity, selectedVariantId);
    if (buyNow) {
      setSelectedProduct(null);
      setIsCheckoutOpen(true);
    }
  };

  const handleCheckZip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipInput.trim()) return;
    setZipResult(`Express delivery available to zip code ${zipInput}. Guaranteed arrival in 2-3 days.`);
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          userName: 'Marcus Vance',
          rating: newReviewRating,
          title: newReviewTitle || 'High quality product!',
          comment: newReviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewsList((prev) => [data, ...prev]);
        addToast('Review submitted successfully!', 'success');
        setNewReviewTitle('');
        setNewReviewComment('');
      }
    } catch {
      addToast('Failed submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 relative max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Main Top Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group">
                <img
                  src={selectedProduct.images[activeImageIdx] || selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {selectedProduct.isFlashSale && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Flash Clearance
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIdx === idx ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Overview & Variants */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">
                  {selectedProduct.brand}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mt-1">
                  {selectedProduct.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(selectedProduct.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{selectedProduct.rating}</span>
                  <span className="text-xs text-slate-400">({selectedProduct.reviewCount} customer reviews)</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500 font-mono">SKU: {selectedProduct.sku}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-2xl font-black text-slate-900">${effectivePrice.toFixed(2)}</span>
                {selectedProduct.compareAtPrice && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    ${selectedProduct.compareAtPrice.toFixed(2)}
                  </span>
                )}
                <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                  selectedProduct.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} left)` : 'Out of Stock'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{selectedProduct.shortDescription}</p>

              {/* Variants Selector */}
              {selectedProduct.variants.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">Select Variant / Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          selectedVariantId === v.id
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:border-slate-400 bg-white'
                        }`}
                      >
                        {v.colorHex && (
                          <span
                            className="w-3 h-3 rounded-full border border-white/40"
                            style={{ backgroundColor: v.colorHex }}
                          />
                        )}
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-3">
                <div className="flex gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 font-bold text-slate-700 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-extrabold text-xs">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 font-bold text-slate-700 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(false)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" /> Add to Shopping Cart
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl py-3 text-center shadow-md active:scale-95 transition-all"
                  >
                    Buy Now Express
                  </button>
                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className={`p-3 rounded-xl border ${
                      isSavedInWishlist ? 'border-rose-500 text-rose-500 bg-rose-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSavedInWishlist ? 'fill-rose-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleCompare(selectedProduct)}
                    className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Scale className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delivery Availability Checker */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                <form onSubmit={handleCheckZip} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter zip code (e.g. 10001)"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs focus:outline-none"
                  />
                  <button type="submit" className="bg-slate-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs">
                    Check Delivery
                  </button>
                </form>
                {zipResult && <p className="text-[11px] text-emerald-700 font-semibold mt-1.5">{zipResult}</p>}
              </div>
            </div>
          </div>

          {/* Details Tabs Section */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-3 ${activeTab === 'description' ? 'border-b-2 border-slate-900 text-slate-900' : ''}`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 ${activeTab === 'specs' ? 'border-b-2 border-slate-900 text-slate-900' : ''}`}
              >
                Specifications & Warranty
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 ${activeTab === 'reviews' ? 'border-b-2 border-slate-900 text-slate-900' : ''}`}
              >
                Customer Reviews ({reviewsList.length})
              </button>
            </div>

            <div className="py-4 text-xs text-slate-700">
              {activeTab === 'description' && (
                <div className="space-y-3 leading-relaxed">
                  <p>{selectedProduct.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="font-bold text-slate-900">Express Delivery</p>
                        <p className="text-[10px] text-slate-500">Dispatch in 24 hours</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-bold text-slate-900">Official Warranty</p>
                        <p className="text-[10px] text-slate-500">{selectedProduct.warrantyInfo || '2 Years Replacement'}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-bold text-slate-900">Hassle Free Returns</p>
                        <p className="text-[10px] text-slate-500">30-day money back guarantee</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {selectedProduct.specifications.map((spec, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-2 font-bold text-slate-900 w-1/3">{spec.key}</td>
                          <td className="py-2 text-slate-600">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews Form */}
                  <form onSubmit={handlePostReview} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900">Write a Customer Review</h4>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-medium text-slate-600">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="text-amber-400"
                        >
                          <Star className={`w-4 h-4 ${star <= newReviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Review Headline (e.g. Exceptional sound and comfort)"
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                    />
                    <textarea
                      placeholder="Share details about durability, performance, fit, or design..."
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl"
                    >
                      Post Review
                    </button>
                  </form>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{rev.userName}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <h5 className="font-bold text-slate-900">{rev.title}</h5>
                        <p className="text-slate-600 text-xs">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
