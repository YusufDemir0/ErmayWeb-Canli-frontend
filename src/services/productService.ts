import type { Product, Category } from '../types';
import apiClient from './api';

export const productService = {
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      const response = await apiClient.get('/products', {
        params: { category, search },
      });

      if (response.data?.success && Array.isArray(response.data.products)) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.warn('REST API Ürün Yükleme Uyarısı (Sunucuya ulaşılamadı):', error);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get(`/products/${id}`);
      if (response.data?.success && response.data.product) {
        return response.data.product;
      }
      return null;
    } catch (error) {
      console.warn('REST API Ürün Detay Uyarısı (Sunucuya ulaşılamadı):', error);
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get('/categories');
      if (response.data?.success && Array.isArray(response.data.categories)) {
        return response.data.categories;
      }
      return [];
    } catch (error) {
      console.warn('REST API Kategori Uyarısı (Sunucuya ulaşılamadı):', error);
      return [];
    }
  },

  async getSaleProducts(): Promise<Product[]> {
    try {
      const products = await this.getProducts();
      return products.filter((p) => p.originalPrice && p.originalPrice > p.price);
    } catch (e) {
      return [];
    }
  },
};
