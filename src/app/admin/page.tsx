'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, AlertTriangle, Lock, User, KeyRound, AlertCircle } from 'lucide-react';
import { useCMSStore } from '../../stores/useCMSStore';
import { useOrderStore } from '../../stores/useOrderStore';
import { useDiscountStore } from '../../stores/useDiscountStore';
import apiClient from '../../services/api';
import { isAxiosError } from 'axios';

// Modular Admin Subcomponents
import { AdminHeader, type AdminModuleMode } from './components/AdminHeader';
import { AdminTabsNav, type AdminTabId } from './components/AdminTabsNav';
import { OverviewTab } from './components/OverviewTab';
import { OrdersTab } from './components/OrdersTab';
import { CategoriesTab } from './components/CategoriesTab';
import { ProductsTab } from './components/ProductsTab';
import { CouponsTab } from './components/CouponsTab';
import { HomeCMSTab } from './components/HomeCMSTab';
import { CorporateCMSTab } from './components/CorporateCMSTab';
import { TickerTab } from './components/TickerTab';
import { PopupTab } from './components/PopupTab';
import { ContactTab } from './components/ContactTab';
import { StoresTab } from './components/StoresTab';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Panel Mode & Active Tab State
  const [activeModule, setActiveModule] = useState<AdminModuleMode>('ecommerce');
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');

  const handleModuleChange = (mode: AdminModuleMode) => {
    setActiveModule(mode);
    if (mode === 'ecommerce') {
      setActiveTab('overview');
    } else {
      setActiveTab('homeCMS');
    }
  };

  // Global Alerts Feedback State
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showSaveSuccess = (msg: string) => {
    setSavedSuccessMsg(msg);
    setErrorMessage('');
    setTimeout(() => setSavedSuccessMsg(''), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSavedSuccessMsg('');
  };

  // CMS Store Selectors
  const products = useCMSStore((state) => state.products);
  const addProduct = useCMSStore((state) => state.addProduct);
  const updateProduct = useCMSStore((state) => state.updateProduct);
  const deleteProduct = useCMSStore((state) => state.deleteProduct);
  const resetProductsToDefault = useCMSStore((state) => state.resetProductsToDefault);

  const categories = useCMSStore((state) => state.categories);
  const addCategory = useCMSStore((state) => state.addCategory);
  const updateCategory = useCMSStore((state) => state.updateCategory);
  const deleteCategory = useCMSStore((state) => state.deleteCategory);

  const homeConfig = useCMSStore((state) => state.homeConfig);
  const updateHomeConfig = useCMSStore((state) => state.updateHomeConfig);

  const corporateConfig = useCMSStore((state) => state.corporateConfig);
  const updateCorporateConfig = useCMSStore((state) => state.updateCorporateConfig);

  const tickerItems = useCMSStore((state) => state.tickerItems);
  const addTickerItem = useCMSStore((state) => state.addTickerItem);
  const removeTickerItem = useCMSStore((state) => state.removeTickerItem);

  const campaignPopup = useCMSStore((state) => state.campaignPopup);
  const updateCampaignPopup = useCMSStore((state) => state.updateCampaignPopup);

  const contactInfo = useCMSStore((state) => state.contactInfo);
  const updateContactInfo = useCMSStore((state) => state.updateContactInfo);

  const stores = useCMSStore((state) => state.stores);

  // Orders Store & Coupons Store
  const orders = useOrderStore((state) => state.orders);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const coupons = useDiscountStore((state) => state.coupons);

  // Check login session on mount via Backend JWT Verification
  useEffect(() => {
    async function verifyAdminJWT() {
      const token = localStorage.getItem('admin_jwt_token') || localStorage.getItem('auth_token');
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const res = await apiClient.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success && res.data?.user?.role === 'ADMIN') {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_jwt_token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        localStorage.removeItem('admin_jwt_token');
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    }

    verifyAdminJWT();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanUser = loginUser.trim().toLowerCase();
    const cleanPass = loginPass.trim();

    try {
      // Direct REST API Admin Authentication
      const res = await apiClient.post(
        '/auth/login',
        {
          email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@ermaymobilya.com`,
          password: cleanPass,
        }
      );

      if (res.data?.success && res.data.token) {
        const userRole = res.data.user?.role;
        if (userRole === 'ADMIN') {
          localStorage.setItem('admin_jwt_token', res.data.token);
          document.cookie = `admin_jwt_token=${res.data.token}; path=/; max-age=604800; SameSite=Lax`;
          setIsAuthenticated(true);
          setAuthError('');
          return;
        } else {
          setAuthError('Yetkisiz Giriş: Bu hesaba Yönetici (Admin) erişim yetkisi tanımlanmamıştır.');
          return;
        }
      } else {
        setAuthError(res.data?.message || 'Giriş başarısız.');
      }
    } catch (err: unknown) {
      const errMsg = isAxiosError(err) ? (err.response?.data as Record<string, string>)?.message : undefined;
      setAuthError(errMsg || 'Giriş yapılamadı. E-posta adresi veya şifre hatalı.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_jwt_token');
    document.cookie = 'admin_jwt_token=; path=/; max-age=0; SameSite=Lax';
    setLoginUser('');
    setLoginPass('');
  };

  if (isVerifying) {
    return (
      <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center">
        <div className="text-xs font-semibold text-neutral-500 animate-pulse">
          Admin Oturumu Doğrulanıyor...
        </div>
      </div>
    );
  }

  // RENDER ADMIN LOGIN CARD IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-neutral-200 shadow-md rounded-sm p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-brand-camel/10 text-brand-camel rounded-full mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-wide uppercase text-neutral-900">
              Yönetici Girişi (Admin REST API)
            </h1>
            <p className="text-xs text-neutral-500 font-light">
              Ermay Mobilya güvenli yönetici paneline erişmek için yetkili JWT hesabı ile giriş yapın.
            </p>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                E-Posta veya Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="admin@ermaymobilya.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
                />
                <User className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Şifre
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
                />
                <KeyRound className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-xs transition-colors cursor-pointer"
            >
              Güvenli Giriş Yap
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 text-center">
            <Link
              href="/"
              className="text-xs text-neutral-500 hover:text-brand-camel transition-colors"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // RENDER ADMIN DASHBOARD IF AUTHENTICATED
  return (
    <div className="w-full bg-neutral-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminHeader
          activeModule={activeModule}
          setActiveModule={handleModuleChange}
          onLogout={handleLogout}
        />

        {savedSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xs mb-6 flex items-center justify-between border border-emerald-300 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{savedSuccessMsg}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 text-rose-900 p-4 rounded-xs mb-6 flex items-center justify-between border border-rose-300 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-xs text-rose-600 hover:underline cursor-pointer"
            >
              Kapat
            </button>
          </div>
        )}

        <AdminTabsNav
          activeModule={activeModule}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={{
            orders: orders.length,
            categories: categories.length,
            products: products.length,
            coupons: coupons.length,
            tickerItems: tickerItems.length,
            stores: stores.length,
          }}
        />

        {activeModule === 'ecommerce' && (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                orders={orders}
                products={products}
                categoriesCount={categories.length}
                campaignEnabled={campaignPopup.enabled}
                discountCode={campaignPopup.discountCode}
                setActiveTab={setActiveTab}
                onResetDefault={() => {
                  resetProductsToDefault();
                  showSaveSuccess('Tüm veriler varsayılana sıfırlandı.');
                }}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                onUpdateOrderStatus={updateOrderStatus}
                onShowSuccess={showSaveSuccess}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                products={products}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
                onShowSuccess={showSaveSuccess}
                onShowError={showError}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab
                products={products}
                categories={categories}
                onAddProduct={addProduct}
                onUpdateProduct={updateProduct}
                onDeleteProduct={deleteProduct}
                onShowSuccess={showSaveSuccess}
              />
            )}

            {activeTab === 'coupons' && (
              <CouponsTab onShowSuccess={showSaveSuccess} />
            )}
          </>
        )}

        {activeModule === 'cms' && (
          <>
            {activeTab === 'homeCMS' && (
              <HomeCMSTab
                homeConfig={homeConfig}
                onUpdateHomeConfig={updateHomeConfig}
                onShowSuccess={showSaveSuccess}
                onShowError={showError}
              />
            )}

            {activeTab === 'corporateCMS' && (
              <CorporateCMSTab
                corporateConfig={corporateConfig}
                onUpdateCorporateConfig={updateCorporateConfig}
                onShowSuccess={showSaveSuccess}
              />
            )}

            {activeTab === 'stores' && (
              <StoresTab onShowSuccess={showSaveSuccess} />
            )}

            {activeTab === 'ticker' && (
              <TickerTab
                tickerItems={tickerItems}
                onAddTickerItem={addTickerItem}
                onRemoveTickerItem={removeTickerItem}
                onShowSuccess={showSaveSuccess}
              />
            )}

            {activeTab === 'popup' && (
              <PopupTab
                campaignPopup={campaignPopup}
                onUpdateCampaignPopup={updateCampaignPopup}
                onShowSuccess={showSaveSuccess}
              />
            )}

            {activeTab === 'contact' && (
              <ContactTab
                contactInfo={contactInfo}
                onUpdateContactInfo={updateContactInfo}
                onShowSuccess={showSaveSuccess}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
