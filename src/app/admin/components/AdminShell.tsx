"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Truck,
  Inbox,
  Package,
  FolderTree,
  RefreshCw,
  Megaphone,
  Sliders,
  Palette,
  FileText,
  BookOpen,
  Building2,
  MapPin,
  Phone,
  LogOut,
  ExternalLink,
  Menu,
  X,
  LayoutTemplate,
} from "lucide-react";
import BrandLogo from "../../../components/BrandLogo";
import { useModalDismiss } from "../../../lib/useModalDismiss";

export type AdminTabId =
  | "overview"
  | "orders"
  | "messages"
  | "products"
  | "erpSync"
  | "deliveryZones"
  | "categories"
  | "landingPage"
  | "blog"
  | "pageContent"
  | "pageDesign"
  | "ticker"
  | "tickerStyle"
  | "contact"
  | "stores";

/** Eski bağlantılar (?sekme=homeCMS) yeni ekranlara yönlenir */
export const LEGACY_TAB_ALIASES: Record<string, AdminTabId> = {
  homeCMS: "pageContent",
  corporateCMS: "pageContent",
};

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

interface NavArm {
  /** Ana kol: Ürün (satış ve katalog) ya da CMS (içerik ve tasarım) */
  title: string;
  groups: NavGroup[];
}

/** Menü iki ana koldan oluşur. STAFF yalnız "staff: true" olanları görür. */
export const ADMIN_ARMS: NavArm[] = [
  {
    title: "Ürün",
    groups: [
      {
        title: "Satış",
        items: [
          {
            id: "overview",
            label: "Genel bakış",
            description: "Bugünkü talepler, bekleyen işler ve hızlı erişim.",
            icon: LayoutGrid,
          },
          {
            id: "orders",
            label: "Sipariş talepleri",
            description:
              "Siteden gelen talepleri inceleyin, durumunu güncelleyin.",
            icon: Truck,
            staff: true,
          },
          {
            id: "messages",
            label: "Gelen mesajlar",
            description: "İletişim formundan gelen mesajlar.",
            icon: Inbox,
            staff: true,
          },
        ],
      },
      {
        title: "Katalog",
        items: [
          {
            id: "products",
            label: "Ürünler",
            description: "Ürün ekleyin, düzenleyin, yayına alın veya kaldırın.",
            icon: Package,
          },
          {
            id: "categories",
            label: "Kategoriler",
            description: "Kategori adı, görseli ve sırası.",
            icon: FolderTree,
          },
          {
            id: "erpSync",
            label: "ERP eşitleme",
            description: "ERP ile fiyat/stok eşitlemesi ve ürün eşleştirme.",
            icon: RefreshCw,
          },
        ],
      },
      {
        title: "Mağaza ve teslimat",
        items: [
          {
            id: "stores",
            label: "Mağazalar",
            description:
              "Showroom ve bayi adresleri (Bayiler sayfası ve harita).",
            icon: Building2,
          },
          {
            id: "deliveryZones",
            label: "Teslimat bölgeleri",
            description: "Teslimat yapılmayan iller.",
            icon: MapPin,
          },
        ],
      },
    ],
  },
  {
    title: "CMS",
    groups: [
      {
        title: "İçerik",
        items: [
          {
            id: "pageContent",
            label: "Sayfa metinleri",
            description:
              "Ana sayfa, Kurumsal ve İletişim sayfalarının metin ve görselleri. Önizlemede tıklayarak düzenleyin.",
            icon: FileText,
          },
          {
            id: "ticker",
            label: "Duyuru metinleri",
            description: "Üstte kayan bantta görünen duyurular.",
            icon: Megaphone,
          },
          {
            id: "contact",
            label: "İletişim bilgileri",
            description: "Telefon, WhatsApp, e-posta, adres ve sosyal medya.",
            icon: Phone,
          },
          {
            id: "blog",
            label: "Blog",
            description: "Blog yazıları ve SEO içerikleri.",
            icon: BookOpen,
          },
        ],
      },
      {
        title: "Tasarım",
        items: [
          {
            id: "pageDesign",
            label: "Sayfa düzeni",
            description:
              "Bölümleri sıralayın, gizleyin, etiket ve zemin seçin, yeni bölüm ekleyin.",
            icon: LayoutTemplate,
          },
          {
            id: "tickerStyle",
            label: "Duyuru bandı görünümü",
            description: "Bandın rengi ve kayma hızı.",
            icon: Palette,
          },
          {
            id: "landingPage",
            label: "Açılış sayfası",
            description: "Ziyaretçi siteye girince hangi sayfayı görsün?",
            icon: Sliders,
          },
        ],
      },
    ],
  },
];

/** Tam genişlik kullanan ekranlar (canlı önizlemeli düzenleyiciler) */
export const WIDE_TABS: AdminTabId[] = ["pageContent", "pageDesign"];

export const ADMIN_NAV: NavGroup[] = ADMIN_ARMS.flatMap((a) => a.groups);

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

export const AdminShell: React.FC<AdminShellProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  isStaffOnly,
  counts,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  useModalDismiss(mobileOpen, closeMobile);
  const arms = ADMIN_ARMS.map((arm) => ({
    ...arm,
    groups: arm.groups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => !isStaffOnly || i.staff),
      }))
      .filter((g) => g.items.length > 0),
  })).filter((arm) => arm.groups.length > 0);
  const wide = WIDE_TABS.includes(activeTab);
  const current = findNavItem(activeTab);

  const nav = (
    <nav
      aria-label="Yönetim menüsü"
      className="flex-1 overflow-y-auto px-3 py-4 space-y-6"
    >
      {arms.map((arm) => (
        <div key={arm.title} className="space-y-4">
          <p className="px-3 text-sm font-semibold text-white border-b border-white/10 pb-1.5">
            {arm.title}
          </p>
          {arm.groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-1.5 text-xs font-medium text-neutral-500">
                {group.title}
              </p>
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
                        aria-current={isActive ? "page" : undefined}
                        className={`w-full flex items-center gap-3 px-3 h-10 rounded-xs text-sm transition-colors cursor-pointer ${
                          isActive
                            ? "bg-brand text-ink font-semibold"
                            : "text-neutral-200 hover:bg-white/10"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {!!count && (
                          <span
                            className={`min-w-6 h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center tabular-nums-all ${
                              isActive
                                ? "bg-ink text-white"
                                : "bg-brand text-ink"
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
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="h-11 w-11 -ml-2 flex items-center justify-center"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">
          {current?.label || "Yönetim paneli"}
        </span>
        <span className="w-9" />
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-ink text-white flex flex-col h-full animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <BrandLogo variant="onDark" className="h-9 w-auto" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="h-11 w-11 -mr-2 flex items-center justify-center"
                aria-label="Menüyü kapat"
              >
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
          <div className={`${wide ? "" : "max-w-6xl"} mx-auto px-8 py-5`}>
            <h1 className="font-display text-2xl font-bold text-ink tracking-tight">
              {current?.label}
            </h1>
            {current?.description && (
              <p className="text-sm text-neutral-600 mt-0.5">
                {current.description}
              </p>
            )}
          </div>
        </header>
        <div
          className={`${wide ? "px-3 lg:px-4 py-3" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"}`}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminShell;
