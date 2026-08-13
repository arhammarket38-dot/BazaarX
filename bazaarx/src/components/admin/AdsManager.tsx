import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdCampaign } from '../../types';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  Tv,
  Plus,
  Search,
  Check,
  X,
  Edit3,
  Trash2,
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Layout,
  Image as ImageIcon,
} from 'lucide-react';

export const AdsManager: React.FC = () => {
  const { addToast, refreshAds } = useStore();
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdCampaign | null>(null);
  const [adToDelete, setAdToDelete] = useState<AdCampaign | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    type: 'HERO_BANNER' as AdCampaign['type'],
    placement: 'HOME_HERO' as AdCampaign['placement'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    targetUrl: '/shop',
    ctaText: 'Shop Now',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '2026-12-31',
    budget: 500,
    status: 'ACTIVE' as AdCampaign['status'],
  });

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setAds(data);
        refreshAds();
      }
    } catch {
      addToast('Failed loading ad campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      subtitle: '',
      type: 'HERO_BANNER',
      placement: 'HOME_HERO',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
      targetUrl: '/shop',
      ctaText: 'Shop Now',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2026-12-31',
      budget: 500,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad: AdCampaign) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      subtitle: ad.subtitle || '',
      type: ad.type,
      placement: ad.placement,
      image: ad.image,
      targetUrl: ad.targetUrl,
      ctaText: ad.ctaText,
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : '2026-12-31',
      budget: ad.budget,
      status: ad.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('Please enter campaign title', 'error');
      return;
    }

    try {
      const url = editingAd ? `/api/ads/${editingAd.id}` : '/api/ads';
      const method = editingAd ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast(
          editingAd
            ? `Updated ad campaign "${formData.title}"`
            : `Created new ad campaign "${formData.title}"`,
          'success'
        );
        setIsModalOpen(false);
        fetchAds();
      } else {
        addToast('Failed saving ad campaign', 'error');
      }
    } catch {
      addToast('Error processing ad campaign request', 'error');
    }
  };

  const handleToggleStatus = async (ad: AdCampaign) => {
    const nextStatus = ad.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        addToast(`Ad campaign "${ad.title}" set to ${nextStatus}`, 'info');
        fetchAds();
      }
    } catch {
      addToast('Failed toggling status', 'error');
    }
  };

  const handleDeleteAd = async (ad: AdCampaign) => {
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        addToast(`Ad campaign "${ad.title}" deleted`, 'info');
        setAdToDelete(null);
        fetchAds();
      }
    } catch {
      addToast('Failed deleting ad campaign', 'error');
    }
  };

  // Filter logic
  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ad.subtitle && ad.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ad.placement.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || ad.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || ad.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Analytics Metrics
  const totalActive = ads.filter((a) => a.status === 'ACTIVE').length;
  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const totalBudget = ads.reduce((sum, a) => sum + (a.budget || 0), 0);
  const avgCtr = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Ads & Banners Management</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Control promotional banners, hero sliders, sidebar sponsors, and interactive popups.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Ad Campaign
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Campaigns</span>
            <Tv className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalActive}</p>
          <span className="text-[10px] text-slate-400 font-medium">out of {ads.length} total ads</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Impressions</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalImpressions.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold">+14.2% this week</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalClicks.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium">Customer interactions</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg CTR Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{avgCtr}%</p>
          <span className="text-[10px] text-emerald-600 font-bold">Above benchmark</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Ad Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">${totalBudget.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium">Allocated spend</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search campaigns or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Ad Types</option>
            <option value="HERO_BANNER">Hero Banner</option>
            <option value="TOP_HEADER_BAR">Header Bar</option>
            <option value="SIDEBAR_PROMO">Sidebar Promo</option>
            <option value="POPUP_INTERSTITIAL">Popup Banner</option>
            <option value="CATEGORY_SPONSORED">Category Sponsor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Ad Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">Loading ad campaigns...</div>
      ) : filteredAds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Tv className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Ad Campaigns Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or create a new campaign.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => {
            const ctr = ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={ad.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Banner Media Preview */}
                <div className="relative h-44 bg-slate-900 group">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 p-4 flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between">
                      <span className="bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {ad.type.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                          ad.status === 'ACTIVE'
                            ? 'bg-emerald-500/80 text-white border-emerald-400'
                            : 'bg-slate-700/80 text-slate-200 border-slate-600'
                        }`}
                      >
                        {ad.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm line-clamp-1">{ad.title}</h3>
                      {ad.subtitle && <p className="text-[11px] text-slate-300 line-clamp-1">{ad.subtitle}</p>}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Layout className="w-3.5 h-3.5 text-slate-400" /> Placement:
                      </span>
                      <strong className="text-slate-800 font-bold">{ad.placement}</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Target URL:
                      </span>
                      <span className="text-indigo-600 font-bold truncate max-w-[150px]">{ad.targetUrl}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>CTA Button:</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-700">
                        {ad.ctaText}
                      </span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center font-mono">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Views</span>
                      <strong className="text-xs text-slate-900">{ad.impressions.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Clicks</span>
                      <strong className="text-xs text-indigo-600">{ad.clicks.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">CTR</span>
                      <strong className="text-xs text-emerald-600">{ctr}%</strong>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStatus(ad)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ad.status === 'ACTIVE'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {ad.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> Activate
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(ad)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Ad Campaign"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAdToDelete(ad)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-slate-900 mb-4">
              {editingAd ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 Architectural Hardware Flash Clearance"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subheadline / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Discover beryllium acoustics & leather gear"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ad Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  >
                    <option value="HERO_BANNER">Hero Banner</option>
                    <option value="TOP_HEADER_BAR">Header Bar</option>
                    <option value="SIDEBAR_PROMO">Sidebar Promo</option>
                    <option value="POPUP_INTERSTITIAL">Popup Banner</option>
                    <option value="CATEGORY_SPONSORED">Category Sponsor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Placement</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  >
                    <option value="HOME_HERO">Home Main Hero Slider</option>
                    <option value="HEADER_ANNOUNCEMENT">Top Announcement Bar</option>
                    <option value="PRODUCT_SIDEBAR">Product Sidebar</option>
                    <option value="CART_POPUP">Cart / Checkout Modal</option>
                    <option value="FEATURED_GRID">Featured Category Grid</option>
                  </select>
                </div>
              </div>

              <ImageUploadInput
                label="Campaign Banner Image"
                value={formData.image}
                onChange={(val) => setFormData({ ...formData, image: val })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Link URL</label>
                  <input
                    type="text"
                    required
                    placeholder="/shop or /category/electronics"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    required
                    placeholder="Shop Now"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="SCHEDULED">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {adToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Delete Ad Campaign?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">{adToDelete.title}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAd(adToDelete)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer flex-1 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
