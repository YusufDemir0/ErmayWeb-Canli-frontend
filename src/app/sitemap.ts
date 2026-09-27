import type { MetadataRoute } from 'next';
import { productService } from '../services/productService';

export const revalidate = 3600; // Regenerate sitemap every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ermaymobilya.com';
  const now = new Date();

  // 1. Core Static Brand & Catalog Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/indirimler`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kurumsal`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bayiler`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. Fetch Active Categories
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = await productService.getCategories();
    if (Array.isArray(categories) && categories.length > 0) {
      categoryEntries = categories.map((cat) => ({
        url: `${baseUrl}/kategori/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.warn('Sitemap category fetch warning:', err);
  }

  // 3. Fetch Active Published Products
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await productService.getProducts({ limit: 100 });
    if (Array.isArray(products) && products.length > 0) {
      productEntries = products.map((prod) => ({
        url: `${baseUrl}/urun/${prod.slug || prod.id}`,
        lastModified: prod.createdAt ? new Date(prod.createdAt) : now,
        changeFrequency: 'weekly',
        priority: 0.85,
      }));
    }
  } catch (err) {
    console.warn('Sitemap product fetch warning:', err);
  }

  return [...staticPages, ...categoryEntries, ...productEntries];
}
