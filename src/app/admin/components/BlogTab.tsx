'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, BookOpen, Sparkles, Image as ImageIcon, Save, X, Search, Check, ExternalLink } from 'lucide-react';
import blogService from '../../../services/blogService';
import type { BlogPost } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { RowsSkeleton } from '../../../components/Skeleton';

interface BlogTabProps {
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
}

export const BlogTab: React.FC<BlogTabProps> = ({ onShowSuccess, onShowError }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    category: 'Dekorasyon & Tasarım',
    tags: 'masif ahşap, lüks mobilya, modoko, dekorasyon',
    author: 'Ermay Mobilya',
    isPublished: true,
  });

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await blogService.getPosts({ all: true, limit: 50 });
      if (res?.success) {
        setPosts(res.posts || []);
      }
    } catch {
      onShowError('Blog yazıları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPostId(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      coverImage: '',
      category: 'Dekorasyon & Tasarım',
      tags: 'masif ahşap, lüks mobilya, modoko, dekorasyon',
      author: 'Ermay Mobilya',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: BlogPost) => {
    setEditingPostId(post.id);
    setFormData({
      title: post.title,
      summary: post.summary || '',
      content: post.content,
      coverImage: post.coverImage || '',
      category: post.category || 'Dekorasyon & Tasarım',
      tags: (post.tags || []).join(', '),
      author: post.author || 'Ermay Mobilya',
      isPublished: post.isPublished !== false,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        setFormData((prev) => ({ ...prev, coverImage: url }));
        onShowSuccess('Görsel başarıyla yüklendi!');
      } catch {
        onShowError('Görsel yüklenirken bir problem oluştu.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      onShowError('Başlık ve içerik alanları zorunludur.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      summary: formData.summary.trim() || undefined,
      content: formData.content.trim(),
      coverImage: formData.coverImage.trim() || undefined,
      category: formData.category.trim() || 'Dekorasyon & Tasarım',
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      author: formData.author.trim() || 'Ermay Mobilya',
      isPublished: formData.isPublished,
    };

    try {
      if (editingPostId) {
        const res = await blogService.updatePost(editingPostId, payload);
        if (res?.success) {
          onShowSuccess('Blog yazısı başarıyla güncellendi!');
          setIsModalOpen(false);
          loadPosts();
        } else {
          onShowError(res?.message || 'Güncelleme başarısız.');
        }
      } else {
        const res = await blogService.createPost(payload);
        if (res?.success) {
          onShowSuccess('Yeni blog yazısı başarıyla yayınlandı!');
          setIsModalOpen(false);
          loadPosts();
        } else {
          onShowError(res?.message || 'Blog yazısı eklenemedi.');
        }
      }
    } catch {
      onShowError('Sunucu bağlantı hatası oluştu.');
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`"${post.title}" başlıklı yazıyı silmek istediğinizden emin misiniz?`)) return;

    try {
      const res = await blogService.deletePost(post.id);
      if (res?.success) {
        onShowSuccess('Blog yazısı silindi.');
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
      } else {
        onShowError(res?.message || 'Silme işlemi başarısız.');
      }
    } catch {
      onShowError('Silme işlemi sırasında hata oluştu.');
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xs border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-wood" />
            <span>Blog & SEO İçerik Yönetimi</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Yapay zeka arama motorları ve Google SEO için makale, mimari rehber ve dekorasyon tüyoları yayınlayın.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-dark text-ink text-xs font-bold rounded-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Blog Yazısı Ekle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xs border border-line flex items-center gap-3">
        <Search className="h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Blog başlığı veya kategori ara..."
          value={searchQuery} maxLength={100}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs outline-hidden text-neutral-800"
        />
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xs border border-line overflow-hidden">
        {isLoading ? (
          <RowsSkeleton rows={4} label="Blog yazıları yükleniyor" />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-xs text-neutral-500 space-y-2">
            <BookOpen className="h-8 w-8 text-neutral-300 mx-auto" />
            <p>Henüz blog yazısı bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper text-xs uppercase font-bold text-neutral-500 tracking-wider border-b border-line">
                <tr>
                  <th className="py-3 px-4">Görsel</th>
                  <th className="py-3 px-4">Başlık</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Yayın Durumu</th>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-paper/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 bg-neutral-100 rounded-xs overflow-hidden border border-line">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500 text-center leading-tight" title="Kapak görseli yüklenmemiş">Görsel yok</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded-xs text-xs font-mono">
                        {post.category || 'Genel'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {post.isPublished !== false ? (
                        <span className="px-2 py-0.5 bg-ok-soft text-ok border border-ok/25 rounded-xs text-xs font-bold">
                          Yayında
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-xs text-xs">
                          Taslak
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-mono text-xs">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 hover:bg-neutral-100 text-neutral-500 rounded-xs transition-colors"
                        title="Sayfayı Görüntüle"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenEditModal(post)}
                        className="inline-flex p-1.5 hover:bg-neutral-100 text-neutral-600 rounded-xs transition-colors"
                        title="Düzenle"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="inline-flex p-1.5 hover:bg-signal/5 text-signal rounded-xs transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blog Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xs shadow-xl border border-line max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-paper/50">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-wood" />
                <span>{editingPostId ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı Oluştur'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-700 rounded-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Blog Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title} maxLength={200}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Masif Ahşap Mobilya Bakımı ve 2026 Trendleri"
                  className="w-full px-3 py-2 border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">
                    Kategori
                  </label>
                  {/* Var olan kategoriler önerilir; aynı kategorinin farklı yazılışları birikmesin */}
                  <input
                    type="text"
                    list="blog-category-options"
                    value={formData.category} maxLength={80}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Listeden seçin veya yeni yazın"
                    className="w-full px-3 h-10 text-sm border border-line-strong rounded-xs focus:ring-2 focus:ring-wood/30 focus:outline-hidden"
                  />
                  <datalist id="blog-category-options">
                    {Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).map((c) => (
                      <option key={c} value={c as string} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">
                    Yazar
                  </label>
                  <input
                    type="text"
                    value={formData.author} maxLength={80}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Ermay Mobilya"
                    className="w-full px-3 py-2 border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Kapak Görseli
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.coverImage} maxLength={500}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="Görsel URL veya dosya yükleyin"
                    className="flex-1 px-3 py-2 border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-hidden"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xs border border-line-strong transition-colors">
                    <ImageIcon className="h-3.5 w-3.5 text-neutral-500" />
                    <span>{uploadingImage ? 'Yükleniyor...' : 'Yükle'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Kısa Özet (Google & AI Snippet)
                </label>
                <textarea
                  rows={2}
                  value={formData.summary} maxLength={500}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Arama motorlarında ve kartlarda görünecek 1-2 cümlelik özet..."
                  className="w-full px-3 py-2 border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Yazı İçeriği *
                </label>
                <textarea
                  required
                  rows={10}
                  value={formData.content} maxLength={100000}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detaylı mimari rehber, ahşap türleri, bakım tüyoları ve dekorasyon detaylarını buraya girin..."
                  className="w-full px-3 py-2 border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-hidden font-mono text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Etiketler (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={formData.tags} maxLength={900}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="masif gürgen, modoko, makam takımı, ofis koltuğu"
                  className="w-full px-3 py-2 border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="h-4 w-4 text-wood border-line-strong rounded-xs focus:ring-wood"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                  Hemen Yayına Al (Web sitesinde ve arama motorlarında görünsün)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-line-strong hover:bg-neutral-100 text-neutral-700 font-bold rounded-xs transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-brand hover:bg-brand-dark text-ink font-bold rounded-xs transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{editingPostId ? 'Güncellemeleri Kaydet' : 'Blog Yazısını Yayınla'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
