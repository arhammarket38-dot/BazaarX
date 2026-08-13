import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Warehouse } from '../../types';
import { Warehouse as WarehouseIcon, Search, AlertTriangle, CheckCircle, RefreshCw, Plus, Minus, MapPin } from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { products, refreshProducts, addToast } = useStore();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK'>('ALL');

  const fetchInventoryData = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data.warehouses || []);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'LOW' && p.stock > p.lowStockThreshold) return false;
    if (stockFilter === 'IN_STOCK' && p.stock <= 0) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleAdjustStock = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, stock: newStock }),
      });

      if (res.ok) {
        addToast(`Updated stock for ${p.title} to ${newStock} units`, 'info');
        refreshProducts();
      }
    } catch {
      addToast('Failed to adjust stock level', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <WarehouseIcon className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Inventory & Multi-Warehouse Hub</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monitor real-time warehouse stock reserves, reorder thresholds, and quick-adjust inventory counts.
          </p>
        </div>
        <button
          onClick={refreshProducts}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Inventory
        </button>
      </div>

      {/* Warehouses Bento Summary */}
      {warehouses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div key={wh.id} className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-blue-400 font-extrabold uppercase">{wh.code}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> Active Hub
                </span>
              </div>
              <h3 className="font-extrabold text-sm">{wh.name}</h3>
              <p className="text-[11px] text-slate-400">{wh.address}</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Manager: {wh.manager}</span>
                <span>{wh.contactEmail}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search catalog inventory by title, SKU, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStockFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              stockFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('LOW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              stockFilter === 'LOW' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Low Stock Alerts ({products.filter((p) => p.stock <= p.lowStockThreshold).length})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="p-4">Product Asset</th>
                <th className="p-4">SKU / Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Threshold</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Quick Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-cover rounded-xl border border-slate-200" />
                        <div>
                          <p className="font-extrabold text-slate-900 line-clamp-1">{p.title}</p>
                          <p className="text-[10px] text-slate-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">{p.sku}</td>
                    <td className="p-4 font-black text-slate-900">${p.price.toFixed(2)}</td>
                    <td className="p-4 font-black text-slate-900 text-sm">{p.stock} units</td>
                    <td className="p-4 text-slate-500 font-bold">{p.lowStockThreshold} units</td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Reorder Alert
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Optimal Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleAdjustStock(p, -5)}
                          className="p-1 rounded-lg hover:bg-white text-slate-700 hover:text-rose-600 font-extrabold"
                          title="-5 units"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold font-mono px-2 text-xs">{p.stock}</span>
                        <button
                          onClick={() => handleAdjustStock(p, 5)}
                          className="p-1 rounded-lg hover:bg-white text-slate-700 hover:text-blue-600 font-extrabold"
                          title="+5 units"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
