'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Clock,
  ArrowUpRight,
  MessageCircle,
  Copy,
  Check,
  Compass,
  Layers,
} from 'lucide-react';
import type { StoreItem } from '../../types';
import { TurkeyMap, REGION_NAMES } from '../../components/TurkeyMap';
import { TURKEY_PROVINCES } from '../../data/turkeyProvinces';
import { toast } from '../../stores/useToastStore';
import { useWhatsappNumber } from '../../lib/whatsapp';

interface BayilerContentProps {
  stores: StoreItem[];
}

export const BayilerContent: React.FC<BayilerContentProps> = ({ stores }) => {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const activeStores = useMemo(() => stores.filter((s) => s.isActive !== false), [stores]);

  // Compute store density per region
  const regionStats = useMemo(() => {
    const stats: Record<string, { count: number; stores: StoreItem[] }> = {
      marmara: { count: 0, stores: [] },
      ege: { count: 0, stores: [] },
      icanadolu: { count: 0, stores: [] },
      akdeniz: { count: 0, stores: [] },
      karadeniz: { count: 0, stores: [] },
      guneydogu: { count: 0, stores: [] },
      doguanadolu: { count: 0, stores: [] },
    };

    activeStores.forEach((s) => {
      const normalizedCity = (s.city || '').trim().toLowerCase();
      const foundProv = TURKEY_PROVINCES.find(
        (p) => p.name.toLowerCase() === normalizedCity || normalizedCity.includes(p.name.toLowerCase())
      );
      const regionKey = foundProv ? foundProv.region : 'marmara';

      if (stats[regionKey]) {
        stats[regionKey].count += 1;
        stats[regionKey].stores.push(s);
      }
    });

    // Sort regions by store count descending (most stores first)
    return Object.entries(stats)
      .map(([regionId, data]) => ({
        regionId,
        name: REGION_NAMES[regionId] || regionId,
        count: data.count,
        stores: data.stores,
      }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [activeStores]);

  // Harita her zaman bir bölgeye odaklı açılır; sayfa kaydırması haritayı değiştirmez.
  // Açılış bölgesi: ziyaretçinin bölgesi (orada mağaza varsa) → yoksa en çok mağazası olan bölge.
  const mostStoresRegion = regionStats[0]?.regionId || 'marmara';
  const [activeRegionId, setActiveRegionId] = useState<string | null>(mostStoresRegion);
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null);
  const [activeBubbleCity, setActiveBubbleCity] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(activeStores[0]?.id || '');
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const [userDetectedCity, setUserDetectedCity] = useState<string | null>(null);
  const userPickedRegionRef = useRef(false);

  const storeCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const regionSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mapSectionRef = useRef<HTMLDivElement | null>(null);

  // Mağaza listesi sonradan gelirse varsayılan bölgeyi güncelle (kullanıcı seçim yapmadıysa)
  useEffect(() => {
    if (!userPickedRegionRef.current) setActiveRegionId(mostStoresRegion);
  }, [mostStoresRegion]);

  // Ziyaretçi bölgesi: CDN/proxy konum başlığından (bkz. app/api/region-hint). Üçüncü taraf IP servisi kullanılmaz.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/region-hint', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((hint: { region: string | null; city: string | null } | null) => {
        if (cancelled || !hint?.region || userPickedRegionRef.current) return;
        if (regionStats.some((r) => r.regionId === hint.region)) {
          setActiveRegionId(hint.region);
          if (hint.city) setUserDetectedCity(hint.city);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [regionStats]);

  const selectRegion = useCallback((regionId: string | null) => {
    userPickedRegionRef.current = true;
    setActiveRegionId(regionId);
    setActiveBubbleCity(null);
  }, []);

  // Click handler on map city / province
  const handleSelectCity = useCallback((cityName: string) => {
    userPickedRegionRef.current = true;
    setSelectedCityName(cityName);
    setActiveBubbleCity(cityName);

    const storeInCity = activeStores.find(
      (s) =>
        s.city.toLowerCase() === cityName.toLowerCase() ||
        cityName.toLowerCase().includes(s.city.toLowerCase())
    );
    if (storeInCity) {
      setSelectedStoreId(storeInCity.id);
    }
  }, [activeStores]);

  // Scroll to store card smoothly
  const handleScrollToStore = useCallback((storeId: string) => {
    const cardEl = storeCardRefs.current[storeId];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedStoreId(storeId);
    }
  }, []);

  const handleCopyAddress = (store: StoreItem) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${store.name}, ${store.address}`);
      setCopiedStoreId(store.id);
      toast.success('Adres Kopyalandı', 'Mağaza adresi panoya kopyalandı.');
      setTimeout(() => setCopiedStoreId(null), 2000);
    }
  };

  return (
    <div className="w-full bg-canvas min-h-screen py-8 sm:py-14 overflow-x-clip">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <nav className="text-xs text-neutral-500 flex items-center gap-2 mb-6 sm:mb-8">
          <Link href="/anasayfa" className="hover:text-neutral-900 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-700 font-normal">Satış noktaları</span>
        </nav>

        {/* Minimal Modern Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/60 text-neutral-700 text-xs mb-3 font-medium">
              <Compass className="w-3.5 h-3.5 text-wood-dark" />
              <span>Showroomlar ve satış noktaları</span>
            </div>
            <h1 className="text-2xl sm:text-4xl text-neutral-900 tracking-tight">
              Showroomlar
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm mt-2.5 leading-relaxed">
              Mobilyalarımızı yakından incelemek, malzeme kalitesini ve dokusunu deneyimlemek için mağazalarımıza davetlisiniz. Şehrinizde mağaza olmasa dahi doğrudan fabrikadan tüm Türkiye&apos;ye sigortalı kapıya teslimat yapılmaktadır.
            </p>
          </div>

          {/* User Location Badge if detected */}
          {userDetectedCity && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xs border border-line text-xs text-neutral-600 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-wood" />
              <span>Size en yakın showroomlar: <strong>{userDetectedCity}</strong> bölgesi</span>
            </div>
          )}
        </div>

        {/* QUICK REGION FILTER PILLS & VIEW CONTROLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => {
              selectRegion(null);
              setSelectedCityName(null);
            }}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeRegionId === null
                ? 'bg-neutral-900 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-line'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tüm Türkiye Haritası</span>
          </button>

          {regionStats.map((reg) => (
            <button
              key={reg.regionId}
              type="button"
              onClick={() => {
                selectRegion(reg.regionId);
                const firstStoreInReg = reg.stores[0];
                if (firstStoreInReg) {
                  setSelectedCityName(firstStoreInReg.city);
                }
              }}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeRegionId === reg.regionId
                  ? 'bg-brand text-ink'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-line'
              }`}
            >
              <span>{reg.name}</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                activeRegionId === reg.regionId
                  ? 'bg-ink/10 text-ink'
                  : 'bg-neutral-100 text-neutral-600'
              }`}>
                {reg.count} Mağaza
              </span>
            </button>
          ))}
        </div>

        {/* STICKY MAP CONTAINER (OPTIMIZED FOR ALL SCREENS) */}
        <div
          ref={mapSectionRef}
          className="sticky top-[104px] z-20 mb-12 sm:mb-16 bg-canvas/95 pt-1 pb-3"
        >
          <TurkeyMap
            stores={activeStores}
            activeRegionId={activeRegionId}
            selectedCityName={selectedCityName}
            activeBubbleCity={activeBubbleCity}
            onSelectCity={handleSelectCity}
            onSelectRegion={selectRegion}
            onCloseBubble={() => setActiveBubbleCity(null)}
            onScrollToStore={handleScrollToStore}
          />
        </div>

        {/* STORE CARDS LIST (ORDERED BY REGION DENSITY) */}
        <div className="space-y-12 sm:space-y-16">
          {activeStores.length === 0 && (
            <div className="bg-white border border-line rounded-xs p-8 text-center text-sm text-neutral-600">
              Mağaza bilgileri şu anda yüklenemedi. Showroom adreslerimiz için{' '}
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="text-wood-dark font-semibold underline">
                WhatsApp hattımızdan
              </a>{' '}
              bize ulaşabilirsiniz.
            </div>
          )}

          {regionStats.map((region) => (
            <div
              key={region.regionId}
              ref={(el) => {
                regionSectionRefs.current[region.regionId] = el;
              }}
              className="scroll-mt-32"
            >
              {/* Region Label */}
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-line">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    {region.name}
                  </span>
                  <span className="text-xs text-neutral-500">
                    ({region.count} Aktif Showroom)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRegionId(region.regionId);
                    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-wood-dark hover:text-neutral-900 font-medium transition-colors"
                >
                  Haritada Odakla &rarr;
                </button>
              </div>

              {/* Modern Curved Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {region.stores.map((store) => {
                  const isSelected = selectedStoreId === store.id;

                  return (
                    <div
                      key={store.id}
                      ref={(el) => {
                        storeCardRefs.current[store.id] = el;
                      }}
                      className={`bg-white rounded-xs border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-wood ring-2 ring-wood/30'
                          : 'border-line hover:border-line-strong'
                      }`}
                    >
                      {/* Store Photo */}
                      <div className="p-3">
                        <div className="aspect-[16/10] rounded-xs overflow-hidden bg-neutral-100 relative">
                          <img
                            src={store.image || '/default-furniture.webp'}
                            alt={store.name}
                            className="w-full h-full object-cover transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 text-neutral-900 text-xs font-medium px-3 py-1 rounded-full">
                            {store.city} {store.district ? `· ${store.district}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Store Details */}
                      <div className="p-5 sm:p-6 pt-2 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-medium text-neutral-900 leading-snug">
                              {store.name}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectCity(store.city);
                                mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="text-xs text-wood-dark hover:underline shrink-0 font-medium"
                              title="Haritada Göster"
                            >
                              Harita
                            </button>
                          </div>

                          {/* Address */}
                          <div className="flex items-start justify-between gap-2 text-xs text-neutral-500 leading-relaxed">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                              <span>{store.address}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyAddress(store)}
                              className="text-neutral-500 hover:text-neutral-800 transition-colors shrink-0 p-1 cursor-pointer"
                              title="Adresi Kopyala"
                            >
                              {copiedStoreId === store.id ? (
                                <Check className="h-3.5 w-3.5 text-ok" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Hours */}
                          {store.hours && (
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <Clock className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <span>{store.hours}</span>
                            </div>
                          )}

                          {/* Phone */}
                          {store.phone && (
                            <div className="flex items-center gap-2 text-xs text-neutral-800 font-medium">
                              <Phone className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <a href={`tel:${store.phone}`} className="hover:underline">
                                {store.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Modern Curved Actions */}
                        <div className="pt-4 border-t border-line flex items-center gap-2.5">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${store.name} ${store.address}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Yol Tarifi</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>

                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                              `Merhaba, ${store.name} mağazanız hakkında bilgi almak istiyorum.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3.5 bg-whatsapp hover:bg-whatsapp-dark text-white text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5"
                            title="WhatsApp İletişim"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Factory Direct Delivery Note (All 81 Provinces) */}
        <div className="mt-16 p-6 sm:p-8 bg-ink text-white rounded-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-wood-light text-sm">
              Türkiye geneline teslimat
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-semibold">
              Şehrinizde showroom yoksa da sipariş verebilirsiniz.
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm max-w-xl">
              Ermay Mobilya, 81 ilimizin tamamına sigortalı nakliye, randevulu teslimat ve uzman montaj desteği sunar. Aracı komisyonu olmadan doğrudan fabrika satış fiyatı avantajıyla sipariş verin.
            </p>
          </div>

          <a
            href={`https://wa.me/${waNumber}?text=Merhaba,%20%C5%9Fehrime%20teslimat%20ko%C5%9Fullar%C4%B1%20ve%20fabrika%20sat%C4%B1%C5%9F%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-brand hover:bg-ink text-ink font-semibold text-sm rounded-xs transition-colors shrink-0 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-neutral-900" />
            <span>Teslimat danışmanı</span>
          </a>
        </div>

      </div>
    </div>
  );
};
