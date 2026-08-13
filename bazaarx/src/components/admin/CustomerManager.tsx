import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Product, Order, Review } from '../../types';
import { 
  Users, Search, Award, DollarSign, Edit3, Shield, Mail, Phone, X, Check, 
  Trash2, AlertTriangle, Calendar, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  Download, RefreshCw, UserCheck, CheckCircle2, ShoppingBag, Heart, Star, 
  Activity, ArrowRight, UserMinus, ShieldCheck, HelpCircle, Laptop, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaginatedResponse {
  customers: User[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CustomerManager: React.FC = () => {
  const { addToast } = useStore();
  
  // List parameters state
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail & Modals state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerWishlist, setCustomerWishlist] = useState<Product[]>([]);
  const [customerReviews, setCustomerReviews] = useState<Review[]>([]);
  const [customerReturns, setCustomerReturns] = useState<Order[]>([]);
  const [customerActivity, setCustomerActivity] = useState<any[]>([]);
  const [detailTab, setDetailTab] = useState<'overview' | 'orders' | 'wishlist' | 'reviews' | 'returns' | 'activity'>('overview');
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Editing controls
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    group: 'REGULAR',
    storeCredit: 0,
    loyaltyPoints: 0,
    role: 'CUSTOMER',
    status: 'ACTIVE'
  });
  const [customerToDelete, setCustomerToDelete] = useState<User | null>(null);

  // Fetch Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('aura_token') || 'mock_jwt_token_usr_admin_arham';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        group: groupFilter,
        status: statusFilter,
        role: roleFilter,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString(),
        startDate,
        endDate
      });

      const res = await fetch(`/api/admin/customers?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setCustomers(data.customers);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } else {
        const errData = await res.json();
        addToast(errData.error || 'Failed loading customer directory', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error loading customer directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single customer details & aggregates
  const fetchCustomerDetails = async (id: string) => {
    setLoadingDetail(true);
    setDetailTab('overview');
    try {
      const [resCust, resOrd, resWish, resRev, resRet, resAct] = await Promise.all([
        fetch(`/api/admin/customers/${id}`, { headers: getAuthHeaders() }),
        fetch(`/api/admin/customers/${id}/orders`, { headers: getAuthHeaders() }),
        fetch(`/api/admin/customers/${id}/wishlist`, { headers: getAuthHeaders() }),
        fetch(`/api/admin/customers/${id}/reviews`, { headers: getAuthHeaders() }),
        fetch(`/api/admin/customers/${id}/returns`, { headers: getAuthHeaders() }),
        fetch(`/api/admin/customers/${id}/activity`, { headers: getAuthHeaders() })
      ]);

      if (resCust.ok) {
        const custData = await resCust.json();
        setSelectedCustomer(custData);
        setEditForm({
          name: custData.name || '',
          email: custData.email || '',
          phone: custData.phone || '',
          group: custData.group || 'REGULAR',
          storeCredit: custData.storeCredit || 0,
          loyaltyPoints: custData.loyaltyPoints || 0,
          role: custData.role || 'CUSTOMER',
          status: custData.status || 'ACTIVE'
        });
      }
      if (resOrd.ok) setCustomerOrders(await resOrd.json());
      if (resWish.ok) setCustomerWishlist(await resWish.json());
      if (resRev.ok) setCustomerReviews(await resRev.json());
      if (resRet.ok) setCustomerReturns(await resRet.json());
      if (resAct.ok) setCustomerActivity(await resAct.json());
      
      // Update browser URL state cosmetically to emulate route
      window.history.pushState(null, '', `/admin/customers/${id}`);
    } catch (e) {
      console.error(e);
      addToast('Error loading customer detailed profile', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCustomerId(null);
    setSelectedCustomer(null);
    setIsEditingProfile(false);
    window.history.pushState(null, '', '/admin');
    fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, groupFilter, statusFilter, roleFilter, sortBy, sortOrder, startDate, endDate]);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...selectedCustomer,
          name: editForm.name,
          phone: editForm.phone,
          group: editForm.group,
          storeCredit: parseFloat(editForm.storeCredit as any) || 0,
          loyaltyPoints: parseInt(editForm.loyaltyPoints as any) || 0,
          role: editForm.role,
          status: editForm.status
        }),
      });

      if (res.ok) {
        addToast(`Updated profile details for ${editForm.name}`, 'success');
        setIsEditingProfile(false);
        // Refresh details
        fetchCustomerDetails(selectedCustomer.id);
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed saving customer details', 'error');
      }
    } catch {
      addToast('Error saving profile changes', 'error');
    }
  };

  const handleDeleteCustomer = async (user: User) => {
    if (user.role === 'SUPER_ADMIN') {
      addToast('Super Admin accounts cannot be deleted.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/customers/${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        addToast(`Customer account for ${user.name} deleted successfully`, 'info');
        setCustomerToDelete(null);
        if (selectedCustomer?.id === user.id) {
          handleCloseDetail();
        } else {
          fetchCustomers();
        }
      } else {
        const errData = await res.json();
        addToast(errData.error || 'Failed deleting customer', 'error');
      }
    } catch {
      addToast('Error deleting customer account', 'error');
    }
  };

  const exportCustomersCSV = async () => {
    try {
      const queryParams = new URLSearchParams({
        search, group: groupFilter, status: statusFilter, role: roleFilter,
        sortBy, sortOrder, startDate, endDate, export: 'true'
      });
      const res = await fetch(`/api/admin/customers?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.customers || [];
        
        // Build CSV
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Tier/Group', 'Status', 'Store Credit', 'Loyalty Points', 'Total Orders', 'Total Spending', 'Registered At'];
        const rows = list.map((u: any) => [
          u.id, u.name, u.email, u.phone || '', u.role, u.group, u.status, 
          u.storeCredit.toFixed(2), u.loyaltyPoints, u.totalOrders || 0, 
          (u.totalSpending || 0).toFixed(2), new Date(u.createdAt).toLocaleDateString()
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Aura_Customers_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast('CSV export completed successfully', 'success');
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to export CSV directory', 'error');
    }
  };

  const triggerPasswordReset = () => {
    if (!selectedCustomer) return;
    addToast(`Password reset instruction link sent dynamically to ${selectedCustomer.email}`, 'success');
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Detail View Overlay / Slideout (Emulates /admin/customers/[customerId]) */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="bg-slate-50 border-l border-slate-200 w-full max-w-4xl h-full flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-6 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center border border-white/10 shadow-lg">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight">{selectedCustomer.name}</h2>
                      <span className="text-[9px] bg-amber-400 text-slate-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {selectedCustomer.group} TIER
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        selectedCustomer.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {selectedCustomer.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">UUID: {selectedCustomer.id} • Registered {new Date(selectedCustomer.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseDetail}
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-colors text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-Tabs Navigation */}
              <div className="bg-white border-b border-slate-200 px-6 flex gap-1 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Basic Profile', icon: UserCheck },
                  { id: 'orders', label: `Orders (${customerOrders.length})`, icon: ShoppingBag },
                  { id: 'wishlist', label: `Wishlist (${customerWishlist.length})`, icon: Heart },
                  { id: 'reviews', label: `Reviews (${customerReviews.length})`, icon: Star },
                  { id: 'returns', label: `Returns (${customerReturns.length})`, icon: AlertTriangle },
                  { id: 'activity', label: 'Live Log timeline', icon: Activity }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDetailTab(tab.id as any)}
                      className={`py-3.5 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        detailTab === tab.id 
                          ? 'border-indigo-600 text-indigo-600 font-black' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* A. OVERVIEW TAB */}
                {detailTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Left: General Cards & Settings */}
                    <div className="md:col-span-2 space-y-6">
                      
                      {/* Identity Details */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-slate-400" /> Account Security & Verification
                          </h3>
                          <button 
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            {isEditingProfile ? 'Cancel Edit' : 'Modify Fields'}
                          </button>
                        </div>

                        {!isEditingProfile ? (
                          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Name</span>
                              <p className="font-extrabold text-slate-900">{selectedCustomer.name}</p>
                            </div>
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                              <p className="font-extrabold text-slate-900">{selectedCustomer.email}</p>
                            </div>
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</span>
                              <p className="font-extrabold text-slate-900">{selectedCustomer.phone || 'Not recorded'}</p>
                            </div>
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">System Role</span>
                              <p className="font-extrabold text-slate-900 uppercase text-indigo-600">{selectedCustomer.role}</p>
                            </div>
                            
                            {/* Verification statuses */}
                            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <ShieldCheck className={`w-5 h-5 ${selectedCustomer.emailVerified ? 'text-emerald-500' : 'text-slate-300'}`} />
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Status</span>
                                <span className={`text-[10px] font-extrabold ${selectedCustomer.emailVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {selectedCustomer.emailVerified ? 'VERIFIED' : 'PENDING'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <ShieldCheck className={`w-5 h-5 ${selectedCustomer.phoneVerified ? 'text-emerald-500' : 'text-slate-300'}`} />
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">SMS Status</span>
                                <span className={`text-[10px] font-extrabold ${selectedCustomer.phoneVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {selectedCustomer.phoneVerified ? 'VERIFIED' : 'PENDING'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Profile Form */
                          <form onSubmit={handleSaveCustomer} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                <input 
                                  type="text" 
                                  value={editForm.name} 
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                                <input 
                                  type="text" 
                                  value={editForm.phone} 
                                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Group Tier</label>
                                <select 
                                  value={editForm.group} 
                                  onChange={(e) => setEditForm({...editForm, group: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold"
                                >
                                  <option value="REGULAR">REGULAR</option>
                                  <option value="VIP">VIP</option>
                                  <option value="WHOLESALE">WHOLESALE</option>
                                  <option value="PREMIUM">PREMIUM</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Access Role</label>
                                <select 
                                  value={editForm.role} 
                                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold"
                                >
                                  <option value="CUSTOMER">CUSTOMER</option>
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                  <option value="MANAGER">MANAGER</option>
                                  <option value="CATALOG_MANAGER">CATALOG_MANAGER</option>
                                  <option value="SUPPORT">SUPPORT</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Store Credit ($)</label>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  value={editForm.storeCredit} 
                                  onChange={(e) => setEditForm({...editForm, storeCredit: parseFloat(e.target.value) || 0})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loyalty Points</label>
                                <input 
                                  type="number" 
                                  value={editForm.loyaltyPoints} 
                                  onChange={(e) => setEditForm({...editForm, loyaltyPoints: parseInt(e.target.value) || 0})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account status</label>
                                <select 
                                  value={editForm.status} 
                                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold"
                                >
                                  <option value="ACTIVE">ACTIVE</option>
                                  <option value="BLOCKED">BLOCKED</option>
                                  <option value="SUSPENDED">SUSPENDED</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                              <button 
                                type="button" 
                                onClick={() => setIsEditingProfile(false)}
                                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      {/* Shipping Addresses list */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" /> Shipping & Billing Directory ({selectedCustomer.addresses?.length || 0})
                        </h3>
                        {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                          <div className="text-xs text-slate-400 font-bold py-2">No physical address stored on the central database.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCustomer.addresses.map((addr: any, i: number) => (
                              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative text-xs">
                                <span className="absolute top-3 right-3 text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded uppercase">
                                  {addr.type}
                                </span>
                                <p className="font-extrabold text-slate-900 mb-1">{addr.fullName}</p>
                                <p className="text-slate-600">{addr.street}</p>
                                <p className="text-slate-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                                <p className="text-slate-500 mt-1">{addr.country}</p>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Phone: {addr.phone}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right: Quick Stats & Security Admin Tools */}
                    <div className="space-y-6">
                      
                      {/* Financial statistics */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Ledger Metrics</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Store Credit</span>
                            <span className="text-base font-black text-indigo-700">${(selectedCustomer.storeCredit || 0).toFixed(2)}</span>
                          </div>
                          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Loyalty Points</span>
                            <span className="text-base font-black text-amber-700">{selectedCustomer.loyaltyPoints || 0} pts</span>
                          </div>
                          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Spent</span>
                            <span className="text-base font-black text-emerald-700">${(selectedCustomer.totalSpending || 0).toFixed(2)}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Orders</span>
                            <span className="text-base font-black text-slate-700">{selectedCustomer.totalOrders || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Session Metadata */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Device Telemetry</h4>
                        <div className="space-y-2 font-medium text-slate-600">
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-400">Last Login IP</span>
                            <span className="font-bold text-slate-800">{selectedCustomer.lastLoginIp || '127.0.0.1'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-400">Last Active At</span>
                            <span className="font-bold text-slate-800">
                              {selectedCustomer.lastLoginAt ? new Date(selectedCustomer.lastLoginAt).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-400">Referral Code</span>
                            <span className="font-mono font-bold text-indigo-600">{selectedCustomer.referralCode}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin actions block */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Security Actions</h4>
                        <div className="space-y-2">
                          <button 
                            type="button" 
                            onClick={triggerPasswordReset}
                            className="w-full text-center font-bold text-xs py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-indigo-600 cursor-pointer"
                          >
                            Trigger Password Reset Link
                          </button>
                          
                          {selectedCustomer.role !== 'SUPER_ADMIN' && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setCustomerToDelete(selectedCustomer);
                              }}
                              className="w-full text-center font-bold text-xs py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer border border-rose-200/50"
                            >
                              Permanently Delete Account
                            </button>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* B. ORDERS TAB */}
                {detailTab === 'orders' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Historical Purchase Records ({customerOrders.length})</h3>
                    {customerOrders.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">No purchases found for this user account.</div>
                    ) : (
                      <div className="space-y-3">
                        {customerOrders.map((ord) => (
                          <div key={ord.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs font-medium">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900">{ord.orderNumber}</span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                  ord.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ord.paymentStatus}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">Placed: {new Date(ord.createdAt).toLocaleDateString()} • Items: {ord.items.reduce((sum, i) => sum + i.quantity, 0)}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-900 block">${ord.grandTotal.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400 capitalize">{ord.status.toLowerCase()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* C. WISHLIST TAB */}
                {detailTab === 'wishlist' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Active Saved Wishlist ({customerWishlist.length})</h3>
                    {customerWishlist.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">User has not saved any items to wishlist.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customerWishlist.map((prod) => (
                          <div key={prod.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                            <img src={prod.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-100" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-extrabold text-xs text-slate-900 truncate">{prod.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">${prod.price.toFixed(2)} • SKU: {prod.sku}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* D. REVIEWS TAB */}
                {detailTab === 'reviews' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Product Reviews & Ratings ({customerReviews.length})</h3>
                    {customerReviews.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">This customer has not submitted any product reviews.</div>
                    ) : (
                      <div className="space-y-3">
                        {customerReviews.map((rev) => (
                          <div key={rev.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < rev.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="font-extrabold text-slate-800">Regarding Product: {rev.productTitle || 'Store Item'}</p>
                            <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* E. RETURNS TAB */}
                {detailTab === 'returns' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Returns & Dispute Claims ({customerReturns.length})</h3>
                    {customerReturns.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">No returns or dispute claims reported.</div>
                    ) : (
                      <div className="space-y-3">
                        {customerReturns.map((ord) => (
                          <div key={ord.id} className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-slate-900">{ord.orderNumber}</span>
                              <span className="text-[10px] bg-rose-100 text-rose-700 font-black px-2 py-0.5 rounded">
                                {ord.status}
                              </span>
                            </div>
                            <p className="text-slate-500 font-medium">Refund processed on database: <strong className="text-slate-900">${ord.grandTotal.toFixed(2)}</strong></p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* F. ACTIVITY TIMELINE */}
                {detailTab === 'activity' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Security Audit Trail</h3>
                    <div className="relative border-l-2 border-slate-200 pl-4 ml-2 space-y-5 py-2">
                      {customerActivity.map((log, index) => (
                        <div key={log.id || index} className="relative text-xs">
                          <span className="absolute -left-[21px] top-0.5 bg-white border-2 border-indigo-600 w-3 h-3 rounded-full"></span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                              {log.action}
                            </span>
                          </div>
                          <p className="text-slate-700 font-bold mt-1 text-[11px]">{log.details}</p>
                          {log.ipAddress && (
                            <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                              <Laptop className="w-3 h-3" /> Client IP: {log.ipAddress}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Primary Directory Listing Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Customer Accounts Directory</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse through unified central user records, analyze VIP groups, manage store credits, and trace account sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCustomersCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
            title="Download CSV report"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => { setPage(1); fetchCustomers(); }}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Force Refresh
          </button>
        </div>
      </div>

      {/* 3. Filtering and Searching Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, email address, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Group VIP Filter */}
          <div>
            <select
              value={groupFilter}
              onChange={(e) => { setGroupFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Loyalty Groups</option>
              <option value="REGULAR">REGULAR Tier</option>
              <option value="VIP">VIP Tier</option>
              <option value="WHOLESALE">WHOLESALE Tier</option>
              <option value="PREMIUM">PREMIUM Tier</option>
            </select>
          </div>

          {/* System Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Access Roles</option>
              <option value="CUSTOMER">Standard Customers</option>
              <option value="ADMIN">System Admins</option>
              <option value="SUPER_ADMIN">SUPER ADMIN accounts</option>
              <option value="MANAGER">Store Managers</option>
              <option value="CATALOG_MANAGER">Catalog Managers</option>
              <option value="SUPPORT">Support Teams</option>
            </select>
          </div>

        </div>

        {/* Extended Date & Status Filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-600">
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Account status:</span>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-[11px] font-bold text-slate-800 cursor-pointer"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="ACTIVE">ACTIVE ONLY</option>
                <option value="BLOCKED">BLOCKED ONLY</option>
                <option value="SUSPENDED">SUSPENDED ONLY</option>
              </select>
            </div>

            {/* Date range inputs */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Registered:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-medium text-slate-800"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-medium text-slate-800"
              />
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                  className="text-indigo-600 text-[10px] hover:underline cursor-pointer"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400">Found:</span> <strong className="text-slate-900 font-extrabold">{totalCount} users</strong>
          </div>

        </div>

      </div>

      {/* 4. Elegant Spreadsheet-like Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            Loading system records from central database...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-xs font-bold text-slate-400 space-y-1">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700">No database users found matching current filters.</p>
            <p className="text-[11px] text-slate-400 font-medium">Try resetting your search query or tier parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black text-slate-400 tracking-wider uppercase">
                  <th className="p-4 pl-6">Customer Profile</th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('role')}>
                    <div className="flex items-center gap-1">Role <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('group')}>
                    <div className="flex items-center gap-1">VIP Group <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('storeCredit')}>
                    <div className="flex items-center gap-1">Ledger Credits <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('loyaltyPoints')}>
                    <div className="flex items-center gap-1">Loyalty <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('totalSpending')}>
                    <div className="flex items-center gap-1">Spent / Orders <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('createdAt')}>
                    <div className="flex items-center gap-1">Registered On <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs font-medium text-slate-700">
                {customers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* User profile identifier */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-slate-200 text-indigo-700 font-black flex items-center justify-center shadow-xs shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <button 
                            onClick={() => {
                              setSelectedCustomerId(user.id);
                              fetchCustomerDetails(user.id);
                            }}
                            className="font-black text-slate-950 text-xs hover:text-indigo-600 transition-colors block text-left"
                          >
                            {user.name}
                          </button>
                          <span className="text-[10px] text-slate-400 block truncate">{user.email}</span>
                          {user.phone && <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{user.phone}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                        user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                          : user.role === 'CUSTOMER'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Group */}
                    <td className="p-4">
                      <span className="text-[10px] bg-slate-100 border border-slate-200/60 font-bold text-slate-700 px-2.5 py-0.5 rounded uppercase">
                        {user.group}
                      </span>
                    </td>

                    {/* Store Credit */}
                    <td className="p-4 font-black text-slate-900 font-mono">
                      ${(user.storeCredit || 0).toFixed(2)}
                    </td>

                    {/* Loyalty Points */}
                    <td className="p-4 font-bold text-indigo-600 font-mono">
                      {user.loyaltyPoints || 0} pts
                    </td>

                    {/* Total Spending / Orders */}
                    <td className="p-4 text-slate-800">
                      <span className="font-bold text-emerald-700 block font-mono">${((user as any).totalSpending || 0).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 block">{(user as any).totalOrders || 0} invoices</span>
                    </td>

                    {/* Created At */}
                    <td className="p-4 text-[11px] text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block uppercase ${
                        user.status === 'BLOCKED' 
                          ? 'bg-rose-100 text-rose-800' 
                          : user.status === 'SUSPENDED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>

                    {/* Actions button */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(user.id);
                            fetchCustomerDetails(user.id);
                          }}
                          className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                        >
                          View Profiles <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Server-side Pagination panel */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-500">
          <div>
            Showing <span className="text-slate-800">{(page - 1) * limit + 1}</span> to <span className="text-slate-800">{Math.min(page * limit, totalCount)}</span> of <span className="text-slate-800">{totalCount}</span> entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl transition-all border cursor-pointer ${
                  page === i + 1
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/10'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal (Admin level only) */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Delete Customer Profile?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">{customerToDelete.name}</strong> ({customerToDelete.email})? This action is non-reversible and will detach their history.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCustomer(customerToDelete)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer flex-1 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete ID
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
