import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Category, StoreItem, SocialLinksConfig } from '../types';
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

export interface LandingPageConfig {
  type: 'home' | 'category' | 'catalog';
  targetSlug?: string;
  targetTitle?: string;
}

interface CMSState {
  tickerItems: string[];
  campaignPopup: CampaignPopupConfig;
  contactInfo: ContactInfoConfig;
  landingPageConfig: LandingPageConfig;
  products: Product[];
  categories: Category[];
  stores: StoreItem[];
  homeConfig: HomeConfig;
  corporateConfig: CorporateConfig;
  isLoading: boolean;

  // Actions
  fetchCmsBlocks: () => Promise<void>;
  fetchProductsAndCategories: () => Promise<void>;
  updateLandingPageConfig: (config: LandingPageConfig) => Promise<void>;

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

  // Social Links
  socialLinks: SocialLinksConfig;
  updateSocialLinks: (config: Partial<SocialLinksConfig>) => void;
}

export const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  instagram: 'https://instagram.com/ermaymobilya',
  youtube: 'https://youtube.com/@ermaymobilya',
  telegram: 'https://t.me/ErmayMobilya',
  whatsapp: '905324194151',
  facebook: 'https://facebook.com/ermaymobilya',
  tiktok: 'https://tiktok.com/@ermaymobilya',
};

const DEFAULT_TICKER = [
  '• DOĞRUDAN FABRİKADAN ARACISIZ SATIŞ',
  '• İSTANBUL İÇİ KENDİ ARACIMIZLA TESLİMAT & MONTAJ',
  '• ÇOKLU ALIMLARDA FABRİKA İSKONTOSU',
  '• 1. SINIF E1 MELAMİN & DAYANIKLI METAL İSKELET',
  '• 2 YIL RESMİ ÜRETİCİ GARANTİSİ'
];

const DEFAULT_POPUP: CampaignPopupConfig = {
  enabled: true,
  popupType: 'coupon',
  title: 'FABRİKA SATIŞ & TOPTAN İSKONTO',
  subtitle: 'Standart seri ofis mobilyalarımızda doğrudan üretici fiyatı ve toptan avantajı!',
  discountCode: 'FABRIKA10',
  badgeText: 'ÜRETİCİDEN',
  image: '/default-furniture.webp',
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
    image: '/default-furniture.webp'
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
    image: '/default-furniture.webp'
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
    image: '/default-furniture.webp'
  }
];

const DEFAULT_HOME_CONFIG: HomeConfig = {
  heroSlides: [
    {
      id: 'slide-1',
      title: 'Doğrudan Fabrikadan Aracısız Ofis Mobilyaları',
      subtitle: 'Kendi üretim tesislerimizde standart seri imalat; aracı komisyonu olmadan net fabrika fiyatıyla.',
      badge: 'FABRİKA SATIŞ GÜVENCESİ',
      image: '/default-furniture.webp',
      buttonText: 'Koleksiyonu Keşfet',
      buttonLink: '/katalog'
    }
  ],
  featuredTitle: 'Öne Çıkan Ofis Takımları',
  featuredSubtitle: 'En çok tercih edilen standart seri fabrika ofis mobilyalarımız',
  categoriesTitle: 'Kategoriler',
  categoriesSubtitle: 'Çalışma alanlarınız ve ofisiniz için standart seri fabrika imalatı çözümler'
};

const DEFAULT_CORPORATE_CONFIG: CorporateConfig = {
  heroBadge: 'DOĞRUDAN ÜRETİCİDEN',
  heroTitle: 'Fabrikadan Aracısız,',
  heroHighlight: 'Standart Seri Güvencesi.',
  heroSubtitle: 'Kendi üretim tesislerimizde standart seri olarak imal edilen dayanıklı ofis mobilyaları.',
  heroImage: '/default-furniture.webp',
  storyTitle: 'İmalat Felsefemiz ve Üretim Standartlarımız',
  storyContent: `Ermay Mobilya, modern üretim tesislerinde standart seri ofis mobilyası imalatı yaparak doğrudan kurumsal firmalara ve son kullanıcıya aracısız ulaştırmaktadır.\n\nÜrünlerimizde 1. sınıf E1 melamin paneller, darbe emici 2mm PVC kenar bantları ve elektrostatik fırın boyalı DKP çelik profil ayaklar kullanılarak sağlamlık ve uzun ömür güvence altına alınır. Aracı ve mağaza komisyonlarını ortadan kaldırarak en rekabetçi fabrika fiyatlarını sunuyoruz.`,
  storyParagraph1: 'Ermay Mobilya, modern tesislerinde standart seri ofis mobilyaları üreterek aracısız doğrudan satış gerçekleştirmektedir.',
  storyParagraph2: '1. Sınıf E1 melamin paneller, 2mm PVC kenar koruması ve dayanıklı çelik profil ayaklar ile uzun ömürlü kullanım sunar.',
  experienceYears: '40+',
  experienceSubtitle: 'Yıllık İmalat Güvencesi',
  storyImage: '/default-furniture.webp',
  visionTitle: 'Vizyonumuz',
  visionText: 'Ofis ve çalışma alanlarında uzun ömürlü, dayanıklı ve ergonomik standart seri mobilyaları en uygun fabrika fiyatıyla müşterilerimize ulaştırmak.',
  missionTitle: 'Misyonumuz',
  missionText: '1. Sınıf E1 melamin, darbe emici PVC ve elektrostatik boyalı çelik konstrüksiyon ile yüksek kalite standartlarında seri üretim.',
  qualityTitle: 'Kalite Politikamız',
  qualityText: 'Tüm ürünlerimizde E1 normunda insan sağlığına uygun antibakteriyel melamin ve yüksek mukavemetli metal profiller kullanıyoruz.'
};

export const DEFAULT_CATEGORIES: Category[] = [];

export const useCMSStore = create<CMSState>()((set, get) => ({
      tickerItems: DEFAULT_TICKER,
      campaignPopup: DEFAULT_POPUP,
      contactInfo: DEFAULT_CONTACT,
      landingPageConfig: { type: 'home' } as LandingPageConfig,
      products: [],
      categories: [],
      stores: DEFAULT_STORES,
      homeConfig: DEFAULT_HOME_CONFIG,
      corporateConfig: DEFAULT_CORPORATE_CONFIG,
      socialLinks: DEFAULT_SOCIAL_LINKS,
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
              landingPageConfig: (cms.landing_page_config as LandingPageConfig) || get().landingPageConfig,
              socialLinks: cms.social_links
                ? { ...DEFAULT_SOCIAL_LINKS, ...(cms.social_links as SocialLinksConfig) }
                : get().socialLinks,
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

      updateLandingPageConfig: async (config) => {
        set({ landingPageConfig: config });
        try {
          await apiClient.put('/cms/landing_page_config', { content: config });
        } catch (e) {
          console.warn('Açılış sayfası ayarı API kayıt hatası:', e);
        }
      },

      updateSocialLinks: (config) => {
        set((state) => {
          const updated = { ...state.socialLinks, ...config };
          apiClient.put('/cms/social_links', { content: updated }).catch((e) => console.warn('Social links save error:', e));
          return { socialLinks: updated };
        });
      },

      fetchProductsAndCategories: async () => {
        try {
          const [prodRes, catRes] = await Promise.all([
            apiClient.get('/products').catch(() => ({ data: { success: false, products: [] } })),
            apiClient.get('/categories').catch(() => ({ data: { success: false, categories: [] } })),
          ]);

          if (prodRes.data?.success && Array.isArray(prodRes.data.products)) {
            set({ products: prodRes.data.products });
          }

          if (catRes.data?.success && Array.isArray(catRes.data.categories)) {
            set({ categories: catRes.data.categories });
          }
        } catch (err) {
          console.warn('REST API ürün/kategori çekme uyarısı:', err);
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
        try {
          const res = await apiClient.delete(`/categories/${id}`);
          if (res.data?.success) {
            set((state) => ({
              categories: state.categories.filter((c) => c.id !== id)
            }));
            await get().fetchProductsAndCategories();
            return { success: true, message: res.data.message || 'Kategori silindi.' };
          }
          return { success: false, message: res.data?.message || 'Kategori silinemedi.' };
        } catch (e: unknown) {
          const msg = e && typeof e === 'object' && 'response' in e
            ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Kategori silinemedi.')
            : (e instanceof Error ? e.message : 'Kategori silinirken bir hata oluştu.');
          console.warn('Kategori silme hatası:', msg);
          return { success: false, message: msg };
        }
      },

      addProduct: async (product) => {
        try {
          const res = await apiClient.post('/products', product);
          if (res.data?.success && res.data.product) {
            await get().fetchProductsAndCategories();
          }
        } catch (e: unknown) {
          const msg = e && typeof e === 'object' && 'response' in e
            ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ürün ekleme hatası.')
            : (e instanceof Error ? e.message : 'Ürün eklenirken bir hata oluştu.');
          console.warn('Ürün ekleme hatası:', msg);
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
    })
);
