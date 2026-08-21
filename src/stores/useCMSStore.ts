import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Category, StoreItem } from '../types';
import { PRODUCTS } from '../data/mockData';
import apiClient from '../services/api';

export interface CampaignPopupConfig {
  enabled: boolean;
  popupType?: 'coupon' | 'collection' | 'announcement';
  title: string;
  subtitle: string;
  discountCode: string;
  badgeText: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface ContactInfoConfig {
  phone: string;
  fax: string;
  email: string;
  address: string;
  whatsapp: string;
  showroom: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

export interface HomeConfig {
  heroSlides: HeroSlide[];
  featuredTitle: string;
  featuredSubtitle: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
}

export interface CorporateConfig {
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImage: string;
  storyTitle: string;
  storyContent?: string; // Unified adaptive multi-paragraph rich text
  storyParagraph1?: string;
  storyParagraph2?: string;
  experienceYears: string;
  experienceSubtitle: string;
  storyImage: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionText: string;
  qualityTitle: string;
  qualityText: string;
}

interface CMSState {
  tickerItems: string[];
  campaignPopup: CampaignPopupConfig;
  contactInfo: ContactInfoConfig;
  products: Product[];
  categories: Category[];
  stores: StoreItem[];
  homeConfig: HomeConfig;
  corporateConfig: CorporateConfig;
  isLoading: boolean;

  // Actions
  fetchCmsBlocks: () => Promise<void>;
  fetchProductsAndCategories: () => Promise<void>;

  setTickerItems: (items: string[]) => void;
  addTickerItem: (item: string) => void;
  removeTickerItem: (index: number) => void;

  updateCampaignPopup: (config: Partial<CampaignPopupConfig>) => void;
  updateContactInfo: (config: Partial<ContactInfoConfig>) => void;

  // Category CRUD
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<{ success: boolean; message: string }>;

  // Product CRUD
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProductsToDefault: () => void;

  // Store CRUD
  fetchStores: () => Promise<void>;
  addStore: (store: StoreItem) => Promise<void>;
  updateStore: (id: string, store: Partial<StoreItem>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;

  // Home & Corporate CMS Actions
  updateHomeConfig: (config: Partial<HomeConfig>) => void;
  updateCorporateConfig: (config: Partial<CorporateConfig>) => void;
}

const DEFAULT_TICKER = [
  '• ÜCRETSİZ KARGO & MONTAJ',
  '• 12 TAKSİT İMKANI',
  '• 5 YIL İSKELET GARANTİSİ',
  '• DOĞRUDAN ÜRETİCİDEN SATIŞ'
];

const DEFAULT_POPUP: CampaignPopupConfig = {
  enabled: true,
  popupType: 'coupon',
  title: 'YENİ SEZON KOLEKSİYONU',
  subtitle: 'Özel tasarım ürünlerimizde sepette ekstra %15 indirim fırsatı!',
  discountCode: 'YENISEZON15',
  badgeText: 'FIRSAT',
  image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
  buttonText: 'Koleksiyonu İncele',
  buttonLink: '/katalog'
};

const DEFAULT_CONTACT: ContactInfoConfig = {
  phone: '0532 419 41 51',
  fax: '+90 (216) 555 42 42',
  email: 'info@ermaymobilya.com',
  address: 'Modoko Mobilyacılar Sitesi 1. Cadde No: 42, Ümraniye / İstanbul',
  whatsapp: '905324194151',
  showroom: 'Modoko Mobilyacılar Sitesi 1. Cadde No: 42, Ümraniye / İstanbul'
};

export const DEFAULT_STORES: StoreItem[] = [
  {
    id: 'store-1',
    name: 'Ermay Modoko Merkez Mağaza',
    city: 'İstanbul',
    district: 'Ümraniye / Modoko',
    address: 'Modoko Mobilyacılar Sitesi, No: 42, 34775 Ümraniye / İstanbul',
    phone: '0532 419 41 51',
    email: 'istanbul@ermaymobilya.com',
    hours: 'Hafta içi: 09:00 - 20:00 | Hafta sonu: 10:00 - 19:00',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'store-2',
    name: 'Ermay Kocaeli Fabrika Satış Mağazası',
    city: 'Kocaeli',
    district: 'İzmit',
    address: 'Kadıköy Bağdat Cd. No: 141, 41050 İzmit / Kocaeli',
    phone: '0532 419 41 51',
    email: 'kocaeli@ermaymobilya.com',
    hours: 'Hafta içi: 09:00 - 19:00 | Cumartesi: 09:00 - 18:00',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'store-3',
    name: 'Ermay Sakarya Mağaza',
    city: 'Sakarya',
    district: 'Serdivan',
    address: 'İstiklal Cd. No: 88, Serdivan / Sakarya',
    phone: '0532 419 41 51',
    email: 'sakarya@ermaymobilya.com',
    hours: 'Hafta içi: 09:00 - 19:00 | Cumartesi: 09:00 - 18:00',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800'
  }
];

const DEFAULT_HOME_CONFIG: HomeConfig = {
  heroSlides: [
    {
      id: 'slide-1',
      title: 'Zamansız Tasarım & Lüks Konfor',
      subtitle: 'Ermay Mobilya ile yaşam alanlarınıza İtalyan zarafeti katın.',
      badge: '2026 ÖZEL KOLEKSİYON',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600',
      buttonText: 'Koleksiyonu Keşfet',
      buttonLink: '/katalog'
    }
  ],
  featuredTitle: 'Öne Çıkan Ürünler',
  featuredSubtitle: 'En çok tercih edilen lüks mobilya tasarımlarımız',
  categoriesTitle: 'Kategoriler',
  categoriesSubtitle: 'Evinizin her köşesi için özel tasarımlar'
};

const DEFAULT_CORPORATE_CONFIG: CorporateConfig = {
  heroBadge: '40 YILLIK TECRÜBE',
  heroTitle: 'Geleneksel Ahşap Ustalığı,',
  heroHighlight: 'Modern İtalyan Çizgisi.',
  heroSubtitle: '1986 yılından bu yana Modoko merkezli atölyelerimizde üretilen lüks mobilyalar.',
  heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
  storyTitle: 'Zanaat ve Estetiğin Buluşması',
  storyContent: `Ermay Mobilya, kurucumuzun ahşaba olan tutkusuyla küçük bir atölyede başlayan yolculuğunu bugün modern üretim tesisleri ve geniş satış ağı ile sürdürmektedir.\n\nHer bir parçada kullanılan %100 fırınlanmış gürgen ağacı, birinci sınıf çelik konstrüksiyon ve hakiki döşemelik kumaşlar, usta zanaatkarlarımızın elinde zamansız mobilyalara dönüşür.`,
  storyParagraph1: 'Ermay Mobilya, kurucumuzun ahşaba olan tutkusuyla küçük bir atölyede başlayan yolculuğunu bugün geniş satış ağı ile sürdürmektedir.',
  storyParagraph2: 'Her bir parçada kullanılan %100 fırınlanmış gürgen ağacı ve hakiki döşemeler, usta zanaatkarlarımızın elinde zamansız mobilyalara dönüşür.',
  experienceYears: '40+',
  experienceSubtitle: 'Yıllık İmalat Tecrübesi',
  storyImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000',
  visionTitle: 'Vizyonumuz',
  visionText: 'Türk mobilya zanaatını dünya ölçeğinde lüks ve kalite standartlarıyla temsil eden öncü marka olmak.',
  missionTitle: 'Misyonumuz',
  missionText: 'Yaşam alanlarına değer katan, ergonomik, estetik ve nesiller boyu kullanılan kaliteli mobilyalar üretmek.',
  qualityTitle: 'Kalite Politikamız',
  qualityText: 'Kullandığımız tüm hammaddelerde uluslararası sertifikalı masif ahşap ve E1 normunda çevreci malzemeler tercih ediyoruz.'
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Koltuk Takımları',
    slug: 'koltuk-takimlari',
    description: 'İtalyan deri ve kumaş köşe koltuklar',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'cat-2',
    name: 'Yemek Odası',
    slug: 'yemek-odalari',
    description: 'Masif ahşap ve mermer masalar',
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'cat-3',
    name: 'Makam Takımları',
    slug: 'makam-takimlari',
    description: 'Ergonomik ve prestijli ofis takımları',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'cat-4',
    name: 'Yatak Odası',
    slug: 'yatak-odalari',
    description: 'Lüks karyola ve gardırop çözümleri',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'cat-5',
    name: 'TV Üniteleri',
    slug: 'tv-uniteleri',
    description: 'Modüler yaşam alanı konsolları',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'cat-6',
    name: 'Aksesuarlar',
    slug: 'aksesuarlar',
    description: 'Aydınlatma, ayna ve sehpa çeşitleri',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
  },
];

export const useCMSStore = create<CMSState>()(
  persist(
    (set, get) => ({
      tickerItems: DEFAULT_TICKER,
      campaignPopup: DEFAULT_POPUP,
      contactInfo: DEFAULT_CONTACT,
      products: PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      stores: DEFAULT_STORES,
      homeConfig: DEFAULT_HOME_CONFIG,
      corporateConfig: DEFAULT_CORPORATE_CONFIG,
      isLoading: false,

      fetchCmsBlocks: async () => {
        set({ isLoading: true });
        try {
          const res = await apiClient.get('/cms');
          if (res.data?.success && res.data.cms) {
            const cms = res.data.cms;
            set({
              tickerItems: cms.ticker_items || get().tickerItems,
              campaignPopup: cms.campaign_popup || get().campaignPopup,
              contactInfo: cms.contact_info || get().contactInfo,
              homeConfig: cms.home_config
                ? { ...get().homeConfig, ...cms.home_config }
                : cms.home_hero
                ? {
                    ...get().homeConfig,
                    heroSlides: Array.isArray(cms.home_hero)
                      ? cms.home_hero
                      : [cms.home_hero],
                  }
                : get().homeConfig,
              corporateConfig: cms.corporate_config || get().corporateConfig,
            });
          }
        } catch (err) {
          console.warn('REST API CMS blokları çekme uyarısı:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProductsAndCategories: async () => {
        try {
          const [prodRes, catRes] = await Promise.all([
            apiClient.get('/products').catch(() => ({ data: { success: false, products: [] } })),
            apiClient.get('/categories').catch(() => ({ data: { success: false, categories: [] } })),
          ]);

          if (prodRes.data?.success && Array.isArray(prodRes.data.products) && prodRes.data.products.length > 0) {
            set({ products: prodRes.data.products });
          } else if (!get().products || get().products.length === 0) {
            set({ products: PRODUCTS });
          }

          if (catRes.data?.success && Array.isArray(catRes.data.categories) && catRes.data.categories.length > 0) {
            set({ categories: catRes.data.categories });
          } else if (!get().categories || get().categories.length === 0) {
            set({ categories: DEFAULT_CATEGORIES });
          }
        } catch (err) {
          console.warn('REST API ürün/kategori çekme uyarısı:', err);
          if (!get().products || get().products.length === 0) {
            set({ products: PRODUCTS });
          }
        }
      },

      setTickerItems: (items) => {
        set({ tickerItems: items });
        apiClient.put('/cms/ticker_items', { content: items }).catch((e) => console.warn(e));
      },

      addTickerItem: (item) => {
        const updated = [...get().tickerItems, item];
        set({ tickerItems: updated });
        apiClient.put('/cms/ticker_items', { content: updated }).catch((e) => console.warn(e));
      },

      removeTickerItem: (index) => {
        const updated = get().tickerItems.filter((_, i) => i !== index);
        set({ tickerItems: updated });
        apiClient.put('/cms/ticker_items', { content: updated }).catch((e) => console.warn(e));
      },

      updateCampaignPopup: (config) => {
        const updated = { ...get().campaignPopup, ...config };
        set({ campaignPopup: updated });
        apiClient.put('/cms/campaign_popup', { content: updated }).catch((e) => console.warn(e));
      },

      updateContactInfo: (config) => {
        const updated = { ...get().contactInfo, ...config };
        set({ contactInfo: updated });
        apiClient.put('/cms/contact_info', { content: updated }).catch((e) => console.warn(e));
      },

      addCategory: async (category) => {
        set((state) => ({ categories: [category, ...state.categories] }));
        try {
          const res = await apiClient.post('/categories', category);
          if (res.data?.success && res.data.category) {
            get().fetchProductsAndCategories();
          }
        } catch (e) {
          console.warn('Kategori ekleme hatası:', e);
        }
      },

      updateCategory: async (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c))
        }));
        try {
          await apiClient.put(`/categories/${id}`, category);
        } catch (e) {
          console.warn('Kategori güncelleme hatası:', e);
        }
      },

      deleteCategory: async (id) => {
        const hasProducts = get().products.some((p) => p.category_id === id || p.category === id);
        if (hasProducts) {
          return { success: false, message: 'Bu kategoriye ait ürünler olduğu için silinemez!' };
        }
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
        }));
        try {
          await apiClient.delete(`/categories/${id}`);
        } catch (e) {
          console.warn('Kategori silme hatası:', e);
        }
        return { success: true, message: 'Kategori silindi.' };
      },

      addProduct: async (product) => {
        set((state) => ({ products: [product, ...state.products] }));
        try {
          const res = await apiClient.post('/products', product);
          if (res.data?.success && res.data.product) {
            get().fetchProductsAndCategories();
          }
        } catch (e) {
          console.warn('Ürün ekleme hatası:', e);
        }
      },

      updateProduct: async (id, product) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p))
        }));
        try {
          await apiClient.put(`/products/${id}`, product);
        } catch (e) {
          console.warn('Ürün güncelleme hatası:', e);
        }
      },

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        }));
        try {
          await apiClient.delete(`/products/${id}`);
        } catch (e) {
          console.warn('Ürün silme hatası:', e);
        }
      },

      resetProductsToDefault: () => {},

      fetchStores: async () => {
        try {
          const res = await apiClient.get('/stores');
          if (res.data?.success && Array.isArray(res.data.stores) && res.data.stores.length > 0) {
            set({ stores: res.data.stores });
          }
        } catch (e) {
          console.warn('Mağazalar API üzerinden yüklenemedi:', e);
        }
      },

      addStore: async (store) => {
        set((state) => ({ stores: [store, ...state.stores] }));
        try {
          const res = await apiClient.post('/stores', store);
          if (res.data?.success && res.data.store) {
            get().fetchStores();
          }
        } catch (e) {
          console.warn('Mağaza API ekleme hatası:', e);
        }
      },

      updateStore: async (id, updatedFields) => {
        set((state) => ({
          stores: state.stores.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
        }));
        try {
          await apiClient.put(`/stores/${id}`, updatedFields);
        } catch (e) {
          console.warn('Mağaza API güncelleme hatası:', e);
        }
      },

      deleteStore: async (id) => {
        set((state) => ({
          stores: state.stores.filter((s) => s.id !== id)
        }));
        try {
          await apiClient.delete(`/stores/${id}`);
        } catch (e) {
          console.warn('Mağaza API silme hatası:', e);
        }
      },

      updateHomeConfig: (config) => {
        const updated = { ...get().homeConfig, ...config };
        set({ homeConfig: updated });
        apiClient.put('/cms/home_hero', { content: updated.heroSlides || [] }).catch((e) => console.warn(e));
        apiClient.put('/cms/home_config', { content: updated }).catch((e) => console.warn(e));
      },

      updateCorporateConfig: (config) => {
        const updated = { ...get().corporateConfig, ...config };
        set({ corporateConfig: updated });
        apiClient.put('/cms/corporate_config', { content: updated }).catch((e) => console.warn(e));
      }
    }),
    {
      name: 'ermay_cms_store',
    }
  )
);
