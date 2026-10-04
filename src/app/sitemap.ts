import type { MetadataRoute } from 'next';
import { productService } from '../services/productService';
import apiClient from '../services/api';
import type { Product, BlogPost } from '../types';

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
      url: `${baseUrl}/kategori`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
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
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
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

  // 3. Fetch ALL published products (API caps a page at 60, so paginate)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products: Product[] = [];
    for (let page = 1; page <= 50; page++) {
      const res = await apiClient.get('/products', { params: { page, limit: 60 } });
      const batch: Product[] = Array.isArray(res.data?.products) ? res.data.products : [];
      products.push(...batch);
      if (batch.length === 0 || page >= (res.data?.totalPages || 1)) break;
    }
    productEntries = products.map((prod) => ({
      url: `${baseUrl}/urun/${prod.slug || prod.id}`,
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : prod.createdAt ? new Date(prod.createdAt) : now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));
  } catch (err) {
    console.warn('Sitemap product fetch warning:', err);
  }

  // 4. Fetch published blog posts
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts: BlogPost[] = [];
    for (let page = 1; page <= 20; page++) {
      const res = await apiClient.get('/blogs', { params: { page, limit: 50 } });
      const batch: BlogPost[] = Array.isArray(res.data?.posts) ? res.data.posts : [];
      posts.push(...batch);
      if (batch.length === 0 || page >= (res.data?.totalPages || 1)) break;
    }
    blogEntries = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (err) {
    console.warn('Sitemap blog fetch warning:', err);
  }

  return [...staticPages, ...categoryEntries, ...productEntries, ...blogEntries];
}
