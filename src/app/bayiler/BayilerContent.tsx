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
  Store,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { StoreItem } from '../../types';
import { TurkeyMap, REGION_NAMES } from '../../components/TurkeyMap';
import { TURKEY_PROVINCES } from '../../data/turkeyProvinces';
import { toast } from '../../stores/useToastStore';

interface BayilerContentProps {
  stores: StoreItem[];
}

export const BayilerContent: React.FC<BayilerContentProps> = ({ stores }) => {
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

  // Initial state: Harita ilk açılışta tam olarak tüm Türkiye olarak gelmeli (null)
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null);
  const [activeBubbleCity, setActiveBubbleCity] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(activeStores[0]?.id || '');
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);

  // Target primary region (IP detection or region with most stores fallback)
  const [targetPrimaryRegion, setTargetPrimaryRegion] = useState<string>(
    regionStats[0]?.regionId || 'marmara'
  );
  const [userDetectedCity, setUserDetectedCity] = useState<string | null>(null);

  // Refs for tracking sections and RAF scroll
  const storeCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const regionSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const isAutoScrollingRef = useRef<boolean>(false);

  // 1. IP-BASED USER LOCATION DETECTION (Fast timeout with fallback)
  useEffect(() => {
    let isMounted = true;
    async function detectUserLocation() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const res = await fetch('https://ipapi.co/json/', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);

        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        const rawCity = (data.city || data.region || '').trim().toLowerCase();
        if (rawCity) {
          const matchedProv = TURKEY_PROVINCES.find(
            (p) =>
              p.name.toLowerCase() === rawCity ||
              rawCity.includes(p.name.toLowerCase()) ||
              p.name.toLowerCase().includes(rawCity)
          );

          if (matchedProv) {
            setUserDetectedCity(matchedProv.name);
            // Check if user's region has stores
            const hasStoresInRegion = regionStats.some((r) => r.regionId === matchedProv.region);
            if (hasStoresInRegion) {
              setTargetPrimaryRegion(matchedProv.region);
            }
          }
        }
      } catch {
        // Silently fallback to region with most stores (Marmara)
      }
    }

    detectUserLocation();
    return () => {
      isMounted = false;
    };
  }, [regionStats]);

  // Lock timestamp when user explicitly clicks on a region or bubble
  const manualLockUntilRef = useRef<number>(0);

  // 2. HARDWARE-OPTIMIZED RAF SCROLL LISTENER WITH HYSTERESIS
  // - Starts full view (activeRegionId = null)
  // - When scroll begins (scrollY > 90): zooms smoothly into targetPrimaryRegion (IP region or highest density region)
  // - As scroll continues: focuses on subsequent active store regions
  // - When scrolled back to top (< 30px): resets to full Turkey view
  // - Deadzone (30px-90px) prevents threshold flipping and jitter!
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;
      if (Date.now() < manualLockUntilRef.current) return;

      const scrollY = window.scrollY;

      // Top of page: Reset to Full Turkey Map
      if (scrollY < 35) {
        setActiveRegionId(null);
        return;
      }

      // Check which region section is currently in viewport
      let matchedRegion: string | null = null;
      for (const reg of regionStats) {
        const el = regionSectionRefs.current[reg.regionId];
        if (el) {
          const rect = el.getBoundingClientRect();
          // Region section is currently being viewed
          if (rect.top <= 360 && rect.bottom >= 140) {
            matchedRegion = reg.regionId;
            break;
          }
        }
      }

      if (matchedRegion) {
        setActiveRegionId(matchedRegion);
      } else if (scrollY >= 90) {
        // Only zoom in after passing 90px threshold (prevents jitter)
        setActiveRegionId((prev) => prev || targetPrimaryRegion);
      }

      // Store card active border tracking
      for (const st of activeStores) {
        const el = storeCardRefs.current[st.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 280 && rect.bottom >= 100) {
            setSelectedStoreId(st.id);
            break;
          }
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [regionStats, activeStores, targetPrimaryRegion]);

  // Click handler on map city / province
  const handleSelectCity = useCallback((cityName: string) => {
    manualLockUntilRef.current = Date.now() + 3000;
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
    manualLockUntilRef.current = Date.now() + 3000;
    const cardEl = storeCardRefs.current[storeId];
    if (cardEl) {
      isAutoScrollingRef.current = true;
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedStoreId(storeId);
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 800);
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
    <div className="w-full bg-[#FAF9F6] min-h-screen py-8 sm:py-14 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <nav className="text-xs text-neutral-400 font-light flex items-center gap-2 mb-6 sm:mb-8">
          <Link href="/anasayfa" className="hover:text-neutral-900 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-700 font-normal">Satış Noktaları & Mağazalar</span>
        </nav>

        {/* Minimal Modern Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/60 text-neutral-700 text-xs mb-3 font-medium">
              <Compass className="w-3.5 h-3.5 text-[#8A4B20]" />
              <span>Türkiye Geneli Satış & Showroom Ağı</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light text-neutral-900 tracking-tight">
              Satış Noktaları & Showroomlar
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm mt-2.5 leading-relaxed font-light">
              Mobilyalarımızı yakından incelemek, malzeme kalitesini ve dokusunu deneyimlemek için mağazalarımıza davetlisiniz. Şehrinizde mağaza olmasa dahi doğrudan fabrikadan tüm Türkiye&apos;ye sigortalı kapıya teslimat yapılmaktadır.
            </p>
          </div>

          {/* User Location Badge if detected */}
          {userDetectedCity && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-neutral-200 shadow-2xs text-xs text-neutral-600 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Tespit Edilen Bölgeniz: <strong>{userDetectedCity}</strong></span>
            </div>
          )}
        </div>

        {/* QUICK REGION FILTER PILLS & VIEW CONTROLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => {
              manualLockUntilRef.current = Date.now() + 3000;
              setActiveRegionId(null);
              setSelectedCityName(null);
              setActiveBubbleCity(null);
            }}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeRegionId === null
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
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
                manualLockUntilRef.current = Date.now() + 3000;
                setActiveRegionId(reg.regionId);
                const firstStoreInReg = reg.stores[0];
                if (firstStoreInReg) {
                  setSelectedCityName(firstStoreInReg.city);
                }
              }}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeRegionId === reg.regionId
                  ? 'bg-[#C5A880] text-white shadow-xs'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
              }`}
            >
              <span>{reg.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeRegionId === reg.regionId
                  ? 'bg-white/30 text-white'
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
          className="sticky top-16 sm:top-20 z-20 mb-12 sm:mb-16 bg-[#FAF9F6]/95 backdrop-blur-md pt-1 pb-3"
        >
          <TurkeyMap
            stores={activeStores}
            activeRegionId={activeRegionId}
            selectedCityName={selectedCityName}
            activeBubbleCity={activeBubbleCity}
            onSelectCity={handleSelectCity}
            onSelectRegion={(reg) => setActiveRegionId(reg)}
            onCloseBubble={() => setActiveBubbleCity(null)}
            onScrollToStore={handleScrollToStore}
          />
        </div>

        {/* STORE CARDS LIST (ORDERED BY REGION DENSITY) */}
        <div className="space-y-12 sm:space-y-16">
          {regionStats.map((region) => (
            <div
              key={region.regionId}
              ref={(el) => {
                regionSectionRefs.current[region.regionId] = el;
              }}
              className="scroll-mt-32"
            >
              {/* Region Label */}
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    {region.name}
                  </span>
                  <span className="text-xs text-neutral-500 font-light">
                    ({region.count} Aktif Showroom)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRegionId(region.regionId);
                    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-[#8A4B20] hover:text-neutral-900 font-medium transition-colors"
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
                      className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30 shadow-md'
                          : 'border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      {/* Store Photo */}
                      <div className="p-3">
                        <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-100 relative">
                          <img
                            src={store.image || '/default-furniture.webp'}
                            alt={store.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-neutral-900 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs">
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
                              className="text-[11px] text-[#8A4B20] hover:underline shrink-0 font-medium"
                              title="Haritada Göster"
                            >
                              Harita
                            </button>
                          </div>

                          {/* Address */}
                          <div className="flex items-start justify-between gap-2 text-xs text-neutral-500 font-light leading-relaxed">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                              <span>{store.address}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyAddress(store)}
                              className="text-neutral-400 hover:text-neutral-800 transition-colors shrink-0 p-1 cursor-pointer"
                              title="Adresi Kopyala"
                            >
                              {copiedStoreId === store.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Hours */}
                          {store.hours && (
                            <div className="flex items-center gap-2 text-xs text-neutral-500 font-light">
                              <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                              <span>{store.hours}</span>
                            </div>
                          )}

                          {/* Phone */}
                          {store.phone && (
                            <div className="flex items-center gap-2 text-xs text-neutral-800 font-medium">
                              <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                              <a href={`tel:${store.phone}`} className="hover:underline">
                                {store.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Modern Curved Actions */}
                        <div className="pt-4 border-t border-neutral-100 flex items-center gap-2.5">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${store.name} ${store.address}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <span>Yol Tarifi</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>

                          <a
                            href={`https://wa.me/905324194151?text=${encodeURIComponent(
                              `Merhaba, ${store.name} mağazanız hakkında bilgi almak istiyorum.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
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
        <div className="mt-16 p-6 sm:p-8 bg-neutral-900 text-white rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-[#C5A880] text-xs font-medium uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Tüm Türkiye&apos;ye Doğrudan Üreticiden Teslimat</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-light">
              Şehrinizde Showroom Yok mu? Hiç Sorun Değil.
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-xl">
              Ermay Mobilya, 81 ilimizin tamamına sigortalı nakliye, randevulu teslimat ve uzman montaj desteği sunar. Aracı komisyonu olmadan doğrudan fabrika satış fiyatı avantajıyla sipariş verin.
            </p>
          </div>

          <a
            href="https://wa.me/905324194151?text=Merhaba,%20%C5%9Fehrime%20teslimat%20ko%C5%9Fullar%C4%B1%20ve%20fabrika%20sat%C4%B1%C5%9F%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#b3956e] text-neutral-900 font-medium text-xs rounded-full transition-colors shrink-0 shadow-sm flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-neutral-900" />
            <span>Teslimat & Sevkiyat Danışmanı</span>
          </a>
        </div>

      </div>
    </div>
  );
};
