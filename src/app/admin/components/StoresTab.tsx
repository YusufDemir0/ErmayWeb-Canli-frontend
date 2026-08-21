'use client';

import React, { useState } from 'react';
import { 
  MapPin, Plus, Edit3, Trash2, Phone, Mail, Clock, 
  Upload, X, CheckCircle, ExternalLink, Building2, Search 
} from 'lucide-react';
import { useCMSStore } from '../../../stores/useCMSStore';
import type { StoreItem } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';

interface StoresTabProps {
  onShowSuccess: (msg: string) => void;
}

export const StoresTab: React.FC<StoresTabProps> = ({ onShowSuccess }) => {
  const { stores, addStore, updateStore, deleteStore } = useCMSStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    hours: 'Hafta İçi & Cmt: 09:00 - 20:00 | Pazar: 11:00 - 19:00',
    image: '',
    mapUrl: '',
    isActive: true,
  });

  const openCreateModal = () => {
    setEditingStoreId(null);
    setFormData({
      name: '',
      city: '',
      district: '',
      address: '',
      phone: '0532 419 41 51',
      email: 'info@ermaymobilya.com',
      hours: 'Hafta İçi & Cmt: 09:00 - 20:00 | Pazar: 11:00 - 19:00',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
      mapUrl: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (store: StoreItem) => {
    setEditingStoreId(store.id);
    setFormData({
      name: store.name,
      city: store.city,
      district: store.district || '',
      address: store.address,
      phone: store.phone,
      email: store.email || '',
      hours: store.hours || 'Hafta İçi & Cmt: 09:00 - 20:00 | Pazar: 11:00 - 19:00',
      image: store.image || '',
      mapUrl: store.mapUrl || '',
      isActive: store.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        setFormData((prev) => ({ ...prev, image: url }));
        onShowSuccess('Mağaza görseli başarıyla yüklendi!');
      } catch (err) {
        console.error('Yükleme hatası:', err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim() || !formData.address.trim() || !formData.phone.trim()) {
      alert('Lütfen Mağaza Adı, İl, Açık Adres ve Telefon alanlarını doldurun.');
      return;
    }

    const payload: StoreItem = {
      id: editingStoreId || `store-${Date.now()}`,
      name: formData.name.trim(),
      city: formData.city.trim(),
      district: formData.district.trim() || undefined,
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      hours: formData.hours.trim() || undefined,
      image: formData.image.trim() || undefined,
      mapUrl: formData.mapUrl.trim() || undefined,
      isActive: formData.isActive,
    };

    if (editingStoreId) {
      updateStore(editingStoreId, payload);
      onShowSuccess(`"${payload.name}" mağazası güncellendi.`);
    } else {
      addStore(payload);
      onShowSuccess(`"${payload.name}" mağazası sisteme eklendi.`);
    }

    setIsModalOpen(false);
    setEditingStoreId(null);
  };

  const filteredStores = stores.filter((s) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      (s.district && s.district.toLowerCase().includes(q)) ||
      s.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Header Strip */}
      <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block mb-1">
            Lokasyon & Satış Ağları
          </span>
          <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
            Fabrika Satış Mağazaları & Bayiler ({stores.length} Nokta)
          </h2>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xs transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Mağaza / Bayi Ekle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="İl, ilçe veya mağaza adı ile ara..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none bg-neutral-50/50"
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-dashed border-neutral-300 rounded-sm text-neutral-400 italic text-xs">
            Arama kriterine uygun mağaza / bayi bulunamadı.
          </div>
        ) : (
          filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#C5A880]/50 transition-colors"
            >
              <div>
                {/* Store Image */}
                <div className="aspect-[16/9] bg-neutral-100 relative overflow-hidden">
                  <img
                    src={store.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-[#FAF8F5] text-neutral-900 font-bold text-[9px] uppercase px-2.5 py-1 rounded-xs border border-[#EAE3D2] shadow-2xs">
                    {store.city} {store.district ? `/ ${store.district}` : ''}
                  </span>
                  <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-xs ${
                    store.isActive !== false ? 'bg-emerald-600 text-white' : 'bg-neutral-500 text-white'
                  }`}>
                    {store.isActive !== false ? 'Açık' : 'Pasif'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-neutral-900">
                    {store.name}
                  </h3>

                  <div className="space-y-2 text-xs text-neutral-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#C5A880] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{store.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#C5A880] flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="hover:text-neutral-900 font-mono font-medium">
                        {store.phone}
                      </a>
                    </div>

                    {store.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[#C5A880] flex-shrink-0" />
                        <span className="font-light truncate">{store.email}</span>
                      </div>
                    )}

                    {store.hours && (
                      <div className="flex items-start gap-2 pt-1 border-t border-neutral-100 text-[11px] text-neutral-500">
                        <Clock className="h-3.5 w-3.5 text-[#C5A880] flex-shrink-0 mt-0.5" />
                        <span>{store.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 border-t border-neutral-100 flex items-center justify-between gap-2 mt-3">
                {store.mapUrl ? (
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C5A880] hover:text-[#8A4B20]"
                  >
                    <span>Haritada Gör</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : <span />}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(store)}
                    className="p-1.5 text-neutral-600 hover:text-[#C5A880] hover:bg-neutral-100 rounded-xs transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${store.name}" mağazasını silmek istediğinize emin misiniz?`)) {
                        deleteStore(store.id);
                        onShowSuccess(`"${store.name}" silindi.`);
                      }
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT STORE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880] block">
                  {editingStoreId ? 'Mağaza Revizyonu' : 'Yeni Bayi Kaydı'}
                </span>
                <h3 className="text-base font-bold text-neutral-900 uppercase">
                  {editingStoreId ? `Düzenle: ${formData.name}` : 'Yeni Satış Noktası / Bayi Ekle'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-200/60 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Mağaza / Bayi Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Modoko Fabrika Satış Mağazası"
                    className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    İl *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Örn: İstanbul"
                    className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    İlçe
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Örn: Ümraniye"
                    className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Telefon Numarası *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0532 419 41 51"
                    className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Açık Adres *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Modoko Mobilyacılar Sitesi 1. Cadde No: 42..."
                  className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="modoko@ermaymobilya.com"
                    className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Çalışma Saatleri
                  </label>
                  <input
                    type="text"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="09:00 - 20:00"
                    className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>

              {/* Image & Map URL */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Mağaza Cephe Görseli (Dosya Yükle veya URL)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-[10px] flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Veya görsel URL yapıştırın"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 text-xs border border-neutral-300 p-2 rounded-xs"
                    />
                  </div>
                  {uploading && <span className="text-[10px] text-[#C5A880]">Görsel yükleniyor...</span>}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Google Harita / Navigasyon Linki (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-[#C5A880] rounded-xs border-neutral-300 focus:ring-[#C5A880]"
                    />
                    <span className="text-xs font-bold text-neutral-800">Mağaza Aktif ve Müşteri Ziyaretine Açık</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 py-2.5 px-4 rounded-xs cursor-pointer"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  {editingStoreId ? 'Değişiklikleri Güncelle' : 'Mağazayı Kaydet'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default StoresTab;
