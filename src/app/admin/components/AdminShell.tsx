'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutGrid, Truck, Inbox, Package, FolderTree, RefreshCw, Home, Megaphone, Sliders,
  FileText, BookOpen, Building2, MapPin, Phone, LogOut, ExternalLink, Menu, X,
} from 'lucide-react';
import BrandLogo from '../../../components/BrandLogo';

export type AdminTabId =
  | 'overview'
  | 'orders'
  | 'messages'
  | 'products'
  | 'erpSync'
  | 'deliveryZones'
  | 'categories'
  | 'landingPage'
  | 'blog'
  | 'homeCMS'
  | 'corporateCMS'
  | 'ticker'
  | 'contact'
  | 'stores';

interface NavItem {
  id: AdminTabId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  staff?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Menü: işin akışına göre gruplu. STAFF yalnız "staff: true" olanları görür. */
export const ADMIN_NAV: NavGroup[] = [
  {
    title: 'Satış',
    items: [
      { id: 'overview', label: 'Genel bakış', description: 'Bugünkü talepler, bekleyen işler ve hızlı erişim.', icon: LayoutGrid },
      { id: 'orders', label: 'Sipariş talepleri', description: 'Siteden gelen talepleri inceleyin, durumunu güncelleyin.', icon: Truck, staff: true },
      { id: 'messages', label: 'Gelen mesajlar', description: 'İletişim formundan gelen mesajlar.', icon: Inbox, staff: true },
    ],
  },
  {
    title: 'Katalog',
    items: [
      { id: 'products', label: 'Ürünler', description: 'Ürün ekleyin, düzenleyin, yayına alın veya kaldırın.', icon: Package },
      { id: 'categories', label: 'Kategoriler', description: 'Kategori adı, görseli ve sırası.', icon: FolderTree },
      { id: 'erpSync', label: 'ERP eşitleme', description: 'ERP ile fiyat/stok eşitlemesi ve ürün eşleştirme.', icon: RefreshCw },
    ],
  },
  {
    title: 'Site içeriği',
    items: [
      { id: 'homeCMS', label: 'Ana sayfa', description: 'Slaytlar ve ana sayfa başlıkları.', icon: Home },
      { id: 'ticker', label: 'Duyuru bandı', description: 'Üstte kayan duyurular, renk ve hız.', icon: Megaphone },
      { id: 'landingPage', label: 'Açılış sayfası', description: 'Ziyaretçi siteye girince hangi sayfayı görsün?', icon: Sliders },
      { id: 'corporateCMS', label: 'Kurumsal sayfa', description: 'Hakkımızda sayfasının metin ve görselleri.', icon: FileText },
      { id: 'blog', label: 'Blog', description: 'Blog yazıları ve SEO içerikleri.', icon: BookOpen },
    ],
  },
  {
    title: 'Ayarlar',
    items: [
      { id: 'stores', label: 'Mağazalar', description: 'Showroom ve bayi adresleri (Bayiler sayfası ve harita).', icon: Building2 },
      { id: 'deliveryZones', label: 'Teslimat bölgeleri', description: 'Teslimat yapılmayan iller.', icon: MapPin },
      { id: 'contact', label: 'İletişim bilgileri', description: 'Telefon, WhatsApp, e-posta ve adres.', icon: Phone },
    ],
  },
];

export const findNavItem = (id: AdminTabId): NavItem | undefined =>
  ADMIN_NAV.flatMap((g) => g.items).find((i) => i.id === id);

interface AdminShellProps {
  activeTab: AdminTabId;
  onSelectTab: (tab: AdminTabId) => void;
  onLogout: () => void;
  isStaffOnly: boolean;
  counts: Partial<Record<AdminTabId, number | undefined>>;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ activeTab, onSelectTab, onLogout, isStaffOnly, counts, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const groups = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => !isStaffOnly || i.staff) })).filter(
    (g) => g.items.length > 0
  );
  const current = findNavItem(activeTab);

  const nav = (
    <nav aria-label="Yönetim menüsü" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 mb-1.5 text-xs font-medium text-neutral-500">{group.title}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeTab;
              const count = counts[item.id];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 h-10 rounded-xs text-sm transition-colors cursor-pointer ${
                      isActive ? 'bg-brand text-ink font-semibold' : 'text-neutral-200 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {!!count && (
                      <span
                        className={`min-w-6 h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center tabular-nums-all ${
                          isActive ? 'bg-ink text-white' : 'bg-brand text-ink'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3 space-y-1">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 px-3 h-10 rounded-xs text-sm text-neutral-200 hover:bg-white/10"
      >
        <ExternalLink className="h-4 w-4" />
        <span>Siteyi yeni sekmede aç</span>
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 h-10 rounded-xs text-sm text-neutral-200 hover:bg-white/10 cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span>Çıkış yap</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Masaüstü yan menü */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-ink text-white h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/10">
          <BrandLogo variant="onDark" className="h-10 w-auto" />
          <p className="text-xs text-neutral-500 mt-2">Yönetim paneli</p>
        </div>
        {nav}
        {footer}
      </aside>

      {/* Mobil üst çubuk + çekmece */}
      <div className="lg:hidden sticky top-0 z-40 bg-ink text-white flex items-center justify-between px-4 h-14">
        <button type="button" onClick={() => setMobileOpen(true)} className="h-11 w-11 -ml-2 flex items-center justify-center" aria-label="Menüyü aç">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">{current?.label || 'Yönetim paneli'}</span>
        <span className="w-9" />
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-ink text-white flex flex-col h-full animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <BrandLogo variant="onDark" className="h-9 w-auto" />
              <button type="button" onClick={() => setMobileOpen(false)} className="h-11 w-11 -mr-2 flex items-center justify-center" aria-label="Menüyü kapat">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="hidden lg:block border-b border-line bg-white">
          <div className="max-w-6xl mx-auto px-8 py-5">
            <h1 className="font-display text-2xl font-bold text-ink tracking-tight">{current?.label}</h1>
            {current?.description && <p className="text-sm text-neutral-600 mt-0.5">{current.description}</p>}
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminShell;
