import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, ShieldCheck, Truck, RefreshCw, Headphones, ArrowRight } from 'lucide-react';

export const Footer: React.FC<{ onNavigateCustomerTab?: (tab: string) => void }> = ({ onNavigateCustomerTab }) => {
  const { settings, addToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    addToast(`Subscribed ${newsletterEmail} to VIP insider offers!`, 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Value Proposition Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Free Global Shipping</h4>
              <p className="text-xs text-slate-400">On all orders over ${settings?.freeShippingThreshold || 99}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Secure Checkout</h4>
              <p className="text-xs text-slate-400">256-Bit SSL Encryption Protection</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Day Easy Returns</h4>
              <p className="text-xs text-slate-400">Prepaid return shipping labels</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24/7 Priority Support</h4>
              <p className="text-xs text-slate-400">{settings?.supportEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-slate-900 flex items-center justify-center font-black text-lg">
              {(settings?.storeName || 'A')[0].toUpperCase()}
            </div>
            <span className="font-black text-xl text-white tracking-tight">
              {(settings?.storeName || 'AURA').toUpperCase()} ENTERPRISE
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Architecting high-performance luxury consumer hardware, minimalist living aesthetics, and engineered accessories for discerning customers worldwide.
          </p>

          <form onSubmit={handleSubscribe} className="pt-2">
            <p className="text-xs font-bold text-white mb-2">Subscribe to Insider VIP Launches</p>
            <div className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:border-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
              >
                Join <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Shop Categories</h5>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
            <li><button onClick={() => onNavigateCustomerTab?.('shop')} className="hover:text-white transition-colors">Electronics & Audio</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('shop')} className="hover:text-white transition-colors">Apparel & Accessories</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('shop')} className="hover:text-white transition-colors">Home & Living</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('shop')} className="hover:text-white transition-colors">Fitness & Outdoors</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('shop')} className="hover:text-white transition-colors">Beauty & Care</button></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Customer Care</h5>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
            <li><button onClick={() => onNavigateCustomerTab?.('account')} className="hover:text-white transition-colors">Order History & Tracking</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('account')} className="hover:text-white transition-colors">Loyalty Rewards & Credit</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('returns')} className="hover:text-white transition-colors">Returns & Exchanges</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('faq')} className="hover:text-white transition-colors">Frequently Asked Questions</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('about')} className="hover:text-white transition-colors">About Our Story</button></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Trust & Legal</h5>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
            <li><button onClick={() => onNavigateCustomerTab?.('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('security')} className="hover:text-white transition-colors">Security Safeguards</button></li>
            <li><button onClick={() => onNavigateCustomerTab?.('blog')} className="hover:text-white transition-colors">Journal & Insights</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 mt-10 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 AURA Enterprise Platform Inc. All Rights Reserved.</p>
        <div className="flex items-center gap-3 font-semibold text-slate-400">
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px]">VISA</span>
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px]">MASTERCARD</span>
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px]">AMEX</span>
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px]">PAYPAL</span>
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px]">APPLE PAY</span>
        </div>
      </div>
    </footer>
  );
};
