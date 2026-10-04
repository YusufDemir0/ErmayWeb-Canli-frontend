'use client';

import React, { useState, useEffect, use, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw, Star, 
  CheckCircle2, ArrowLeft, Layers, Ruler, Loader2, Compass, 
  Sparkles, Eye, Check, MessageSquare, CreditCard, Box,
  Info, CornerDownRight, Send, CheckCircle, Award, Factory,
  Tag, PlusCircle, Percent, CheckSquare, Square
} from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { productService } from '../services/productService';
import apiClient from '../services/api';
import { getProductImages } from '../lib/productImages';
import type { Product, ProductColorVariant, ProductSetPiece } from '../types';
import ProductCard from './ProductCard';
import { toast } from '../stores/useToastStore';
import { useWhatsappNumber } from '../lib/whatsapp';

interface ProductDetailClientProps {
  id: string;
  initialProduct?: Product | null;
}

export interface LuxurySwatch extends ProductColorVariant {
  category: 'deri' | 'nubuk' | 'keten' | 'boucle' | 'ahsap';
  categoryLabel: string;
  description: string;
}

// 1. Sınıf Mimari ve Lüks Mobilya Kumaş / Deri / Ahşap Kartelası
export const LUXURY_SWATCHES: LuxurySwatch[] = [
  { id: 'taba-deri', name: 'İtalyan Taba Hakiki Deri', color: '#8A4B20', hex: '#8A4B20', tag: 'Hakiki Deri', category: 'deri', categoryLabel: 'Hakiki Deri', description: '1. Sınıf nefes alabilir İtalyan dana derisi. Pürüzsüz tuşe ve doğal damarlı doku.' },
  { id: 'siyah-deri', name: 'Asil Siyah Hakiki Deri', color: '#18181B', hex: '#18181B', tag: 'Hakiki Deri', category: 'deri', categoryLabel: 'Hakiki Deri', description: 'Yüksek sürtünme dayanımlı, lüks mat siyah deri yüzeyi.' },
  { id: 'antrasit-nubuk', name: 'Antrasit Mat Nubuk', color: '#2C323B', hex: '#2C323B', tag: 'Nubuk', category: 'nubuk', categoryLabel: 'Mat Nubuk', description: 'Su ve leke itici mikrofiber teknolojili yumuşak dokulu nubuk.' },
  { id: 'duman-nubuk', name: 'Duman Grisi Nubuk', color: '#4B5563', hex: '#4B5563', tag: 'Nubuk', category: 'nubuk', categoryLabel: 'Mat Nubuk', description: 'Yumuşak tuşeli kadifemsi nubuk dokusu, kolay temizlenebilir.' },
  { id: 'krem-keten', name: 'Krem Doğal Dokuma Keten', color: '#E4DAC6', hex: '#E4DAC6', tag: 'Keten', category: 'keten', categoryLabel: 'Doğal Keten', description: '%100 doğal keten ve pamuk lifi harmanı. Terletmez ve nefes alır.' },
  { id: 'kum-keten', name: 'Kum Beji Doğal Keten', color: '#D4C5B0', hex: '#D4C5B0', tag: 'Keten', category: 'keten', categoryLabel: 'Doğal Keten', description: 'Aşınmaya dayanıklı sık dokuma keten kumaş, sıcak tonlar.' },
  { id: 'vizon-boucle', name: 'Vizon Lüks Bouclé', color: '#877569', hex: '#877569', tag: 'Bouclé', category: 'boucle', categoryLabel: 'Lüks Buklet', description: 'Son trend sıcak ve kabarık dokulu buklet kumaş.' },
  { id: 'zumrut-kadife', name: 'Zümrüt İtalyan Kadife', color: '#1B382B', hex: '#1B382B', tag: 'Kadife', category: 'boucle', categoryLabel: 'İtalyan Kadife', description: 'Zengin parlaklık ve lüks yumuşaklık sunan asil kadife döşeme.' },
  { id: 'ceviz-ahsap', name: 'Doğal Amerikan Ceviz', color: '#5C381E', hex: '#5C381E', tag: 'Ahşap', category: 'ahsap', categoryLabel: 'Masif Ahşap', description: 'Doğal damarlı Amerikan ceviz kaplama, fırınlanmış dayanıklı gövde.' },
  { id: 'mese-ahsap', name: 'Açık İskandinav Meşe', color: '#C8A87B', hex: '#C8A87B', tag: 'Ahşap', category: 'ahsap', categoryLabel: 'Masif Ahşap', description: 'Mat vernikli İskandinav açık meşe masif ahşap yüzey.' },
];

const COLOR_HEX_MAP: Record<string, { hex: string; category: LuxurySwatch['category']; tag: string }> = {
  siyah: { hex: '#18181B', category: 'deri', tag: 'Deri / Metal' },
  antrasit: { hex: '#2C323B', category: 'nubuk', tag: 'Mat Nubuk' },
  gri: { hex: '#6B7280', category: 'nubuk', tag: 'Doku Kumaş' },
  duman: { hex: '#4B5563', category: 'nubuk', tag: 'Duman Grisi' },
  beyaz: { hex: '#F4F4F5', category: 'keten', tag: 'Keten / Lake' },
  krem: { hex: '#E4DAC6', category: 'keten', tag: 'Doğal Keten' },
  bej: { hex: '#D4C5B0', category: 'keten', tag: 'Doğal Keten' },
  kum: { hex: '#D4C5B0', category: 'keten', tag: 'Doğal Keten' },
  taba: { hex: '#8A4B20', category: 'deri', tag: 'Hakiki Deri' },
  kahve: { hex: '#5C381E', category: 'deri', tag: 'Kahverengi' },
  ceviz: { hex: '#5C381E', category: 'ahsap', tag: 'Masif Ahşap' },
  mese: { hex: '#C8A87B', category: 'ahsap', tag: 'Masif Ahşap' },
  meşe: { hex: '#C8A87B', category: 'ahsap', tag: 'Masif Ahşap' },
  vizon: { hex: '#877569', category: 'boucle', tag: 'Lüks Buklet' },
  zumrut: { hex: '#1B382B', category: 'boucle', tag: 'İtalyan Kadife' },
  zümrüt: { hex: '#1B382B', category: 'boucle', tag: 'İtalyan Kadife' },
  haki: { hex: '#2D4A3E', category: 'boucle', tag: 'Doğal Kumaş' },
  yesil: { hex: '#2D4A3E', category: 'boucle', tag: 'Doğal Kumaş' },
  yeşil: { hex: '#2D4A3E', category: 'boucle', tag: 'Doğal Kumaş' },
  lacivert: { hex: '#1E3A8A', category: 'deri', tag: 'Lüks Döşeme' },
  mavi: { hex: '#2563EB', category: 'deri', tag: 'Lüks Döşeme' },
  bordo: { hex: '#7F1D1D', category: 'deri', tag: 'Özel Seri' },
  krom: { hex: '#D1D5DB', category: 'ahsap', tag: 'Metal Aksam' },
  gold: { hex: '#D4AF37', category: 'ahsap', tag: 'Metal Aksam' },
};

// Sıra önemlidir: "nubuk" deri ailesindendir ama ayrı kategoridir, bu yüzden "deri"den önce aranır.
const MATERIAL_KEYWORDS: Array<{ keywords: string[]; category: LuxurySwatch['category']; tag: string }> = [
  { keywords: ['nubuk'], category: 'nubuk', tag: 'Mat Nubuk' },
  { keywords: ['deri', 'leather'], category: 'deri', tag: 'Hakiki Deri' },
  { keywords: ['keten'], category: 'keten', tag: 'Doğal Keten' },
  { keywords: ['kadife'], category: 'boucle', tag: 'İtalyan Kadife' },
  { keywords: ['buklet', 'boucle'], category: 'boucle', tag: 'Lüks Buklet' },
  { keywords: ['ahşap', 'ahsap', 'masif', 'meşe', 'mese', 'ceviz', 'kaplama'], category: 'ahsap', tag: 'Masif Ahşap' },
];

export function resolveSwatchForColor(col: string | ProductColorVariant, idx = 0): LuxurySwatch {
  if (typeof col === 'object' && col !== null) {
    const existing = LUXURY_SWATCHES.find((s) => s.id === col.id || s.name.toLowerCase() === col.name?.toLowerCase());
    if (existing) return existing;
    return {
      id: col.id || `col-${idx}`,
      name: col.name || 'Özel Renk',
      color: col.hex || col.color || '#4B5563',
      hex: col.hex || col.color || '#4B5563',
      tag: col.tag || 'Özel Seri',
      category: 'deri',
      categoryLabel: 'Döşeme',
      description: `${col.name || 'Özel Renk'} döşeme seçeneği.`,
    };
  }

  const str = String(col || '').trim();
  const lower = str.toLowerCase();

  const matched = LUXURY_SWATCHES.find(
    (s) => s.name.toLowerCase().includes(lower) || s.id.toLowerCase().includes(lower)
  );
  if (matched) return matched;

  let foundHex = '#4B5563';
  let foundCat: LuxurySwatch['category'] = 'deri';
  let foundTag = 'Standart Seri';

  for (const [key, val] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(key)) {
      foundHex = val.hex;
      foundCat = val.category;
      foundTag = val.tag;
      break;
    }
  }

  // Malzeme kelimesi renk kelimesinden önceliklidir: "Antrasit Deri" bir deridir, "Mat Nubuk" değil.
  const materialMatch = MATERIAL_KEYWORDS.find((m) => m.keywords.some((kw) => lower.includes(kw)));
  if (materialMatch) {
    foundCat = materialMatch.category;
    foundTag = materialMatch.tag;
  }

  return {
    id: `col-${idx}-${lower.replace(/\s+/g, '-')}`,
    name: str || 'Standart Renk',
    color: foundHex,
    hex: foundHex,
    tag: foundTag,
    category: foundCat,
    categoryLabel:
      foundCat === 'ahsap'
        ? 'Ahşap & Metal'
        : foundCat === 'keten'
        ? 'Doğal Keten'
        : foundCat === 'nubuk'
        ? 'Mat Nubuk'
        : foundCat === 'boucle'
        ? 'Lüks Kumaş'
        : 'Döşeme',
    description: `${str || 'Standart Seri'} 1. sınıf fabrika standart kaplaması.`,
  };
}

// Module-level cached price formatter
const detailCurrencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

export default function ProductDetailClient({ id, initialProduct }: ProductDetailClientProps) {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const router = useRouter();
  const storeProducts = useCMSStore((state) => state.products);
  const contactInfo = useCMSStore((state) => state.contactInfo);
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));

  const [product, setProduct] = useState<Product | null>(() => {
    return initialProduct || storeProducts.find((p) => p.id === id || p.slug === id) || null;
  });
  const [loading, setLoading] = useState(!initialProduct && !product);
  const [notFoundState, setNotFoundState] = useState(!initialProduct && !product && initialProduct === null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSwatch, setSelectedSwatch] = useState<ProductColorVariant>(() => {
    const rawColors = initialProduct?.colors;
    if (rawColors && rawColors.length > 0) {
      return resolveSwatchForColor(rawColors[0], 0);
    }
    return LUXURY_SWATCHES[0];
  });
  const [quantity, setQuantity] = useState(1);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery'>('desc');
  const [activeFabricCategory, setActiveFabricCategory] = useState<'all' | 'deri' | 'nubuk' | 'keten' | 'boucle' | 'ahsap'>('all');
  const [selectedComplementaryIds, setSelectedComplementaryIds] = useState<string[]>([]);
  const [selectedSetPieceTitles, setSelectedSetPieceTitles] = useState<string[]>([]);

  // Synchronize modular set pieces when product loads or updates
  useEffect(() => {
    if (product?.setPieces && product.setPieces.length > 0) {
      setSelectedSetPieceTitles(product.setPieces.map((p) => p.title));
    } else {
      setSelectedSetPieceTitles([]);
    }
  }, [product?.id]);

  const toggleSetPiece = (title: string) => {
    setSelectedSetPieceTitles((prev) => {
      if (prev.includes(title)) {
        if (prev.length <= 1) return prev; // At least one piece remains in set
        return prev.filter((t) => t !== title);
      } else {
        return [...prev, title];
      }
    });
  };

  // Hover Lens Zoom States - zero-re-render RAF DOM mutation for 60-120 FPS
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !zoomImageRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      if (zoomImageRef.current) {
        zoomImageRef.current.style.transformOrigin = `${x}% ${y}%`;
      }
    });
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    if (zoomImageRef.current) {
      zoomImageRef.current.style.transformOrigin = 'center center';
    }
  };

  // Resilient async load from REST API if not found in store or initial props immediately
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      if (initialProduct.colors && initialProduct.colors.length > 0) {
        setSelectedSwatch(resolveSwatchForColor(initialProduct.colors[0], 0));
      }
      setLoading(false);
      return;
    }

    let isMounted = true;
    const storeItem = storeProducts.find((p) => p.id === id || p.slug === id);
    if (storeItem) {
      setProduct(storeItem);
      if (storeItem.colors && storeItem.colors.length > 0) {
        setSelectedSwatch(resolveSwatchForColor(storeItem.colors[0], 0));
      }
      setLoading(false);
      return;
    }

    async function loadProduct() {
      try {
        const fetched = await productService.getProductById(id);
        if (isMounted) {
          if (fetched) {
            setProduct(fetched);
            if (fetched.colors && fetched.colors.length > 0) {
              setSelectedSwatch(resolveSwatchForColor(fetched.colors[0], 0));
            }
          } else {
            setNotFoundState(true);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setNotFoundState(true);
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, storeProducts]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FCFAF6] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-[#C5A880] animate-spin" />
        <span className="text-xs font-semibold text-neutral-500 tracking-widest uppercase">
          Ürün Tasarımı Yükleniyor...
        </span>
      </div>
    );
  }

  if (notFoundState || !product) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FCFAF6] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-6 bg-white border border-[#EAE3D2] text-neutral-800 rounded-sm max-w-md space-y-4 shadow-xs">
          <h2 className="font-serif text-xl font-bold uppercase tracking-tight">Koleksiyon Bulunamadı</h2>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Aradığınız mobilya modeli üretimden kaldırılmış veya geçici olarak yayından alınmış olabilir.
          </p>
          <Link
            href="/katalog"
            className="inline-block bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-xs transition-colors"
          >
            2026 Kataloğuna Dön
          </Link>
        </div>
      </div>
    );
  }

  const imagesList = getProductImages(product);
  const currentImage = imagesList[selectedImageIndex] || imagesList[0];

  const productColors: LuxurySwatch[] = useMemo(() => {
    if (product.colors && product.colors.length > 0) {
      return product.colors.map((c, idx) => resolveSwatchForColor(c, idx));
    }
    return LUXURY_SWATCHES;
  }, [product.colors]);

  useEffect(() => {
    if (productColors.length > 0) {
      const exists = productColors.some((s) => s.name === selectedSwatch.name || s.id === selectedSwatch.id);
      if (!exists) {
        setSelectedSwatch(productColors[0]);
      }
    }
  }, [productColors, selectedSwatch]);

  const displayedSwatches = useMemo(() => {
    if (activeFabricCategory === 'all') return productColors;
    return productColors.filter((s) => s.category === activeFabricCategory);
  }, [productColors, activeFabricCategory]);

  const handleSelectColor = (swatch: ProductColorVariant) => {
    setSelectedSwatch(swatch);
    if (swatch.image) {
      const foundIdx = imagesList.findIndex(img => img === swatch.image);
      if (foundIdx !== -1) {
        setSelectedImageIndex(foundIdx);
      }
    }
  };

  const handleAddToCartClick = () => {
    const customizedProduct = {
      ...product,
      selectedColor: selectedSwatch.name,
      selectedVariant: selectedSwatch.id || selectedSwatch.name,
      variantId: selectedSwatch.id || undefined,
      selectedPieces: selectedSetPieceTitles.length > 0 ? selectedSetPieceTitles : undefined,
    };
    addToCart(customizedProduct, quantity);
    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 3000);
  };

  const handleBuyNowClick = () => {
    const customizedProduct = {
      ...product,
      selectedColor: selectedSwatch.name,
      selectedVariant: selectedSwatch.id || selectedSwatch.name,
      variantId: selectedSwatch.id || undefined,
      selectedPieces: selectedSetPieceTitles.length > 0 ? selectedSetPieceTitles : undefined,
    };
    addToCart(customizedProduct, quantity);
    router.push('/talep');
  };

  const productCatSlug = typeof product.category === 'object' && product.category !== null 
    ? (product.category as { slug?: string }).slug 
    : String(product.category || '');

  const relatedProducts = storeProducts
    .filter((p) => {
      const cSlug = typeof p.category === 'object' && p.category !== null 
        ? (p.category as { slug?: string }).slug 
        : String(p.category || '');
      return cSlug === productCatSlug && p.id !== product.id;
    })
    .slice(0, 4);

  // "Takımı Tamamla" Bundle Detection
  const complementaryPieces = useMemo(() => {
    if (!product) return [];
    const firstWord = product.name.trim().split(' ')[0].toLocaleUpperCase('tr-TR');
    
    let matches = storeProducts.filter((p) => {
      if (p.id === product.id) return false;
      const pFirstWord = p.name.trim().split(' ')[0].toLocaleUpperCase('tr-TR');
      return pFirstWord === firstWord && pFirstWord.length > 2;
    });

    if (matches.length < 2) {
      const catMatches = storeProducts.filter((p) => {
        if (p.id === product.id) return false;
        if (matches.some((m) => m.id === p.id)) return false;
        const cSlug = typeof p.category === 'object' && p.category !== null 
          ? (p.category as { slug?: string }).slug 
          : String(p.category || '');
        return cSlug === productCatSlug;
      });
      matches = [...matches, ...catMatches];
    }

    return matches.slice(0, 3);
  }, [product, storeProducts, productCatSlug]);

  // Tamamlayıcı ürünler önceden işaretli GELMEZ: kullanıcı istemediği ürünleri (ör. B2B teklif paketi) fark etmeden
  // sepete eklemesin. Ürün değişince seçim sıfırlanır.
  const initializedComplementaryProductIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (product?.id && initializedComplementaryProductIdRef.current !== product.id) {
      initializedComplementaryProductIdRef.current = product.id;
      setSelectedComplementaryIds([]);
    }
  }, [product?.id]);

  const toggleComplementaryItem = (pieceId: string) => {
    setSelectedComplementaryIds((prev) =>
      prev.includes(pieceId) ? prev.filter((id) => id !== pieceId) : [...prev, pieceId]
    );
  };

  const bundleItems = useMemo(() => {
    return complementaryPieces.filter((p) => selectedComplementaryIds.includes(p.id));
  }, [complementaryPieces, selectedComplementaryIds]);

  const mainProductPrice = Number(product.price || 0);
  const bundleSubtotal = bundleItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
  const rawTotal = mainProductPrice + bundleSubtotal;
  const bundleDiscount = 0;
  const finalBundleTotal = rawTotal;

  const handleAddBundleToCart = () => {
    if (!product) return;
    const customizedMain = {
      ...product,
      selectedColor: selectedSwatch.name,
      selectedVariant: selectedSwatch.id || selectedSwatch.name,
      variantId: selectedSwatch.id || undefined,
    };
    addToCart(customizedMain, quantity);

    for (const item of bundleItems) {
      addToCart(item, 1);
    }

    toast.success(
      'Takım Sepete Eklendi',
      `${product.name} ve ${bundleItems.length} tamamlayıcı parça sepetinize eklendi.`
    );
    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 3000);
  };

  const formatPrice = (price: number) => {
    return detailCurrencyFormatter.format(price).replace('TRY', 'TL');
  };

  const cashDiscountPrice = Math.round(product.price * 0.95);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.image, product.image1, product.image2, product.image3].filter(Boolean),
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Ermay Mobilya',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: product.price,
      availability: (product.stock && product.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="w-full bg-[#FCFAF6] min-h-screen py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EAE3D2]">
          <nav className="text-xs text-neutral-400 font-light flex items-center gap-2">
            <Link href="/" className="hover:text-[#C5A880] transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/katalog" className="hover:text-[#C5A880] transition-colors">Katalog</Link>
            <span>/</span>
            <span className="text-neutral-700 font-medium">
              {typeof product.category === 'object' && product.category !== null
                ? (product.category as { name?: string }).name || (product.category as { slug?: string }).slug || ''
                : String(product.category || '')}
            </span>
            <span>/</span>
            <span className="text-[#B4966E] font-semibold truncate max-w-[200px]">{product.name}</span>
          </nav>

          <Link 
            href="/katalog" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#C5A880] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Koleksiyon Kataloğu</span>
          </Link>
        </div>

        {/* ATMACA OFIS TOP PRODUCT STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 md:p-10 rounded-sm border border-[#EAE3D2] shadow-2xs mb-12">
          
          {/* Left Column: Interactive Image Gallery with Lens Zoom */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image with Interactive Hover Magnifier */}
            <div 
              ref={imageContainerRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="relative aspect-[16/11] bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200 cursor-crosshair group select-none"
            >
              <img
                ref={zoomImageRef}
                src={currentImage}
                alt={product.name}
                style={{
                  transformOrigin: 'center center',
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                }}
                className="w-full h-full object-cover transition-transform duration-200 ease-out pointer-events-none transform-gpu will-change-transform"
              />

              {/* Zoom Instruction Badge */}
              <div className={`absolute bottom-3 right-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[9.5px] font-semibold px-2.5 py-1 rounded-xs flex items-center gap-1.5 transition-opacity duration-300 pointer-events-none ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
                <Eye className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Detay Büyüteci</span>
              </div>

              {/* Tag / Collection Badge */}
              <div className="absolute top-3 left-3 bg-[#FAF8F5]/95 backdrop-blur-xs text-neutral-900 font-bold text-[9.5px] uppercase tracking-wider px-2.5 py-1 rounded-xs border border-[#C5A880]/30 shadow-2xs">
                {product.badge || 'Doğrudan Atölye İmalatı'}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {imagesList.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-[4/3] rounded-xs overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx 
                        ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30 scale-105' 
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Dimensions Box */}
            <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-xs p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-700">
                <Ruler className="h-4 w-4 text-[#C5A880]" />
                <span className="font-bold uppercase text-[10px] tracking-wider text-neutral-500">Standart Ölçüler:</span>
                <span className="font-semibold text-neutral-900 font-mono">{product.dimensions || 'G: 220cm × D: 95cm × Y: 75cm'}</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                Standart Fabrika Seri Ölçüsü
              </span>
            </div>

          </div>

          {/* Right Column: Title, Swatches, Pricing & Actions */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Header & Title */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#C5A880] uppercase tracking-[0.25em] block">
                ERMAY MOBİLYA • İMALAT & SATIŞ
              </span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Stock / Manufacturing Status */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {product.stock && product.stock > 0 ? 'Stokta Hazır (1-2 İş Günü Sevkiyat)' : 'Fabrika Seri İmalatı (3-5 İş Günü)'}
                </span>
              </div>
            </div>

            {/* Editorial Mini Description */}
            <p className="text-xs md:text-sm text-neutral-600 font-light leading-relaxed">
              {product.description}
            </p>

            {/* Material / Leather Swatch Color Picker */}
            <div className="space-y-3 pt-1 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#C5A880]" />
                  <span>Kumaş, Deri & Ahşap Kartelası:</span>
                </label>
                <span className="text-xs font-bold text-[#C5A880]">
                  {selectedSwatch.name}
                </span>
              </div>

              {/* Doku Kategorileri Hızlı Seçim */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                {[
                  { id: 'all' as const, label: 'Tüm Kartela' },
                  { id: 'deri' as const, label: 'Hakiki Deri' },
                  { id: 'nubuk' as const, label: 'Mat Nubuk' },
                  { id: 'keten' as const, label: 'Doğal Keten' },
                  { id: 'boucle' as const, label: 'Buklet & Kadife' },
                  { id: 'ahsap' as const, label: 'Masif Ahşap' },
                ]
                  // Ürünün hiç seçeneği olmayan doku sekmeleri gösterilmez (deri koltukta "Doğal Keten" boş sekmesi gibi)
                  .filter((cat) => cat.id === 'all' || productColors.some((sw) => sw.category === cat.id))
                  .map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveFabricCategory(cat.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                      activeFabricCategory === cat.id
                        ? 'bg-[#8A4B20] text-white shadow-2xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Swatches Grid */}
              <div className="flex flex-wrap items-center gap-2">
                {displayedSwatches.map((swatch, idx) => {
                  const isSelected = selectedSwatch.name === swatch.name || selectedSwatch.id === swatch.id;
                  const swatchColor = swatch.hex || swatch.color || '#8A4B20';
                  return (
                    <button
                      key={swatch.id || idx}
                      onClick={() => handleSelectColor(swatch)}
                      className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#C5A880] bg-[#FAF8F5] ring-1 ring-[#C5A880] shadow-xs' 
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div 
                        style={{ backgroundColor: swatchColor }}
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                      />
                      <span className="text-[11px] font-semibold text-neutral-800">
                        {swatch.name}
                      </span>
                      {swatch.tag && (
                        <span className="text-[9px] text-neutral-400 font-normal">
                          ({swatch.tag})
                        </span>
                      )}
                      {isSelected && <Check className="h-3 w-3 text-[#C5A880] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Selected Fabric Description Box */}
              <div className="bg-[#FAF8F5] border border-[#EAE3D2] p-3.5 rounded-xs space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: selectedSwatch.hex || '#8A4B20' }} />
                    {selectedSwatch.name}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#EAE3D2] text-[#8A4B20]">
                    {selectedSwatch.tag || 'Özel Seri'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  {(selectedSwatch as LuxurySwatch).description || 'Ermay Mobilya atölyelerinde 1. sınıf işçilikle titizlikle uygulanan özel döşeme seçeneği.'}
                </p>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-[#FAF8F5] p-4 rounded-xs border border-[#EAE3D2] space-y-1.5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Fabrika Satış Fiyatı (%20 KDV Dahil)</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-neutral-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-neutral-500 font-normal pt-1 border-t border-[#EAE3D2]/60 flex items-center justify-between">
                <span>Fiyat Politikası:</span>
                <span className="text-[11px] text-neutral-700 font-bold">Doğrudan İmalatçı Net Liste Fiyatı</span>
              </div>
            </div>

            {/* Factory Direct & Wholesale B2B Trust Card */}
            <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-xs p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <span>🏭</span>
                  <span>Doğrudan Fabrika Satışı • Aracı Komisyonu Yok</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                  Fabrika Net Fiyatı
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#EAE3D2]/60 text-[11px]">
                <span className="text-neutral-600 font-light">
                  Şirketiniz için 3+ adet veya komple ofis kurulumu mu yapıyorsunuz?
                </span>
                <a
                  href={`https://wa.me/${waNumber}?text=Merhaba%2C%20${encodeURIComponent(product.name)}%20modelinden%20%C5%9Firketimiz%20i%C3%A7in%20adetli%2Ftoplu%20ofis%20al%C4%B1m%C4%B1%20yapmak%20istiyoruz.%20Fabrika%20iskontolu%20toptan%20fiyat%20teklifi%20alabilir%20miyiz%3F`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#8A4B20] hover:underline shrink-0 ml-2"
                >
                  Toptan İskonto İste &rarr;
                </a>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-1">
              {/* Action Buttons Row */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2 sm:gap-2.5">
                  <div className="flex items-center justify-between border border-[#EAE3D2] rounded-xs bg-[#FAF8F5] shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-2.5 text-xs font-bold text-neutral-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCartClick}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-3 px-3 sm:px-4 rounded-xs text-xs font-bold uppercase tracking-wider bg-neutral-900 hover:bg-[#C5A880] text-white transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0" />
                    <span>Sepete Ekle</span>
                  </button>

                  {/* Buy Now Button (UNTOUCHABLE: Hemen Al) */}
                  <button
                    onClick={handleBuyNowClick}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 px-3 sm:px-4 rounded-xs text-xs font-bold uppercase tracking-wider bg-[#C5A880] hover:bg-[#B4966E] text-white transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <span>Hemen Al</span>
                  </button>

                  {/* Toggle Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product)}
                    className={`p-3 rounded-xs border transition-all cursor-pointer shrink-0 ${
                      isFavorite 
                        ? 'bg-rose-50 border-rose-300 text-rose-600' 
                        : 'bg-white border-[#EAE3D2] text-neutral-600 hover:text-[#C5A880]'
                    }`}
                    aria-label="Favorilere Ekle"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* PROMINENT WHATSAPP ORDER LINE - ESNAF DÖNÜŞÜM BUTONU */}
                {(() => {
                  const setPiecesSummaryText = product.setPieces && product.setPieces.length > 0 && selectedSetPieceTitles.length > 0
                    ? `\n• Seçili Takım Parçaları: ${selectedSetPieceTitles.join(', ')} (${selectedSetPieceTitles.length}/${product.setPieces.length} Parça)`
                    : '';
                  return (
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `Merhaba Ermay Mobilya, web sitenizden "${product.name}" modeli hakkında bilgi almak ve sipariş vermek istiyorum.\n• Seçili Renk: ${selectedSwatch.name}${setPiecesSummaryText}\n• Ölçüler: ${product.dimensions || (product.widthCm ? `${product.widthCm}x${product.depthCm}x${product.heightCm} cm` : 'Standart Seri')}\n• Malzeme: ${product.material || '1. Sınıf E1 Melamin & Metal İskelet'}\n• Fiyat: ${formatPrice(product.price)}\n• Ürün Linki: https://ermaymobilya.com/urun/${product.id}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99]"
                    >
                      <MessageSquare className="h-4 w-4 fill-white text-white" />
                      <span>WhatsApp ile Sipariş Ver & Danış (Hızlı Yanıt)</span>
                    </a>
                  );
                })()}
              </div>

              {addedToCartSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Seçilen <strong>{selectedSwatch.name}</strong> seçeneği ile sepete eklendi!</span>
                </div>
              )}

              {/* DETAILED TECHNICAL SPECIFICATIONS TABLE (XYZ ÖLÇÜLER, ÇEKMECE & ÜNİTE) */}
              <div className="bg-white border border-[#EAE3D2] rounded-xs p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-[#C5A880]" />
                    <span>Mobilya Teknik Özellikleri:</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                    Standart Fabrika Seri Üretimi
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-[#FAF8F5] p-2 rounded-xs border border-neutral-200 text-center">
                    <span className="block text-[9px] font-sans uppercase font-bold text-neutral-500">Genişlik (X)</span>
                    <strong className="text-neutral-900">{product.widthCm ? `${product.widthCm} cm` : 'Standart'}</strong>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded-xs border border-neutral-200 text-center">
                    <span className="block text-[9px] font-sans uppercase font-bold text-neutral-500">Derinlik (Y)</span>
                    <strong className="text-neutral-900">{product.depthCm ? `${product.depthCm} cm` : 'Standart'}</strong>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded-xs border border-neutral-200 text-center">
                    <span className="block text-[9px] font-sans uppercase font-bold text-neutral-500">Yükseklik (Z)</span>
                    <strong className="text-neutral-900">{product.heightCm ? `${product.heightCm} cm` : 'Standart'}</strong>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded-xs border border-neutral-200 text-center">
                    <span className="block text-[9px] font-sans uppercase font-bold text-neutral-500">Çekmece Adedi</span>
                    <strong className="text-neutral-900">{product.drawerCount !== undefined ? `${product.drawerCount} Adet` : 'Yok'}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-neutral-600 pt-1 font-sans">
                  <span>Ünite / Takım Parça Sayısı: <strong>{product.unitCount || 1} Parça</strong></span>
                  <span>İmalat Malzemesi: <strong>{product.material || 'Masif Gürgen & MDF'}</strong></span>
                </div>
              </div>
            </div>

            {/* Interactive Modular Set Pieces Breakdown */}
            {product.setPieces && product.setPieces.length > 0 && (
              <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-xs p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] uppercase font-bold text-neutral-800 flex items-center gap-1.5">
                    <Box className="h-4 w-4 text-[#C5A880]" />
                    <span>Modüler Takım Parçaları:</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                    {selectedSetPieceTitles.length} / {product.setPieces.length} Parça Dahil
                  </span>
                </div>

                <div className="space-y-1.5">
                  {product.setPieces.map((piece, pIdx) => {
                    const isSelected = selectedSetPieceTitles.includes(piece.title);
                    return (
                      <div 
                        key={pIdx} 
                        onClick={() => toggleSetPiece(piece.title)}
                        className={`flex items-center justify-between text-[11px] p-2.5 rounded-xs border transition-all cursor-pointer select-none ${
                          isSelected 
                            ? 'bg-white border-[#C5A880]/70 shadow-2xs' 
                            : 'bg-neutral-50/80 border-dashed border-neutral-300 opacity-60 hover:opacity-85'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-neutral-400 bg-white'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className={`font-semibold ${isSelected ? 'text-neutral-900' : 'text-neutral-500 line-through'}`}>
                              {piece.title}
                            </span>
                            {piece.dimensions && (
                              <span className="text-neutral-400 text-[10px] ml-1.5">({piece.dimensions})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isSelected && (
                            <span className="text-[9.5px] font-bold text-[#8A4B20] bg-amber-50 px-1.5 py-0.5 rounded-xs">
                              + Dahil Et
                            </span>
                          )}
                          {piece.pieceProductId && (
                            <Link
                              href={`/urun/${piece.pieceProductId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C5A880] hover:text-[#B4966E] hover:underline"
                            >
                              <span>Ayrı İncele</span>
                              <CornerDownRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-neutral-500 font-light leading-relaxed pt-1 border-t border-[#EAE3D2]/60">
                  * Takımdan çıkarmak veya geri eklemek istediğiniz parçaların üzerine tıklayabilirsiniz. Tercihiniz sepete ve WhatsApp sipariş temsilcisine otomatik aktarılır.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* ATMACA OFIS 5-TAB DETAILED SECTION */}
        <div className="bg-white rounded-sm border border-[#EAE3D2] shadow-2xs overflow-hidden mb-16">
          
          {/* Tab Headers Bar */}
          <div className="flex border-b border-[#EAE3D2] bg-[#FAF8F5] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('desc')}
              className={`py-4 px-6 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'desc'
                  ? 'border-[#C5A880] text-neutral-900 bg-white shadow-xs'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Ürün Açıklaması
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-6 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-[#C5A880] text-neutral-900 bg-white shadow-xs'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Renk ve Ölçü Seçenekleri
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-4 px-6 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'delivery'
                  ? 'border-[#C5A880] text-neutral-900 bg-white shadow-xs'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Teslimat ve İade Koşulları
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="p-6 md:p-10">
            
            {/* TAB 1: ÜRÜN AÇIKLAMASI */}
            {activeTab === 'desc' && (
              <div className="space-y-8 animate-fade-in">
                <div className="prose max-w-none text-neutral-700 text-sm leading-relaxed space-y-4">
                  <h3 className="text-lg font-serif font-bold text-neutral-900 uppercase tracking-tight">
                    {product.name} - İmalat Detayları ve Tasarım Yaklaşımı
                  </h3>
                  <p>
                    {product.description}
                  </p>
                  <p>
                    Ermay Mobilya güvencesiyle üretilen tüm mobilyalarımız, 1. sınıf fırınlanmış gürgen ağacından imal edilen masif iskelet konstrüksiyonu, yüksek dansiteli HR soft sünger dolgusu ve leke tutmaz silinebilir lüks döşemelik kumaş/deri malzemelerle yıllarca ilk günkü formunu koruyacak şekilde üretilmektedir.
                  </p>
                </div>

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                  {(product.features || [
                    '%100 Fırınlanmış Masif Gürgen İskelet & Çelik Güçlendirme',
                    '35 DNS Yüksek Dayanımlı ve Çökmeyen HR Soft Sünger',
                    'E1 Normunda Sağlığa Zararsız Bağlantı Elemanları & Ahşap Tutkalları',
                    'Doğrudan Fabrikadan Satış & Çoklu Alım İskontosu',
                  ]).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2]">
                      <CheckCircle className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                      <span className="text-xs font-semibold text-neutral-800">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: RENK VE ÖLÇÜ SEÇENEKLERİ */}
            {activeTab === 'specs' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Dimensions Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-[#C5A880]" />
                    Ölçü Tablosu ve Spesifikasyonlar
                  </h3>
                  
                  <div className="overflow-x-auto border border-neutral-200 rounded-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] border-b border-neutral-200 text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Parça / Modül</th>
                          <th className="py-3 px-4">Genişlik (cm)</th>
                          <th className="py-3 px-4">Derinlik (cm)</th>
                          <th className="py-3 px-4">Yükseklik (cm)</th>
                          <th className="py-3 px-4">Malzeme / Yapı</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-neutral-800">
                        {product.setPieces && product.setPieces.length > 0 ? (
                          product.setPieces.map((piece, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="py-3 px-4 font-bold text-neutral-900">{piece.title}</td>
                              <td className="py-3 px-4 font-mono">{piece.dimensions?.split('x')[0] || '220 cm'}</td>
                              <td className="py-3 px-4 font-mono">{piece.dimensions?.split('x')[1] || '95 cm'}</td>
                              <td className="py-3 px-4 font-mono">{piece.dimensions?.split('x')[2] || '75 cm'}</td>
                              <td className="py-3 px-4 text-neutral-600">{product.material || 'E1 Melamin & Metal İskelet'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="hover:bg-neutral-50">
                            <td className="py-3 px-4 font-bold text-neutral-900">{product.name}</td>
                            <td className="py-3 px-4 font-mono">{product.widthCm || product.dimensionSpec?.width || '220'} cm</td>
                            <td className="py-3 px-4 font-mono">{product.depthCm || product.dimensionSpec?.depth || '95'} cm</td>
                            <td className="py-3 px-4 font-mono">{product.heightCm || product.dimensionSpec?.height || '75'} cm</td>
                            <td className="py-3 px-4 text-neutral-600">
                              <div>{product.material || '1. Sınıf E1 Melamin & Elektrostatik Metal İskelet'}</div>
                              {product.drawerCount !== undefined && product.drawerCount > 0 && (
                                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                  {product.drawerCount} Çekmeceli (Teleskopik Ray)
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Color and Fabric Options */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#C5A880]" />
                    Mevcut Döşeme & Renk Varyasyonları
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {productColors.map((col, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2]">
                        <div 
                          style={{ backgroundColor: col.hex || col.color || '#8A4B20' }}
                          className="w-7 h-7 rounded-full border border-black/10 shadow-xs flex-shrink-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-neutral-900 block">{col.name}</span>
                          <span className="text-[10px] text-neutral-500">{col.tag || 'Lüks Döşeme'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: TESLİMAT VE İADE KOŞULLARI */}
            {activeTab === 'delivery' && (
              <div className="space-y-6 animate-fade-in text-neutral-700 text-xs md:text-sm leading-relaxed">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Delivery Info */}
                  <div className="p-6 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2] space-y-3">
                    <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm uppercase">
                      <Truck className="h-5 w-5 text-[#C5A880]" />
                      <h4>Teslimat ve Profesyonel Kurulum</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-600 list-disc list-inside">
                      <li><strong>İstanbul İçi:</strong> Kendi lojistik araçlarımız ve uzman montaj kadromuzla 3-5 iş günü içinde teslimat ve montaj (ücret ve koşullar temsilcimizle netleştirilir).</li>
                      <li><strong>Tüm Türkiye:</strong> Anlaşmalı mobilya lojistik ağımızla dairenize/ofisinize kadar teslim edilir.</li>
                      <li><strong>Fabrika Seri Üretimi:</strong> Depoda hazır olmayan ürünlerimiz fabrikamızda standart seri bant imalatıyla ortalama 3-5 iş gününde hazır hale getirilerek sevk edilir.</li>
                    </ul>
                  </div>

                  {/* Return & Warranty Info */}
                  <div className="p-6 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2] space-y-3">
                    <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm uppercase">
                      <ShieldCheck className="h-5 w-5 text-[#C5A880]" />
                      <h4>14 Gün Cayma Hakkı & 2 Yıl Üretici Garantisi</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-600 list-disc list-inside">
                      <li><strong>14 Gün Cayma Hakkı:</strong> WhatsApp / telefon üzerinden uzaktan tamamlanan satışlarda, teslimat tarihinden itibaren 14 gün içinde 6502 sayılı Kanun kapsamındaki yasal cayma hakkınız bulunmaktadır.</li>
                      <li><strong>2 Yıl Üretici Garantisi:</strong> Tüm mekanik, iskelet ve üretim aksamları 2 yıl süreyle resmi Ermay Mobilya fabrika garantisi altındadır.</li>
                      <li><strong>İstanbul İçi Teslimat & Montaj:</strong> Kendi montaj ekibimiz tarafından kata kadar teslim ve kurulum yapılır; koşullar temsilcimizle netleştirilir.</li>
                    </ul>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* TAKIMI TAMAMLA (FREQUENTLY BOUGHT TOGETHER / BUNDLE) SECTION */}
        {complementaryPieces.length > 0 && (
          <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-xs p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EAE3D2] pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-[#C5A880]/15 text-[#917248] text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    Koleksiyon Sinerjisi
                  </span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                  Takımı Tamamla & Koleksiyon Uyumu
                </h3>
                <p className="text-xs text-neutral-500 font-light mt-1">
                  Mekanınızda kusursuz tasarım bütünlüğü oluşturmak için tamamlayıcı parçaları birlikte seçebilirsiniz.
                </p>
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Product Cards Row */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Main Product Card */}
                <div className="relative bg-white border-2 border-[#C5A880] rounded-xs p-3 flex flex-col justify-between shadow-xs">
                  <div className="absolute -top-2.5 left-3 bg-[#C5A880] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-xs tracking-wider">
                    Ana Parça
                  </div>
                  <div>
                    <div className="aspect-[4/3] w-full bg-[#FCFAF6] rounded-xs overflow-hidden relative mb-2.5 mt-1">
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-[#C5A880] font-medium mt-0.5">
                      Seçilen Doku: {selectedSwatch.name}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-neutral-900">
                      ₺{mainProductPrice.toLocaleString('tr-TR')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs">
                      Dahil
                    </span>
                  </div>
                </div>

                {/* Complementary Pieces Cards */}
                {complementaryPieces.map((piece) => {
                  const isSelected = selectedComplementaryIds.includes(piece.id);
                  const pieceImages = getProductImages(piece);
                  const pieceThumb = pieceImages[0] || '/images/placeholder.webp';
                  const pPrice = Number(piece.price || 0);

                  return (
                    <div
                      key={piece.id}
                      onClick={() => toggleComplementaryItem(piece.id)}
                      className={`relative bg-white border rounded-xs p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none ${
                        isSelected
                          ? 'border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                          : 'border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                            Tamamlayıcı
                          </span>
                          <button
                            type="button"
                            aria-label={isSelected ? 'Çıkar' : 'Ekle'}
                            className="text-neutral-900"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-[#C5A880]" />
                            ) : (
                              <Square className="h-4 w-4 text-neutral-400" />
                            )}
                          </button>
                        </div>

                        <div className="aspect-[4/3] w-full bg-[#FCFAF6] rounded-xs overflow-hidden relative mb-2.5">
                          <img
                            src={pieceThumb}
                            alt={piece.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                          {piece.name}
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-light mt-0.5 line-clamp-1">
                          {typeof piece.category === 'object' && piece.category !== null
                            ? (piece.category as { name?: string }).name || 'Koleksiyon Parçası'
                            : String(piece.category || 'Koleksiyon Parçası')}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">
                          ₺{pPrice.toLocaleString('tr-TR')}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs ${
                            isSelected
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {isSelected ? 'Eklendi' : 'Ekle'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bundle Checkout Summary Box */}
              <div className="lg:col-span-4 bg-white border border-[#EAE3D2] rounded-xs p-5 space-y-4 shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                    Takım Özeti
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900">
                    1 Ana Ürün + {bundleItems.length} Tamamlayıcı Parça
                  </h4>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Birlikte Alım Toplamı:
                    </span>
                    <span className="text-lg font-black text-neutral-900 font-serif">
                      ₺{finalBundleTotal.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>


                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  className="w-full bg-neutral-900 hover:bg-[#C5A880] text-white py-3 px-4 rounded-xs text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {bundleItems.length > 0 ? 'Tüm Takımı Sepete Ekle' : 'Sadece Ana Ürünü Ekle'}
                  </span>
                </button>

                <div className="space-y-1 text-[10px] text-neutral-500 font-light border-t border-neutral-100 pt-3">
                  <p className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#C5A880]" />
                    Teslimat ve montaj koşulları temsilcimizle netleştirilir
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#C5A880]" />
                    Tüm parçalar aynı parti kumaş/ahşap tonunda hazırlanır
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 uppercase tracking-tight border-l-4 border-[#C5A880] pl-4">
              Uyumlu Koleksiyon & Benzer Ürünler
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
