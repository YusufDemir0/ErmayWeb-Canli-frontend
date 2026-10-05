'use client';

import React, { useState, useMemo } from 'react';
import { 
  Edit3, Trash2, Plus, Image as ImageIcon, Sparkles, Ruler, 
  Layers, DollarSign, Upload, X, Search, CheckCircle, Eye, 
  Box, CornerDownRight, Check, Star, ShoppingBag, Truck, ShieldCheck, RefreshCw,
  Wand2, Filter, CheckSquare, Square
} from 'lucide-react';
import apiClient from '../../../services/api';
import type { Product, Category, ProductColorVariant, ProductSetPiece } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { getProductImages } from '../../../lib/productImages';
import { Pagination } from '../../../components/Pagination';
import { toast } from '../../../stores/useToastStore';
import { useCMSStore } from '../../../stores/useCMSStore';
import { ProductFormModal } from './ProductFormModal';
import { RowsSkeleton } from '../../../components/Skeleton';

export interface ErpCatalogItem {
  erpId: string;
  erpCode: string;
  erpName: string;
  erpSalePrice: number;
  erpStock: number;
  erpType?: string;
  erpImage?: string | null;
}

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (prod: Product) => void;
  onUpdateProduct: (id: string, prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  onShowSuccess: (msg: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onShowSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  // Yayın durumu filtresi: ERP'den gelen ürünlerin çoğu taslaktır; yayındakileri ayırmak için
  const catalogLoaded = useCMSStore((state) => state.catalogLoaded);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const fetchProductsAndCategories = useCMSStore((state) => state.fetchProductsAndCategories);

  // CRM ERP Catalog & Matching State
  const [erpCatalog, setErpCatalog] = useState<ErpCatalogItem[]>([]);
  const [isErpLoading, setIsErpLoading] = useState(false);

  // Bulk Category Assignment Wizard State
  const [isBulkWizardOpen, setIsBulkWizardOpen] = useState(false);
  const [wizardTargetCategoryId, setWizardTargetCategoryId] = useState<string>('');
  const [wizardSearch, setWizardSearch] = useState('');
  const [wizardOnlyUnlinked, setWizardOnlyUnlinked] = useState(true);
  const [wizardSelectedIds, setWizardSelectedIds] = useState<string[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Map of linked ERP items
  const linkedErpIdMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      if (p.erpItemId) {
        map.set(String(p.erpItemId), p);
      }
    }
    return map;
  }, [products]);

  const unlinkedErpCount = useMemo(() => {
    return erpCatalog.filter((item) => !linkedErpIdMap.has(String(item.erpId))).length;
  }, [erpCatalog, linkedErpIdMap]);

  const linkedErpCount = useMemo(() => {
    return erpCatalog.filter((item) => linkedErpIdMap.has(String(item.erpId))).length;
  }, [erpCatalog, linkedErpIdMap]);

  // Pagination state (chunked 15 products per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const loadErpCatalog = async () => {
    setIsErpLoading(true);
    try {
      const res = await apiClient.get('/integration/catalog');
      if (res.data?.success && Array.isArray(res.data.catalog)) {
        setErpCatalog(res.data.catalog);
      }
    } catch (err) {
      console.warn('ERP katalog yükleme uyarısı:', err);
    } finally {
      setIsErpLoading(false);
    }
  };

  React.useEffect(() => {
    loadErpCatalog();
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, selectedCategoryFilter, statusFilter]);





  // Bulk Category Wizard filtered ERP items
  const wizardFilteredErpItems = erpCatalog.filter((item) => {
    const isLinked = linkedErpIdMap.has(String(item.erpId));
    if (wizardOnlyUnlinked && isLinked) return false;

    if (!wizardSearch.trim()) return true;
    const q = wizardSearch.toLowerCase();
    return (
      (item.erpName && item.erpName.toLowerCase().includes(q)) ||
      (item.erpCode && item.erpCode.toLowerCase().includes(q)) ||
      (item.erpId && String(item.erpId).toLowerCase().includes(q))
    );
  });

  const handleToggleSelectAllWizard = () => {
    const visibleIds = wizardFilteredErpItems.map((i) => String(i.erpId));
    const allSelected = visibleIds.every((id) => wizardSelectedIds.includes(id));
    if (allSelected) {
      setWizardSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setWizardSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleWizardItem = (erpId: string) => {
    setWizardSelectedIds((prev) =>
      prev.includes(erpId) ? prev.filter((id) => id !== erpId) : [...prev, erpId]
    );
  };

  const handleExecuteBulkLink = async () => {
    if (!wizardTargetCategoryId) {
      toast.error('Kategori Seçilmedi', 'Lütfen ürünlerin bağlanacağı hedef kategoriyi seçiniz.');
      return;
    }
    if (wizardSelectedIds.length === 0) {
      toast.error('Ürün Seçilmedi', 'Lütfen en az bir ERP ürünü seçiniz.');
      return;
    }

    setIsBulkSubmitting(true);
    try {
      const res = await apiClient.post('/products/bulk-link', {
        erpItemIds: wizardSelectedIds,
        categoryId: wizardTargetCategoryId,
        isPublished: true,
      });

      if (res.data?.success) {
        toast.success('Toplu Eşleme Tamamlandı', res.data.message || `${wizardSelectedIds.length} ürün başarıyla bağlandı.`);
        onShowSuccess(res.data.message || 'Ürünler başarıyla kategoriye bağlandı.');
        await fetchProductsAndCategories({ includeDrafts: true });
        setIsBulkWizardOpen(false);
        setWizardSelectedIds([]);
      } else {
        toast.error('Hata Oluştu', res.data?.message || 'Toplu eşleme gerçekleştirilemedi.');
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Eşleme hatası')
        : 'Toplu eşleme gerçekleştirilemedi.';
      toast.error('Hata', msg);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const openCreateModal = () => {
    if (erpCatalog.length === 0) {
      loadErpCatalog();
    }
    setEditingProdId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (p: Product) => {
    if (erpCatalog.length === 0) {
      loadErpCatalog();
    }
    setEditingProdId(p.id);
    setIsModalOpen(true);
  };

  const handleSaveProductModal = async (productPayload: any) => {
    if (editingProdId) {
      await onUpdateProduct(editingProdId, productPayload);
      toast.success('Ürün Güncellendi', `"${productPayload.name}" başarıyla güncellendi.`);
      onShowSuccess(`"${productPayload.name}" ürünü başarıyla güncellendi!`);
    } else {
      await onAddProduct(productPayload);
      toast.success('Ürün Eklendi', `"${productPayload.name}" kataloğa eklendi.`);
      onShowSuccess(`"${productPayload.name}" başarıyla kataloğa eklendi!`);
    }
    setIsModalOpen(false);
    setEditingProdId(null);
  };

  const filteredProducts = products.filter((p) => {
    const q = searchFilter.trim().toLocaleLowerCase('tr-TR');
    const matchesSearch =
      !q ||
      p.name.toLocaleLowerCase('tr-TR').includes(q) ||
      (p.description || '').toLocaleLowerCase('tr-TR').includes(q) ||
      (p.erpItemCode || '').toLocaleLowerCase('tr-TR').includes(q);
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' ? p.isPublished : !p.isPublished);
    const pCatSlug = typeof p.category === 'object' && p.category !== null ? (p.category as { slug?: string }).slug : String(p.category || '');
    const matchesCategory = selectedCategoryFilter === 'all' || pCatSlug === selectedCategoryFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Header Strip & Add Product Trigger */}
      <div className="bg-white p-6 rounded-xs border border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {products.length} ürün · {products.filter((p) => p.isPublished).length} yayında
          </h2>
          <p className="text-sm text-neutral-600">Taslak ürünler sitede görünmez. Yayına almak için ürünü düzenleyin.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (erpCatalog.length === 0) loadErpCatalog();
              setWizardTargetCategoryId(categories[0]?.id || '');
              setWizardSelectedIds([]);
              setIsBulkWizardOpen(true);
            }}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-5 rounded-xs transition-colors cursor-pointer border border-neutral-700"
          >
            <Wand2 className="h-4 w-4 text-wood" />
            <span>Toplu ERP Kategori Eşleme</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold py-3 px-6 rounded-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Ürün Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xs border border-line flex flex-col lg:flex-row lg:items-center gap-4">
        <div role="radiogroup" aria-label="Yayın durumu" className="flex border border-line-strong rounded-xs overflow-hidden shrink-0">
          {([
            ['all', 'Tümü', products.length],
            ['published', 'Yayında', products.filter((p) => p.isPublished).length],
            ['draft', 'Taslak', products.filter((p) => !p.isPublished).length],
          ] as const).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={statusFilter === value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 h-10 text-sm cursor-pointer ${statusFilter === value ? 'bg-ink text-white font-semibold' : 'bg-white text-neutral-700 hover:bg-paper'}`}
            >
              {label} <span className="font-mono text-xs opacity-80">{count}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Ürün adı, açıklama veya ERP kodu ile ara"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 h-10 text-sm border border-line-strong rounded-xs focus:ring-2 focus:ring-wood/30 focus:outline-none bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Kategori:</label>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-sm border border-line-strong h-10 px-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:outline-none bg-white min-w-[180px]"
          >
            <option value="all">Tüm Kategoriler ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xs border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper border-b border-line text-neutral-600 font-medium text-xs">
              <tr>
                <th className="py-3.5 px-4">Görsel</th>
                <th className="py-3.5 px-4">Ürün Adı</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Ölçüler</th>
                <th className="py-3.5 px-4">Renkler</th>
                <th className="py-3.5 px-4">Fiyat</th>
                <th className="py-3.5 px-4">Durum</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-neutral-800">
              {!catalogLoaded && products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <RowsSkeleton rows={6} label="Ürünler yükleniyor" />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-neutral-500 italic">
                    Arama kriterine uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                (() => {
                  const paginatedProducts = filteredProducts.slice(
                    (currentPage - 1) * pageSize,
                    currentPage * pageSize
                  );
                  return paginatedProducts.map((p) => {
                    const imgs = getProductImages(p);
                    const pCatName = typeof p.category === 'object' && p.category !== null ? (p.category as { name?: string }).name : String(p.category || '');
                    return (
                      <tr key={p.id} className="hover:bg-paper/80 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={imgs[0]}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xs border border-line"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-neutral-900 block">{p.name}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {p.erpItemCode ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-ok-soft text-ok border border-ok/25 font-mono font-bold px-1.5 py-0.5 rounded-xs">
                                <span>ERP: {p.erpItemCode}</span>
                              </span>
                            ) : p.erpItemId ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-ok-soft text-ok border border-ok/25 font-mono font-bold px-1.5 py-0.5 rounded-xs">
                                <span>ERP ID #{p.erpItemId}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-signal/5 text-signal border border-signal/40 font-bold px-1.5 py-0.5 rounded-xs">
                                <span>ERP Bağlantısız</span>
                              </span>
                            )}
                            {p.badge && (
                              <span className="inline-block text-xs bg-wood/15 text-wood-dark font-bold px-1.5 py-0.5 rounded-xs">
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600 font-medium">
                          {pCatName || p.category_id || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-neutral-600">
                          {p.dimensions || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {(p.colors || []).slice(0, 3).map((col, cIdx) => (
                              <div
                                key={cIdx}
                                title={col.name}
                                style={{ backgroundColor: col.hex || col.color || '#8A4B20' }}
                                className="w-3.5 h-3.5 rounded-full border border-black/20"
                              />
                            ))}
                            {(p.colors || []).length > 3 && (
                              <span className="text-xs text-neutral-500 font-bold">+{p.colors!.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-neutral-900">
                          {formatPrice(p.price)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-xs ${
                              p.isPublished ? 'bg-brand text-ink' : 'bg-paper text-neutral-700 border border-line'
                            }`}>
                              {p.isPublished ? 'Yayında' : 'Taslak'}
                            </span>
                            <span className={`text-xs ${p.inStock !== false ? 'text-ok' : 'text-signal'}`}>
                              {p.inStock !== false ? 'Stokta' : 'Tükendi'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="h-9 w-9 inline-flex items-center justify-center text-neutral-700 hover:text-ink hover:bg-paper rounded-xs transition-colors cursor-pointer"
                            title="Düzenle"
                            aria-label={`${p.name} düzenle`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`"${p.name}" ürününü silmek istediğinize emin misiniz?`)) {
                                onDeleteProduct(p.id);
                                onShowSuccess(`"${p.name}" katalogdan kaldırıldı.`);
                              }
                            }}
                            className="h-9 w-9 inline-flex items-center justify-center text-neutral-500 hover:text-signal hover:bg-signal/5 rounded-xs transition-colors cursor-pointer"
                            title="Sil"
                            aria-label={`${p.name} sil`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalItems={filteredProducts.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 15, 25, 50]}
          itemLabel="ürün"
        />
      </div>

      {/* 4-STEP ULTRA SIMPLE PRODUCT FORM MODAL */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProdId(null);
        }}
        categories={categories}
        erpCatalog={erpCatalog}
        editingProduct={editingProdId ? products.find((p) => p.id === editingProdId) : null}
        onSave={handleSaveProductModal}
      />

      {/* BULK CATEGORY WIZARD MODAL */}
      {isBulkWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white rounded-xs border border-line shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-line flex items-center justify-between bg-paper">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xs bg-neutral-900 flex items-center justify-center text-wood">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                    Toplu ERP Kategori Eşleme Sihirbazı
                  </h3>
                  <p className="text-xs text-neutral-500">
                    CRM ERP'deki ürünleri seçip topluca istediğiniz kategoriye bağlayın ve yayına alın.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkWizardOpen(false)}
                className="text-neutral-500 hover:text-neutral-600 p-1.5 rounded-xs transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Target Category Selector */}
              <div className="bg-paper p-4 rounded-xs border border-line space-y-2">
                <label className="text-sm font-semibold text-neutral-800 block">
                  1. Hedef Web Kategorisini Seçin *
                </label>
                <select
                  value={wizardTargetCategoryId}
                  onChange={(e) => setWizardTargetCategoryId(e.target.value)}
                  className="w-full text-xs border border-line-strong py-2.5 px-3 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-white font-medium"
                >
                  <option value="" disabled>-- Lütfen Kategori Seçiniz --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500">
                  Seçilen tüm ERP ürünleri web kataloğunda bu kategori altında yayınlanacaktır.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-800 block">
                  2. Eşlenecek ERP Ürünlerini Seçin ({wizardSelectedIds.length} Seçildi)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Kod veya isim ile filtreleyin (örn: MBL-, MASA, KOLTUK, SEKRETER)..."
                      value={wizardSearch}
                      onChange={(e) => setWizardSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-white font-mono"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 whitespace-nowrap cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wizardOnlyUnlinked}
                      onChange={(e) => setWizardOnlyUnlinked(e.target.checked)}
                      className="rounded border-line-strong text-wood focus:ring-wood"
                    />
                    <span>Sadece Web'de Olmayanlar</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleToggleSelectAllWizard}
                    className="text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {wizardFilteredErpItems.length > 0 &&
                    wizardFilteredErpItems.map((i) => String(i.erpId)).every((id) => wizardSelectedIds.includes(id))
                      ? 'Seçimi Kaldır'
                      : 'Tümünü Seç'}
                  </button>
                </div>

                {/* Items Selection List */}
                <div className="border border-line rounded-xs divide-y divide-line max-h-64 overflow-y-auto bg-white">
                  {wizardFilteredErpItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      Arama kriterlerine uygun ERP ürünü bulunamadı.
                    </div>
                  ) : (
                    wizardFilteredErpItems.map((erp) => {
                      const idStr = String(erp.erpId);
                      const isSelected = wizardSelectedIds.includes(idStr);
                      const linked = linkedErpIdMap.get(idStr);

                      return (
                        <div
                          key={erp.erpId}
                          onClick={() => handleToggleWizardItem(idStr)}
                          className={`p-3 flex items-center justify-between hover:bg-paper transition-colors cursor-pointer ${
                            isSelected ? 'bg-paper' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-neutral-500">
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-wood" />
                              ) : (
                                <Square className="h-4 w-4 text-neutral-300" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-bold">
                                  {erp.erpCode}
                                </span>
                                <span className="text-xs font-bold text-neutral-900">{erp.erpName}</span>
                                {linked ? (
                                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-ok-soft text-ok border border-ok/25">
                                    ✓ Yayında
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-paper text-wood-dark border border-line">
                                    + Web'de Yok
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500 flex items-center gap-3">
                                <span>ERP ID: #{erp.erpId}</span>
                                <span>ERP Fiyatı: {formatPrice(erp.erpSalePrice)}</span>
                                <span>ERP Stoku: {erp.erpStock}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-line bg-paper flex items-center justify-between gap-4">
              <div className="text-xs text-neutral-600 font-medium">
                Toplam <strong className="text-neutral-900">{wizardSelectedIds.length}</strong> ürün seçildi.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkWizardOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkLink}
                  disabled={isBulkSubmitting || wizardSelectedIds.length === 0 || !wizardTargetCategoryId}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-xs transition-colors ${
                    isBulkSubmitting || wizardSelectedIds.length === 0 || !wizardTargetCategoryId
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-brand hover:bg-brand-dark text-ink cursor-pointer'
                  }`}
                >
                  {isBulkSubmitting ? 'Bağlanıyor...' : `Seçilen ${wizardSelectedIds.length} Ürünü Eşle & Yayına Al`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsTab;
