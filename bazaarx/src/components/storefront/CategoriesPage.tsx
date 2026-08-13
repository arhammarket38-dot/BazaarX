import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronRight, LayoutGrid, Box, Sparkles, Tag, ShoppingBag, Eye } from 'lucide-react';

interface CategoriesPageProps {
  onSelectCategory: (categoryId: string) => void;
  onNavigateCustomerTab: (tab: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onSelectCategory,
  onNavigateCustomerTab,
}) => {
  const { categories, products } = useStore();

  // Helper to count products in category
  const getProductCount = (catId: string) => {
    return products.filter((p) => p.categoryId === catId).length;
  };

  // Static images mapping for gorgeous aesthetic look
  const getCategoryTheme = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('audio') || lowercaseName.includes('sound')) {
      return {
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        desc: 'Premium high-fidelity audio gear, studio reference monitors, and acoustic accessories.',
        color: 'from-amber-600/20 to-amber-950/40',
        badge: 'Audiophile Grade'
      };
    }
    if (lowercaseName.includes('keyboard') || lowercaseName.includes('desk') || lowercaseName.includes('workspace')) {
      return {
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        desc: 'Mechanical custom keyboards, brass plates, and high-performance tactile switches.',
        color: 'from-blue-600/20 to-blue-950/40',
        badge: 'Engineered Precision'
      };
    }
    if (lowercaseName.includes('lighting') || lowercaseName.includes('lamp') || lowercaseName.includes('led')) {
      return {
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
        desc: 'High-CRI workspace lightbars, ambient smart panels, and structural desktop lamps.',
        color: 'from-violet-600/20 to-violet-950/40',
        badge: 'Eye-Safe Glow'
      };
    }
    if (lowercaseName.includes('case') || lowercaseName.includes('bag') || lowercaseName.includes('leather')) {
      return {
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
        desc: 'Full-grain Italian leather organizers, premium travel cases, and laptop sleeves.',
        color: 'from-emerald-600/20 to-emerald-950/40',
        badge: 'Aesthetic Carry'
      };
    }
    return {
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
      desc: 'Expertly designed utility, minimalist organizers, and performance gear.',
      color: 'from-slate-600/20 to-slate-950/40',
      badge: 'Curated'
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header section */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
          <LayoutGrid className="w-3.5 h-3.5" /> Dynamic Catalog Collections
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
          Explore Categories
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold">
          Select a dynamic category layout to explore customized hardware, premium desktop gear, and custom-tuned luxury accessories.
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const theme = getCategoryTheme(cat.name);
          const pCount = getProductCount(cat.id);

          return (
            <div
              key={cat.id}
              className="group relative h-[320px] rounded-3xl overflow-hidden border border-slate-200/60 shadow-md bg-slate-900 text-white flex flex-col justify-end p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Background Cover Image */}
              <img
                src={theme.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Gradient Overlay for legibility */}
              <div className={`absolute inset-0 bg-gradient-to-t ${theme.color} via-slate-950/80 to-slate-950/20`} />

              {/* Card content */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-white/10 hover:bg-white/25 text-white/90 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm border border-white/15">
                    {theme.badge}
                  </span>
                  
                  {/* Item counter */}
                  <span className="flex items-center gap-1 text-[11px] font-black text-amber-300">
                    <Box className="w-3.5 h-3.5" /> {pCount} Products
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                    {cat.desc || cat.description}
                  </p>
                </div>

                {/* Navigation Button */}
                <button
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onNavigateCustomerTab('shop');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-amber-300 hover:text-slate-950 text-xs font-black py-3 px-4 rounded-xl transition-all shadow-md group-hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> View Collection <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
