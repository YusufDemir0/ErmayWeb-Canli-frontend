'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, KeyRound, AlertCircle } from 'lucide-react';
import { useCMSStore } from '../../stores/useCMSStore';
import apiClient from '../../services/api';
import { isAxiosError } from 'axios';

// Modular Admin Subcomponents
import { AdminShell, findNavItem, type AdminTabId } from './components/AdminShell';
import BrandLogo from '../../components/BrandLogo';
import { requestService } from '../../services/requestService';
import { OverviewTab } from './components/OverviewTab';
import { OrdersTab } from './components/OrdersTab';
import { ContactMessagesTab } from './components/ContactMessagesTab';
import { CategoriesTab } from './components/CategoriesTab';
import { ProductsTab } from './components/ProductsTab';
import { ErpSyncTab } from './components/ErpSyncTab';
import { HomeCMSTab } from './components/HomeCMSTab';
import { CorporateCMSTab } from './components/CorporateCMSTab';
import { TickerTab } from './components/TickerTab';
import { ContactTab } from './components/ContactTab';
import { StoresTab } from './components/StoresTab';
import { DeliveryZonesTab } from './components/DeliveryZonesTab';
import { LandingPageTab } from './components/LandingPageTab';
import { BlogTab } from './components/BlogTab';
import { toast } from '../../stores/useToastStore';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // STAFF (satış personeli) yalnızca talepleri ve gelen mesajları yönetir; katalog/CMS ADMIN'e özeldir.
  const [userRole, setUserRole] = useState<'ADMIN' | 'STAFF' | null>(null);
  const isStaffOnly = userRole === 'STAFF';
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState('');

  // Aktif sekme adres çubuğunda (?sekme=) tutulur: sayfa yenilenince veya bağlantı paylaşılınca aynı ekran açılır
  const [activeTab, setActiveTabState] = useState<AdminTabId>('overview');
  const [openMessageCount, setOpenMessageCount] = useState<number | undefined>(undefined);
  const [newRequestCount, setNewRequestCount] = useState<number | undefined>(undefined);

  const setActiveTab = (tab: AdminTabId) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('sekme', tab);
    window.history.replaceState(null, '', url.toString());
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('sekme') as AdminTabId | null;
    if (fromUrl && findNavItem(fromUrl)) setActiveTabState(fromUrl);
  }, []);

  // Başarı/hata bildirimi yalnız toast ile (sayfa içi tekrar eden bant yok)
  const showSaveSuccess = (msg: string) => {
    toast.success('Kaydedildi', msg);
  };

  const showError = (msg: string) => {
    toast.error('İşlem tamamlanamadı', msg);
  };

  // CMS Store Selectors
  const products = useCMSStore((state) => state.products);
  const addProduct = useCMSStore((state) => state.addProduct);
  const updateProduct = useCMSStore((state) => state.updateProduct);
  const deleteProduct = useCMSStore((state) => state.deleteProduct);

  const categories = useCMSStore((state) => state.categories);
  const addCategory = useCMSStore((state) => state.addCategory);
  const updateCategory = useCMSStore((state) => state.updateCategory);
  const deleteCategory = useCMSStore((state) => state.deleteCategory);
  const reorderCategories = useCMSStore((state) => state.reorderCategories);

  const homeConfig = useCMSStore((state) => state.homeConfig);
  const updateHomeConfig = useCMSStore((state) => state.updateHomeConfig);

  const corporateConfig = useCMSStore((state) => state.corporateConfig);
  const updateCorporateConfig = useCMSStore((state) => state.updateCorporateConfig);

  const tickerItems = useCMSStore((state) => state.tickerItems);
  const addTickerItem = useCMSStore((state) => state.addTickerItem);
  const removeTickerItem = useCMSStore((state) => state.removeTickerItem);

  const campaignPopup = useCMSStore((state) => state.campaignPopup);

  const contactInfo = useCMSStore((state) => state.contactInfo);
  const updateContactInfo = useCMSStore((state) => state.updateContactInfo);


  // Check login session on mount via Backend JWT Verification (HttpOnly cookie via withCredentials)
  useEffect(() => {
    async function verifyAdminJWT() {
      try {
        const res = await apiClient.get('/auth/profile');
        const role = res.data?.user?.role;
        if (res.data?.success && (role === 'ADMIN' || role === 'STAFF')) {
          setUserRole(role);
          if (role === 'STAFF') setActiveTabState('orders');
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    }

    verifyAdminJWT();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'ADMIN') {
        const store = useCMSStore.getState();
        store.fetchProductsAndCategories({ includeDrafts: true });
        store.fetchStores({ includeInactive: true });
        store.fetchCmsBlocks();
      }
      apiClient
        .get('/contact', { params: { status: 'open', limit: 1 } })
        .then((res) => setOpenMessageCount(res.data?.openCount ?? 0))
        .catch(() => {});
      requestService
        .getAdminRequests({ status: 'NEW', page: 1, limit: 1 })
        .then((res) => setNewRequestCount(res?.pagination?.total ?? res?.requests?.length ?? 0))
        .catch(() => {});
    }
  }, [isAuthenticated, userRole]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanUser = loginUser.trim().toLowerCase();
    const cleanPass = loginPass.trim();

    try {
      // Direct REST API Admin Authentication (Cookie is set as HttpOnly by server)
      const res = await apiClient.post(
        '/auth/login',
        {
          email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@ermaymobilya.com`,
          password: cleanPass,
        }
      );

      if (res.data?.success) {
        const loginRole = res.data.user?.role;
        if (loginRole === 'ADMIN' || loginRole === 'STAFF') {
          setUserRole(loginRole);
          if (loginRole === 'STAFF') {
            setActiveTabState('orders');
          }
          setIsAuthenticated(true);
          setAuthError('');
          return;
        } else {
          setAuthError('Yetkisiz Giriş: Bu hesaba panel erişim yetkisi tanımlanmamıştır.');
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

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    setIsAuthenticated(false);
    setUserRole(null);
    document.cookie = 'admin_jwt_token=; path=/; max-age=0; SameSite=Lax';
    setLoginUser('');
    setLoginPass('');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-sm text-neutral-600">Oturum doğrulanıyor…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-line rounded-xs p-8 space-y-6">
          <div className="space-y-3">
            <BrandLogo variant="onLight" className="h-11 w-auto" priority />
            <div>
              <h1 className="text-xl font-display font-bold text-ink">Yönetim paneli girişi</h1>
              <p className="text-sm text-neutral-600 mt-1">Kullanıcı adınız ve şifrenizle giriş yapın.</p>
            </div>
          </div>

          {authError && (
            <div role="alert" className="border-l-4 border-signal bg-signal/5 text-ink p-3 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-signal" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-user" className="text-sm font-medium text-ink block mb-1.5">
                Kullanıcı adı veya e-posta
              </label>
              <div className="relative">
                <input
                  id="admin-user"
                  type="text"
                  required
                  autoComplete="username"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full pl-10 pr-3 h-11 text-base sm:text-sm border border-line-strong rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
                />
                <User className="absolute left-3 top-3.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <div>
              <label htmlFor="admin-pass" className="text-sm font-medium text-ink block mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="admin-pass"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full pl-10 pr-3 h-11 text-base sm:text-sm border border-line-strong rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
                />
                <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand hover:bg-ink text-ink text-sm font-semibold h-11 rounded-xs transition-colors cursor-pointer"
            >
              Giriş yap
            </button>
          </form>

          <Link href="/" className="block text-sm text-neutral-600 hover:text-ink">
            ← Siteye dön
          </Link>
        </div>
      </div>
    );
  }

  const staffBlocked = isStaffOnly && activeTab !== 'orders' && activeTab !== 'messages';

  return (
    <AdminShell
      activeTab={staffBlocked ? 'orders' : activeTab}
      onSelectTab={setActiveTab}
      onLogout={handleLogout}
      isStaffOnly={isStaffOnly}
      counts={{
        orders: newRequestCount,
        messages: openMessageCount,
      }}
    >
      {(staffBlocked || activeTab === 'orders') && <OrdersTab onShowSuccess={showSaveSuccess} />}

      {!staffBlocked && activeTab === 'messages' && <ContactMessagesTab onOpenCountChange={setOpenMessageCount} />}

      {!isStaffOnly && (
        <>
          {activeTab === 'overview' && (
            <OverviewTab
              products={products}
              categoriesCount={categories.length}
              campaignEnabled={campaignPopup.enabled}
              discountCode={campaignPopup.discountCode}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              products={products}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onReorderCategories={reorderCategories}
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

          {activeTab === 'erpSync' && (
            <ErpSyncTab categories={categories} onShowSuccess={showSaveSuccess} onShowError={showError} />
          )}

          {activeTab === 'deliveryZones' && <DeliveryZonesTab onShowSuccess={showSaveSuccess} onShowError={showError} />}

          {activeTab === 'landingPage' && <LandingPageTab onShowSuccess={showSaveSuccess} onShowError={showError} />}

          {activeTab === 'blog' && <BlogTab onShowSuccess={showSaveSuccess} onShowError={showError} />}

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

          {activeTab === 'stores' && <StoresTab onShowSuccess={showSaveSuccess} />}

          {activeTab === 'ticker' && (
            <TickerTab
              tickerItems={tickerItems}
              onAddTickerItem={addTickerItem}
              onRemoveTickerItem={removeTickerItem}
              onShowSuccess={showSaveSuccess}
            />
          )}

          {activeTab === 'contact' && (
            <ContactTab contactInfo={contactInfo} onUpdateContactInfo={updateContactInfo} onShowSuccess={showSaveSuccess} />
          )}
        </>
      )}
    </AdminShell>
  );
}
