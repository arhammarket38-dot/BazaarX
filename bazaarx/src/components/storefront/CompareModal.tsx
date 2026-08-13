import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Scale, ShoppingBag, Trash2 } from 'lucide-react';

export const CompareModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { compareList, toggleCompare, addToCart } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base">Product Comparison Matrix ({compareList.length}/4)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          {compareList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Scale className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No products selected for comparison</p>
              <p className="text-xs text-slate-500">Click the scale icon on any product card to compare specs.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-50 font-bold text-slate-500 w-1/5">Attribute</th>
                  {compareList.map((p) => (
                    <th key={p.id} className="p-3 border-l border-slate-200 text-center min-w-[200px]">
                      <div className="space-y-2">
                        <img src={p.images[0]} alt="" className="w-24 h-24 object-cover rounded-xl mx-auto" />
                        <h4 className="font-bold text-slate-900 line-clamp-2">{p.title}</h4>
                        <p className="text-sm font-black text-slate-900">${p.price}</p>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => addToCart(p)}
                            className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleCompare(p)}
                            className="bg-rose-100 text-rose-600 p-2 rounded-lg hover:bg-rose-200"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-700">Brand</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border-l border-slate-100 text-center font-medium">
                      {p.brand}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-700">Rating</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border-l border-slate-100 text-center font-bold text-amber-500">
                      ★ {p.rating} ({p.reviewCount})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-700">Stock Availability</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border-l border-slate-100 text-center">
                      <span className={`font-bold ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {p.stock > 0 ? `${p.stock} Available` : 'Out of Stock'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-700">SKU Code</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border-l border-slate-100 text-center font-mono">
                      {p.sku}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
