import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';

import { StorefrontHome } from './components/storefront/StorefrontHome';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { WishlistDrawer } from './components/storefront/WishlistDrawer';
import { CompareModal } from './components/storefront/CompareModal';
import { CustomerAccount } from './components/storefront/CustomerAccount';
import { BlogSection } from './components/storefront/BlogSection';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { AiStorefrontChat } from './components/storefront/AiStorefrontChat';
import { CategoriesPage } from './components/storefront/CategoriesPage';

import { AdminSidebar } from './components/admin/AdminSidebar';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { ProductManager } from './components/admin/ProductManager';
import { CategoryManager } from './components/admin/CategoryManager';
import { OrderManager } from './components/admin/OrderManager';
import { CustomerManager } from './components/admin/CustomerManager';
import { InventoryManager } from './components/admin/InventoryManager';
import { MarketingManager } from './components/admin/MarketingManager';
import { AdsManager } from './components/admin/AdsManager';
import { AnalyticsManager } from './components/admin/AnalyticsManager';
import { AuditLogManager } from './components/admin/AuditLogManager';
import { SettingsManager } from './components/admin/SettingsManager';
import { AgentsManager } from './components/admin/AgentsManager';

const MainAppContent: React.FC = () => {
  const { viewMode, adminTab, setSelectedCategory } = useStore();
  const [customerActiveTab, setCustomerActiveTab] = useState<'shop' | 'account' | 'blog' | 'page' | 'categories'>('shop');
  const [pageSlug, setPageSlug] = useState('about-us');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleNavigateCustomerTab = (tab: string) => {
    if (tab === 'account') setCustomerActiveTab('account');
    else if (tab === 'blog') setCustomerActiveTab('blog');
    else if (tab === 'categories') setCustomerActiveTab('categories');
    else if (tab === 'about') {
      setPageSlug('about-us');
      setCustomerActiveTab('page');
    } else if (tab === 'privacy') {
      setPageSlug('privacy-policy');
      setCustomerActiveTab('page');
    } else if (tab === 'terms') {
      setPageSlug('terms-of-service');
      setCustomerActiveTab('page');
    } else if (tab === 'returns' || tab === 'faq' || tab === 'security') {
      setPageSlug('returns-and-refunds');
      setCustomerActiveTab('page');
    } else if (tab === 'compare') {
      setIsCompareModalOpen(true);
    } else {
      setCustomerActiveTab('shop');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      <Header onNavigateCustomerTab={handleNavigateCustomerTab} />

      {viewMode === 'storefront' ? (
        <main className="flex-1 relative">
          {customerActiveTab === 'shop' && <StorefrontHome />}
          {customerActiveTab === 'categories' && (
            <CategoriesPage
              onSelectCategory={(id) => {
                setSelectedCategory(id);
              }}
              onNavigateCustomerTab={handleNavigateCustomerTab}
            />
          )}
          {customerActiveTab === 'account' && <CustomerAccount />}
          {customerActiveTab === 'blog' && <BlogSection initialType="blog" />}
          {customerActiveTab === 'page' && <BlogSection initialType="page" pageSlug={pageSlug} />}
          <Footer onNavigateCustomerTab={handleNavigateCustomerTab} />
          <AiStorefrontChat />
        </main>
      ) : (
        <div className="flex flex-1 min-h-[calc(100vh-64px)]">
          <AdminSidebar />
          <main className="flex-1 bg-slate-100 overflow-y-auto">
            {adminTab === 'products' && <ProductManager />}
            {adminTab === 'categories' && <CategoryManager />}
            {adminTab === 'orders' && <OrderManager />}
            {adminTab === 'customers' && <CustomerManager />}
            {adminTab === 'inventory' && <InventoryManager />}
            {adminTab === 'marketing' && <MarketingManager />}
            {adminTab === 'ads' && <AdsManager />}
            {adminTab === 'analytics' && <AnalyticsManager />}
            {adminTab === 'agents' && <AgentsManager />}
            {adminTab === 'audit' && <AuditLogManager />}
            {adminTab === 'settings' && <SettingsManager />}
            {(adminTab === 'dashboard' || !['products', 'categories', 'orders', 'customers', 'inventory', 'marketing', 'ads', 'analytics', 'agents', 'audit', 'settings'].includes(adminTab)) && (
              <DashboardOverview />
            )}
          </main>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <WishlistDrawer />
      <CompareModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} />
      <CheckoutModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
