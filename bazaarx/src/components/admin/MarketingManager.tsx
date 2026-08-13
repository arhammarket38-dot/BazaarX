import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Coupon, FlashSale } from '../../types';
import { Tag, Plus, Zap, Percent, Clock, Check, X, Copy, Sparkles } from 'lucide-react';

export const MarketingManager: React.FC = () => {
  const { addToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    value: 15,
    minSpend: 50,
    usageLimit: 100,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, fRes] = await Promise.all([
        fetch('/api/coupons'),
        fetch('/api/flash-sales'),
      ]);
      if (cRes.ok) setCoupons(await cRes.json());
      if (fRes.ok) setFlashSales(await fRes.json());
    } catch {
      addToast('Failed loading marketing campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });

      if (res.ok) {
        addToast(`Created promo code "${newCoupon.code.toUpperCase()}"`, 'success');
        setIsModalOpen(false);
        setNewCoupon({
          code: '',
          discountType: 'PERCENTAGE',
          value: 15,
          minSpend: 50,
          usageLimit: 100,
        });
        fetchData();
      } else {
        addToast('Failed to create coupon code', 'error');
      }
    } catch {
      addToast('Error saving coupon code', 'error');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast(`Copied code "${code}" to clipboard!`, 'info');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Marketing & Promotional Engine</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure discount vouchers, threshold perks, and seasonal flash sale events.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Promo Voucher
        </button>
      </div>

      {/* Active Flash Sale Showcase */}
      {flashSales.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Live Flash Sale Campaign
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {flashSales.map((fs) => (
              <div key={fs.id} className="relative rounded-2xl bg-slate-900 text-white p-6 overflow-hidden border border-slate-800 shadow-lg flex flex-col justify-between space-y-4">
                <img
                  src={fs.bannerImage}
                  alt={fs.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
                />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-2">
                      {fs.discountPercentage}% OFF ALL ITEMS
                    </span>
                    <h3 className="text-lg font-black">{fs.title}</h3>
                  </div>
                  <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] px-2.5 py-1 rounded-lg">
                    ACTIVE
                  </span>
                </div>
                <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-300 pt-3 border-t border-slate-800">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> Ends 2026-12-31</span>
                  <span>{fs.productIds.length} Products Discounted</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coupons List Bento */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Discount Vouchers & Promo Codes</h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-bold">Loading vouchers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 font-mono font-black text-sm px-3 py-1 rounded-xl flex items-center gap-1">
                      {c.code}
                      <button onClick={() => copyCode(c.code)} className="text-blue-500 hover:text-blue-800 ml-1">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      c.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-xl font-black text-slate-900">
                      {c.discountType === 'PERCENTAGE' && `${c.value}% OFF`}
                      {c.discountType === 'FIXED' && `$${c.value} OFF`}
                      {c.discountType === 'FREE_SHIPPING' && `FREE SHIPPING`}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Min Spend: ${c.minSpend || 0} | Usage: {c.usageCount} / {c.usageLimit}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Expires: {new Date(c.expiryDate).toLocaleDateString()}</span>
                  <span className="font-bold text-slate-700">{c.discountType}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-slate-900 mb-4">Create Promo Code</h2>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AURA15"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED">FIXED AMOUNT ($)</option>
                    <option value="FREE_SHIPPING">FREE SHIPPING</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    value={newCoupon.minSpend}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minSpend: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Usage Limit</label>
                  <input
                    type="number"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-sm"
                >
                  <Check className="w-4 h-4" /> Save Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
