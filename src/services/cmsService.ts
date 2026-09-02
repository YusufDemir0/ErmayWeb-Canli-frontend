import apiClient from './api';
import type { HeroConfig, CategoryListConfig, PageConfig } from '../types/cms';

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  autoPlayIntervalMs: 6000,
  slides: [
    {
      id: 'slide-1',
      title: 'İtalyan Zarafeti ile Yaşam Alanınızı Yenileyin',
      subtitle: 'El işçiliği doğal masif ahşap ve premium döşemelik kumaşların harmanlandığı özel koleksiyonumuzu keşfedin.',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="24">ERMAY MOBİLYA</text></svg>',
      ctaText: 'Koleksiyonu Keşfet',
      ctaCategoryFilter: 'all',
      badgeText: '2026 Özel Koleksiyonu',
    },
    {
      id: 'slide-2',
      title: 'Zamansız Tasarım, Üstün Konfor',
      subtitle: 'Salonunuza şıklık ve huzur katacak lüks köşe koltuklar ve berjer modellerinde özel fırsatlar.',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="24">ERMAY OTURMA ODASI</text></svg>',
      ctaText: 'Oturma Odası Modelleri',
      ctaCategoryFilter: 'living-room',
      badgeText: 'Yeni Sezon',
    },
    {
      id: 'slide-3',
      title: 'Doğal Ahşabın Eşsiz Sıcaklığı',
      subtitle: '%100 fırınlanmış gürgen ve doğal ceviz kaplama yemek masaları ile soflarınızı taçlandırın.',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23475569"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="24">ERMAY YEMEK ODASI</text></svg>',
      ctaText: 'Yemek Odasını İncele',
      ctaCategoryFilter: 'dining',
      badgeText: '%20 İndirim Fırsatı',
    },
  ],
};

export const DEFAULT_CATEGORY_LIST_CONFIG: CategoryListConfig = {
  title: 'Öne Çıkan Koleksiyonlar',
  subtitle: 'Evinizin her alanı için özenle tasarlanmış kategoriler',
  categories: [
    {
      id: 'all',
      name: 'Tüm Koleksiyon',
      slug: 'all',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Tüm Koleksiyon</text></svg>',
    },
    {
      id: 'living-room',
      name: 'Oturma Odası',
      slug: 'oturma-odasi',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Oturma Odası</text></svg>',
      badgeText: 'Popüler',
    },
    {
      id: 'bedroom',
      name: 'Yatak Odası',
      slug: 'yatak-odasi',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23475569"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Yatak Odası</text></svg>',
    },
    {
      id: 'dining',
      name: 'Yemek Odası',
      slug: 'yemek-odasi',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Yemek Odası</text></svg>',
    },
    {
      id: 'accessories',
      name: 'Aksesuar',
      slug: 'aksesuar',
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Aksesuar</text></svg>',
      badgeText: 'Yeni',
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

  async getCorporateConfig(): Promise<any> {
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

  async getStores(): Promise<any[]> {
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
};

