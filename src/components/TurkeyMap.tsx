'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  Clock,
  ArrowUpRight,
  MessageCircle,
  Copy,
  Check,
  Truck,
  Store,
  Navigation,
} from 'lucide-react';
import type { StoreItem } from '../types';
import { TURKEY_PROVINCES, ProvinceData } from '../data/turkeyProvinces';

// Accurate province centers on 1000x422 viewBox
export const PROVINCE_CENTERS: Record<string, { x: number; y: number }> = {
  'Adana': { x: 442, y: 300 },
  'Adıyaman': { x: 579, y: 268 },
  'Afyonkarahisar': { x: 236, y: 204 },
  'Ağrı': { x: 808, y: 164 },
  'Amasya': { x: 457, y: 114 },
  'Ankara': { x: 365, y: 171 },
  'Antalya': { x: 247, y: 312 },
  'Artvin': { x: 708, y: 73 },
  'Aydın': { x: 139, y: 266 },
  'Balıkesir': { x: 136, y: 147 },
  'Bilecik': { x: 240, y: 141 },
  'Bingöl': { x: 697, y: 204 },
  'Bitlis': { x: 768, y: 219 },
  'Bolu': { x: 305, y: 118 },
  'Burdur': { x: 228, y: 274 },
  'Bursa': { x: 194, y: 133 },
  'Çanakkale': { x: 77, y: 125 },
  'Çankırı': { x: 395, y: 118 },
  'Çorum': { x: 440, y: 128 },
  'Denizli': { x: 184, y: 267 },
  'Diyarbakır': { x: 673, y: 249 },
  'Edirne': { x: 80, y: 55 },
  'Elazığ': { x: 629, y: 219 },
  'Erzincan': { x: 638, y: 168 },
  'Erzurum': { x: 719, y: 148 },
  'Eskişehir': { x: 267, y: 163 },
  'Gaziantep': { x: 536, y: 308 },
  'Giresun': { x: 577, y: 104 },
  'Gümüşhane': { x: 618, y: 132 },
  'Hakkari': { x: 864, y: 284 },
  'Hatay': { x: 472, y: 364 },
  'Isparta': { x: 254, y: 254 },
  'Mersin': { x: 388, y: 318 },
  'İstanbul': { x: 205, y: 76 },
  'İzmir': { x: 128, y: 232 },
  'Kars': { x: 789, y: 104 },
  'Kastamonu': { x: 394, y: 74 },
  'Kayseri': { x: 477, y: 228 },
  'Kırklareli': { x: 115, y: 44 },
  'Kırşehir': { x: 412, y: 195 },
  'Kocaeli': { x: 245, y: 96 },
  'Konya': { x: 340, y: 262 },
  'Kütahya': { x: 206, y: 178 },
  'Malatya': { x: 574, y: 228 },
  'Manisa': { x: 145, y: 205 },
  'Kahramanmaraş': { x: 512, y: 268 },
  'Mardin': { x: 712, y: 295 },
  'Muğla': { x: 149, y: 312 },
  'Muş': { x: 739, y: 204 },
  'Nevşehir': { x: 432, y: 221 },
  'Niğde': { x: 438, y: 264 },
  'Ordu': { x: 537, y: 96 },
  'Rize': { x: 673, y: 84 },
  'Sakarya': { x: 273, y: 105 },
  'Samsun': { x: 486, y: 80 },
  'Siirt': { x: 772, y: 252 },
  'Sinop': { x: 444, y: 46 },
  'Sivas': { x: 546, y: 172 },
  'Tekirdağ': { x: 121, y: 77 },
  'Tokat': { x: 497, y: 133 },
  'Trabzon': { x: 628, y: 94 },
  'Tunceli': { x: 649, y: 194 },
  'Şanlıurfa': { x: 618, y: 308 },
  'Uşak': { x: 190, y: 216 },
  'Van': { x: 824, y: 224 },
  'Yozgat': { x: 447, y: 174 },
  'Zonguldak': { x: 298, y: 78 },
  'Aksaray': { x: 399, y: 241 },
  'Bayburt': { x: 654, y: 123 },
  'Karaman': { x: 366, y: 308 },
  'Kırıkkale': { x: 388, y: 165 },
  'Batman': { x: 729, y: 255 },
  'Şırnak': { x: 798, y: 284 },
  'Bartın': { x: 326, y: 64 },
  'Ardahan': { x: 778, y: 68 },
  'Iğdır': { x: 852, y: 140 },
  'Yalova': { x: 213, y: 104 },
  'Karabük': { x: 337, y: 88 },
  'Kilis': { x: 512, y: 326 },
  'Osmaniye': { x: 489, y: 298 },
  'Düzce': { x: 290, y: 101 },
};

export const REGION_NAMES: Record<string, string> = {
  marmara: 'Marmara Bölgesi',
  ege: 'Ege Bölgesi',
  icanadolu: 'İç Anadolu Bölgesi',
  akdeniz: 'Akdeniz Bölgesi',
  karadeniz: 'Karadeniz Bölgesi',
  guneydogu: 'Güneydoğu Anadolu',
  doguanadolu: 'Doğu Anadolu',
};

// Smooth zoomed viewBoxes for each region
export const REGION_VIEWBOXES: Record<string, string> = {
  marmara: '30 4 282 221',
  ege: '57 141 291 250',
  icanadolu: '242 67 440 315',
  akdeniz: '201 220 435 198',
  karadeniz: '264 4 598 170',
  guneydogu: '542 213 361 158',
  doguanadolu: '579 36 391 314',
};

// Memoized province path for maximum 60fps rendering without re-parsing paths
interface ProvincePathProps {
  prov: ProvinceData;
  fill: string;
  stroke: string;
  strokeWidth: number;
  onHover: (name: string | null) => void;
  onClick: (prov: ProvinceData) => void;
}

const MemoizedProvincePath = React.memo<ProvincePathProps>(({
  prov,
  fill,
  stroke,
  strokeWidth,
  onHover,
  onClick,
}) => {
  return (
    <path
      id={prov.id}
      d={prov.d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-150 cursor-pointer hover:opacity-80 active:opacity-95"
      onMouseEnter={() => onHover(prov.name)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(prov);
      }}
    />
  );
});

MemoizedProvincePath.displayName = 'MemoizedProvincePath';

interface TurkeyMapProps {
  stores: StoreItem[];
  activeRegionId: string | null;
  selectedCityName?: string | null;
  activeBubbleCity?: string | null;
  onSelectCity?: (cityName: string) => void;
  onSelectRegion?: (regionId: string | null) => void;
  onCloseBubble?: () => void;
  onScrollToStore?: (storeId: string) => void;
}

export const TurkeyMap: React.FC<TurkeyMapProps> = ({
  stores,
  activeRegionId,
  selectedCityName,
  activeBubbleCity: controlledBubbleCity,
  onSelectCity,
  onSelectRegion,
  onCloseBubble,
  onScrollToStore,
}) => {
  const [internalBubbleCity, setInternalBubbleCity] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);

  // Effective bubble city
  const activeBubbleCity = controlledBubbleCity !== undefined
    ? controlledBubbleCity
    : internalBubbleCity;

  // Group stores by normalized city name
  const cityStoresMap = useMemo(() => {
    const map = new Map<string, StoreItem[]>();
    for (const s of stores) {
      const c = (s.city || '').trim().toLowerCase();
      if (!map.has(c)) {
        map.set(c, []);
      }
      map.get(c)!.push(s);
    }
    return map;
  }, [stores]);

  const activeCityNorm = (selectedCityName || activeBubbleCity || '').trim().toLowerCase();

  // Dynamic viewBox: when activeRegionId is null -> full Turkey '0 0 1000 422'
  const currentViewBox = useMemo(() => {
    if (activeRegionId && REGION_VIEWBOXES[activeRegionId]) {
      return REGION_VIEWBOXES[activeRegionId];
    }
    return '0 0 1000 422';
  }, [activeRegionId]);

  // Click on province or pin: open city bubble
  const handleCityClick = useCallback((prov: { name: string; region: string }) => {
    setInternalBubbleCity(prov.name);
    if (onSelectCity) onSelectCity(prov.name);
    if (onSelectRegion && prov.region) onSelectRegion(prov.region);
  }, [onSelectCity, onSelectRegion]);

  const handleCloseBubble = useCallback(() => {
    setInternalBubbleCity(null);
    if (onCloseBubble) onCloseBubble();
  }, [onCloseBubble]);

  // Close bubble on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeBubbleCity) {
        handleCloseBubble();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBubbleCity, handleCloseBubble]);

  // Stores in active bubble city
  const bubbleStores = useMemo(() => {
    if (!activeBubbleCity) return [];
    const norm = activeBubbleCity.trim().toLowerCase();
    return cityStoresMap.get(norm) || [];
  }, [activeBubbleCity, cityStoresMap]);

  // Province info of active bubble city
  const bubbleProv = useMemo(() => {
    if (!activeBubbleCity) return null;
    return TURKEY_PROVINCES.find(
      (p) => p.name.toLowerCase() === activeBubbleCity.toLowerCase()
    );
  }, [activeBubbleCity]);

  const handleCopy = (store: StoreItem) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${store.name}, ${store.address}`);
      setCopiedStoreId(store.id);
      setTimeout(() => setCopiedStoreId(null), 2000);
    }
  };

  return (
    <div
      className="relative w-full bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-3.5 sm:p-5 overflow-hidden transition-all"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      onClick={() => {
        // Clicking map card backdrop closes bubble if open
        if (activeBubbleCity) handleCloseBubble();
      }}
    >
      {/* Top Controls & Status Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-neutral-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880] animate-pulse" />
          <span className="font-semibold text-neutral-800">
            {activeRegionId && REGION_NAMES[activeRegionId]
              ? REGION_NAMES[activeRegionId]
              : 'Türkiye Geneli Harita (Tüm Bölgeler)'}
          </span>
          {activeRegionId && (
            <button
              type="button"
              onClick={() => {
                if (onSelectRegion) onSelectRegion(null);
              }}
              className="text-[11px] font-medium text-[#8A4B20] hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-full transition-colors ml-1 cursor-pointer"
            >
              Tam Görünüme Dön
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] border border-neutral-400" />
            <span className="hidden sm:inline">Mağaza Var</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
            <span>Seçili İl</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] border border-neutral-300" />
            <span className="hidden sm:inline">Diğer İller</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas (Hardware Accelerated, Smooth Transition) */}
      <div
        className="relative w-full aspect-[2.35/1] max-h-[380px] sm:max-h-[440px] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          viewBox={currentViewBox}
          className="w-full h-full"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
        >
          {/* 81 PROVINCES */}
          <g id="turkey-provinces">
            {TURKEY_PROVINCES.map((prov) => {
              const provNorm = prov.name.toLowerCase();
              const hasStores = cityStoresMap.has(provNorm);
              const isSelected = activeCityNorm === provNorm;

              // Visual styling: White background, slate gray for store cities, warm bronze for selected
              let fill = '#FFFFFF';
              let stroke = '#E2E8F0';
              let strokeWidth = 0.5;

              if (hasStores) {
                fill = '#CBD5E1'; // Slate gray for store cities
                stroke = '#94A3B8';
                strokeWidth = 0.8;
              }

              if (isSelected) {
                fill = '#C5A880'; // Main brand gold/bronze
                stroke = '#8A4B20';
                strokeWidth = 1.6;
              }

              return (
                <MemoizedProvincePath
                  key={prov.id}
                  prov={prov}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  onHover={setHoveredCity}
                  onClick={handleCityClick}
                />
              );
            })}
          </g>

          {/* ACTIVE STORE PINS */}
          {TURKEY_PROVINCES.filter((p) => cityStoresMap.has(p.name.toLowerCase())).map((prov) => {
            const center = PROVINCE_CENTERS[prov.name] || { x: 200, y: 100 };
            const isSelected = activeCityNorm === prov.name.toLowerCase();

            return (
              <g
                key={`pin-${prov.id}`}
                transform={`translate(${center.x}, ${center.y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCityClick(prov);
                }}
              >
                {/* Pulse ring for selected city */}
                {isSelected && (
                  <circle
                    r={13}
                    fill="#C5A880"
                    opacity={0.35}
                    className="animate-ping"
                  />
                )}

                {/* Outer dot */}
                <circle
                  r={isSelected ? 6.5 : 4.2}
                  fill={isSelected ? '#8A4B20' : '#475569'}
                  className="transition-all duration-300"
                />

                {/* Inner white core */}
                <circle
                  r={isSelected ? 2.5 : 1.8}
                  fill="#FFFFFF"
                />

                {/* City label */}
                <g transform="translate(0, -9)">
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill={isSelected ? '#8A4B20' : '#1E293B'}
                    fontSize="7.5"
                    fontWeight="700"
                    className="font-sans select-none pointer-events-none tracking-wide"
                  >
                    {prov.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hovered city tooltip (lightweight) */}
        {hoveredCity && !activeBubbleCity && (
          <div className="absolute top-2 left-2 bg-neutral-900/90 text-white text-xs px-3 py-1.5 rounded-xl shadow-md pointer-events-none transition-opacity flex items-center gap-2">
            <span className="font-semibold">{hoveredCity}</span>
            <span className="text-neutral-400 text-[11px]">
              {cityStoresMap.has(hoveredCity.toLowerCase())
                ? `• ${cityStoresMap.get(hoveredCity.toLowerCase())?.length} Mağaza (Tıkla ve İncele)`
                : '• Mağaza yok (Tıkla ve Bilgi Al)'}
            </span>
          </div>
        )}

        {/* 
          =======================================================
          INTERACTIVE CITY STORE BUBBLE (POPOVER / FLOATING CARD)
          =======================================================
        */}
        {activeBubbleCity && (
          <div
            className="absolute z-30 inset-x-2 bottom-2 md:inset-x-auto md:bottom-auto md:top-3 md:right-3 md:w-96 max-h-[88%] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-200/95 flex flex-col overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform' }}
          >
            {/* Bubble Header */}
            <div className="p-3.5 sm:p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C5A880]/20 flex items-center justify-center text-[#8A4B20]">
                  {bubbleStores.length > 0 ? (
                    <Store className="w-4 h-4" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-neutral-900 text-sm">
                      {activeBubbleCity}
                    </h3>
                    <span className="text-[10px] font-medium text-neutral-500">
                      ({bubbleProv ? REGION_NAMES[bubbleProv.region] || bubbleProv.region : 'Türkiye'})
                    </span>
                  </div>
                  <span className={`text-[11px] font-medium ${
                    bubbleStores.length > 0 ? 'text-emerald-700' : 'text-neutral-500'
                  }`}>
                    {bubbleStores.length > 0
                      ? `${bubbleStores.length} Satış Noktası Aktif`
                      : 'Fabrikadan Doğrudan Teslimat'}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseBubble}
                className="w-7 h-7 rounded-full bg-neutral-200/70 hover:bg-neutral-300 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Kapat (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bubble Content Body */}
            <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3.5 text-xs max-h-[300px]">
              {bubbleStores.length > 0 ? (
                /* STORE CARDS IN THIS CITY */
                bubbleStores.map((store) => (
                  <div
                    key={store.id}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2 hover:border-[#C5A880]/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <h4 className="font-semibold text-neutral-900 text-xs leading-snug">
                          {store.name}
                        </h4>
                        {store.district && (
                          <span className="text-[10px] text-neutral-500 font-medium">
                            {store.district}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(store)}
                        className="text-neutral-400 hover:text-neutral-800 p-1 transition-colors"
                        title="Adresi Kopyala"
                      >
                        {copiedStoreId === store.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-neutral-600 leading-relaxed font-light flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </p>

                    {store.hours && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-light">
                        <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{store.hours}</span>
                      </div>
                    )}

                    {store.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-800 font-medium">
                        <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                        <a href={`tel:${store.phone}`} className="hover:underline">
                          {store.phone}
                        </a>
                      </div>
                    )}

                    {/* Action buttons inside bubble */}
                    <div className="pt-2 border-t border-neutral-200/60 flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${store.name} ${store.address}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] font-medium"
                      >
                        <span>Yol Tarifi</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>

                      <a
                        href={`https://wa.me/905324194151?text=${encodeURIComponent(
                          `Merhaba, ${activeBubbleCity} ${store.name} mağazanız hakkında bilgi almak istiyorum.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] font-medium"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>

                      {onScrollToStore && (
                        <button
                          type="button"
                          onClick={() => {
                            handleCloseBubble();
                            onScrollToStore(store.id);
                          }}
                          className="py-1.5 px-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-[10px] font-medium transition-colors"
                          title="Aşağıdaki Mağaza Kartına Kaydır"
                        >
                          Karta Git
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                /* NO PHYSICAL STORE IN THIS PROVINCE - FACTORY DIRECT MESSAGE */
                <div className="space-y-3 py-1">
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed space-y-1.5">
                    <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{activeBubbleCity} İlimizde Fiziksel Mağazamız Bulunmamaktadır.</span>
                    </p>
                    <p className="text-neutral-600 font-light">
                      Ermay Mobilya doğrudan üreticidir. İstanbul üretim tesislerimizden{' '}
                      <strong>{activeBubbleCity}</strong> ve tüm Türkiye geneline sigortalı nakliye, randevulu teslimat ve fabrika satış fiyatı avantajıyla gönderim sağlanmaktadır.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/905324194151?text=${encodeURIComponent(
                        `Merhaba, ${activeBubbleCity} teslimatı, fabrika satış fiyatları ve nakliye koşulları hakkında bilgi almak istiyorum.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{activeBubbleCity} İçin Teslimat Bilgisi Al (WhatsApp)</span>
                    </a>

                    <a
                      href="tel:05324194151"
                      className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-[11px]"
                    >
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Fabrika Satış Destek: 0532 419 41 51</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
