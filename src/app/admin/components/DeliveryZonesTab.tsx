'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Search, CheckCircle2, AlertCircle, RefreshCw, 
  Save, ShieldAlert, Sparkles, Filter, Check, X, Truck, Info
} from 'lucide-react';
import apiClient from '../../../services/api';
import { TURKEY_CITIES, type TurkeyCity } from '../../../lib/turkeyData';

interface DeliveryZonesTabProps {
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
}

// Regional grouping for quick filters
const MARMARA_CITIES = ['İstanbul', 'Bursa', 'Kocaeli', 'Sakarya', 'Tekirdağ', 'Balıkesir', 'Çanakkale', 'Edirne', 'Kırklareli', 'Yalova', 'Bilecik'];
const EGE_CITIES = ['İzmir', 'Manisa', 'Aydın', 'Denizli', 'Muğla', 'Afyonkarahisar', 'Kütahya', 'Uşak'];
const IC_ANADOLU_CITIES = ['Ankara', 'Konya', 'Kayseri', 'Eskişehir', 'Sivas', 'Kırıkkale', 'Aksaray', 'Karaman', 'Kırşehir', 'Niğde', 'Nevşehir', 'Yozgat', 'Çankırı'];

export const DeliveryZonesTab: React.FC<DeliveryZonesTabProps> = ({
  onShowSuccess,
  onShowError,
}) => {
  const [disabledCityIds, setDisabledCityIds] = useState<number[]>([]);
  const [noticeMessage, setNoticeMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');

  // Load current delivery zones configuration from backend
  const fetchDeliveryZones = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/geo/delivery-zones');
      if (res.data?.success && res.data?.zones) {
        setDisabledCityIds(res.data.zones.disabledCityIds || []);
        setNoticeMessage(res.data.zones.noticeMessage || '');
      }
    } catch (err: unknown) {
      console.error('Fetch delivery zones error:', err);
      onShowError('Teslimat bölge ayarları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryZones();
  }, []);

  // Toggle single city
  const handleToggleCity = (cityId: number) => {
    setDisabledCityIds((prev) => {
      if (prev.includes(cityId)) {
        return prev.filter((id) => id !== cityId);
      } else {
        return [...prev, cityId];
      }
    });
  };

  // Bulk actions
  const handleEnableAll = () => {
    setDisabledCityIds([]);
    onShowSuccess('Tüm 81 il teslimat hizmetine açıldı.');
  };

  const handleDisableAll = () => {
    setDisabledCityIds(TURKEY_CITIES.map((c) => c.id));
    onShowSuccess('Tüm iller geçici olarak hizmete kapatıldı.');
  };

  const handleEnableOnlyMarmaraEge = () => {
    const allowed = [...MARMARA_CITIES, ...EGE_CITIES];
    const newDisabled = TURKEY_CITIES
      .filter((c) => !allowed.includes(c.name))
      .map((c) => c.id);
    setDisabledCityIds(newDisabled);
    onShowSuccess('Yalnızca Marmara ve Ege illeri hizmete açıldı.');
  };

  const handleEnableMetros = () => {
    const metros = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Kocaeli', 'Adana', 'Konya'];
    const newDisabled = TURKEY_CITIES
      .filter((c) => !metros.includes(c.name))
      .map((c) => c.id);
    setDisabledCityIds(newDisabled);
    onShowSuccess('Yalnızca ana büyükşehirler hizmete açıldı.');
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const disabledCityNames = TURKEY_CITIES
        .filter((c) => disabledCityIds.includes(c.id))
        .map((c) => c.name);

      const res = await apiClient.put('/geo/delivery-zones', {
        disabledCityIds,
        disabledCityNames,
        noticeMessage: noticeMessage.trim(),
      });

      if (res.data?.success) {
        onShowSuccess('Teslimat ve şehir hizmet durumu başarıyla kaydedildi.');
      } else {
        onShowError(res.data?.message || 'Kaydedilirken bir sorun oluştu.');
      }
    } catch (err: unknown) {
      console.error('Save delivery zones error:', err);
      const errObj = err as { response?: { data?: { message?: string } } };
      onShowError(errObj.response?.data?.message || 'Ayarlar kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered cities
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return TURKEY_CITIES.filter((city) => {
      const matchesSearch = 
        !q || 
        city.name.toLocaleLowerCase('tr-TR').includes(q) || 
        String(city.id) === q ||
        String(city.id).padStart(2, '0') === q;

      const isCityDisabled = disabledCityIds.includes(city.id);

      if (statusFilter === 'ACTIVE' && isCityDisabled) return false;
      if (statusFilter === 'DISABLED' && !isCityDisabled) return false;

      return matchesSearch;
    });
  }, [searchQuery, disabledCityIds, statusFilter]);

  const activeCount = TURKEY_CITIES.length - disabledCityIds.length;
  const disabledCount = disabledCityIds.length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner & Save CTA */}
      <div className="bg-white border border-line rounded-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-wood">
            <Truck className="h-5 w-5 text-wood" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              Lojistik & Teslimat Yönetimi
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Türkiye 81 İl Teslimat & Şehir Görünürlük Katmanı
          </h2>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
            Mobilya sevkiyatı ve montaj hizmeti verdiğiniz şehirleri dilediğiniz gibi açıp kapatabilirsiniz. 
            Hizmete kapalı şehirler müşteri ödeme (checkout) ekranında hizmet dışı olarak işaretlenir ve sipariş verilmesi engellenir.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={fetchDeliveryZones}
            disabled={isLoading}
            className="p-3 border border-line hover:bg-paper rounded-xs text-neutral-600 transition-colors cursor-pointer"
            title="Yenile"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-ink hover:bg-neutral-800 text-white px-6 py-3 rounded-xs text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-line rounded-xs p-4 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Toplam İl Sayısı</span>
          <p className="text-2xl font-extrabold text-neutral-900">81 İl</p>
          <span className="text-xs text-neutral-500">Tüm resmi Türkiye illeri ve ilçeleri</span>
        </div>

        <div className="bg-white border border-line rounded-xs p-4 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-ok">Aktif Hizmet Verilen İller</span>
          <p className="text-2xl font-extrabold text-ok">{activeCount} İl</p>
          <span className="text-xs text-ok font-medium">Müşteriler doğrudan sipariş verebilir</span>
        </div>

        <div className="bg-white border border-line rounded-xs p-4 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-signal">Geçici Olarak Hizmet Dışı</span>
          <p className="text-2xl font-extrabold text-signal">{disabledCount} İl</p>
          <span className="text-xs text-signal font-medium">Sipariş alımı geçici olarak durduruldu</span>
        </div>
      </div>

      {/* Checkout Alert Notice Config */}
      <div className="bg-paper border border-line rounded-xs p-5 space-y-3">
        <div className="flex items-center gap-2 text-wood-dark">
          <Info className="h-4 w-4" />
          <h3 className="text-sm font-semibold">
            Müşteri Ödeme Ekranı Teslimat Bilgilendirme Metni (Opsiyonel)
          </h3>
        </div>
        <p className="text-xs text-neutral-600">
          Bu metin, sepet ve ödeme sayfasında teslimat kısıtlaması olan bölgeler için müşterilere şeffaf bilgilendirme olarak gösterilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={noticeMessage}
            onChange={(e) => setNoticeMessage(e.target.value)}
            placeholder="Örn: Kış mevsimi hava şartları ve lojistik yoğunluğu sebebiyle Doğu Anadolu ve bazı illerimize teslimat geçici olarak yapılamamaktadır."
            className="flex-1 text-xs border border-line-strong rounded-xs px-3.5 py-2.5 bg-white focus:outline-none focus:border-wood"
          />
          <button
            type="button"
            onClick={() => setNoticeMessage('Ermay Mobilya kendi araç filosu ile belirli illere teslimat ve kurulum yapmaktadır. Hizmet dışı iller için WhatsApp hattımızdan özel nakliye bilgisi alabilirsiniz.')}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-semibold rounded-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            Örnek Şablon Ekle
          </button>
        </div>
      </div>

      {/* Bulk Quick Action Buttons & Search */}
      <div className="bg-white border border-line rounded-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Şehir adı veya plaka ara (örn: İzmir, 35)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-line-strong rounded-xs focus:outline-none focus:border-wood"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-xs transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Tümü ({TURKEY_CITIES.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-xs transition-colors cursor-pointer ${
                statusFilter === 'ACTIVE'
                  ? 'bg-whatsapp text-white'
                  : 'bg-ok-soft text-ok hover:bg-ok-soft'
              }`}
            >
              Hizmet Açık ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('DISABLED')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-xs transition-colors cursor-pointer ${
                statusFilter === 'DISABLED'
                  ? 'bg-signal text-white'
                  : 'bg-signal/5 text-signal hover:bg-signal/5'
              }`}
            >
              Hizmet Kapalı ({disabledCount})
            </button>
          </div>
        </div>

        {/* Fast presets */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line text-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-1">
            Hızlı Şablonlar:
          </span>
          <button
            type="button"
            onClick={handleEnableAll}
            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xs font-medium cursor-pointer transition-colors"
          >
            ✓ Tüm İlleri Aç
          </button>
          <button
            type="button"
            onClick={handleEnableMetros}
            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xs font-medium cursor-pointer transition-colors"
          >
            🏛 Sadece Büyükşehirleri Aç
          </button>
          <button
            type="button"
            onClick={handleEnableOnlyMarmaraEge}
            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xs font-medium cursor-pointer transition-colors"
          >
            🌊 Sadece Marmara & Egeyi Aç
          </button>
          <button
            type="button"
            onClick={handleDisableAll}
            className="px-2.5 py-1 bg-signal/5 hover:bg-signal/5 text-signal rounded-xs font-medium cursor-pointer transition-colors ml-auto"
          >
            ✕ Tümünü Kapat
          </button>
        </div>
      </div>

      {/* Cities Grid Table */}
      <div className="bg-white border border-line rounded-xs overflow-hidden">
        <div className="p-4 bg-paper border-b border-line flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-700 uppercase tracking-wider">
            Listelenen Şehirler ({filteredCities.length})
          </span>
          <span className="text-neutral-500 text-xs">
            Switch&apos;i kapatılan iller müşteriye teslimat dışı olarak gösterilir
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
          {filteredCities.map((city) => {
            const isCityDisabled = disabledCityIds.includes(city.id);
            const isCityActive = !isCityDisabled;

            return (
              <div
                key={city.id}
                className={`p-4 flex items-center justify-between transition-colors border-b border-line ${
                  isCityDisabled ? 'bg-paper/70 opacity-75' : 'bg-white hover:bg-[#FDFBF7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xs bg-neutral-100 text-neutral-700 font-mono text-xs font-bold flex items-center justify-center border border-line">
                    {String(city.id).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-neutral-900 block">
                      {city.name}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {city.districts.length} İlçe (Örn: {city.districts.slice(0, 2).join(', ')}...)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCity(city.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isCityActive ? 'bg-whatsapp' : 'bg-neutral-300'
                    }`}
                    role="switch"
                    aria-checked={isCityActive}
                    aria-label={`${city.name} hizmet durumu`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out ${
                        isCityActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold uppercase tracking-wider w-16 text-right ${
                    isCityActive ? 'text-ok' : 'text-neutral-500'
                  }`}>
                    {isCityActive ? 'Açık' : 'Kapalı'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCities.length === 0 && (
          <div className="p-12 text-center text-neutral-500 text-xs">
            Arama kriterine uygun şehir bulunamadı.
          </div>
        )}
      </div>

    </div>
  );
};

export default DeliveryZonesTab;
