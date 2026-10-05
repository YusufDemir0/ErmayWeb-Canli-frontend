'use client';

import React, { useState } from 'react';
import { 
  MapPin, Plus, Edit3, Trash2, Phone, Mail, Clock, 
  Upload, X, CheckCircle, ExternalLink, Building2, Search 
} from 'lucide-react';
import { useCMSStore } from '../../../stores/useCMSStore';
import type { StoreItem } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { toast } from '../../../stores/useToastStore';
import { TURKEY_CITIES, getDistrictsByCityName } from '../../../lib/turkeyData';

interface StoresTabProps {
  onShowSuccess: (msg: string) => void;
}

export const StoresTab: React.FC<StoresTabProps> = ({ onShowSuccess }) => {
  const { stores, addStore, updateStore, deleteStore } = useCMSStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [legacyDistrict, setLegacyDistrict] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
    image: '',
    mapUrl: '',
    isActive: true,
  });

  const openCreateModal = () => {
    setEditingStoreId(null);
    setLegacyDistrict(null);
    setFormData({
      name: '',
      city: '',
      district: '',
      address: '',
      phone: '',
      email: '',
      hours: '',
      image: '',
      mapUrl: '',
      isActive: true,
    });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (store: StoreItem) => {
    setEditingStoreId(store.id);
    // Resmî ilçe listesinde olmayan eski serbest metin seçenek yapılmaz: alan boşaltılır, admin listeden seçer
    const validDistrict = store.district && getDistrictsByCityName(store.city).includes(store.district) ? store.district : '';
    setLegacyDistrict(store.district && !validDistrict ? store.district : null);
    setFormData({
      name: store.name,
      city: store.city,
      district: validDistrict,
      address: store.address,
      phone: store.phone,
      email: store.email || '',
      hours: store.hours || '',
      image: store.image || '',
      mapUrl: store.mapUrl || '',
      isActive: store.isActive !== false,
    });
    setSaveError(null);
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
        console.error('Görsel yükleme hatası:', err);
        toast.error('Yükleme Hatası', err instanceof Error ? err.message : 'Görsel yüklenemedi.');
      } finally {
        setUploading(false);
      }
    }
  };

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!formData.name.trim() || !formData.city.trim() || !formData.address.trim() || !formData.phone.trim()) {
      setSaveError('Mağaza adı, il, açık adres ve telefon zorunludur.');
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

    // Sunucu onaylamadan "kaydedildi" denmez; hata formda gösterilir, form açık kalır
    setIsSaving(true);
    try {
      if (editingStoreId) {
        await updateStore(editingStoreId, payload);
        onShowSuccess(`"${payload.name}" mağazası güncellendi.`);
      } else {
        await addStore(payload);
        onShowSuccess(`"${payload.name}" mağazası eklendi.`);
      }
      setIsModalOpen(false);
      setEditingStoreId(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Mağaza kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const sortedCities = React.useMemo(
    () => [...TURKEY_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'tr')),
    []
  );
  const districtOptions = React.useMemo(
    () => (formData.city ? getDistrictsByCityName(formData.city) : []),
    [formData.city]
  );

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
      <div className="bg-white p-6 rounded-xs border border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-wood block mb-1">
            Lokasyon & Satış Ağları
          </span>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Fabrika Satış Mağazaları & Bayiler ({stores.length} Nokta)
          </h2>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold py-3 px-6 rounded-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Mağaza / Bayi Ekle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xs border border-line">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="İl, ilçe veya mağaza adı ile ara..."
            value={searchFilter} maxLength={100}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-paper/50"
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-dashed border-line-strong rounded-xs text-neutral-500 italic text-xs">
            Arama kriterine uygun mağaza / bayi bulunamadı.
          </div>
        ) : (
          filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xs border border-line overflow-hidden flex flex-col justify-between hover:border-wood/50 transition-colors"
            >
              <div>
                {/* Store Image */}
                <div className="aspect-[16/9] bg-neutral-100 relative overflow-hidden">
                  {store.image ? (
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-500">
                      <Building2 className="h-8 w-8 text-neutral-300 mb-1" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Görsel Yok</span>
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-paper text-neutral-900 font-semibold text-sm px-2.5 py-1 rounded-xs border border-line">
                    {store.city} {store.district ? `/ ${store.district}` : ''}
                  </span>
                  <span className={`absolute top-2.5 right-2.5 text-sm font-semibold px-2 py-0.5 rounded-xs ${
                    store.isActive !== false ? 'bg-whatsapp text-white' : 'bg-neutral-500 text-white'
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
                      <MapPin className="h-3.5 w-3.5 text-wood flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{store.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-wood flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="hover:text-neutral-900 font-mono font-medium">
                        {store.phone}
                      </a>
                    </div>

                    {store.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-wood flex-shrink-0" />
                        <span className="truncate">{store.email}</span>
                      </div>
                    )}

                    {store.hours && (
                      <div className="flex items-start gap-2 pt-1 border-t border-line text-xs text-neutral-500">
                        <Clock className="h-3.5 w-3.5 text-wood flex-shrink-0 mt-0.5" />
                        <span>{store.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 border-t border-line flex items-center justify-between gap-2 mt-3">
                {store.mapUrl ? (
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-wood hover:text-wood-dark"
                  >
                    <span>Haritada Gör</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : <span />}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(store)}
                    className="p-1.5 text-neutral-600 hover:text-wood hover:bg-neutral-100 rounded-xs transition-colors cursor-pointer"
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
                    className="p-1.5 text-neutral-500 hover:text-signal hover:bg-signal/5 rounded-xs transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-xs shadow-2xl overflow-hidden border border-line flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-paper px-6 py-4 border-b border-line flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-wood block">
                  {editingStoreId ? 'Mağaza Revizyonu' : 'Yeni Bayi Kaydı'}
                </span>
                <h3 className="text-base font-semibold text-neutral-900">
                  {editingStoreId ? `Düzenle: ${formData.name}` : 'Yeni Satış Noktası / Bayi Ekle'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-200/60 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">
                    Mağaza / Bayi Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name} maxLength={120}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Modoko Fabrika Satış Mağazası"
                    className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">
                    İl *
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '' })}
                    className="w-full text-sm border border-line-strong h-10 px-2.5 rounded-xs focus:ring-2 focus:ring-wood/30 focus:outline-none bg-white"
                  >
                    <option value="" disabled>İl seçin</option>
                    {sortedCities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">
                    İlçe
                  </label>
                  <select
                    value={formData.district}
                    disabled={!formData.city}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full text-sm border border-line-strong h-10 px-2.5 rounded-xs focus:ring-2 focus:ring-wood/30 focus:outline-none bg-white disabled:bg-paper"
                  >
                    <option value="">{formData.city ? 'İlçe seçin (isteğe bağlı)' : 'Önce il seçin'}</option>
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {legacyDistrict && !formData.district && (
                    <p className="mt-1 text-xs text-signal">
                      Kayıtlı değer &quot;{legacyDistrict}&quot; bir ilçe adı değil. Listeden ilçeyi seçin.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">
                    Telefon Numarası *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone} maxLength={25}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0532 419 41 51"
                    className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">
                  Açık Adres *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address} maxLength={300}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Modoko Mobilyacılar Sitesi 1. Cadde No: 42..."
                  className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">
                    E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    value={formData.email} maxLength={150}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="modoko@ermaymobilya.com"
                    className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">
                    Çalışma Saatleri
                  </label>
                  <input
                    type="text"
                    value={formData.hours} maxLength={200}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="Örn: Pzt–Cmt 09:00–19:30, Pazar 11:00–18:30"
                    className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none"
                  />
                </div>
              </div>

              {/* Image & Map URL */}
              <div className="space-y-3 pt-2 border-t border-line">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">
                    Mağaza Cephe Görseli (Dosya Yükle veya URL)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Veya görsel URL yapıştırın"
                      value={formData.image} maxLength={500}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 text-xs border border-line-strong p-2 rounded-xs"
                    />
                  </div>
                  {uploading && <span className="text-xs text-wood">Görsel yükleniyor...</span>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">
                    Google Harita / Navigasyon Linki (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={formData.mapUrl} maxLength={1000}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    className="w-full text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-wood rounded-xs border-line-strong focus:ring-wood"
                    />
                    <span className="text-xs font-bold text-neutral-800">Mağaza Aktif ve Müşteri Ziyaretine Açık</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions */}
              {saveError && (
                <p role="alert" className="text-sm text-signal border-l-4 border-signal bg-signal/5 px-3 py-2">{saveError}</p>
              )}
              <div className="pt-4 border-t border-line flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 py-2.5 px-4 rounded-xs cursor-pointer"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand hover:bg-brand-dark text-ink text-sm font-semibold py-3 px-8 rounded-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Kaydediliyor…' : editingStoreId ? 'Değişiklikleri kaydet' : 'Mağazayı kaydet'}
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
