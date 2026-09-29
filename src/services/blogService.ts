import apiClient from './api';
import type { BlogPost } from '../types';

export interface BlogListResponse {
  success: boolean;
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export const blogService = {
  /**
   * Yayınlanmış blog yazılarını listeler
   */
  async getPosts(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    all?: boolean;
  }): Promise<BlogListResponse> {
    const res = await apiClient.get<BlogListResponse>('/blogs', { params });
    return res.data;
  },

  /**
   * Slug ile tekil blog yazısını getirir
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const res = await apiClient.get<{ success: boolean; post: BlogPost }>(`/blogs/${slug}`);
      return res.data?.post || null;
    } catch {
      return null;
    }
  },

  /**
   * Admin: Yeni blog yazısı ekle
   */
  async createPost(data: Partial<BlogPost>): Promise<{ success: boolean; post?: BlogPost; message?: string }> {
    const res = await apiClient.post<{ success: boolean; post: BlogPost; message: string }>('/blogs', data);
    return res.data;
  },

  /**
   * Admin: Blog yazısını güncelle
   */
  async updatePost(id: string, data: Partial<BlogPost>): Promise<{ success: boolean; post?: BlogPost; message?: string }> {
    const res = await apiClient.put<{ success: boolean; post: BlogPost; message: string }>(`/blogs/${id}`, data);
    return res.data;
  },

  /**
   * Admin: Blog yazısını sil
   */
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/blogs/${id}`);
    return res.data;
  },
};

export default blogService;
