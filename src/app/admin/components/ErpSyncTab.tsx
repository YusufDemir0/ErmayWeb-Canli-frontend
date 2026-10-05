'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Search, Filter, CheckCircle2, AlertCircle, Eye, EyeOff, 
  Upload, X, Image as ImageIcon, Layers, ExternalLink, Check, 
  Tag, Box, DollarSign, Sparkles, Loader2, ArrowRight
} from 'lucide-react';
import apiClient from '../../../services/api';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { resolveImageUrl } from '../../../lib/productImages';
import { Pagination } from '../../../components/Pagination';
import { toast } from '../../../stores/useToastStore';
import type { Category } from '../../../types';
import { RowsSkeleton } from '../../../components/Skeleton';

export interface CatalogItem {
  erpId: string;
  erpCode: string;
  erpName: string;
  erpSalePrice: number;
  erpStock: number;
  erpType: string;
  erpImage: string | null;
  webProduct: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    isPublished: boolean;
    images: string[];
    image: string;
    categoryId: string;
    categoryName: string;
    description: string;
    dimensions: string;
    material: string;
  } | null;
}

interface ErpSyncTabProps {
  categories: Category[];
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
}

export const ErpSyncTab: React.FC<ErpSyncTabProps> = ({
  categories,
  onShowSuccess,
  onShowError,
}) => {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [publishFilter, setPublishFilter] = useState<'ALL' | 'PUBLISHED' | 'UNPUBLISHED'>('ALL');
  const [stockOnlyFilter, setStockOnlyFilter] = useState<boolean>(false);

  // Pagination State (Chunked 15 items per page for ultra fast UI)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Edit / Image Modal State
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editDimensions, setEditDimensions] = useState<string>('');
  const [editMaterial, setEditMaterial] = useState<string>('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editIsPublished, setEditIsPublished] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch catalog from backend API
  const fetchCatalog = async (silent = false) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/integration/catalog');
      if (res.data?.success && Array.isArray(res.data.catalog)) {
        setCatalog(res.data.catalog);
        if (!silent) {
          toast.info('ERP Kataloğu Güncellendi', `${res.data.catalog.length} ürün listelendi.`);
        }
      }
    } catch (err: unknown) {
      console.error('Catalog fetch error:', err);
      const errObj = err as { response?: { data?: { message?: string } } };
      const msg = errObj.response?.data?.message || 'ERP ürün kataloğu alınamadı.';
      toast.error('Hata', msg);
      onShowError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog(true);
  }, []);

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, publishFilter, stockOnlyFilter]);

  // Quick Switch Toggle (Instant publish/unpublish from list)
  const handleTogglePublish = async (item: CatalogItem, currentState: boolean) => {
    const nextState = !currentState;

    // RULE: If turning ON, MUST have at least 1 image!
    const existingImages = item.webProduct?.images || (item.webProduct?.image ? [item.webProduct.image] : []);
    if (nextState && existingImages.length === 0) {
      const warningMsg = `"${item.erpName}" için görsel yok. Satışa açmak için en az 1 görsel eklenmelidir.`;
      toast.warning('Görsel Eksik', warningMsg);
      onShowError(warningMsg);
      openEditModal(item);
      return;
    }

    try {
      const res = await apiClient.post('/integration/sync', {
        erpItemId: item.erpId,
        isPublished: nextState,
        images: existingImages,
        categoryId: item.webProduct?.categoryId || (categories[0]?.id || ''),
        name: item.webProduct?.name || item.erpName,
        description: item.webProduct?.description || '',
        dimensions: item.webProduct?.dimensions || 'G: Standart | D: Standart | Y: Standart',
        material: item.webProduct?.material || 'Lüks Ermay Mobilya Atölye Üretimi',
      });

      if (res.data?.success) {
        const successMsg = nextState
          ? `"${item.erpName}" web satışına açıldı.`
          : `"${item.erpName}" web satışından kaldırıldı.`;
        toast.success(nextState ? 'Satışa Açıldı' : 'Satıştan Kaldırıldı', successMsg);
        onShowSuccess(successMsg);
        fetchCatalog(true);
      }
    } catch (err: unknown) {
      console.error('Toggle error:', err);
      const errObj = err as { response?: { data?: { message?: string } } };
      const errMsg = errObj.response?.data?.message || 'Yayın durumu değiştirilemedi.';
      toast.error('İşlem Başarısız', errMsg);
      onShowError(errMsg);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: CatalogItem) => {
    setSelectedItem(item);
    setEditName(item.webProduct?.name || item.erpName);
    setEditCategoryId(item.webProduct?.categoryId || categories[0]?.id || '');
    setEditDescription(
      item.webProduct?.description || 'Lüks Modoko atölye zanaati ile özenle üretilmiş Ermay Mobilya tasarımı.'
    );
    setEditDimensions(item.webProduct?.dimensions || 'G: Standart | D: Standart | Y: Standart');
    setEditMaterial(item.webProduct?.material || 'Lüks Ermay Mobilya Atölye Üretimi');
    
    const existingImages = item.webProduct?.images?.length 
      ? item.webProduct.images 
      : (item.webProduct?.image ? [item.webProduct.image] : []);
    setEditImages(existingImages);
    setEditIsPublished(item.webProduct?.isPublished || false);
  };

  // Upload image handler for modal
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editImages.length >= 5) {
      toast.warning('Görsel Sınırı', 'Bir ürün için en fazla 5 görsel eklenebilir.');
      onShowError('Bir ürün için en fazla 5 görsel eklenebilir.');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      if (uploadedUrl) {
        setEditImages((prev) => [...prev, uploadedUrl]);
        toast.success('Görsel Yüklendi', `${editImages.length + 1}/5 görsel hazır.`);
        onShowSuccess('Görsel başarıyla yüklendi.');
      }
    } catch (err: unknown) {
      toast.error('Yükleme Hatası', 'Görsel yüklenirken bir hata oluştu.');
      onShowError('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
      // Reset input value
      e.target.value = '';
    }
  };

  // Remove image from list
  const handleRemoveImage = (indexToRemove: number) => {
    setEditImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    toast.info('Görsel Kaldırıldı', 'Kalan görseller kaydedilmeyi bekliyor.');
  };

  // Save Modal Changes
  const handleSaveModal = async () => {
    if (!selectedItem) return;

    // Enforce Rule: If isPublished is true, images MUST be between 1 and 5
    if (editIsPublished && editImages.length === 0) {
      const warnMsg = 'Web satışına açmak için en az 1 görsel eklenmelidir (Maksimum 5).';
      toast.warning('Görsel Gerekli', warnMsg);
      onShowError(warnMsg);
      return;
    }

    if (editImages.length > 5) {
      toast.warning('Görsel Sınırı', 'En fazla 5 görsel eklenebilir.');
      onShowError('En fazla 5 görsel eklenebilir.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.post('/integration/sync', {
        erpItemId: selectedItem.erpId,
        isPublished: editIsPublished,
        images: editImages,
        categoryId: editCategoryId,
        name: editName.trim() || selectedItem.erpName,
        description: editDescription,
        dimensions: editDimensions,
        material: editMaterial,
      });

      if (res.data?.success) {
        const msg = `"${editName}" başarıyla kaydedildi ve ERP ile senkronize edildi.`;
        toast.success('Başarıyla Kaydedildi', msg);
        onShowSuccess(msg);
        setSelectedItem(null);
        fetchCatalog(true);
      }
    } catch (err: unknown) {
      console.error('Save error:', err);
      const errObj = err as { response?: { data?: { message?: string } } };
      const errMsg = errObj.response?.data?.message || 'Senkronizasyon başarısız oldu.';
      toast.error('Kayıt Başarısız', errMsg);
      onShowError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter items
  const filteredCatalog = catalog.filter((item) => {
    // Search query
    const cleanSearch = searchQuery.toLowerCase().trim();
    if (cleanSearch) {
      const matchCode = item.erpCode?.toLowerCase().includes(cleanSearch);
      const matchName = item.erpName?.toLowerCase().includes(cleanSearch);
      const matchWebName = item.webProduct?.name?.toLowerCase().includes(cleanSearch);
      if (!matchCode && !matchName && !matchWebName) return false;
    }

    // Type filter
    if (typeFilter !== 'ALL' && item.erpType !== typeFilter) {
      return false;
    }

    // Publish filter
    const isPub = Boolean(item.webProduct?.isPublished);
    if (publishFilter === 'PUBLISHED' && !isPub) return false;
    if (publishFilter === 'UNPUBLISHED' && isPub) return false;

    // Stock filter
    if (stockOnlyFilter && item.erpStock <= 0) return false;

    return true;
  });

  const publishedCount = catalog.filter((i) => i.webProduct?.isPublished).length;
  const inStockCount = catalog.filter((i) => i.erpStock > 0).length;

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-line rounded-xs p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Toplam ERP Ürünü</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{catalog.length}</p>
          </div>
          <div className="p-3 bg-neutral-100 rounded-xs text-neutral-600">
            <Box className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-wood/30 rounded-xs p-4 flex items-center justify-between bg-gradient-to-br from-white to-paper">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-wood-dark">Web Satışına Açık</p>
            <p className="text-2xl font-extrabold text-wood-dark mt-1">{publishedCount}</p>
          </div>
          <div className="p-3 bg-wood/20 rounded-xs text-wood-dark">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-ok/25 rounded-xs p-4 flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/40">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ok">Stokta Bulunan</p>
            <p className="text-2xl font-extrabold text-ok mt-1">{inStockCount}</p>
          </div>
          <div className="p-3 bg-ok-soft rounded-xs text-ok">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 2. FILTER & ACTION BAR */}
      <div className="bg-white border border-line rounded-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün adı veya koduna göre ara (örn: MBL-334, İmaj Dolap)..."
              className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line rounded-xs text-xs text-neutral-800 focus:outline-none focus:border-wood focus:bg-white transition-all"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchCatalog()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-brand text-ink text-sm font-semibold rounded-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>ERP'den Güncelle</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 mr-2 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filtrele:
          </span>

          {/* Publish State Filters */}
          <div className="flex rounded-xs border border-line bg-paper p-0.5 text-xs">
            <button
              onClick={() => setPublishFilter('ALL')}
              className={`px-3 py-1 font-semibold rounded-xs transition-all ${
                publishFilter === 'ALL' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Tümü ({catalog.length})
            </button>
            <button
              onClick={() => setPublishFilter('PUBLISHED')}
              className={`px-3 py-1 font-semibold rounded-xs transition-all ${
                publishFilter === 'PUBLISHED' ? 'bg-brand text-ink' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Yayındakiler ({publishedCount})
            </button>
            <button
              onClick={() => setPublishFilter('UNPUBLISHED')}
              className={`px-3 py-1 font-semibold rounded-xs transition-all ${
                publishFilter === 'UNPUBLISHED' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Kapalılar ({catalog.length - publishedCount})
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-paper border border-line rounded-xs text-xs font-semibold text-neutral-700 focus:outline-none focus:border-wood"
          >
            <option value="ALL">Tüm Ürün Tipleri</option>
            <option value="Ticari Mamül">Ticari Mamül</option>
            <option value="Ara Mamül">Ara Mamül</option>
            <option value="Hammadde">Hammadde</option>
          </select>

          {/* Stock Only Checkbox */}
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer pl-2">
            <input
              type="checkbox"
              checked={stockOnlyFilter}
              onChange={(e) => setStockOnlyFilter(e.target.checked)}
              className="accent-wood rounded"
            />
            <span>Sadece Stoktakiler</span>
          </label>
        </div>
      </div>

      {/* 3. CATALOG TABLE */}
      <div className="bg-white border border-line rounded-xs overflow-hidden">
        {isLoading ? (
          <RowsSkeleton rows={6} label="ERP kataloğu yükleniyor" />
        ) : filteredCatalog.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-neutral-300 mx-auto" />
            <p className="text-sm font-bold text-neutral-700">Eşleşen Ürün Bulunamadı</p>
            <p className="text-xs text-neutral-500">Filtre kriterlerinizi değiştirebilir veya ERP'den yenileyebilirsiniz.</p>
          </div>
        ) : (
          (() => {
            const paginatedCatalog = filteredCatalog.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            );
            return (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-paper text-neutral-500 uppercase tracking-wider font-bold border-b border-line text-xs">
                      <tr>
                        <th className="py-3 px-4">Görseller (Min 1 - Max 5)</th>
                        <th className="py-3 px-4">Kod & İsim</th>
                        <th className="py-3 px-4">Tip</th>
                        <th className="py-3 px-4">ERP Fiyat</th>
                        <th className="py-3 px-4">Stok</th>
                        <th className="py-3 px-4 text-center">Web Satış Durumu</th>
                        <th className="py-3 px-4 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line font-medium">
                      {paginatedCatalog.map((item) => {
                        const isPublished = Boolean(item.webProduct?.isPublished);
                        const images = item.webProduct?.images || (item.webProduct?.image ? [item.webProduct.image] : []);
                        const hasImages = images.length > 0;

                  return (
                    <tr 
                      key={item.erpId}
                      className={`hover:bg-paper/70 transition-colors ${
                        isPublished ? 'bg-paper/40' : ''
                      }`}
                    >
                      {/* Image Preview / Count */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {hasImages ? (
                            <div className="relative group">
                              <img
                                src={resolveImageUrl(images[0])}
                                alt={item.erpName}
                                className="w-12 h-12 object-cover rounded-xs border border-line"
                              />
                              <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-xs font-bold px-1.5 py-0.2 rounded-full">
                                {images.length}/5
                              </span>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xs border border-dashed border-signal/40 bg-signal/5 flex flex-col items-center justify-center text-signal text-center p-1">
                              <ImageIcon className="h-4 w-4" />
                              <span className="text-xs font-bold leading-none mt-0.5">Yok</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Code & Name */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-mono font-bold text-neutral-500 text-xs block">
                            {item.erpCode}
                          </span>
                          <span className="font-bold text-neutral-900 text-xs">
                            {item.webProduct?.name || item.erpName}
                          </span>
                          {item.webProduct?.categoryName && (
                            <span className="text-xs text-wood-dark block font-semibold">
                              {item.webProduct.categoryName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.erpType === 'Ticari Mamül'
                            ? 'bg-paper text-wood-dark'
                            : item.erpType === 'Ara Mamül'
                            ? 'bg-paper text-wood-dark'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {item.erpType}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        {item.erpSalePrice > 0 ? (
                          <span>{item.erpSalePrice.toLocaleString('tr-TR')} ₺</span>
                        ) : (
                          <span className="text-neutral-500">Belirtilmemiş</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        {item.erpStock > 0 ? (
                          <span className="inline-flex items-center gap-1 text-ok font-bold bg-ok-soft px-2 py-0.5 rounded-xs border border-ok/25 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-whatsapp" />
                            {item.erpStock} adet
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-signal font-bold bg-signal/5 px-2 py-0.5 rounded-xs border border-signal/40 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Tükendi (0)
                          </span>
                        )}
                      </td>

                      {/* Web Switch (Default OFF) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item, isPublished)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isPublished ? 'bg-wood' : 'bg-neutral-200'
                            }`}
                            role="switch"
                            aria-checked={isPublished}
                            title={isPublished ? 'Yayında (Kapatmak için tıklayın)' : 'Kapalı (Açmak için tıklayın)'}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isPublished ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            isPublished ? 'text-wood-dark' : 'text-neutral-500'
                          }`}>
                            {isPublished ? 'Açık' : 'Kapalı'}
                          </span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line-strong hover:border-wood hover:text-wood-dark rounded-xs text-xs font-bold transition-all cursor-pointer"
                        >
                          <ImageIcon className="h-3.5 w-3.5 text-wood" />
                          <span>Görsel & Detay</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={filteredCatalog.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 15, 25, 50]}
            itemLabel="ERP ürünü"
          />
        </>
      );
    })()
  )}
</div>

      {/* ============================================================ */}
      {/* 4. EDIT & IMAGE MANAGEMENT MODAL                            */}
      {/* ============================================================ */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 animate-fade-in">
          <div className="bg-white max-w-2xl w-full rounded-xs shadow-2xl border border-line overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-line flex items-center justify-between bg-paper">
              <div>
                <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  ERP KOD: {selectedItem.erpCode} (ID: {selectedItem.erpId})
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  {selectedItem.erpName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Product Web Title */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Web Sitesinde Görünecek Ürün Adı
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-paper border border-line rounded-xs text-xs font-semibold focus:outline-none focus:border-wood focus:bg-white"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Web Kategorisi
                </label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-paper border border-line rounded-xs text-xs font-semibold focus:outline-none focus:border-wood focus:bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ======================================================= */}
              {/* IMAGE UPLOAD & GALLERY (MIN 1 - MAX 5 MANDATORY)        */}
              {/* ======================================================= */}
              <div className="p-4 bg-paper border border-line rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900">
                      Ürün Görselleri (En Az 1 - En Fazla 5 Adet)
                    </label>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      İlk görsel kapak fotoğrafı olur ve CRM/ERP veritabanına otomatik senkronize edilir.
                    </p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    editImages.length >= 1 ? 'bg-ok-soft text-ok' : 'bg-signal/5 text-signal'
                  }`}>
                    {editImages.length} / 5 Görsel
                  </span>
                </div>

                {/* Thumbnails Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {editImages.map((imgUrl, index) => (
                    <div key={index} className="relative group aspect-square rounded-xs border border-line overflow-hidden bg-white">
                      <img src={resolveImageUrl(imgUrl)} alt={`Görsel ${index + 1}`} className="w-full h-full object-cover" />
                      {index === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-neutral-900/80 text-white text-xs font-bold text-center py-0.5">
                          KAPAK
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-signal hover:bg-signal-dark text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Görseli Kaldır"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Image Slot */}
                  {editImages.length < 5 && (
                    <label className={`aspect-square rounded-xs border-2 border-dashed border-line-strong hover:border-wood bg-white flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors ${
                      isUploading ? 'opacity-50 pointer-events-none' : ''
                    }`}>
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 text-wood animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-neutral-500 mb-1" />
                          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Görsel Yükle
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>

                {editImages.length === 0 && (
                  <div className="bg-paper border border-line p-2.5 rounded-xs flex items-center gap-2 text-wood-dark text-xs">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-wood" />
                    <span>Ürünü web satışına açabilmek için en az 1 görsel yüklemeniz gerekmektedir.</span>
                  </div>
                )}
              </div>

              {/* Description & Technical Specs */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Ürün Açıklaması
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-paper border border-line rounded-xs text-xs focus:outline-none focus:border-wood focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">
                    Ölçüler / Boyutlar
                  </label>
                  <input
                    type="text"
                    value={editDimensions}
                    onChange={(e) => setEditDimensions(e.target.value)}
                    placeholder="G: 180cm | D: 90cm | Y: 75cm"
                    className="w-full px-3 py-2 bg-paper border border-line rounded-xs text-xs focus:outline-none focus:border-wood focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">
                    Malzeme / Ağaç Türü
                  </label>
                  <input
                    type="text"
                    value={editMaterial}
                    onChange={(e) => setEditMaterial(e.target.value)}
                    placeholder="Doğal Meşe, Fırınlanmış Gürgen vb."
                    className="w-full px-3 py-2 bg-paper border border-line rounded-xs text-xs focus:outline-none focus:border-wood focus:bg-white"
                  />
                </div>
              </div>

              {/* Publish Toggle in Modal */}
              <div className="p-3 bg-paper rounded-xs border border-line flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    Web Sitesinde Yayına Al
                  </span>
                  <span className="text-xs text-neutral-500">
                    Açık olduğunda ürün müşterilerin sepetine ve kataloğuna eklenir.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!editIsPublished && editImages.length === 0) {
                      onShowError('Web satışına açmak için en az 1 görsel eklenmelidir.');
                      return;
                    }
                    setEditIsPublished(!editIsPublished);
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    editIsPublished ? 'bg-wood' : 'bg-neutral-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      editIsPublished ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-line flex items-center justify-end gap-3 bg-paper">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                İptal
              </button>

              <button
                type="button"
                onClick={handleSaveModal}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-brand text-ink text-sm font-semibold rounded-xs transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Kaydet & Senkronize Et</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
