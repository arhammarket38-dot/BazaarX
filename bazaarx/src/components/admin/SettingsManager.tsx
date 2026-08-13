import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import { Settings, Save, RotateCcw, ShieldAlert, Check, Globe, DollarSign, Mail, Phone, Truck, Percent, Sparkles } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { addToast, refreshSettings } = useStore();
  const [formData, setFormData] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    } catch {
      addToast('Failed loading store settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast('Store configuration saved successfully!', 'success');
        refreshSettings();
      } else {
        addToast('Failed to save store settings', 'error');
      }
    } catch {
      addToast('Error updating store settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSeed = async () => {
    if (confirm('CRITICAL ACTION: Reset database to original seed state? All newly created items/orders will be cleared.')) {
      setIsResetting(true);
      try {
        const res = await fetch('/api/seed/reset', { method: 'POST' });
        if (res.ok) {
          addToast('Database successfully reset to initial seed state!', 'success');
          window.location.reload();
        } else {
          addToast('Failed to reset database', 'error');
        }
      } catch {
        addToast('Error during database reset', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  if (loading || !formData) {
    return <div className="p-12 text-center text-xs font-bold text-slate-400">Loading store settings...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Enterprise Store Configuration</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Global tax rates, shipping free thresholds, currency symbols, and database seed controls.
          </p>
        </div>
        <button
          onClick={handleResetSeed}
          disabled={isResetting}
          className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset Database Seed
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Store Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" /> General Store Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-extrabold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email Address</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Financial & Shipping */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" /> Tax & Shipping Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Shipping Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.standardShippingFee}
                onChange={(e) => setFormData({ ...formData, standardShippingFee: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Free Shipping Threshold ($)</label>
              <input
                type="number"
                step="1"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Automated Features & Controls
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoApproveReviews}
                onChange={(e) => setFormData({ ...formData, autoApproveReviews: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <p className="font-extrabold text-slate-900">Auto-Approve Customer Reviews</p>
                <p className="text-[11px] text-slate-500">Automatically publish verified buyer reviews on product pages without manual moderation.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableLoyalty}
                onChange={(e) => setFormData({ ...formData, enableLoyalty: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <p className="font-extrabold text-slate-900">Enable Customer Loyalty Program</p>
                <p className="text-[11px] text-slate-500">Earn rewards points on checkout for logged in users.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <div>
                <p className="font-extrabold text-rose-700">Maintenance Mode Lockout</p>
                <p className="text-[11px] text-slate-500">Temporarily restrict customer purchases for backend upgrades.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Config...' : 'Save Configuration Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
