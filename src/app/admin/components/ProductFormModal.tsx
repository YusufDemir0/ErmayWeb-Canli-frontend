'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload, Search, Check, Trash2 } from 'lucide-react';
import type { Product, Category, ProductColorVariant } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';

export interface ErpCatalogItem {
  erpId: string;
  erpCode: string;
  erpName: string;
  erpSalePrice: number;
  erpStock: number;
  erpType?: string;
  erpImage?: string | null;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  erpCatalog: ErpCatalogItem[];
  editingProduct?: Product | null;
  onSave: (productData: any) => Promise<void> | void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  erpCatalog,
  editingProduct,
  onSave,
}) => {
  const [name, setName] = useState(editingProduct?.name || '');
  const [category, setCategory] = useState<string>(
    typeof editingProduct?.category === 'object' && editingProduct.category !== null
      ? (editingProduct.category as any).slug || (editingProduct.category as any).id
      : (editingProduct?.category as string) || (categories[0]?.slug || '')
  );

  // Images
  const initialImg = editingProduct?.image || (editingProduct?.images && (editingProduct.images as string[])[0]) || '';
  const initialImg2 = (editingProduct?.images && (editingProduct.images as string[])[1]) || editingProduct?.image2 || '';
  const initialImg3 = (editingProduct?.images && (editingProduct.images as string[])[2]) || editingProduct?.image3 || '';
  
  const [image1, setImage1] = useState(initialImg);
  const [image2, setImage2] = useState(initialImg2);
  const [image3, setImage3] = useState(initialImg3);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // ERP Matching
  const [erpItemId, setErpItemId] = useState(editingProduct?.erpItemId ? String(editingProduct.erpItemId) : '');
  const [erpItemCode, setErpItemCode] = useState(editingProduct?.erpItemCode || '');
  const [erpSearch, setErpSearch] = useState('');
  const [showErpList, setShowErpList] = useState(false);

  // Pricing & Stock
  const [price, setPrice] = useState(editingProduct?.price ? String(editingProduct.price) : '');
  const [inStock, setInStock] = useState(editingProduct?.inStock !== false);

  // Colors
  const [colors, setColors] = useState<ProductColorVariant[]>(
    editingProduct?.colors && editingProduct.colors.length > 0
      ? editingProduct.colors
      : [
          { id: 'c-1', name: 'Krem Keten', hex: '#E4DAC6', tag: 'Döşeme' },
          { id: 'c-2', name: 'Antrasit Nubuk', hex: '#2C323B', tag: 'Nubuk' },
          { id: 'c-3', name: 'İtalyan Taba', hex: '#8A4B20', tag: 'Hakiki Deri' },
        ]
  );

  // Optional Details
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [width, setWidth] = useState(editingProduct?.widthCm ? String(editingProduct.widthCm) : '220');
  const [depth, setDepth] = useState(editingProduct?.depthCm ? String(editingProduct.depthCm) : '95');
  const [height, setHeight] = useState(editingProduct?.heightCm ? String(editingProduct.heightCm) : '75');
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [badge, setBadge] = useState(editingProduct?.badge || '2026 Özel Koleksiyon');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingSlot(slot);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        if (slot === 1) setImage1(url);
        if (slot === 2) setImage2(url);
        if (slot === 3) setImage3(url);
      } catch {
        alert('Görsel yüklenirken bir problem oluştu.');
      } finally {
        setUploadingSlot(null);
      }
    }
  };

  const handleSelectErp = (item: ErpCatalogItem) => {
    setErpItemId(String(item.erpId));
    setErpItemCode(item.erpCode);
    if (!name.trim()) setName(item.erpName);
    if (!price || price === '0') setPrice(String(item.erpSalePrice));
    if (item.erpImage && !image1) setImage1(item.erpImage);
    setShowErpList(false);
  };

  const filteredErp = erpCatalog.filter((item) => {
    if (!erpSearch.trim()) return true;
    const q = erpSearch.toLowerCase();
    return item.erpName.toLowerCase().includes(q) || item.erpCode.toLowerCase().includes(q);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen ürün adını yazınız.');
      return;
    }
    if (!price) {
      alert('Lütfen ürün fiyatını yazınız.');
      return;
    }

    setIsSubmitting(true);
    try {
      const allImages = [image1, image2, image3].filter(Boolean);
      const dimsString = `G: ${width || '220'}cm × D: ${depth || '95'}cm × Y: ${height || '75'}cm`;

      const payload = {
        name: name.trim(),
        category,
        price: parseFloat(price) || 0,
        image: image1 || '/default-furniture.webp',
        images: allImages.length > 0 ? allImages : ['/default-furniture.webp'],
        image1: image1 || undefined,
        image2: image2 || undefined,
        image3: image3 || undefined,
        inStock,
        erpItemId: erpItemId ? erpItemId : undefined,
        erpItemCode: erpItemCode ? erpItemCode : undefined,
        colors,
        dimensions: dimsString,
        widthCm: parseInt(width, 10) || 220,
        depthCm: parseInt(depth, 10) || 95,
        heightCm: parseInt(height, 10) || 75,
        description: description.trim() || undefined,
        badge: badge.trim() || undefined,
        material: '1. Sınıf Masif Gürgen & İtalyan Döşeme',
      };

      await onSave(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880] block">
              {editingProduct ? 'Düzenleme Ekranı' : 'Sade & Kolay Form'}
            </span>
            <h3 className="text-base font-bold text-neutral-900">
              {editingProduct ? `Ürünü Düzenle: ${editingProduct.name}` : 'Yeni Ürün Ekle'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* ADIM 1: ÜRÜN ADI & KATEGORİ */}
          <div className="bg-neutral-50/70 p-4 rounded-xs border border-neutral-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C5A880] text-white flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Ürün Adı ve Kategori
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Milano Chester Koltuk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm font-semibold px-3 py-2 border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Kategori *
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-hidden bg-white"
                >
                  <option value="" disabled>-- Kategori Seçin --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ADIM 2: ÜRÜN RESMİ */}
          <div className="bg-neutral-50/70 p-4 rounded-xs border border-neutral-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C5A880] text-white flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Ürün Resmi
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Slot 1: Ana Kapak */}
              <div className="relative aspect-square bg-white border-2 border-dashed border-neutral-300 hover:border-[#C5A880] rounded-xs flex flex-col items-center justify-center overflow-hidden transition-colors">
                {image1 ? (
                  <>
                    <img src={image1} alt="Kapak" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage1('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer">
                    <ImageIcon className="h-7 w-7 text-neutral-400 mb-1" />
                    <span className="text-xs font-bold text-neutral-800">Ana Resim Seç</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      {uploadingSlot === 1 ? 'Yükleniyor...' : 'Tıkla ve Yükle'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingSlot === 1}
                      onChange={(e) => handleImageUpload(1, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Slot 2: Ek Resim */}
              <div className="relative aspect-square bg-white border border-dashed border-neutral-300 hover:border-[#C5A880] rounded-xs flex flex-col items-center justify-center overflow-hidden transition-colors">
                {image2 ? (
                  <>
                    <img src={image2} alt="Detay" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage2('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer">
                    <Upload className="h-5 w-5 text-neutral-400 mb-1" />
                    <span className="text-[11px] font-semibold text-neutral-600">2. Resim</span>
                    <span className="text-[9px] text-neutral-400">İsteğe Bağlı</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingSlot === 2}
                      onChange={(e) => handleImageUpload(2, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Slot 3: Ek Resim */}
              <div className="relative aspect-square bg-white border border-dashed border-neutral-300 hover:border-[#C5A880] rounded-xs flex flex-col items-center justify-center overflow-hidden transition-colors">
                {image3 ? (
                  <>
                    <img src={image3} alt="Detay" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage3('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer">
                    <Upload className="h-5 w-5 text-neutral-400 mb-1" />
                    <span className="text-[11px] font-semibold text-neutral-600">3. Resim</span>
                    <span className="text-[9px] text-neutral-400">İsteğe Bağlı</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingSlot === 3}
                      onChange={(e) => handleImageUpload(3, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* ADIM 3: CRM / ERP EŞLEŞTİRME */}
          <div className="bg-neutral-50/70 p-4 rounded-xs border border-neutral-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#C5A880] text-white flex items-center justify-center text-xs font-bold">3</span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  CRM / ERP Ürün Eşleştirmesi
                </h4>
              </div>
              {erpItemId && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Eşleşti: {erpItemCode}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="ERP'deki ürünün adını veya kodunu arayın..."
                  value={erpSearch}
                  onChange={(e) => {
                    setErpSearch(e.target.value);
                    setShowErpList(true);
                  }}
                  onFocus={() => setShowErpList(true)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-hidden bg-white"
                />
              </div>

              {showErpList && (
                <div className="border border-neutral-200 rounded-xs max-h-40 overflow-y-auto divide-y divide-neutral-100 bg-white shadow-md">
                  {filteredErp.slice(0, 25).map((erp) => (
                    <div
                      key={erp.erpId}
                      onClick={() => handleSelectErp(erp)}
                      className="p-2.5 text-xs hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between"
                    >
                      <div className="space-x-2">
                        <span className="font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded font-bold text-neutral-700">
                          {erp.erpCode}
                        </span>
                        <span className="text-neutral-900 font-medium">{erp.erpName}</span>
                      </div>
                      <span className="text-neutral-500 font-mono text-[11px]">
                        {erp.erpSalePrice ? `${Number(erp.erpSalePrice).toLocaleString('tr-TR')} TL` : '0 TL'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ADIM 4: FİYAT VE RENK BİLGİLERİ */}
          <div className="bg-neutral-50/70 p-4 rounded-xs border border-neutral-200/80 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C5A880] text-white flex items-center justify-center text-xs font-bold">4</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Fiyat ve Renk Seçenekleri
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Satış Fiyatı (TL) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Örn: 48000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-base font-bold text-[#C87A53] px-3 py-2 border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-hidden bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="inStockForm"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-4 w-4 text-[#C5A880] border-neutral-300 rounded-xs focus:ring-[#C5A880]"
                />
                <label htmlFor="inStockForm" className="text-xs font-bold text-neutral-800 cursor-pointer">
                  Stokta Var (Sipariş Talebine Açık)
                </label>
              </div>
            </div>

            {/* Colors list */}
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-bold text-neutral-700 uppercase">
                Seçilen Renkler:
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-neutral-800 text-xs rounded-xs border border-neutral-200"
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                      className="text-neutral-400 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Add Color Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-neutral-400">Hızlı Ekle:</span>
                {[
                  { name: 'Krem Keten', hex: '#E4DAC6' },
                  { name: 'Antrasit Nubuk', hex: '#2C323B' },
                  { name: 'İtalyan Taba', hex: '#8A4B20' },
                  { name: 'Siyah Deri', hex: '#1A1A1A' },
                  { name: 'Doğal Ceviz', hex: '#5A3825' },
                ].map((rc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!colors.some((c) => c.name === rc.name)) {
                        setColors([...colors, { id: `c-${Date.now()}-${idx}`, name: rc.name, hex: rc.hex, tag: 'Döşeme' }]);
                      }
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xs text-neutral-700 cursor-pointer text-[10px]"
                  >
                    + {rc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* İSTEĞE BAĞLI EKSTRA BİLGİLER AKORDEONU */}
          <div className="border border-neutral-200 rounded-xs overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-3.5 text-left text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between cursor-pointer"
            >
              <span>+ İsteğe Bağlı Ek Detaylar (Ölçü, Açıklama, Etiket)</span>
              <span className="text-neutral-400 text-xs">{showAdvanced ? 'Gizle ▲' : 'Göster ▼'}</span>
            </button>

            {showAdvanced && (
              <div className="p-4 border-t border-neutral-100 space-y-4 animate-fade-in bg-neutral-50/50">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Genişlik (cm)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="220"
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Derinlik (cm)</label>
                    <input
                      type="number"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      placeholder="95"
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Yükseklik (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="75"
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Koleksiyon Rozeti</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Örn: 2026 Özel Koleksiyon"
                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-xs bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Açıklama</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Masif gürgen iskelet, leke tutmaz kumaş..."
                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-xs bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 py-2.5 px-4 rounded-xs cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#C5A880] hover:bg-[#B4966E] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet & Kataloğa Ekle'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
