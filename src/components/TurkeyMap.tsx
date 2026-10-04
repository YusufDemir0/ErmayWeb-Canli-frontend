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
} from 'lucide-react';
import type { StoreItem } from '../types';
import { TURKEY_PROVINCES, ProvinceData } from '../data/turkeyProvinces';
import { useWhatsappNumber } from '../lib/whatsapp';
import { useCMSStore } from '../stores/useCMSStore';

// İl merkezleri: data/turkeyProvinces.ts path'lerinden alan ağırlıklı merkez (en büyük parça) olarak hesaplandı (viewBox 1000×422)
export const PROVINCE_CENTERS: Record<string, { x: number; y: number }> = {
  'Adana': { x: 517.8, y: 307.1 },
  'Adıyaman': { x: 647.5, y: 285.4 },
  'Afyonkarahisar': { x: 282.3, y: 235.8 },
  'Aksaray': { x: 434.6, y: 250.4 },
  'Amasya': { x: 522.9, y: 108.0 },
  'Ankara': { x: 375.2, y: 164.6 },
  'Antalya': { x: 295.7, y: 345.3 },
  'Ardahan': { x: 857.2, y: 82.5 },
  'Artvin': { x: 811.8, y: 82.7 },
  'Aydın': { x: 157.0, y: 288.7 },
  'Ağrı': { x: 879.0, y: 178.4 },
  'Balıkesir': { x: 150.4, y: 171.6 },
  'Bartın': { x: 371.0, y: 50.8 },
  'Batman': { x: 793.2, y: 273.1 },
  'Bayburt': { x: 736.9, y: 134.0 },
  'Bilecik': { x: 256.3, y: 147.2 },
  'Bingöl': { x: 759.7, y: 208.9 },
  'Bitlis': { x: 840.0, y: 240.6 },
  'Bolu': { x: 328.8, y: 113.8 },
  'Burdur': { x: 256.0, y: 308.4 },
  'Bursa': { x: 204.9, y: 144.2 },
  'Denizli': { x: 216.6, y: 288.8 },
  'Diyarbakır': { x: 742.5, y: 265.9 },
  'Düzce': { x: 311.7, y: 94.4 },
  'Edirne': { x: 88.3, y: 75.4 },
  'Elazığ': { x: 699.4, y: 232.2 },
  'Erzincan': { x: 693.8, y: 171.4 },
  'Erzurum': { x: 799.5, y: 147.9 },
  'Eskişehir': { x: 303.8, y: 176.2 },
  'Gaziantep': { x: 601.0, y: 328.1 },
  'Giresun': { x: 659.4, y: 115.3 },
  'Gümüşhane': { x: 696.7, y: 131.7 },
  'Hakkari': { x: 919.5, y: 304.7 },
  'Hatay': { x: 548.0, y: 366.3 },
  'Isparta': { x: 296.5, y: 278.0 },
  'Iğdır': { x: 916.2, y: 159.8 },
  'Kahramanmaraş': { x: 583.2, y: 278.0 },
  'Karabük': { x: 376.8, y: 77.3 },
  'Karaman': { x: 404.5, y: 328.5 },
  'Kars': { x: 872.2, y: 123.5 },
  'Kastamonu': { x: 426.0, y: 58.1 },
  'Kayseri': { x: 528.6, y: 234.3 },
  'Kilis': { x: 587.6, y: 345.8 },
  'Kocaeli': { x: 247.0, y: 97.1 },
  'Konya': { x: 375.7, y: 270.3 },
  'Kütahya': { x: 231.2, y: 197.3 },
  'Kırklareli': { x: 128.8, y: 45.6 },
  'Kırıkkale': { x: 426.3, y: 160.8 },
  'Kırşehir': { x: 448.4, y: 192.8 },
  'Malatya': { x: 637.0, y: 242.8 },
  'Manisa': { x: 165.0, y: 227.6 },
  'Mardin': { x: 770.0, y: 311.7 },
  'Mersin': { x: 433.7, y: 351.5 },
  'Muğla': { x: 179.1, y: 332.1 },
  'Muş': { x: 813.9, y: 211.6 },
  'Nevşehir': { x: 474.2, y: 224.9 },
  'Niğde': { x: 474.7, y: 277.7 },
  'Ordu': { x: 609.4, y: 101.8 },
  'Osmaniye': { x: 549.8, y: 317.1 },
  'Rize': { x: 766.4, y: 93.0 },
  'Sakarya': { x: 275.2, y: 105.9 },
  'Samsun': { x: 537.5, y: 75.4 },
  'Siirt': { x: 834.0, y: 278.6 },
  'Sinop': { x: 483.1, y: 49.2 },
  'Sivas': { x: 600.3, y: 176.7 },
  'Tekirdağ': { x: 127.8, y: 82.9 },
  'Tokat': { x: 564.1, y: 127.8 },
  'Trabzon': { x: 717.0, y: 101.6 },
  'Tunceli': { x: 701.7, y: 200.9 },
  'Uşak': { x: 221.2, y: 241.1 },
  'Van': { x: 896.7, y: 241.9 },
  'Yalova': { x: 210.5, y: 114.7 },
  'Yozgat': { x: 501.1, y: 171.8 },
  'Zonguldak': { x: 340.6, y: 71.5 },
  'Çanakkale': { x: 99.8, y: 152.2 },
  'Çankırı': { x: 415.0, y: 108.5 },
  'Çorum': { x: 472.3, y: 116.3 },
  'İstanbul': { x: 183.6, y: 76.0 },
  'İzmir': { x: 123.9, y: 243.2 },
  'Şanlıurfa': { x: 683.9, y: 318.4 },
  'Şırnak': { x: 848.0, y: 305.7 },
};

// Bölge sınır kutuları (aynı path verisinden): [minX, minY, maxX, maxY]
export const REGION_BOUNDS: Record<string, [number, number, number, number]> = {
  akdeniz: [216.3, 235.8, 621.0, 403.1],
  guneydogu: [557.8, 228.8, 888.2, 356.0],
  ege: [72.5, 156.1, 333.2, 375.3],
  doguanadolu: [594.5, 51.7, 954.5, 335.3],
  karadeniz: [279.6, 19.2, 846.8, 158.3],
  icanadolu: [257.9, 82.4, 667.5, 367.1],
  marmara: [45.5, 19.3, 297.1, 209.8],
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

const VIEW_W = 1000;
const VIEW_H = 422;

/** Bölgeyi tuvale sığdıran dönüşüm (kenarda komşu bölgeler de görünsün diye %18 pay bırakılır) */
const regionTransform = (regionId: string): { scale: number; x: number; y: number } => {
  const b = REGION_BOUNDS[regionId];
  if (!b) return { scale: 1, x: 0, y: 0 };
  const w = b[2] - b[0];
  const h = b[3] - b[1];
  const scale = Math.min(3.2, Math.min(VIEW_W / (w * 1.18), VIEW_H / (h * 1.18)));
  const cx = (b[0] + b[2]) / 2;
  const cy = (b[1] + b[3]) / 2;
  return { scale, x: VIEW_W / 2 - cx * scale, y: VIEW_H / 2 - cy * scale };
};

export const REGION_TRANSFORMS: Record<string, { scale: number; x: number; y: number }> = Object.fromEntries(
  Object.keys(REGION_BOUNDS).map((id) => [id, regionTransform(id)])
);

/** Bölge sınır kutusunun ekranda görünen kısmının ortası (ekran = viewBox koordinatı); görünür alan çok küçükse null */
const visibleRegionLabelPos = (
  regionId: string,
  t: { scale: number; x: number; y: number }
): { x: number; y: number } | null => {
  const b = REGION_BOUNDS[regionId];
  if (!b) return null;
  const margin = 24;
  const x0 = Math.max(b[0] * t.scale + t.x, margin);
  const y0 = Math.max(b[1] * t.scale + t.y, margin);
  const x1 = Math.min(b[2] * t.scale + t.x, VIEW_W - margin);
  const y1 = Math.min(b[3] * t.scale + t.y, VIEW_H - margin);
  if (x1 - x0 < 60 || y1 - y0 < 28) return null;
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
};

// Bölge görünümünde seçili olmayan bölgeler tek renk alan olarak çizilir (il sınırları gizlenir)
const REGION_FILL = '#EFE7D6';
const REGION_FILL_HOVER = '#E5D9C0';
const REGION_BORDER = '#B9A988';

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
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const [internalBubbleCity, setInternalBubbleCity] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const contactInfo = useCMSStore((state) => state.contactInfo);
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

  // Bölge başına mağaza sayısı (bölge etiketlerinde gösterilir)
  const regionStoreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const prov of TURKEY_PROVINCES) {
      const n = cityStoresMap.get(prov.name.toLowerCase())?.length || 0;
      if (n) counts[prov.region] = (counts[prov.region] || 0) + n;
    }
    return counts;
  }, [cityStoresMap]);

  const activeCityNorm = (selectedCityName || activeBubbleCity || '').trim().toLowerCase();

  // Dynamic smooth GPU transform (translate & scale on fixed 1000x422 canvas)
  const currentTransform = useMemo(() => {
    if (activeRegionId && REGION_TRANSFORMS[activeRegionId]) {
      return REGION_TRANSFORMS[activeRegionId];
    }
    return { scale: 1, x: 0, y: 0 };
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
      className="relative w-full bg-white rounded-xs border border-line p-3.5 sm:p-5 overflow-hidden transition-all"
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
          <span className="w-2.5 h-2.5 rounded-full bg-brand border border-ink" />
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
              className="text-xs font-medium text-wood-dark hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-full transition-colors ml-1 cursor-pointer"
            >
              Tüm Türkiye
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-soft border border-line-strong" />
            <span className="hidden sm:inline">Mağaza Var</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand border border-ink" />
            <span>Seçili İl</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EFE7D6] border border-[#B9A988]" />
            <span className="hidden sm:inline">Diğer bölgeler (tıklayın)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas (Hardware Accelerated, Smooth Transition) */}
      <div
        className="relative w-full aspect-[2.35/1] max-h-[380px] sm:max-h-[440px] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          viewBox="0 0 1000 422"
          className="w-full h-full overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
        >
          <g
            id="map-zoom-transform-group"
            style={{
              transform: `translate(${currentTransform.x}px, ${currentTransform.y}px) scale(${currentTransform.scale})`,
              transformOrigin: '0 0',
              transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
            }}
          >
            {/* 1) Diğer bölgeler: her bölge önce kalın sınırla, sonra aynı renkte iç çizgiyle çizilir.
                   Böylece il sınırları kaybolur, yalnız bölge dış hattı kalır. */}
            {activeRegionId &&
              Object.keys(REGION_NAMES)
                .filter((regionId) => regionId !== activeRegionId)
                .map((regionId) => {
                  const provs = TURKEY_PROVINCES.filter((p) => p.region === regionId);
                  const isHover = hoveredRegion === regionId;
                  const fill = isHover ? REGION_FILL_HOVER : REGION_FILL;
                  return (
                    <g
                      key={regionId}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRegion(regionId)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectRegion) onSelectRegion(regionId);
                      }}
                    >
                      {provs.map((prov) => (
                        <path key={`b-${prov.id}`} d={prov.d} fill={fill} stroke={REGION_BORDER} strokeWidth={1.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                      ))}
                      {provs.map((prov) => (
                        <path key={`f-${prov.id}`} d={prov.d} fill={fill} stroke={fill} strokeWidth={1.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                      ))}
                    </g>
                  );
                })}

            {/* 2) Seçili bölge (ya da tam görünümde tüm Türkiye): il il, mağazalı iller vurgulu */}
            <g id="turkey-provinces">
              {TURKEY_PROVINCES.filter((prov) => !activeRegionId || prov.region === activeRegionId).map((prov) => {
                const provNorm = prov.name.toLowerCase();
                const hasStores = cityStoresMap.has(provNorm);
                const isSelected = activeCityNorm === provNorm;

                let fill = '#FFFFFF';
                let stroke = '#D8CCB4';
                let strokeWidth = 0.8;
                if (hasStores) {
                  fill = '#FFF3BF'; // marka sarısının açık tonu
                  stroke = '#B9A988';
                  strokeWidth = 1;
                }
                if (isSelected) {
                  fill = '#FECC00';
                  stroke = '#161514';
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

            {/* 4) Mağaza işaretleri: yalnız seçili bölgede (tam görünümde hepsi). Boyut zoom'dan bağımsız. */}
            {TURKEY_PROVINCES.filter(
              (p) => cityStoresMap.has(p.name.toLowerCase()) && (!activeRegionId || p.region === activeRegionId)
            ).map((prov) => {
              const center = PROVINCE_CENTERS[prov.name];
              if (!center) return null;
              const isSelected = activeCityNorm === prov.name.toLowerCase();
              return (
                <g
                  key={`pin-${prov.id}`}
                  transform={`translate(${center.x}, ${center.y}) scale(${1 / currentTransform.scale})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCityClick(prov);
                  }}
                >
                  <circle r={isSelected ? 9 : 7} fill="#161514" stroke="#FECC00" strokeWidth={isSelected ? 3 : 2} />
                  <circle r={2.5} fill="#FECC00" />
                  <text
                    y={-13}
                    textAnchor="middle"
                    fill="#161514"
                    fontSize="13"
                    fontWeight="700"
                    paintOrder="stroke"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    className="font-sans select-none pointer-events-none"
                  >
                    {prov.name}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Diğer bölgelerin adları: zoom grubunun dışında, ekran koordinatında; bölgenin görünen kısmının ortasına
              yerleşir ve bölge değişiminde aynı eğriyle kayar. Tıklanınca o bölgeye geçilir. */}
          {activeRegionId &&
            Object.keys(REGION_NAMES)
              .filter((regionId) => regionId !== activeRegionId)
              .map((regionId) => {
                const pos = visibleRegionLabelPos(regionId, currentTransform);
                if (!pos) return null;
                const count = regionStoreCounts[regionId] || 0;
                return (
                  <g
                    key={`label-${regionId}`}
                    style={{
                      transform: `translate(${pos.x}px, ${pos.y}px)`,
                      transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredRegion(regionId)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectRegion) onSelectRegion(regionId);
                    }}
                  >
                    <text textAnchor="middle" fill="#523C22" fontSize="15" fontWeight="700" className="font-sans select-none" paintOrder="stroke" stroke="#EFE7D6" strokeWidth="4">
                      {REGION_NAMES[regionId]}
                    </text>
                    <text y="17" textAnchor="middle" fill="#6E5231" fontSize="12" className="font-sans select-none" paintOrder="stroke" stroke="#EFE7D6" strokeWidth="4">
                      {count > 0 ? `${count} mağaza · görüntüle` : 'görüntüle'}
                    </text>
                  </g>
                );
              })}
        </svg>

        {/* Hovered city tooltip (lightweight) */}
        {hoveredCity && !activeBubbleCity && (
          <div className="absolute top-2 left-2 bg-neutral-900/90 text-white text-xs px-3 py-1.5 rounded-xs pointer-events-none transition-opacity flex items-center gap-2">
            <span className="font-semibold">{hoveredCity}</span>
            <span className="text-neutral-500 text-xs">
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
            className="absolute z-30 inset-x-2 bottom-2 md:inset-x-auto md:bottom-auto md:top-3 md:right-3 md:w-96 max-h-[88%] bg-white/98 rounded-xs shadow-2xl border border-line flex flex-col overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform' }}
          >
            {/* Bubble Header */}
            <div className="p-3.5 sm:p-4 border-b border-line flex items-center justify-between bg-neutral-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-wood/20 flex items-center justify-center text-wood-dark">
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
                    <span className="text-xs font-medium text-neutral-500">
                      ({bubbleProv ? REGION_NAMES[bubbleProv.region] || bubbleProv.region : 'Türkiye'})
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${
                    bubbleStores.length > 0 ? 'text-ok' : 'text-neutral-500'
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
                    className="p-3 rounded-xs bg-neutral-50 border border-line space-y-2 hover:border-wood/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <h4 className="font-semibold text-neutral-900 text-xs leading-snug">
                          {store.name}
                        </h4>
                        {store.district && (
                          <span className="text-xs text-neutral-500 font-medium">
                            {store.district}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(store)}
                        className="text-neutral-500 hover:text-neutral-800 p-1 transition-colors"
                        title="Adresi Kopyala"
                      >
                        {copiedStoreId === store.id ? (
                          <Check className="w-3.5 h-3.5 text-ok" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </p>

                    {store.hours && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
                        <span>{store.hours}</span>
                      </div>
                    )}

                    {store.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-800 font-medium">
                        <Phone className="w-3 h-3 text-neutral-500 shrink-0" />
                        <a href={`tel:${store.phone}`} className="hover:underline">
                          {store.phone}
                        </a>
                      </div>
                    )}

                    {/* Action buttons inside bubble */}
                    <div className="pt-2 border-t border-line flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${store.name} ${store.address}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xs transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                      >
                        <span>Yol Tarifi</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>

                      <a
                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                          `Merhaba, ${activeBubbleCity} ${store.name} mağazanız hakkında bilgi almak istiyorum.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-xs transition-colors flex items-center justify-center gap-1 text-xs font-medium"
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
                          className="py-1.5 px-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xs text-xs font-medium transition-colors"
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
                  <div className="bg-paper border border-line rounded-xs p-3 text-xs text-wood-dark leading-relaxed space-y-1.5">
                    <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-wood" />
                      <span>{activeBubbleCity} İlimizde Fiziksel Mağazamız Bulunmamaktadır.</span>
                    </p>
                    <p className="text-neutral-600">
                      Ermay Mobilya doğrudan üreticidir. İstanbul üretim tesislerimizden{' '}
                      <strong>{activeBubbleCity}</strong> ve tüm Türkiye geneline sigortalı nakliye, randevulu teslimat ve fabrika satış fiyatı avantajıyla gönderim sağlanmaktadır.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `Merhaba, ${activeBubbleCity} teslimatı, fabrika satış fiyatları ve nakliye koşulları hakkında bilgi almak istiyorum.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-whatsapp hover:bg-whatsapp-dark text-white font-medium rounded-xs transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{activeBubbleCity} İçin Teslimat Bilgisi Al (WhatsApp)</span>
                    </a>

                    <a
                      href={`tel:${(contactInfo?.phone || '').replace(/[^0-9+]/g, '') || waNumber}`}
                      className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xs transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Destek hattı: {contactInfo?.phone || waNumber}</span>
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
