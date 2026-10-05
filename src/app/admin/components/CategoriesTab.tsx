'use client';

import React, { useState, useEffect } from 'react';
import {
  Edit3,
  Trash2,
  GripVertical,
  CornerDownRight,
  FolderTree,
  ArrowUp,
  ArrowDown,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  FolderPlus,
  Unlink,
} from 'lucide-react';
import type { Category, Product } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { slugifyTurkish } from '../../../lib/slug';

interface CategoriesTabProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (cat: Category) => void;
  onUpdateCategory: (id: string, cat: Partial<Category>) => void;
  onDeleteCategory: (id: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onReorderCategories?: (items: { id: string; parentId?: string | null; sortOrder: number }[]) => Promise<{ success: boolean; message: string }>;
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onShowSuccess,
  onShowError,
}) => {
  // Local editable categories list for drag & drop and order manipulation
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Form State
  const [catForm, setCatForm] = useState<Partial<Category>>({
    name: '',
    slug: '',
    image: '',
    parentId: null,
  });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Drag and Drop State
  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
  const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);
  const [dropAction, setDropAction] = useState<'makeChild' | 'reorder' | null>(null);

  useEffect(() => {
    setLocalCategories(categories);
    setHasUnsavedOrder(false);
  }, [categories]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        setCatForm((prev) => ({ ...prev, image: url }));
        onShowSuccess('Görsel başarıyla yüklendi!');
      } catch (err) {
        onShowError(err instanceof Error ? err.message : 'Görsel yüklenemedi.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) return;

    const generatedSlug = catForm.slug ? slugifyTurkish(catForm.slug) : slugifyTurkish(catForm.name);

    const imgUrl = catForm.image || '';
    const parentIdVal = catForm.parentId || null;

    if (editingCatId) {
      onUpdateCategory(editingCatId, {
        name: catForm.name,
        slug: generatedSlug,
        image: imgUrl,
        parentId: parentIdVal,
      });
      onShowSuccess('Kategori güncellendi!');
      setEditingCatId(null);
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: catForm.name,
        slug: generatedSlug,
        image: imgUrl,
        parentId: parentIdVal,
        sortOrder: localCategories.length,
      };
      onAddCategory(newCat);
      onShowSuccess('Yeni kategori oluşturuldu!');
    }

    setCatForm({ name: '', slug: '', image: '', parentId: null });
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

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedCatId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string, action: 'makeChild' | 'reorder') => {
    e.preventDefault();
    if (draggedCatId === targetId) return;
    setDragOverCatId(targetId);
    setDropAction(action);
  };

  const handleDragLeave = () => {
    setDragOverCatId(null);
    setDropAction(null);
  };

  const handleDropOnCategory = async (e: React.DragEvent, targetCategory: Category, action: 'makeChild' | 'reorder') => {
    e.preventDefault();
    const sourceId = draggedCatId || e.dataTransfer.getData('text/plain');
    setDraggedCatId(null);
    setDragOverCatId(null);
    setDropAction(null);

    if (!sourceId || sourceId === targetCategory.id) return;

    const sourceCat = localCategories.find((c) => c.id === sourceId);
    if (!sourceCat) return;

    let updatedList = [...localCategories];

    if (action === 'makeChild') {
      // Sürüklenen kategori targetCategory'nin alt kategorisi haline gelir
      updatedList = updatedList.map((c) =>
        c.id === sourceId ? { ...c, parentId: targetCategory.id } : c
      );
      onShowSuccess(`"${sourceCat.name}" kategorisi "${targetCategory.name}" altına taşındı.`);
    } else {
      // Sıralama yer değişimi (Reorder)
      const sourceIndex = updatedList.findIndex((c) => c.id === sourceId);
      const targetIndex = updatedList.findIndex((c) => c.id === targetCategory.id);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [removed] = updatedList.splice(sourceIndex, 1);
        // Aynı ebeveyne sahipse koru, farklıysa hedefinkini al
        removed.parentId = targetCategory.parentId || null;
        updatedList.splice(targetIndex, 0, removed);
      }
    }

    // sortOrder indekslerini yeniden hesapla
    const reindexedList = updatedList.map((c, index) => ({
      ...c,
      sortOrder: index,
    }));

    setLocalCategories(reindexedList);
    setHasUnsavedOrder(true);
    await persistOrder(reindexedList);
  };

  // Alt kategoriyi ana kategoriye çıkarma
  const handleMakeRoot = async (catId: string) => {
    const updated = localCategories.map((c) =>
      c.id === catId ? { ...c, parentId: null } : c
    );
    setLocalCategories(updated);
    setHasUnsavedOrder(true);
    await persistOrder(updated);
    onShowSuccess('Kategori ana seviyeye yükseltildi.');
  };

  // Sıra yukarı / aşağı taşıma
  const handleMoveStep = async (catId: string, direction: 'up' | 'down') => {
    const index = localCategories.findIndex((c) => c.id === catId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localCategories.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...localCategories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reindexed = updated.map((c, i) => ({ ...c, sortOrder: i }));
    setLocalCategories(reindexed);
    setHasUnsavedOrder(true);
    await persistOrder(reindexed);
  };

  // Backend'e sıralamayı kaydet
  const persistOrder = async (listToPersist?: Category[]) => {
    const list = listToPersist || localCategories;
    if (!onReorderCategories) return;

    setIsSavingOrder(true);
    const payload = list.map((c, idx) => ({
      id: c.id,
      parentId: c.parentId || null,
      sortOrder: idx,
    }));

    const res = await onReorderCategories(payload);
    setIsSavingOrder(false);

    if (res.success) {
      setHasUnsavedOrder(false);
      onShowSuccess(res.message || 'Sıralama ve kategori hiyerarşisi kaydedildi.');
    } else {
      onShowError(res.message || 'Sıralama kaydedilemedi.');
    }
  };

  // Ağaç yapısını oluştur: Ana kategoriler ve altındakiler
  const rootCategories = localCategories.filter((c) => !c.parentId);
  const getSubcategories = (parentId: string) =>
    localCategories.filter((c) => c.parentId === parentId);

  // Kendi alt kategorisi olmayanlar ebeveyn seçilebilir
  const availableParents = localCategories.filter((c) => c.id !== editingCatId && !c.parentId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Kategori Ekleme / Düzenleme Formu */}
      <div className="bg-white p-8 rounded-xs border border-line">
        <h3 className="text-sm font-semibold text-neutral-900 border-b border-line pb-4 mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-wood" />
            {editingCatId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
          </span>
          {editingCatId && (
            <button
              type="button"
              onClick={() => {
                setEditingCatId(null);
                setCatForm({ name: '', slug: '', image: '', parentId: null });
              }}
              className="text-xs text-signal hover:underline cursor-pointer font-normal"
            >
              Vazgeç
            </button>
          )}
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-1">
                Kategori Adı *
              </label>
              <input
                type="text"
                required
                value={catForm.name} maxLength={80}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="Örn: Çalışma Koltukları"
                className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-1">
                Kategori Slug (URL Yolu)
              </label>
              <input
                type="text"
                value={catForm.slug || ''} maxLength={120}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                placeholder="calisma-koltuklari"
                className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-1">
                Üst Kategori (Hiyerarşi)
              </label>
              <select
                value={catForm.parentId || ''}
                onChange={(e) =>
                  setCatForm({ ...catForm, parentId: e.target.value ? e.target.value : null })
                }
                className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-white text-neutral-800"
              >
                <option value="">-- Ana Kategori (Kök Seviye) --</option>
                {availableParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    ↳ {parent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-1">
                Görsel Yükle (Firebase Storage)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs border border-line-strong p-2 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-white"
              />
            </div>
          </div>

          {catForm.image && (
            <div className="flex items-center gap-3 p-2 bg-paper rounded-xs border border-line">
              <img src={catForm.image} alt="" className="h-12 w-12 object-cover rounded-xs" />
              <span className="text-xs text-neutral-500 font-mono truncate flex-1">
                {catForm.image}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={uploadingImage}
              className="bg-brand hover:bg-brand-dark text-ink text-sm font-semibold py-3 px-8 rounded-xs transition-colors cursor-pointer"
            >
              {uploadingImage
                ? 'Görsel Yükleniyor...'
                : editingCatId
                ? 'Kategoriyi Güncelle'
                : 'Kategori Ekle'}
            </button>
          </div>
        </form>
      </div>

      {/* Sürükle Bırak ve Sıralama Yönetim Çubuğu */}
      <div className="bg-white rounded-xs border border-line overflow-hidden">
        <div className="p-4 bg-paper border-b border-line flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-wood" />
            <div>
              <h4 className="text-sm font-semibold text-neutral-800">
                Kategori Hiyerarşisi ve Sıralama Yönetimi ({localCategories.length})
              </h4>
              <p className="text-xs text-neutral-500">
                Kategorileri sürükleyip başka birinin üzerine bırakarak alt kategorisi yapabilir veya aralarında sıralayabilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedOrder && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-wood-dark bg-paper px-2.5 py-1 rounded-xs border border-line">
                <RotateCcw className="h-3 w-3 animate-spin" /> Kaydedilmemiş Değişiklikler Var
              </span>
            )}
            <button
              type="button"
              disabled={isSavingOrder}
              onClick={() => persistOrder()}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xs cursor-pointer transition-colors ${
                hasUnsavedOrder
                  ? 'bg-whatsapp hover:bg-whatsapp-dark text-white'
                  : 'bg-neutral-800 hover:bg-neutral-900 text-white'
              }`}
            >
              {isSavingOrder ? (
                <>Kaydediliyor...</>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Sıralamayı Kaydet
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bilgilendirme Bannerı */}
        <div className="bg-paper/70 px-4 py-2.5 border-b border-line flex items-center gap-2 text-xs text-neutral-600">
          <Layers className="h-3.5 w-3.5 text-neutral-500" />
          <span>
            <strong>İpucu:</strong> Bir kategoriyi alt kategori yapmak için diğerinin <em>"Üzerine Bırakın"</em>. Ana kategoriye çevirmek için <em>"Ana Seviyeye Çıkar"</em> butonuna basın.
          </span>
        </div>

        {/* Kategori Ağacı ve Listesi */}
        <div className="divide-y divide-line">
          {rootCategories.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              Henüz tanımlı kategori bulunmamaktadır.
            </div>
          ) : (
            rootCategories.map((rootCat, rootIdx) => {
              const children = getSubcategories(rootCat.id);
              const rootProdCount = products.filter(
                (p) => p.category === rootCat.id || p.category === rootCat.slug
              ).length;
              const isBeingDragged = draggedCatId === rootCat.id;
              const isDragTarget = dragOverCatId === rootCat.id;

              return (
                <div key={rootCat.id} className="transition-colors">
                  {/* Ana Kategori Satırı */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, rootCat.id)}
                    onDragOver={(e) => handleDragOver(e, rootCat.id, 'makeChild')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropOnCategory(e, rootCat, dropAction || 'makeChild')}
                    className={`flex items-center justify-between p-3.5 gap-3 transition-all ${
                      isBeingDragged
                        ? 'opacity-40 bg-neutral-100'
                        : isDragTarget
                        ? 'bg-wood/15 border-2 border-dashed border-wood'
                        : 'hover:bg-paper/70 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Drag Handle */}
                      <button
                        type="button"
                        className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-700 p-1"
                        title="Sürükleyip Taşıyın"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>

                      {/* Sıra Numarası */}
                      <span className="w-5 text-xs font-mono font-bold text-neutral-500 text-center">
                        {rootIdx + 1}
                      </span>

                      {/* Görsel */}
                      {rootCat.image ? (
                        <img src={rootCat.image} alt={rootCat.name} className="h-10 w-10 object-cover rounded-xs border border-line" />
                      ) : (
                        <span className="h-10 w-10 rounded-xs border border-dashed border-line-strong bg-paper flex items-center justify-center text-[10px] text-neutral-500 text-center leading-tight shrink-0" title="Görsel yüklenmemiş">Görsel yok</span>
                      )}

                      {/* İsim ve Bilgiler */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-900 truncate">
                            {rootCat.name}
                          </span>
                          <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-xs">
                            /{rootCat.slug}
                          </span>
                          {children.length > 0 && (
                            <span className="text-xs font-semibold text-wood bg-wood/10 px-2 py-0.5 rounded-full">
                              {children.length} Alt Kategori
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">
                          Ana Kategori
                        </p>
                      </div>
                    </div>

                    {/* Sağ Taraf: Ürün Sayısı & Eylemler */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-xs ${
                          rootProdCount > 0
                            ? 'bg-paper text-wood-dark'
                            : 'bg-ok-soft text-ok'
                        }`}
                      >
                        {rootProdCount} Ürün
                      </span>

                      {/* Sıra Butonları */}
                      <div className="flex items-center border border-line rounded-xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(rootCat.id, 'up')}
                          disabled={rootIdx === 0}
                          className="p-1.5 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer text-neutral-600"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(rootCat.id, 'down')}
                          disabled={rootIdx === rootCategories.length - 1}
                          className="p-1.5 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer text-neutral-600"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Düzenle & Sil */}
                      <button
                        onClick={() => {
                          setEditingCatId(rootCat.id);
                          setCatForm({
                            name: rootCat.name,
                            slug: rootCat.slug,
                            image: rootCat.image,
                            parentId: rootCat.parentId || null,
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-1.5 text-neutral-500 hover:text-wood transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rootCat.id)}
                        className={`p-1.5 transition-colors cursor-pointer ${
                          rootProdCount > 0 || children.length > 0
                            ? 'text-neutral-300 hover:text-signal'
                            : 'text-neutral-500 hover:text-signal'
                        }`}
                        title={
                          rootProdCount > 0
                            ? 'İlişkili ürünler başka kategoriye aktarılacaktır'
                            : children.length > 0
                            ? 'Alt kategoriler ana seviyeye yükseltilecektir'
                            : 'Sil'
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Alt Kategoriler (Varsa) */}
                  {children.length > 0 && (
                    <div className="bg-paper/50 pl-10 pr-3 py-1 space-y-1 border-t border-line">
                      {children.map((childCat, childIdx) => {
                        const childProdCount = products.filter(
                          (p) => p.category === childCat.id || p.category === childCat.slug
                        ).length;
                        const isChildBeingDragged = draggedCatId === childCat.id;

                        return (
                          <div
                            key={childCat.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, childCat.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xs transition-all ${
                              isChildBeingDragged
                                ? 'opacity-40 bg-neutral-200'
                                : 'bg-white hover:bg-paper border border-line'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-700 p-1"
                                title="Sürükleyip Taşıyın"
                              >
                                <GripVertical className="h-3.5 w-3.5" />
                              </button>

                              <CornerDownRight className="h-4 w-4 text-wood flex-shrink-0" />

                              {childCat.image ? (
                                <img src={childCat.image} alt={childCat.name} className="h-8 w-8 object-cover rounded-xs border border-line" />
                              ) : (
                                <span className="h-8 w-8 rounded-xs border border-dashed border-line-strong bg-paper flex items-center justify-center text-[10px] text-neutral-500 text-center leading-tight shrink-0" title="Görsel yüklenmemiş">Görsel yok</span>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-neutral-800 truncate">
                                    {childCat.name}
                                  </span>
                                  <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded-xs">
                                    /{childCat.slug}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-500">
                                  ↳ {rootCat.name} alt kategorisi
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 text-xs font-bold rounded-xs ${
                                  childProdCount > 0
                                    ? 'bg-paper text-wood-dark'
                                    : 'bg-ok-soft text-ok'
                                }`}
                              >
                                {childProdCount} Ürün
                              </span>

                              {/* Ana Kategoriye Çıkar Butonu */}
                              <button
                                type="button"
                                onClick={() => handleMakeRoot(childCat.id)}
                                className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-xs cursor-pointer font-medium"
                                title="Alt kategorilikten çıkarıp bağımsız ana kategori yap"
                              >
                                <Unlink className="h-3 w-3" />
                                Ana Kategori Yap
                              </button>

                              {/* Düzenle & Sil */}
                              <button
                                onClick={() => {
                                  setEditingCatId(childCat.id);
                                  setCatForm({
                                    name: childCat.name,
                                    slug: childCat.slug,
                                    image: childCat.image,
                                    parentId: childCat.parentId || null,
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-1 text-neutral-500 hover:text-wood transition-colors cursor-pointer"
                                title="Düzenle"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(childCat.id)}
                                className="p-1 text-neutral-500 hover:text-signal transition-colors cursor-pointer"
                                title="Sil"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
