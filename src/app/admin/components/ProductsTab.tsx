'use client';

import React, { useState } from 'react';
import { 
  Edit3, Trash2, Plus, Image as ImageIcon, Sparkles, Ruler, 
  Layers, DollarSign, Upload, X, Search, CheckCircle, Eye, 
  Box, CornerDownRight, Check, Star, ShoppingBag, Truck, ShieldCheck, RefreshCw 
} from 'lucide-react';
import type { Product, Category, ProductColorVariant, ProductSetPiece } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { getProductImages } from '../../../lib/productImages';

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
  const [modalTab, setModalTab] = useState<'basic' | 'colors' | 'dimensions' | 'set' | 'details' | 'preview'>('basic');
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    width: '220',
    depth: '95',
    height: '75',
    material: '1. Sınıf Masif Gürgen & İtalyan Döşeme',
    description: '',
    badge: '2026 Özel Koleksiyon',
    image1: '',
    image2: '',
    image3: '',
    inStock: true,
    colors: [
      { id: 'c-1', name: 'İtalyan Taba', hex: '#8A4B20', tag: 'Hakiki Deri' },
      { id: 'c-2', name: 'Antrasit Nubuk', hex: '#2C323B', tag: 'Nubuk' },
      { id: 'c-3', name: 'Krem Keten', hex: '#E4DAC6', tag: 'Doğal Keten' },
    ] as ProductColorVariant[],
    setPieces: [] as ProductSetPiece[],
    features: [
      '%100 Fırınlanmış Masif Gürgen İskelet',
      '35 DNS Yüksek Dayanımlı HR Soft Sünger',
      '5 Yıl Koşulsuz İskelet Garantisi',
      'Özel Ölçü İmalat İmkânı',
    ],
  });

  // Color Variant Input Temporary State
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8A4B20');
  const [newColorTag, setNewColorTag] = useState('Döşeme');

  // Set Piece Input Temporary State
  const [newPieceTitle, setNewPieceTitle] = useState('');
  const [newPieceDims, setNewPieceDims] = useState('');
  const [newPieceProductId, setNewPieceProductId] = useState('');

  // Feature Input Temporary State
  const [newFeatureText, setNewFeatureText] = useState('');

  const openCreateModal = () => {
    setEditingProdId(null);
    setFormData({
      name: '',
      category: categories[0]?.slug || 'koltuk-takimlari',
      price: '',
      originalPrice: '',
      width: '220',
      depth: '95',
      height: '75',
      material: '1. Sınıf Masif Gürgen & İtalyan Döşeme',
      description: '',
      badge: '2026 Özel Koleksiyon',
      image1: '',
      image2: '',
      image3: '',
      inStock: true,
      colors: [
        { id: 'c-1', name: 'İtalyan Taba', hex: '#8A4B20', tag: 'Hakiki Deri' },
        { id: 'c-2', name: 'Antrasit Nubuk', hex: '#2C323B', tag: 'Nubuk' },
        { id: 'c-3', name: 'Krem Keten', hex: '#E4DAC6', tag: 'Doğal Keten' },
      ],
      setPieces: [],
      features: [
        '%100 Fırınlanmış Masif Gürgen İskelet',
        '35 DNS Yüksek Dayanımlı HR Soft Sünger',
        '5 Yıl Koşulsuz İskelet Garantisi',
        'Özel Ölçü İmalat İmkânı',
      ],
    });
    setModalTab('basic');
    setIsModalOpen(true);
  };

  const handleEditClick = (p: Product) => {
    setEditingProdId(p.id);
    const imgs = getProductImages(p);
    
    // Parse dimensions if possible
    let w = '220', d = '95', h = '75';
    if (p.dimensionSpec) {
      w = String(p.dimensionSpec.width || '220');
      d = String(p.dimensionSpec.depth || '95');
      h = String(p.dimensionSpec.height || '75');
    }

    setFormData({
      name: p.name,
      category: typeof p.category === 'object' && p.category !== null ? (p.category as { slug?: string }).slug || '' : String(p.category || ''),
      price: String(p.price || ''),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      width: w,
      depth: d,
      height: h,
      material: p.material || '1. Sınıf Masif Gürgen & İtalyan Döşeme',
      description: p.description || '',
      badge: p.badge || '',
      image1: imgs[0] || '',
      image2: imgs[1] || '',
      image3: imgs[2] || '',
      inStock: p.inStock !== false,
      colors: p.colors && p.colors.length > 0 ? p.colors : [
        { id: 'c-1', name: 'İtalyan Taba', hex: '#8A4B20', tag: 'Hakiki Deri' },
        { id: 'c-2', name: 'Antrasit Nubuk', hex: '#2C323B', tag: 'Nubuk' },
      ],
      setPieces: p.setPieces || [],
      features: p.features && p.features.length > 0 ? p.features : [
        '%100 Fırınlanmış Masif Gürgen İskelet',
        '35 DNS Yüksek Dayanımlı HR Soft Sünger',
        '5 Yıl Koşulsuz İskelet Garantisi',
      ],
    });
    setModalTab('basic');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (slot: 1 | 2 | 3, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingSlot(slot);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        if (slot === 1) setFormData((prev) => ({ ...prev, image1: url }));
        if (slot === 2) setFormData((prev) => ({ ...prev, image2: url }));
        if (slot === 3) setFormData((prev) => ({ ...prev, image3: url }));
        onShowSuccess(`Görsel ${slot} başarıyla yüklendi!`);
      } catch (err) {
        console.error('Yükleme hatası:', err);
      } finally {
        setUploadingSlot(null);
      }
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const newCol: ProductColorVariant = {
      id: `col-${Date.now()}`,
      name: newColorName.trim(),
      hex: newColorHex,
      color: newColorHex,
      tag: newColorTag.trim() || 'Döşeme',
    };
    setFormData((prev) => ({ ...prev, colors: [...prev.colors, newCol] }));
    setNewColorName('');
  };

  const handleRemoveColor = (idx: number) => {
    setFormData((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }));
  };

  const handleAddPiece = () => {
    if (!newPieceTitle.trim()) return;
    const pieceProduct = products.find(p => p.id === newPieceProductId || p.slug === newPieceProductId);
    const newPiece: ProductSetPiece = {
      id: `piece-${Date.now()}`,
      title: newPieceTitle.trim(),
      dimensions: newPieceDims.trim() || undefined,
      pieceProductId: newPieceProductId || undefined,
      pieceProductName: pieceProduct ? pieceProduct.name : undefined,
    };
    setFormData((prev) => ({ ...prev, setPieces: [...prev.setPieces, newPiece] }));
    setNewPieceTitle('');
    setNewPieceDims('');
    setNewPieceProductId('');
  };

  const handleRemovePiece = (idx: number) => {
    setFormData((prev) => ({ ...prev, setPieces: prev.setPieces.filter((_, i) => i !== idx) }));
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData((prev) => ({ ...prev, features: [...prev.features, newFeatureText.trim()] }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Lütfen en azından Ürün Adı ve Fiyat alanlarını doldurun.');
      return;
    }

    const mainImg = formData.image1 || formData.image2 || formData.image3 || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000';
    const imagesArray = [
      formData.image1 || mainImg,
      formData.image2 || formData.image1 || mainImg,
      formData.image3 || formData.image2 || mainImg,
    ];

    const categoryVal = formData.category || (categories[0]?.slug || 'koltuk-takimlari');
    const constructedDims = `G: ${formData.width || '220'}cm × D: ${formData.depth || '95'}cm × Y: ${formData.height || '75'}cm`;

    const productPayload: Product = {
      id: editingProdId || `prod-${Date.now()}`,
      name: formData.name.trim(),
      category: categoryVal,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      image: mainImg,
      image1: imagesArray[0],
      image2: imagesArray[1],
      image3: imagesArray[2],
      images: imagesArray,
      description: formData.description.trim() || 'Ermay Mobilya kendi atölyelerinde imal edilen özel tasarım parçası.',
      material: formData.material.trim() || '1. Sınıf Masif Gürgen & İtalyan Döşeme',
      dimensions: constructedDims,
      dimensionSpec: {
        width: Number(formData.width) || 220,
        depth: Number(formData.depth) || 95,
        height: Number(formData.height) || 75,
        raw: constructedDims,
      },
      colors: formData.colors,
      setPieces: formData.setPieces,
      features: formData.features,
      inStock: formData.inStock,
      badge: formData.badge.trim() || undefined,
      rating: 5.0,
      reviewsCount: 1,
      salesCount: 1,
    };

    if (editingProdId) {
      onUpdateProduct(editingProdId, productPayload);
      onShowSuccess(`"${productPayload.name}" ürünü başarıyla güncellendi!`);
    } else {
      onAddProduct(productPayload);
      onShowSuccess(`"${productPayload.name}" başarıyla kataloğa eklendi!`);
    }

    setIsModalOpen(false);
    setEditingProdId(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.description.toLowerCase().includes(searchFilter.toLowerCase());
    const pCatSlug = typeof p.category === 'object' && p.category !== null ? (p.category as { slug?: string }).slug : String(p.category || '');
    const matchesCategory = selectedCategoryFilter === 'all' || pCatSlug === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
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
      <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block mb-1">
            İmalat & Envanter Yönetimi
          </span>
          <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
            Ürün Kataloğu ({products.length} Ürün)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Ürün Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Ürün adı veya açıklama ile ara..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none bg-neutral-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Kategori:</label>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs border border-neutral-300 py-2 px-3 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none bg-white min-w-[160px]"
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
      <div className="bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-neutral-200 text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Görsel</th>
                <th className="py-3.5 px-4">Ürün Adı</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Ölçüler</th>
                <th className="py-3.5 px-4">Renkler</th>
                <th className="py-3.5 px-4">Fiyat</th>
                <th className="py-3.5 px-4">Stok</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-neutral-400 italic">
                    Arama kriterine uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const imgs = getProductImages(p);
                  const pCatName = typeof p.category === 'object' && p.category !== null ? (p.category as { name?: string }).name : String(p.category || '');
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={imgs[0]}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xs border border-neutral-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-neutral-900 block">{p.name}</span>
                        {p.badge && (
                          <span className="inline-block text-[9px] bg-[#C5A880]/15 text-[#8A4B20] font-bold px-1.5 py-0.5 rounded-xs mt-0.5">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-medium">
                        {pCatName || p.category_id || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">
                        {p.dimensions || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {(p.colors || []).slice(0, 3).map((col, cIdx) => (
                            <div
                              key={cIdx}
                              title={col.name}
                              style={{ backgroundColor: col.hex || col.color || '#8A4B20' }}
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                            />
                          ))}
                          {(p.colors || []).length > 3 && (
                            <span className="text-[9px] text-neutral-400 font-bold">+{p.colors!.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        {formatPrice(p.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                          p.inStock !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {p.inStock !== false ? 'Stokta' : 'Tükendi'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-neutral-600 hover:text-[#C5A880] hover:bg-neutral-100 rounded-xs transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${p.name}" ürününü silmek istediğinize emin misiniz?`)) {
                              onDeleteProduct(p.id);
                              onShowSuccess(`"${p.name}" silindi.`);
                            }
                          }}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADVANCED MULTI-STEP PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-sm shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880] block">
                  {editingProdId ? 'Ürün Revizyonu' : 'Yeni İmalat Ekleme'}
                </span>
                <h3 className="text-base font-bold text-neutral-900 uppercase">
                  {editingProdId ? `Düzenle: ${formData.name || 'Ürün'}` : 'Yeni Mobilya Ürünü Tanımla'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-200/60 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-neutral-200 bg-white px-6 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer ${
                  modalTab === 'basic' ? 'border-[#C5A880] text-[#8A4B20]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                1. Temel Bilgiler
              </button>
              <button
                type="button"
                onClick={() => setModalTab('colors')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer ${
                  modalTab === 'colors' ? 'border-[#C5A880] text-[#8A4B20]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                2. Renkler & Görseller ({formData.colors.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('dimensions')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer ${
                  modalTab === 'dimensions' ? 'border-[#C5A880] text-[#8A4B20]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                3. Sayısal Ölçüler
              </button>
              <button
                type="button"
                onClick={() => setModalTab('set')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer ${
                  modalTab === 'set' ? 'border-[#C5A880] text-[#8A4B20]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                4. Takım Parçaları ({formData.setPieces.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('details')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer ${
                  modalTab === 'details' ? 'border-[#C5A880] text-[#8A4B20]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                5. Açıklama & Malzeme
              </button>
              <button
                type="button"
                onClick={() => setModalTab('preview')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'preview' ? 'border-[#C5A880] text-[#8A4B20]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Canlı Önizleme</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: TEMEL BİLGİLER */}
              {modalTab === 'basic' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Ürün Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Örn: Trend Yönetici Çalışma Masası"
                        className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Kategori *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Satış Fiyatı (TL) *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="49900"
                        className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        İndirimsiz / Liste Fiyatı (TL)
                      </label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="59900"
                        className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Koleksiyon Rozeti / Etiketi
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="Örn: 2026 Özel Seri"
                        className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="h-4 w-4 text-[#C5A880] rounded-xs border-neutral-300 focus:ring-[#C5A880]"
                      />
                      <span className="text-xs font-bold text-neutral-800">Ürün Stokta / İmalata Açık</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: RENKLER & GÖRSELLER */}
              {modalTab === 'colors' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Image Upload Slots */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
                      Ürün Galeri Görselleri (3 Açı)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[1, 2, 3].map((slot) => {
                        const imgUrl = slot === 1 ? formData.image1 : slot === 2 ? formData.image2 : formData.image3;
                        return (
                          <div key={slot} className="border border-neutral-200 p-3 rounded-xs bg-[#FAF8F5] space-y-2">
                            <span className="text-[10px] font-bold uppercase text-neutral-500 block">
                              Görsel {slot} {slot === 1 && '(Kapak)'}
                            </span>
                            <div className="aspect-[4/3] bg-neutral-200 rounded-xs overflow-hidden relative">
                              {imgUrl ? (
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                                  Görsel Yok
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(slot as 1 | 2 | 3, e)}
                              className="text-[10px] w-full"
                            />
                            <input
                              type="text"
                              placeholder="Veya URL yapıştırın"
                              value={imgUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (slot === 1) setFormData({ ...formData, image1: val });
                                if (slot === 2) setFormData({ ...formData, image2: val });
                                if (slot === 3) setFormData({ ...formData, image3: val });
                              }}
                              className="w-full text-[10px] border border-neutral-300 p-1.5 rounded-xs bg-white"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Swatches Management */}
                  <div className="pt-4 border-t border-neutral-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Döşeme & Renk Varyasyonları
                    </h4>
                    
                    <div className="flex flex-wrap gap-3">
                      {formData.colors.map((col, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#FAF8F5] border border-neutral-300 px-3 py-1.5 rounded-xs">
                          <div style={{ backgroundColor: col.hex || col.color }} className="w-4 h-4 rounded-full border border-black/20" />
                          <span className="text-xs font-bold text-neutral-800">{col.name}</span>
                          <span className="text-[10px] text-neutral-500">({col.tag || 'Döşeme'})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="text-neutral-400 hover:text-rose-600 ml-1 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Color Form */}
                    <div className="p-3 bg-neutral-50 rounded-xs border border-neutral-200 flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        placeholder="Renk Adı (Örn: İtalyan Taba Deri)"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="w-full sm:w-1/3 text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-[10px] font-bold text-neutral-500">Renk:</label>
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="h-8 w-10 border border-neutral-300 rounded-xs cursor-pointer p-0.5 bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Kumaş Türü (Örn: Hakiki Deri, Nubuk)"
                        value={newColorTag}
                        onChange={(e) => setNewColorTag(e.target.value)}
                        className="w-full sm:w-1/3 text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="w-full sm:w-auto bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold px-4 py-2 rounded-xs transition-colors whitespace-nowrap cursor-pointer"
                      >
                        + Renk Ekle
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: SAYISAL ÖLÇÜLER */}
              {modalTab === 'dimensions' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D2] rounded-xs">
                    <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider block mb-1">
                      Yapılandırılmış Standart Ölçüler
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Lütfen ürünün ana ölçülerini santimetre (cm) cinsinden sayısal olarak girin. Sistem ölçü tablosunu otomatik oluşturacaktır.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-neutral-800 block">
                        Genişlik (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        placeholder="220"
                        className="w-full text-sm font-mono font-bold border border-neutral-300 p-3 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-400">Ön cephe genişliği (G)</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-neutral-800 block">
                        Derinlik (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.depth}
                        onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                        placeholder="95"
                        className="w-full text-sm font-mono font-bold border border-neutral-300 p-3 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-400">Yan derinlik (D)</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-neutral-800 block">
                        Yükseklik (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        placeholder="75"
                        className="w-full text-sm font-mono font-bold border border-neutral-300 p-3 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-400">Yerden toplam yükseklik (Y)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-100 rounded-xs text-xs flex items-center justify-between">
                    <span className="font-semibold text-neutral-700">Oluşturulan Ölçü İbaresi:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      G: {formData.width || '220'}cm × D: {formData.depth || '95'}cm × Y: {formData.height || '75'}cm
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: TAKIM PARÇALARI */}
              {modalTab === 'set' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D2] rounded-xs">
                    <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider block mb-1">
                      Takımı Oluşturan Parçalar & Ayrı Satış Bağlantısı
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Eğer bu ürün bir takım ise (Masa, Sehpa, Etejer, Dolap vb.), takımı oluşturan parçaları ekleyin. Eğer bir parça mağazada tek başına da satılıyorsa, açılır menüden ilgili ürünü seçerek müşteriyi doğrudan o parçaya yönlendirebilirsiniz.
                    </p>
                  </div>

                  {/* List of Set Pieces */}
                  <div className="space-y-2">
                    {formData.setPieces.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-3 text-center border border-dashed border-neutral-300 rounded-xs">
                        Henüz takım parçası eklenmedi. (Tekli ürün ise boş bırakabilirsiniz)
                      </p>
                    ) : (
                      formData.setPieces.map((piece, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xs text-xs">
                          <div className="flex items-center gap-2">
                            <Box className="h-4 w-4 text-[#C5A880]" />
                            <span className="font-bold text-neutral-900">{piece.title}</span>
                            {piece.dimensions && (
                              <span className="text-neutral-500 font-mono text-[11px]">({piece.dimensions})</span>
                            )}
                            {piece.pieceProductName && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-xs">
                                Bağlı Ürün: {piece.pieceProductName}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePiece(idx)}
                            className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Set Piece Form */}
                  <div className="p-4 bg-neutral-50 rounded-xs border border-neutral-200 space-y-3">
                    <h5 className="text-xs font-bold uppercase text-neutral-800">Yeni Parça Ekle</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Parça Adı (Örn: Trend Sehpa)"
                        value={newPieceTitle}
                        onChange={(e) => setNewPieceTitle(e.target.value)}
                        className="text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Ölçü (Örn: 80x50x45 cm)"
                        value={newPieceDims}
                        onChange={(e) => setNewPieceDims(e.target.value)}
                        className="text-xs border border-neutral-300 p-2 rounded-xs bg-white font-mono"
                      />
                      <select
                        value={newPieceProductId}
                        onChange={(e) => setNewPieceProductId(e.target.value)}
                        className="text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                      >
                        <option value="">Ayrı Satılıyorsa Ürün Seç (Opsiyonel)</option>
                        {products.filter(p => p.id !== editingProdId).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPiece}
                      className="bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold px-4 py-2 rounded-xs transition-colors cursor-pointer"
                    >
                      + Takım Parçasını Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: AÇIKLAMA & MALZEME */}
              {modalTab === 'details' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Malzeme ve İskelet Yapısı
                    </label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="Örn: 1. Sınıf Fırınlanmış Gürgen & İtalyan Deri"
                      className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Detaylı Ürün Açıklaması
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ürünün zanaat detayları, konfor özellikleri ve tasarım felsefesi hakkında bilgi verin..."
                      className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                    />
                  </div>

                  {/* Features Checklist */}
                  <div className="pt-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                      Öne Çıkan Özellik Maddeleri
                    </label>
                    <div className="space-y-1.5">
                      {formData.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white border border-neutral-200 rounded-xs text-xs">
                          <span className="text-neutral-800">{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Yeni özellik maddesi yazın..."
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        className="flex-1 text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold px-4 py-2 rounded-xs transition-colors whitespace-nowrap cursor-pointer"
                      >
                        + Madde Ekle
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CANLI ÖNİZLEME */}
              {modalTab === 'preview' && (
                <div className="space-y-6 animate-fade-in bg-[#FCFAF6] p-6 rounded-xs border border-[#EAE3D2]">
                  <div className="flex items-center gap-2 border-b border-[#EAE3D2] pb-3">
                    <Eye className="h-4 w-4 text-[#C5A880]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Sitede Nasıl Görünecek? (Canlı Simülasyon)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xs border border-neutral-200 shadow-xs">
                    {/* Preview Image */}
                    <div className="space-y-2">
                      <div className="aspect-[4/3] bg-neutral-100 rounded-xs overflow-hidden relative">
                        <img
                          src={formData.image1 || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-[#FAF8F5] text-neutral-900 font-bold text-[9px] uppercase px-2 py-0.5 rounded-xs border border-[#C5A880]/40">
                          {formData.badge || 'Özel İmalat'}
                        </span>
                      </div>
                    </div>

                    {/* Preview Info */}
                    <div className="space-y-3 text-xs">
                      <span className="text-[9px] font-bold text-[#C5A880] uppercase tracking-widest block">
                        ERMAY MOBİLYA
                      </span>
                      <h3 className="font-serif text-lg font-bold text-neutral-900">
                        {formData.name || 'Örnek Ürün Adı'}
                      </h3>
                      <div className="text-base font-bold text-neutral-900 font-mono">
                        {formatPrice(Number(formData.price) || 0)}
                      </div>
                      <p className="text-neutral-600 text-[11px] leading-relaxed line-clamp-2">
                        {formData.description || 'Ürün açıklaması henüz girilmedi.'}
                      </p>

                      <div className="p-2 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2] text-[10px] font-mono">
                        G: {formData.width || '220'}cm × D: {formData.depth || '95'}cm × Y: {formData.height || '75'}cm
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        {formData.colors.map((c, i) => (
                          <div key={i} style={{ backgroundColor: c.hex }} className="w-3.5 h-3.5 rounded-full border border-black/20" title={c.name} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 py-2.5 px-4 rounded-xs cursor-pointer"
                >
                  Vazgeç
                </button>

                <div className="flex items-center gap-3">
                  {modalTab !== 'preview' ? (
                    <button
                      type="button"
                      onClick={() => setModalTab('preview')}
                      className="text-xs font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#8A4B20] py-2.5 px-4 rounded-xs cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Önizle</span>
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    className="bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-xs transition-colors cursor-pointer shadow-xs"
                  >
                    {editingProdId ? 'Değişiklikleri Güncelle' : 'Ürünü Kaydet & Kataloğa Ekle'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsTab;
