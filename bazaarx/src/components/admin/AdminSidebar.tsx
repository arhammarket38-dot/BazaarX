import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Warehouse,
  Megaphone,
  BarChart3,
  ShieldAlert,
  Settings,
  Store,
  RotateCcw,
  Tv,
  Cpu,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { adminTab, setAdminTab, setViewMode, addToast, refreshProducts } = useStore();

  const handleResetDb = async () => {
    if (confirm('Reset database back to initial seed data?')) {
      try {
        const res = await fetch('/api/seed/reset', { method: 'POST' });
        if (res.ok) {
          addToast('Database reset to fresh initial seed!', 'success');
          refreshProducts();
        }
      } catch {
        addToast('Failed resetting database', 'error');
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products Catalog', icon: Package },
    { id: 'categories', label: 'Categories & Tree', icon: FolderTree },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'inventory', label: 'Inventory & Warehouses', icon: Warehouse },
    { id: 'marketing', label: 'Coupons & Flash Sales', icon: Megaphone },
    { id: 'ads', label: 'Ads & Banners', icon: Tv },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'agents', label: 'AI Agent Permissions', icon: Cpu },
    { id: 'audit', label: 'Security & Audit Logs', icon: ShieldAlert },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 min-h-screen border-r border-slate-800 shrink-0">
      <div className="space-y-6">
        {/* Brand header */}
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-lg">
              A
            </div>
            <div>
              <h2 className="font-black text-white text-sm leading-none">AURA ADMIN</h2>
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">
                ENTERPRISE V3.0
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => setViewMode('storefront')}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
        >
          <Store className="w-4 h-4 text-emerald-400" /> Switch to Storefront
        </button>
        <button
          onClick={handleResetDb}
          className="w-full flex items-center justify-center gap-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-[11px] py-2 rounded-xl transition-all border border-rose-800/40"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Re-Seed Demo Database
        </button>
      </div>
    </aside>
  );
};
