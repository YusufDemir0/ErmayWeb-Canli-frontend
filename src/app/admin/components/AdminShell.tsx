"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Search,
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

/** Hızlı aramada eşleşecek ek kelimeler (ekranın adında geçmeyen ama kullanıcının arayacağı şeyler) */
const KEYWORDS: Partial<Record<AdminTabId, string>> = {
  overview: "özet panel bugün",
  orders: "sipariş talep müşteri durum whatsapp",
  messages: "mesaj iletişim formu gelen kutusu",
  products: "ürün fiyat görsel stok yayın taslak renk ölçü",
  categories: "kategori sıra görsel alt kategori",
  erpSync: "erp eşleştirme senkron stok fiyat",
  stores: "mağaza bayi showroom adres harita şube",
  deliveryZones: "teslimat il şehir kargo montaj bölge",
  pageContent: "sayfa metin içerik kurumsal kvkk hakkımızda iletişim sayfası slayt kapak ana sayfa",
  ticker: "duyuru bant kayan yazı kampanya",
  contact: "telefon whatsapp e-posta adres sosyal medya instagram telegram çalışma saatleri",
  blog: "blog yazı makale seo",
  pageDesign: "tasarım düzen sırala gizle etiket zemin bölüm ekle",
  tickerStyle: "duyuru bandı renk hız",
  landingPage: "açılış sayfası ana sayfa yönlendirme",
};

const armOf = (id: AdminTabId): string =>
  ADMIN_ARMS.find((a) => a.groups.some((g) => g.items.some((i) => i.id === id)))?.title || ADMIN_ARMS[0].title;

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

  // Yan menü yalnız seçili kolu (Ürün ya da CMS) gösterir; etkin ekranın kolu otomatik seçilir
  const [arm, setArm] = useState(() => armOf(activeTab));
  useEffect(() => setArm(armOf(activeTab)), [activeTab]);
  const visibleArm = arms.find((a) => a.title === arm) || arms[0];

  // Hızlı arama (Ctrl+K)
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const allItems = useMemo(
    () => arms.flatMap((a) => a.groups.flatMap((g) => g.items.map((i) => ({ ...i, arm: a.title, group: g.title })))),
    [arms]
  );

  const nav = (
    <nav
      aria-label="Yönetim menüsü"
      className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
    >
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="w-full flex items-center gap-2 h-9 px-3 rounded-xs bg-white/10 hover:bg-white/15 text-sm text-neutral-300 cursor-pointer"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Ekran ara</span>
        <kbd className="text-[11px] font-mono text-neutral-400 border border-white/20 rounded px-1">Ctrl K</kbd>
      </button>
      {arms.length > 1 && (
        <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xs" role="tablist" aria-label="Bölüm">
          {arms.map((a) => (
            <button
              key={a.title}
              type="button"
              role="tab"
              aria-selected={a.title === visibleArm?.title}
              onClick={() => setArm(a.title)}
              className={`h-8 text-sm rounded-xs cursor-pointer ${a.title === visibleArm?.title ? "bg-white text-ink font-semibold" : "text-neutral-300 hover:bg-white/10"}`}
            >
              {a.title}
            </button>
          ))}
        </div>
      )}
      {[visibleArm].filter(Boolean).map((arm) => (
        <div key={arm.title} className="space-y-4">
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

      {paletteOpen && (
        <CommandPalette
          items={allItems}
          onClose={() => setPaletteOpen(false)}
          onPick={(id) => {
            onSelectTab(id);
            setPaletteOpen(false);
            setMobileOpen(false);
          }}
        />
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

interface PaletteItem extends NavItem {
  arm: string;
  group: string;
}

const trLower = (s: string) => s.toLocaleLowerCase("tr-TR");

/** Ctrl+K: ekranı adıyla ya da içindeki işle bul ("kvkk", "mağaza", "duyuru rengi") */
function CommandPalette({ items, onClose, onPick }: { items: PaletteItem[]; onClose: () => void; onPick: (id: AdminTabId) => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  useModalDismiss(true, onClose);

  const results = useMemo(() => {
    const words = trLower(q).split(/\s+/).filter(Boolean);
    if (!words.length) return items;
    return items.filter((i) => {
      const hay = trLower(`${i.label} ${i.description} ${i.group} ${i.arm} ${KEYWORDS[i.id] || ""}`);
      return words.every((w) => hay.includes(w));
    });
  }, [q, items]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Ekran ara">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xs shadow-2xl border border-line overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b border-line">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            ref={inputRef}
            value={q}
            maxLength={60}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                onPick(results[active].id);
              }
            }}
            placeholder="Ne yapmak istiyorsunuz? (ör. mağaza ekle, kvkk, duyuru rengi)"
            className="flex-1 h-12 text-sm focus:outline-none"
            aria-label="Ekran ara"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-1" role="listbox">
          {results.length === 0 && <li className="px-4 py-3 text-sm text-neutral-500">Eşleşen ekran yok.</li>}
          {results.map((i, idx) => {
            const Icon = i.icon;
            return (
              <li key={i.id} role="option" aria-selected={idx === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => onPick(i.id)}
                  className={`w-full text-left px-4 py-2.5 flex items-start gap-3 cursor-pointer ${idx === active ? "bg-paper" : ""}`}
                >
                  <Icon className="h-4 w-4 mt-0.5 text-wood-dark shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">
                      {i.label} <span className="text-xs font-normal text-neutral-500">· {i.arm} / {i.group}</span>
                    </span>
                    <span className="block text-xs text-neutral-500 truncate">{i.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default AdminShell;
