import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomerAuthModal } from './CustomerAuthModal';
import {
  User,
  Package,
  CreditCard,
  MapPin,
  Gift,
  Shield,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Order } from '../../types';

export const CustomerAccount: React.FC = () => {
  const { currentUser, setCurrentUser, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'loyalty' | 'security'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/orders?customerId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => setOrders(data))
        .catch((e) => console.error('Error loading orders', e));
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Sign In to Your Account</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Please sign in or register to view your order tracking, saved addresses, and loyalty credit balance.
          </p>
        </div>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" /> Sign In / Create Account
        </button>

        <CustomerAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={() => setActiveTab('orders')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            {currentUser?.name.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold">{currentUser?.name}</h2>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {currentUser?.group || 'VIP'} CUSTOMER
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">{currentUser?.email} • Member since 2025</p>
          </div>
        </div>

        {/* Store credit / Loyalty summary */}
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Store Credit</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">${currentUser?.storeCredit || 150}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Loyalty Points</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{currentUser?.loyaltyPoints || 3450} pts</p>
          </div>
        </div>
      </div>

      {/* Account Navigation & Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'orders' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4 text-amber-400" /> Order History & Tracking
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'profile' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4 text-indigo-400" /> Personal Profile
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'addresses' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" /> Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'loyalty' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Gift className="w-4 h-4 text-purple-400" /> Loyalty & Referral Link
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'security' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4 text-rose-400" /> Security Settings
          </button>

          <div className="border-t border-slate-100 pt-3 mt-3 space-y-1">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
            >
              <LogIn className="w-4 h-4 text-blue-600" /> Sign In as Different User
            </button>
            <button
              onClick={() => {
                setCurrentUser(null);
                addToast('Signed out of customer account.', 'info');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-xs text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-slate-900 text-lg">Your Recent Orders ({orders.length})</h3>

              {orders.map((o) => (
                <div key={o.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">{o.orderNumber}</span>
                      <p className="text-[11px] text-slate-500">Placed on {new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'SHIPPED'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                      <span className="font-black text-slate-900 text-sm">${o.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="space-y-2">
                    {o.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded-lg bg-white" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{item.productTitle}</p>
                          <p className="text-[10px] text-slate-500">Qty: {item.quantity} • ${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Tracking Timeline */}
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" /> Live Tracking Timeline
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 text-[10px]">
                      {o.timeline.map((step, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 shrink-0 min-w-[130px]">
                          <p className="font-bold text-slate-900">{step.status}</p>
                          <p className="text-slate-500 text-[9px]">{step.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => window.print()}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                    >
                      <Printer className="w-3.5 h-3.5" /> Printable Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-md">
              <h3 className="font-extrabold text-slate-900 text-lg">Personal Details</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={currentUser?.name}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue={currentUser?.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-500"
                />
              </div>
              <button
                onClick={() => addToast('Profile details updated', 'success')}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                Save Profile
              </button>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Shipping Addresses</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">Default Shipping</span>
                <p className="font-bold text-slate-900 mt-2">{currentUser?.name}</p>
                <p className="text-slate-600">742 Evergreen Terrace</p>
                <p className="text-slate-600">New York, NY 10001, United States</p>
                <p className="text-slate-500 mt-1">+1 212-555-0198</p>
              </div>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">VIP Loyalty Program & Referral Link</h3>
              <div className="p-5 bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h4 className="font-black text-base">Your Referral Code: {currentUser?.referralCode}</h4>
                </div>
                <p className="text-xs text-amber-100">
                  Share your link with friends. Earn $25 in Store Credit for every friend who places their first order!
                </p>
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://aura-store.com/?ref=${currentUser?.referralCode}`}
                    className="bg-black/20 text-white font-mono text-xs p-2 rounded-xl flex-1 border border-white/20"
                  />
                  <button
                    onClick={() => addToast('Referral link copied to clipboard!', 'success')}
                    className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 max-w-md">
              <h3 className="font-extrabold text-slate-900 text-lg">Security & Password</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input type="password" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input type="password" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs" />
              </div>
              <button
                onClick={() => addToast('Password changed successfully!', 'success')}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                Update Password
              </button>
            </div>
          )}
        </div>
      </div>

      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
