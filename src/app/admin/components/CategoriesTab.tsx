'use client';

import React, { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import type { Category, Product } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';

interface CategoriesTabProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (cat: Category) => void;
  onUpdateCategory: (id: string, cat: Partial<Category>) => void;
  onDeleteCategory: (id: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onShowSuccess,
  onShowError,
}) => {
  const [catForm, setCatForm] = useState<Partial<Category>>({
    name: '',
    slug: '',
    image: '',
  });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      const url = await uploadProductImage(e.target.files[0]);
      setCatForm((prev) => ({ ...prev, image: url }));
      setUploadingImage(false);
      onShowSuccess('Görsel başarıyla yüklendi!');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) return;

    const generatedSlug =
      catForm.slug ||
      catForm.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');
    const imgUrl = catForm.image || '';

    if (editingCatId) {
      onUpdateCategory(editingCatId, {
        name: catForm.name,
        slug: generatedSlug,
        image: imgUrl,
      });
      onShowSuccess('Kategori güncellendi!');
      setEditingCatId(null);
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: catForm.name,
        slug: generatedSlug,
        image: imgUrl,
      };
      onAddCategory(newCat);
      onShowSuccess('Yeni kategori oluşturuldu!');
    }

    setCatForm({ name: '', slug: '', image: '' });
  };

  const handleDelete = async (catId: string) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    const res = await onDeleteCategory(catId);
    if (!res.success) {
      onShowError(res.message);
    } else {
      onShowSuccess(res.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 mb-6 flex items-center justify-between">
          <span>{editingCatId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}</span>
          {editingCatId && (
            <button
              type="button"
              onClick={() => {
                setEditingCatId(null);
                setCatForm({ name: '', slug: '', image: '' });
              }}
              className="text-xs text-rose-600 hover:underline cursor-pointer font-normal"
            >
              Vazgeç
            </button>
          )}
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Kategori Adı
              </label>
              <input
                type="text"
                required
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="Örn: Toplantı Masaları"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Kategori Slug (URL Yolu)
              </label>
              <input
                type="text"
                value={catForm.slug || ''}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                placeholder="toplanti-masalari"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Görsel Yükle (Firebase Storage)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs border border-neutral-300 p-2 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none bg-white"
              />
            </div>
          </div>

          {catForm.image && (
            <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded-xs border border-neutral-200">
              <img src={catForm.image} alt="" className="h-12 w-12 object-cover rounded-xs" />
              <span className="text-[11px] text-neutral-500 font-mono truncate flex-1">
                {catForm.image}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={uploadingImage}
            className="bg-brand-camel hover:bg-brand-camel-dark text-white text-xs font-semibold uppercase tracking-widest py-3 px-8 rounded-xs transition-colors cursor-pointer"
          >
            {uploadingImage
              ? 'Görsel Yükleniyor...'
              : editingCatId
              ? 'Kategoriyi Güncelle'
              : 'Kategori Ekle'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Mevcut Kategoriler ({categories.length})
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-400 font-bold uppercase text-[10px] border-b border-neutral-200">
              <tr>
                <th className="p-3">Görsel</th>
                <th className="p-3">Kategori Adı</th>
                <th className="p-3">URL Slug</th>
                <th className="p-3">İlişkili Ürün Sayısı</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((cat) => {
                const prodCount = products.filter(
                  (p) => p.category === cat.id || p.category === cat.slug
                ).length;

                return (
                  <tr key={cat.id} className="hover:bg-neutral-50/50">
                    <td className="p-3">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-10 w-10 object-cover rounded-xs"
                      />
                    </td>
                    <td className="p-3 font-semibold text-neutral-800">{cat.name}</td>
                    <td className="p-3 font-mono text-[11px] text-neutral-500">{cat.slug}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                          prodCount > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prodCount} Ürün
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setCatForm({ name: cat.name, slug: cat.slug, image: cat.image });
                        }}
                        className="p-1.5 text-neutral-500 hover:text-brand-camel transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className={`p-1.5 transition-colors cursor-pointer ${
                          prodCount > 0
                            ? 'text-neutral-300 hover:text-rose-500'
                            : 'text-neutral-500 hover:text-rose-600'
                        }`}
                        title={prodCount > 0 ? 'İlişkili ürün olduğu için silinemez' : 'Sil'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
