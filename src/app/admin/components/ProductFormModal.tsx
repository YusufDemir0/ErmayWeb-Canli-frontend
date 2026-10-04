'use client';

import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Search,
  Check,
  Plus,
  Trash2,
  Ruler,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  Box,
  Eye,
} from 'lucide-react';
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

// Preset furniture dimension templates (ERP/B2B Industry Standards)
const DIMENSION_PRESETS = [
  { label: 'Makam Masası', w: 220, d: 95, h: 75 },
  { label: 'Yönetici Masası', w: 200, d: 90, h: 75 },
  { label: 'Çalışma Masası', w: 160, d: 80, h: 75 },
  { label: 'Operasyonel Masa', w: 140, d: 70, h: 75 },
  { label: 'Toplantı Masası (K)', w: 200, d: 100, h: 75 },
  { label: 'Toplantı Masası (B)', w: 280, d: 120, h: 75 },
  { label: 'Ofis Bankosu', w: 200, d: 75, h: 110 },
  { label: 'Dosya Dolabı (Orta)', w: 160, d: 45, h: 120 },
  { label: 'Yüksek Dosya Dolabı', w: 80, d: 40, h: 198 },
  { label: 'Müdür Koltuğu', w: 68, d: 68, h: 120 },
  { label: 'Personel Koltuğu', w: 60, d: 60, h: 100 },
  { label: 'Ofis Sehpası', w: 100, d: 60, h: 45 },
];

// Preset material chips (Factory Standard Substrates)
const MATERIAL_PRESETS = [
  'E1 Kalite Çizilmez Melamin',
  '1. Sınıf Fırınlanmış Masif Gürgen',
  'DKP Çelik Profil & Elektrostatik Fırın Boya',
  'Ergonomik Nefes Alan File & HR Sünger',
  'Hakiki İtalyan Taba Deri',
  'Lüks Silinebilir Dokuma Kumaş',
  'Doğal Ceviz Kaplama & Masif Kenar Bandı',
];

// Preset technical feature bullet templates (High-conversion B2B selling points)
const FEATURE_PRESETS = [
  'Alüminyum bas-aç kablo kanalı & priz yuvası',
  'Frenli teleskopik çekmece rayları (sessiz kapanma)',
  '32 DNS yüksek dansite dökme sünger dolgu',
  'Çift kollu senkron yatarlı ergonomik mekanizma',
  'Yükseklik ayarlı zemin dengeleme pabuçları',
  '2 mm darbe emici elastik PVC kenar bantları',
  'Çizilme ve sıvı temasına dayanıklı E1 melamin yüzey',
  'Gizli taşıyıcı çelik elektrifikasyon omurgası',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  erpCatalog,
  editingProduct,
  onSave,
}) => {
  // 1. Basic Definitions
  const [name, setName] = useState(editingProduct?.name || '');
  const [category, setCategory] = useState<string>(
    typeof editingProduct?.category === 'object' && editingProduct.category !== null
      ? (editingProduct.category as any).slug || (editingProduct.category as any).id
      : (editingProduct?.category as string) || (categories[0]?.slug || '')
  );

  // 2. Images
  const initialImg = editingProduct?.image || (editingProduct?.images && (editingProduct.images as string[])[0]) || '';
  const initialImg2 = (editingProduct?.images && (editingProduct.images as string[])[1]) || editingProduct?.image2 || '';
  const initialImg3 = (editingProduct?.images && (editingProduct.images as string[])[2]) || editingProduct?.image3 || '';
  
  const [image1, setImage1] = useState(initialImg);
  const [image2, setImage2] = useState(initialImg2);
  const [image3, setImage3] = useState(initialImg3);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // 3. ERP Matching
  const [erpItemId, setErpItemId] = useState(editingProduct?.erpItemId ? String(editingProduct.erpItemId) : '');
  const [erpItemCode, setErpItemCode] = useState(editingProduct?.erpItemCode || '');
  const [erpSearch, setErpSearch] = useState('');
  const [showErpList, setShowErpList] = useState(false);

  // 4. Pricing & Stock
  const [price, setPrice] = useState(editingProduct?.price ? String(editingProduct.price) : '');
  const [originalPrice, setOriginalPrice] = useState(
    editingProduct?.originalPrice ? String(editingProduct.originalPrice) : ''
  );
  const [inStock, setInStock] = useState(editingProduct?.inStock !== false);
  const [leadTimeDays, setLeadTimeDays] = useState(
    editingProduct?.leadTimeDays !== undefined ? String(editingProduct.leadTimeDays) : '15'
  );
  const [vatRate, setVatRate] = useState(
    editingProduct?.vatRate !== undefined ? String(editingProduct.vatRate) : '0.20'
  );

  // 5. Parçalı Boyut / Ölçü Girişi (Dimensions Chunk)
  const [width, setWidth] = useState(editingProduct?.widthCm ? String(editingProduct.widthCm) : '220');
  const [depth, setDepth] = useState(editingProduct?.depthCm ? String(editingProduct.depthCm) : '95');
  const [height, setHeight] = useState(editingProduct?.heightCm ? String(editingProduct.heightCm) : '75');

  // 6. Malzeme & İskelet Girişi (Material Chunk)
  const [material, setMaterial] = useState(
    editingProduct?.material || 'E1 Kalite Çizilmez Melamin & DKP Çelik Profil'
  );

  // 7. Standart Teknik Donanım (Technical Specs Chunk)
  const [topThickness, setTopThickness] = useState('30 mm');
  const [drawerCount, setDrawerCount] = useState(
    editingProduct?.drawerCount !== undefined ? String(editingProduct.drawerCount) : '3'
  );
  const [assemblyType, setAssemblyType] = useState('Demonte - Kolay Kurulum Şemalı');
  const [warrantyYears, setWarrantyYears] = useState('2 Yıl Fabrika Garantisi');

  // 8. Parçalı Madde İmleri / Dinamik Özellikler (Features Chunk)
  const [features, setFeatures] = useState<string[]>(
    editingProduct?.features && editingProduct.features.length > 0
      ? editingProduct.features
      : [
          'Doğrudan İmalatçı Fabrika Satış Fiyatı',
          'E1 Normlarında Dayanıklı Çizilmez Yüzey',
          '2 Yıl Resmi Üretici Garantisi',
        ]
  );
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // 9. Renkler
  const [colors, setColors] = useState<ProductColorVariant[]>(
    editingProduct?.colors && editingProduct.colors.length > 0
      ? editingProduct.colors
      : [
          { id: 'c-1', name: 'Krem Keten', hex: '#E4DAC6', tag: 'Döşeme' },
          { id: 'c-2', name: 'Antrasit Nubuk', hex: '#2C323B', tag: 'Nubuk' },
          { id: 'c-3', name: 'İtalyan Taba', hex: '#8A4B20', tag: 'Hakiki Deri' },
        ]
  );

  // 10. Açıklama & Rozet
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [badge, setBadge] = useState(editingProduct?.badge || '2026 Standart Seri');

  const [activeFormTab, setActiveFormTab] = useState<'general' | 'specs' | 'features' | 'preview'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize form fields whenever modal opens or editingProduct changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setName(editingProduct.name || '');
        setCategory(
          typeof editingProduct.category === 'object' && editingProduct.category !== null
            ? (editingProduct.category as any).slug || (editingProduct.category as any).id
            : (editingProduct.category as string) || (categories[0]?.slug || '')
        );
        const pImages = Array.isArray(editingProduct.images) ? editingProduct.images : [];
        setImage1(editingProduct.image || pImages[0] || '');
        setImage2(pImages[1] || editingProduct.image2 || '');
        setImage3(pImages[2] || editingProduct.image3 || '');
        setErpItemId(editingProduct.erpItemId ? String(editingProduct.erpItemId) : '');
        setErpItemCode(editingProduct.erpItemCode || '');
        setPrice(editingProduct.price ? String(editingProduct.price) : '');
        setOriginalPrice(editingProduct.originalPrice ? String(editingProduct.originalPrice) : '');
        setInStock(editingProduct.inStock !== false);
        setLeadTimeDays(editingProduct.leadTimeDays !== undefined ? String(editingProduct.leadTimeDays) : '15');
        setVatRate(editingProduct.vatRate !== undefined ? String(editingProduct.vatRate) : '0.20');
        setWidth(editingProduct.widthCm ? String(editingProduct.widthCm) : '220');
        setDepth(editingProduct.depthCm ? String(editingProduct.depthCm) : '95');
        setHeight(editingProduct.heightCm ? String(editingProduct.heightCm) : '75');
        setMaterial(editingProduct.material || 'E1 Kalite Çizilmez Melamin & DKP Çelik Profil');
        setDrawerCount(editingProduct.drawerCount !== undefined ? String(editingProduct.drawerCount) : '3');
        setFeatures(
          editingProduct.features && editingProduct.features.length > 0
            ? editingProduct.features
            : [
                'Doğrudan İmalatçı Fabrika Satış Fiyatı',
                'E1 Normlarında Dayanıklı Çizilmez Yüzey',
                '2 Yıl Resmi Üretici Garantisi',
              ]
        );
        setColors(
          editingProduct.colors && editingProduct.colors.length > 0
            ? editingProduct.colors
            : [
                { id: 'c-1', name: 'Krem Keten', hex: '#E4DAC6', tag: 'Döşeme' },
                { id: 'c-2', name: 'Antrasit Nubuk', hex: '#2C323B', tag: 'Nubuk' },
                { id: 'c-3', name: 'İtalyan Taba', hex: '#8A4B20', tag: 'Hakiki Deri' },
              ]
        );
        setDescription(editingProduct.description || '');
        setBadge(editingProduct.badge || '2026 Standart Seri');
      } else {
        setName('');
        setCategory(categories[0]?.slug || categories[0]?.id || '');
        setImage1('');
        setImage2('');
        setImage3('');
        setErpItemId('');
        setErpItemCode('');
        setPrice('');
        setOriginalPrice('');
        setInStock(true);
        setLeadTimeDays('15');
        setVatRate('0.20');
        setWidth('220');
        setDepth('95');
        setHeight('75');
        setMaterial('E1 Kalite Çizilmez Melamin & DKP Çelik Profil');
        setDrawerCount('3');
        setFeatures([
          'Doğrudan İmalatçı Fabrika Satış Fiyatı',
          'E1 Normlarında Dayanıklı Çizilmez Yüzey',
          '2 Yıl Resmi Üretici Garantisi',
        ]);
        setDescription('');
        setBadge('2026 Standart Seri');
      }
      setActiveFormTab('general');
    }
  }, [isOpen, editingProduct, categories]);

  // LocalStorage Auto-Drafting (ERP Caching Paradigm)
  const DRAFT_KEY = 'ermay_admin_product_form_draft';
  const [hasDraft, setHasDraft] = useState(false);

  React.useEffect(() => {
    if (!editingProduct && typeof window !== 'undefined') {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name && !name) {
            setHasDraft(true);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [editingProduct]);

  React.useEffect(() => {
    if (!editingProduct && name.trim() && typeof window !== 'undefined') {
      const draft = {
        name,
        category,
        price,
        originalPrice,
        width,
        depth,
        height,
        material,
        drawerCount,
        leadTimeDays,
        vatRate,
        features,
        description,
        badge,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [
    editingProduct,
    name,
    category,
    price,
    originalPrice,
    width,
    depth,
    height,
    material,
    drawerCount,
    leadTimeDays,
    vatRate,
    features,
    description,
    badge,
  ]);

  const handleRestoreDraft = () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.name) setName(p.name);
        if (p.category) setCategory(p.category);
        if (p.price) setPrice(p.price);
        if (p.originalPrice) setOriginalPrice(p.originalPrice);
        if (p.width) setWidth(p.width);
        if (p.depth) setDepth(p.depth);
        if (p.height) setHeight(p.height);
        if (p.material) setMaterial(p.material);
        if (p.drawerCount) setDrawerCount(p.drawerCount);
        if (p.leadTimeDays !== undefined) setLeadTimeDays(p.leadTimeDays);
        if (p.vatRate !== undefined && p.vatRate !== null) setVatRate(String(p.vatRate));
        if (p.features) setFeatures(p.features);
        if (p.description) setDescription(p.description);
        if (p.badge) setBadge(p.badge);
        setHasDraft(false);
      } catch {
        // ignore
      }
    }
  };

  const handleClearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_KEY);
    }
    setHasDraft(false);
  };

  const handleUppercaseName = () => {
    if (name) {
      setName(name.toLocaleUpperCase('tr-TR'));
    }
  };

  const numericPrice = parseFloat(price) || 0;
  const numericVat = vatRate !== '' && !isNaN(parseFloat(vatRate)) ? parseFloat(vatRate) : 0.20;
  const netPrice = numericPrice > 0 ? numericPrice / (1 + numericVat) : 0;
  const vatAmount = numericPrice > 0 ? numericPrice - netPrice : 0;

  if (!isOpen) return null;

  // Auto-calculated dimension summary string
  const dimensionsSummary = `G: ${width || '220'}cm × D: ${depth || '95'}cm × Y: ${height || '75'}cm`;

  const handleApplyDimensionPreset = (p: { w: number; d: number; h: number }) => {
    setWidth(String(p.w));
    setDepth(String(p.d));
    setHeight(String(p.h));
  };

  const handleAddFeature = () => {
    const trimmed = customFeatureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setCustomFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleAddPresetFeature = (f: string) => {
    if (!features.includes(f)) {
      setFeatures([...features, f]);
    }
  };

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

      const payload = {
        name: name.trim(),
        category,
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image: image1 || '/default-furniture.webp',
        images: allImages.length > 0 ? allImages : ['/default-furniture.webp'],
        image1: image1 || undefined,
        image2: image2 || undefined,
        image3: image3 || undefined,
        inStock,
        leadTimeDays: parseInt(leadTimeDays, 10) || 15,
        vatRate: vatRate !== '' && !isNaN(parseFloat(vatRate)) ? parseFloat(vatRate) : 0.20,
        erpItemId: erpItemId ? erpItemId : undefined,
        erpItemCode: erpItemCode ? erpItemCode : undefined,
        colors,
        dimensions: dimensionsSummary,
        widthCm: parseInt(width, 10) || 220,
        depthCm: parseInt(depth, 10) || 95,
        heightCm: parseInt(height, 10) || 75,
        drawerCount: parseInt(drawerCount, 10) || 0,
        material: material.trim(),
        features,
        description: description.trim() || undefined,
        badge: badge.trim() || undefined,
      };

      await onSave(payload);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_KEY);
      }
      setHasDraft(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#FAF8F5] px-6 py-3.5 border-b border-[#EAE3D2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C5A880]/20 flex items-center justify-center text-[#8A4B20]">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880] block">
                {editingProduct ? 'Ürün Düzenleme Paneli' : 'Parçalı & Modüler Ürün Formu'}
              </span>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">
                {editingProduct ? editingProduct.name : 'Yeni Ürün Ekle'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Bar (ERP Style Ergonomics) */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFormTab('general')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeFormTab === 'general'
                ? 'border-[#C5A880] text-[#8A4B20] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>1. Genel & Fiyat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('specs')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeFormTab === 'specs'
                ? 'border-[#C5A880] text-[#8A4B20] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>2. Ölçü & Malzeme (Parçalı)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('features')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeFormTab === 'features'
                ? 'border-[#C5A880] text-[#8A4B20] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Donanım & Madde İmleri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('preview')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeFormTab === 'preview'
                ? 'border-[#C5A880] text-[#8A4B20] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>4. Canlı Müşteri Önizlemesi</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          
          {/* DRAFT RESTORATION BANNER */}
          {hasDraft && !editingProduct && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Kaydedilmemiş bir önceki ürün taslağınız bulundu.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md text-[11px] cursor-pointer"
                >
                  Taslağı Yükle
                </button>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="px-2 py-1 text-amber-700 hover:text-amber-900 text-[11px] cursor-pointer"
                >
                  Temizle
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: GENEL BİLGİLER, ERP, RESİMLER & FİYAT */}
          {activeFormTab === 'general' && (
            <div className="space-y-5 animate-fade-in">
              {/* Product Name & Category */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C5A880] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Temel Ürün Bilgileri</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-neutral-600 uppercase">
                        Ürün Adı *
                      </label>
                      <button
                        type="button"
                        onClick={handleUppercaseName}
                        className="text-[10px] text-[#C5A880] hover:text-[#8A4B20] font-bold flex items-center gap-0.5 cursor-pointer"
                        title="Tüm harfleri Türkçe büyük harfe çevir"
                      >
                        <span>[Aa → BÜYÜK HARF]</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Viyana Yönetici Makam Masası"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-[#C5A880] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Kategori *
                    </label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-[#C5A880] bg-white"
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

              {/* ERP Matching */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">ERP</span>
                    <span>ERP Ürün Eşleştirmesi</span>
                  </h4>
                  {erpItemId && (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Eşleşti: {erpItemCode || erpItemId}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="ERP'deki ürün kodunu veya adını arayın..."
                    value={erpSearch}
                    onChange={(e) => {
                      setErpSearch(e.target.value);
                      setShowErpList(true);
                    }}
                    onFocus={() => setShowErpList(true)}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-[#C5A880] bg-white"
                  />
                </div>

                {showErpList && (
                  <div className="border border-neutral-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-neutral-100 bg-white shadow-md">
                    {filteredErp.slice(0, 20).map((erp) => (
                      <div
                        key={erp.erpId}
                        onClick={() => handleSelectErp(erp)}
                        className="p-2 text-xs hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between"
                      >
                        <div className="space-x-2">
                          <span className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded font-bold text-neutral-700">
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

              {/* Images Grid */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C5A880] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Ürün Görselleri (Kapak & Galeri)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Image 1 */}
                  <div className="relative aspect-[4/3] bg-white border-2 border-dashed border-neutral-300 hover:border-[#C5A880] rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors">
                    {image1 ? (
                      <>
                        <img src={image1} alt="Kapak" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImage1('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer">
                        <ImageIcon className="h-6 w-6 text-neutral-400 mb-1" />
                        <span className="text-[11px] font-bold text-neutral-800">Ana Resim Seç</span>
                        <span className="text-[9px] text-neutral-400">{uploadingSlot === 1 ? 'Yükleniyor...' : 'Tıkla ve Yükle'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(1, e)} />
                      </label>
                    )}
                  </div>

                  {/* Image 2 */}
                  <div className="relative aspect-[4/3] bg-white border-2 border-dashed border-neutral-300 hover:border-[#C5A880] rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors">
                    {image2 ? (
                      <>
                        <img src={image2} alt="Görsel 2" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImage2('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer">
                        <ImageIcon className="h-6 w-6 text-neutral-400 mb-1" />
                        <span className="text-[11px] font-bold text-neutral-800">2. Görsel Ekle</span>
                        <span className="text-[9px] text-neutral-400">{uploadingSlot === 2 ? 'Yükleniyor...' : 'Tıkla ve Yükle'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(2, e)} />
                      </label>
                    )}
                  </div>

                  {/* Image 3 */}
                  <div className="relative aspect-[4/3] bg-white border-2 border-dashed border-neutral-300 hover:border-[#C5A880] rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors">
                    {image3 ? (
                      <>
                        <img src={image3} alt="Görsel 3" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImage3('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer">
                        <ImageIcon className="h-6 w-6 text-neutral-400 mb-1" />
                        <span className="text-[11px] font-bold text-neutral-800">3. Görsel Ekle</span>
                        <span className="text-[9px] text-neutral-400">{uploadingSlot === 3 ? 'Yükleniyor...' : 'Tıkla ve Yükle'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(3, e)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Stock Parameters */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C5A880] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Fiyat, KDV ve Stok Koşulları</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Fabrika Net Satış Fiyatı (TL) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Örn: 24500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-sm font-bold text-[#8A4B20] px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Üstü Çizili Liste Fiyatı (TL)
                    </label>
                    <input
                      type="number"
                      placeholder="Örn: 29000"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full text-xs font-medium text-neutral-500 px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Termin / Teslimat Süresi (Gün)
                    </label>
                    <input
                      type="number"
                      placeholder="15"
                      value={leadTimeDays}
                      onChange={(e) => setLeadTimeDays(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* KDV Selection & Dynamic Breakdown */}
                <div className="pt-2 border-t border-neutral-200/60 space-y-2">
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase">
                    KDV Oranı Seçimi
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: '%20 (Standart KDV)', val: '0.20' },
                      { label: '%10 (İndirimli KDV)', val: '0.10' },
                      { label: '%1 (Özel KDV)', val: '0.01' },
                      { label: '%0 (KDV Muaf)', val: '0' },
                    ].map((v) => (
                      <button
                        key={v.val}
                        type="button"
                        onClick={() => setVatRate(v.val)}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          vatRate === v.val
                            ? 'bg-[#C5A880] text-white shadow-xs'
                            : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  {numericPrice > 0 && (
                    <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D2] flex flex-wrap items-center justify-between text-[11px] text-neutral-700 gap-2">
                      <div>
                        <span className="text-neutral-500 block text-[9.5px] uppercase font-bold">KDV Hariç Net:</span>
                        <strong className="font-mono text-neutral-900 text-xs">{Math.round(netPrice).toLocaleString('tr-TR')} TL</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9.5px] uppercase font-bold">KDV Tutarı ({Number(vatRate) * 100}%):</span>
                        <strong className="font-mono text-neutral-900 text-xs">{Math.round(vatAmount).toLocaleString('tr-TR')} TL</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9.5px] uppercase font-bold">KDV Dahil Satış:</span>
                        <strong className="font-mono text-[#8A4B20] text-sm font-black">{Math.round(numericPrice).toLocaleString('tr-TR')} TL</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="stockCheck"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="h-4 w-4 text-[#C5A880] border-neutral-300 rounded"
                  />
                  <label htmlFor="stockCheck" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                    Stokta Var (Katalogda Hemen Teslim Rozeti Göster)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARÇALI ÖLÇÜ & MALZEME GİRİŞİ (CHUNKS 1 & 2) */}
          {activeFormTab === 'specs' && (
            <div className="space-y-5 animate-fade-in">
              {/* CHUNK 1: BOYUT & ÖLÇÜ GİRİŞİ */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#C5A880]" />
                    <span>Ölçü & Ebat Parçaları</span>
                  </h4>
                  <span className="font-mono text-[11px] font-bold text-neutral-700 bg-white px-2.5 py-0.5 rounded border border-neutral-200 shadow-2xs">
                    {dimensionsSummary}
                  </span>
                </div>

                {/* Preset Chips */}
                <div>
                  <span className="text-[10px] text-neutral-400 font-medium block mb-1.5">
                    Hızlı Standart Mobilya Şablonları:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DIMENSION_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleApplyDimensionPreset(p)}
                        className="px-2.5 py-1 bg-white hover:bg-[#FAF8F5] border border-neutral-200 hover:border-[#C5A880] text-neutral-700 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        {p.label} ({p.w}×{p.d}×{p.h})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width, Depth, Height Inputs with Step Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* Width */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Genişlik (cm)
                    </label>
                    <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setWidth(String(Math.max(10, (parseInt(width, 10) || 0) - 10)))}
                        className="px-2.5 py-2 text-neutral-500 hover:bg-neutral-100 font-bold"
                      >
                        -10
                      </button>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="flex-1 text-center font-bold text-neutral-900 py-1.5 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setWidth(String((parseInt(width, 10) || 0) + 10))}
                        className="px-2.5 py-2 text-neutral-500 hover:bg-neutral-100 font-bold"
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  {/* Depth */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Derinlik (cm)
                    </label>
                    <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setDepth(String(Math.max(10, (parseInt(depth, 10) || 0) - 5)))}
                        className="px-2.5 py-2 text-neutral-500 hover:bg-neutral-100 font-bold"
                      >
                        -5
                      </button>
                      <input
                        type="number"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                        className="flex-1 text-center font-bold text-neutral-900 py-1.5 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setDepth(String((parseInt(depth, 10) || 0) + 5))}
                        className="px-2.5 py-2 text-neutral-500 hover:bg-neutral-100 font-bold"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Yükseklik (cm)
                    </label>
                    <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setHeight(String(Math.max(10, (parseInt(height, 10) || 0) - 5)))}
                        className="px-2.5 py-2 text-neutral-500 hover:bg-neutral-100 font-bold"
                      >
                        -5
                      </button>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="flex-1 text-center font-bold text-neutral-900 py-1.5 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setHeight(String((parseInt(height, 10) || 0) + 5))}
                        className="px-2.5 py-2 text-neutral-500 hover:bg-neutral-100 font-bold"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHUNK 2: MALZEME & İSKELET YAPISI */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C5A880]" />
                  <span>Malzeme & İskelet Yapısı</span>
                </h4>

                {/* Preset Material Chips */}
                <div>
                  <span className="text-[10px] text-neutral-400 font-medium block mb-1.5">
                    Hazır Üretim Hammadde Seçicileri (Tıkla ve Uygula):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MATERIAL_PRESETS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMaterial(m)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors border cursor-pointer ${
                          material === m
                            ? 'bg-[#8A4B20] text-white border-[#8A4B20]'
                            : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Malzeme Tanım Metni (Katalogda Görünecek İfade)
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Örn: E1 Melamin Tabla & Masif Gürgen İskelet"
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DONANIM, MADDELER & TEKNİK ÖZELLİKLER (CHUNKS 3 & 4) */}
          {activeFormTab === 'features' && (
            <div className="space-y-5 animate-fade-in">
              {/* CHUNK 3: STANDART TEKNİK DONANIMLAR */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                  <span>Standart Teknik Parametreler</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Tabla Kalınlığı
                    </label>
                    <select
                      value={topThickness}
                      onChange={(e) => setTopThickness(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      <option value="18 mm">18 mm Standart Melamin</option>
                      <option value="30 mm">30 mm Kalınlaştırılmış Tabla</option>
                      <option value="48 mm">48 mm Duble Makam Tablası</option>
                      <option value="54 mm">54 mm Ağır Hizmet Masif Tabla</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Çekmece / Keson Sayısı
                    </label>
                    <select
                      value={drawerCount}
                      onChange={(e) => setDrawerCount(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      <option value="0">0 (Çekmecesiz Ünite)</option>
                      <option value="2">2 Çekmeceli Etejer</option>
                      <option value="3">3 Çekmeceli Merkezi Kilitli Keson</option>
                      <option value="4">4 Çekmeceli Geniş Depolama</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Montaj & Sevk Şekli
                    </label>
                    <select
                      value={assemblyType}
                      onChange={(e) => setAssemblyType(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      <option value="Demonte - Kolay Kurulum Şemalı">Demonte (Numaralı Kolay Kurulum Şemalı)</option>
                      <option value="Fabrika Montajlı Hazır Teslimat">Fabrika Montajlı (Kullanıma Hazır Tek Parça)</option>
                      <option value="İstanbul İçi Personelimizle Montaj">İstanbul İçi Kendi Personelimizle Montaj</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Garanti Koşulları
                    </label>
                    <select
                      value={warrantyYears}
                      onChange={(e) => setWarrantyYears(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      <option value="2 Yıl Fabrika Garantisi">2 Yıl Doğrudan Üretici Garantisi</option>
                      <option value="3 Yıl Fabrika Garantisi">3 Yıl Ağır Hizmet Garantisi</option>
                      <option value="5 Yıl Kurumsal B2B Garantisi">5 Yıl Kurumsal Proje Garantisi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CHUNK 4: DİNAMİK MADDE İMLERİ / SPESİFİKASYON LİSTESİ */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>Dinamik Özellik Maddeleri (Bullet Points)</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {features.length} Madde Tanımlı
                  </span>
                </div>

                {/* Preset feature chips */}
                <div>
                  <span className="text-[10px] text-neutral-400 font-medium block mb-1.5">
                    Hızlı Madde Şablonları (+ Tıkla ve Ekle):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FEATURE_PRESETS.map((fp) => (
                      <button
                        key={fp}
                        type="button"
                        onClick={() => handleAddPresetFeature(fp)}
                        className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-neutral-200 hover:border-emerald-300 rounded text-[10px] text-neutral-600 transition-colors cursor-pointer"
                      >
                        + {fp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Add Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customFeatureInput}
                    onChange={(e) => setCustomFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Örn: Elektrostatik fırın boyalı metal konik ayaklar..."
                    className="flex-1 text-xs px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-neutral-900 hover:bg-[#8A4B20] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Madde Ekle
                  </button>
                </div>

                {/* Current Active Features List */}
                <div className="space-y-1.5 pt-2">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-neutral-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-neutral-800 font-medium">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Maddeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description & Badge */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Koleksiyon / Seri Rozeti
                    </label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Örn: 2026 Standart Seri"
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Detaylı İmalat Açıklaması
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Masif gürgen iskelet, leke tutmaz silinebilir kumaş..."
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CANLI MÜŞTERİ ÖNİZLEMESİ (LIVE PREVIEW) */}
          {activeFormTab === 'preview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                Aşağıdaki kart, girdiğiniz parçalı özelliklerin ürün detay sayfasında ve sipariş teklif fişinde müşteriye nasıl gösterileceğinin canlı simülasyonudur.
              </div>

              {/* Product Spec Card Preview */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
                <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A4B20] bg-[#C5A880]/20 px-2 py-0.5 rounded">
                      {badge || 'Standart Seri'}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 mt-1">
                      {name || 'Ürün Adı Belirtilmedi'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#8A4B20]">
                      {price ? `${Number(price).toLocaleString('tr-TR')} TL` : '0 TL'}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">%20 KDV Dahil Fabrika Satışı</span>
                  </div>
                </div>

                {/* Structured Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Ölçüler</span>
                    <span className="font-semibold text-neutral-800">{dimensionsSummary}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Malzeme</span>
                    <span className="font-semibold text-neutral-800 line-clamp-1">{material}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Tabla / Kalınlık</span>
                    <span className="font-semibold text-neutral-800">{topThickness}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Garanti / Termin</span>
                    <span className="font-semibold text-neutral-800">{warrantyYears} • {leadTimeDays} Gün</span>
                  </div>
                </div>

                {/* Bullet Features */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                    Teknik Özellikler:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-700 bg-neutral-50/70 p-2 rounded-lg border border-neutral-100">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeFormTab !== 'general' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeFormTab === 'specs') setActiveFormTab('general');
                    if (activeFormTab === 'features') setActiveFormTab('specs');
                    if (activeFormTab === 'preview') setActiveFormTab('features');
                  }}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  &larr; Önceki Adım
                </button>
              )}
              {activeFormTab !== 'preview' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeFormTab === 'general') setActiveFormTab('specs');
                    if (activeFormTab === 'specs') setActiveFormTab('features');
                    if (activeFormTab === 'features') setActiveFormTab('preview');
                  }}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Sonraki Adım &rarr;
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                İptal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#8A4B20] hover:bg-[#723c17] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Kaydediliyor...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Sisteme Ekle'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
