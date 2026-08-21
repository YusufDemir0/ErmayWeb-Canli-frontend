'use client';

import React from 'react';
import { 
  LayoutGrid, Truck, FolderTree, Package, Tag, Sliders, FileText, 
  Megaphone, Sparkles, Phone, Building2 
} from 'lucide-react';
import { AdminModuleMode } from './AdminHeader';

export type AdminTabId = 
  | 'overview' 
  | 'orders' 
  | 'categories' 
  | 'products' 
  | 'coupons'
  | 'homeCMS' 
  | 'corporateCMS' 
  | 'ticker' 
  | 'popup' 
  | 'contact'
  | 'stores';

interface AdminTabsNavProps {
  activeModule: AdminModuleMode;
  activeTab: AdminTabId;
  setActiveTab: (tab: AdminTabId) => void;
  counts: {
    orders: number;
    categories: number;
    products: number;
    coupons: number;
    tickerItems: number;
    stores?: number;
  };
}

export const AdminTabsNav: React.FC<AdminTabsNavProps> = ({
  activeModule,
  activeTab,
  setActiveTab,
  counts,
}) => {
  const ecommerceTabs = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutGrid },
    { id: 'orders', label: 'Siparişler', count: counts.orders, icon: Truck },
    { id: 'products', label: 'Ürün Kataloğu', count: counts.products, icon: Package },
    { id: 'categories', label: 'Kategoriler', count: counts.categories, icon: FolderTree },
    { id: 'coupons', label: 'Kuponlar', count: counts.coupons, icon: Tag },
  ];

  const cmsTabs = [
    { id: 'homeCMS', label: 'Ana Sayfa Tasarımı', icon: Sliders },
    { id: 'corporateCMS', label: 'Kurumsal Sayfalar', icon: FileText },
    { id: 'stores', label: 'Mağazalar & Bayiler', count: counts.stores, icon: Building2 },
    { id: 'ticker', label: 'Duyuru Bandı', count: counts.tickerItems, icon: Megaphone },
    { id: 'popup', label: 'Kampanya Popup', icon: Sparkles },
    { id: 'contact', label: 'İletişim Bilgileri', icon: Phone },
  ];

  const currentTabs = activeModule === 'ecommerce' ? ecommerceTabs : cmsTabs;

  return (
    <div className="flex overflow-x-auto bg-white border border-neutral-200 rounded-sm mb-6 shadow-xs divide-x divide-neutral-100">
      {currentTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTabId)}
            className={`flex items-center gap-2.5 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap relative border-b-2 ${
              isActive
                ? 'border-[#C5A880] text-[#7A6140] bg-[#FBF9F5]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-[#C5A880]' : 'text-neutral-400'}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                isActive ? 'bg-[#C5A880] text-white' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
