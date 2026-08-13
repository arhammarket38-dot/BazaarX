import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Tag,
  Zap,
  X,
  Check,
} from 'lucide-react';
import { Product } from '../../types';

export const ProductManager: React.FC = () => {
  const { products, categories, refreshProducts, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const filtered = products.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && p.categoryId !== categoryFilter) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingProduct({
      title: '',
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      price: 99,
      stock: 25,
      categoryId: categories[0]?.id || 'cat_electronics',
      brand: 'AURA',
      shortDescription: '',
      description: '',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        addToast('Product duplicated successfully!', 'success');
        refreshProducts();
      }
    } catch {
      addToast('Failed duplicating product', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete product "${title}"?`)) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          addToast(`Deleted product "${title}"`, 'info');
          refreshProducts();
        }
      } catch {
        addToast('Failed deleting product', 'error');
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title) return;

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/products' : `/api/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        addToast(`Product ${isNew ? 'created' : 'updated'} successfully!`, 'success');
        setIsModalOpen(false);
        refreshProducts();
      }
    } catch {
      addToast('Failed saving product', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Product Catalog Management</h1>
          <p className="text-xs text-slate-500">Create, edit, duplicate, and set flash sale prices across inventory.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 text-amber-400" /> Create New Product
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 pl-9 rounded-xl focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-bold p-2.5 rounded-xl text-slate-800 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="p-4">Product Details</th>
                <th className="p-4">SKU / Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs line-clamp-1">{p.title}</h4>
                      <p className="text-[10px] text-slate-400">Rating: ★ {p.rating} ({p.reviewCount})</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-700">
                    <p className="font-bold">{p.sku}</p>
                    <span className="text-[10px] text-indigo-600 font-sans font-bold">{p.brand}</span>
                  </td>
                  <td className="p-4 font-black text-slate-900">
                    ${p.price.toFixed(2)}
                    {p.isFlashSale && (
                      <span className="block text-[10px] text-rose-600 font-bold">
                        Sale: ${p.flashSalePrice}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        p.stock <= p.lowStockThreshold
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4 space-x-1">
                    {p.isFlashSale && <span className="bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded">FLASH</span>}
                    {p.isBestSeller && <span className="bg-amber-400 text-slate-900 font-bold text-[9px] px-2 py-0.5 rounded">BEST SELLER</span>}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => handleDuplicate(p.id)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                      title="Duplicate Product"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-slate-900 text-lg mb-4">
              {editingProduct.id ? 'Edit Product' : 'Create New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isFlashSale}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isFlashSale: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    Flash Sale Active
                  </label>
                </div>
              </div>

              <ImageUploadInput
                label="Product Main Image"
                value={editingProduct.images?.[0] || ''}
                onChange={(val) => {
                  const newImages = [...(editingProduct.images || [])];
                  newImages[0] = val;
                  setEditingProduct({ ...editingProduct, images: newImages });
                }}
                required
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Summary Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 text-white font-bold px-6 py-2 rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
