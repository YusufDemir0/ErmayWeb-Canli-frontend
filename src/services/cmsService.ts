import apiClient from './api';
import type { HeroConfig, CategoryListConfig, PageConfig } from '../types/cms';
import type { StoreItem } from '../types';

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  autoPlayIntervalMs: 6000,
  slides: [
    {
      id: 'slide-1',
      title: 'Doğrudan Fabrikadan Aracısız Ofis Mobilyaları',
      subtitle: '1. Sınıf E1 melamin ve çelik konstrüksiyon standart seri üretim; aracı komisyonu olmadan doğrudan fabrika fiyatıyla.',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="24">ERMAY OFİS MOBİLYASI</text></svg>',
      ctaText: 'Koleksiyonu Keşfet',
      ctaCategoryFilter: 'all',
      badgeText: 'Fabrika Satış Fiyatları',
    },
    {
      id: 'slide-2',
      title: 'Makam ve Yönetici Takımlarında Seri İmalat',
      subtitle: 'Yönetici odaları için tasarlanan sağlam, fonksiyonel ve prestijli standart seri modellerimizi inceleyin.',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="24">ERMAY MAKAM TAKIMLARI</text></svg>',
      ctaText: 'Makam Takımları',
      ctaCategoryFilter: 'makam-takimlari',
      badgeText: 'Stokta Hazır',
    },
    {
      id: 'slide-3',
      title: 'Toplu Ofis & Şirket Kurulumu İskontosu',
      subtitle: '10 ve üzeri çalışma alanı veya tam kat ofis projelerinizde doğrudan fabrikamızdan kademeli toptan iskonto.',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23475569"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="24">ERMAY TOPLU OFİS KURULUMU</text></svg>',
      ctaText: 'Toptan Teklif Al',
      ctaCategoryFilter: 'toplanti-masasi-modelleri',
      badgeText: 'Toptan İskonto',
    },
  ],
};

export const DEFAULT_CATEGORY_LIST_CONFIG: CategoryListConfig = {
  title: 'Standart Seri Fabrika Kategorileri',
  subtitle: 'Çalışma alanlarınız ve kurumsal ofisiniz için standart seri imalat çözümleri',
  categories: [
    {
      id: 'all',
      name: 'Tüm Koleksiyon',
      slug: 'all',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Tüm Koleksiyon</text></svg>',
    },
    {
      id: 'makam-takimlari',
      name: 'Makam Takımları',
      slug: 'makam-takimlari',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Makam Takımları</text></svg>',
      badgeText: 'Çok Satan',
    },
    {
      id: 'uniteli-makam-takimlari',
      name: 'Üniteli Makam Takımları',
      slug: 'uniteli-makam-takimlari',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23475569"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Üniteli Takımlar</text></svg>',
    },
    {
      id: 'toplanti-masasi-modelleri',
      name: 'Toplantı Masaları',
      slug: 'toplanti-masasi-modelleri',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Toplantı Masaları</text></svg>',
    },
    {
      id: 'koltuk-takimlari',
      name: 'Ofis Koltukları',
      slug: 'koltuk-takimlari',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Ofis Koltukları</text></svg>',
      badgeText: 'Stokta',
    },
    {
      id: 'sekreter-ekonomik-takimlar',
      name: 'Personel Masaları',
      slug: 'sekreter-ekonomik-takimlar',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23475569"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Personel Masaları</text></svg>',
    },
  ],
};

export const cmsService = {
  async getHeroConfig(): Promise<HeroConfig> {
    try {
      const response = await apiClient.get<HeroConfig>('/cms/blocks/hero');
      return response.data;
    } catch {
      return DEFAULT_HERO_CONFIG;
    }
  },

  async getCategoryListConfig(): Promise<CategoryListConfig> {
    try {
      const response = await apiClient.get<CategoryListConfig>('/cms/blocks/categories');
      return response.data;
    } catch {
      return DEFAULT_CATEGORY_LIST_CONFIG;
    }
  },

  async getHomePageLayout(): Promise<{ hero: HeroConfig; categoryList: CategoryListConfig }> {
    const [hero, categoryList] = await Promise.all([
      this.getHeroConfig(),
      this.getCategoryListConfig(),
    ]);
    return { hero, categoryList };
  },

  async getPageConfig(slug: string): Promise<PageConfig | null> {
    try {
      const response = await apiClient.get<PageConfig>(`/cms/pages/${slug}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async getCorporateConfig(): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.get('/cms');
      if (response.data?.success && response.data.cms?.corporate_config) {
        return response.data.cms.corporate_config;
      }
    } catch {
      // Fallback to default
    }
    return null;
  },

  async getStores(): Promise<StoreItem[]> {
    try {
      const response = await apiClient.get('/stores');
      if (response.data?.success && Array.isArray(response.data.stores) && response.data.stores.length > 0) {
        return response.data.stores;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async getContactConfig(): Promise<{ phone?: string; whatsapp?: string; email?: string; address?: string }> {
    try {
      const response = await apiClient.get('/cms/contact');
      const data = response.data?.content || response.data;
      if (data && typeof data === 'object') {
        return data as { phone?: string; whatsapp?: string; email?: string; address?: string };
      }
    } catch {
      // Fallback
    }
    return {
      phone: '0216 365 00 00',
      whatsapp: '905324194151',
      email: 'info@ermaymobilya.com',
      address: 'Modoko Mobilyacılar Sitesi 1. Cadde No: 42 Ümraniye / İstanbul',
    };
  },
};


