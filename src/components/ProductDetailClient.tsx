'use client';

import React, { useState, useEffect, use, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw, Star, 
  CheckCircle2, ArrowLeft, Layers, Ruler, Loader2, Compass, 
  Eye, Check, MessageSquare, CreditCard, Box,
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
import LeadTimeBadge from './LeadTimeBadge';
import EdgeNav from './EdgeNav';
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

// Ürün kendi renk kaydını taşımıyorsa kullanılan yedek kartela (kumaş / deri / ahşap)
export const LUXURY_SWATCHES: LuxurySwatch[] = [
  { id: 'taba-deri', name: 'Taba Hakiki Deri', color: '#8A4B20', hex: '#8A4B20', tag: 'Hakiki Deri', category: 'deri', categoryLabel: 'Hakiki Deri', description: 'Nefes alabilir dana derisi; doğal damarlı doku.' },
  { id: 'siyah-deri', name: 'Siyah Hakiki Deri', color: '#18181B', hex: '#18181B', tag: 'Hakiki Deri', category: 'deri', categoryLabel: 'Hakiki Deri', description: 'Yüksek sürtünme dayanımlı mat siyah deri.' },
  { id: 'antrasit-nubuk', name: 'Antrasit Mat Nubuk', color: '#2C323B', hex: '#2C323B', tag: 'Nubuk', category: 'nubuk', categoryLabel: 'Mat Nubuk', description: 'Su ve leke itici mikrofiber teknolojili yumuşak dokulu nubuk.' },
  { id: 'duman-nubuk', name: 'Duman Grisi Nubuk', color: '#4B5563', hex: '#4B5563', tag: 'Nubuk', category: 'nubuk', categoryLabel: 'Mat Nubuk', description: 'Yumuşak tuşeli kadifemsi nubuk dokusu, kolay temizlenebilir.' },
  { id: 'krem-keten', name: 'Krem Doğal Dokuma Keten', color: '#E4DAC6', hex: '#E4DAC6', tag: 'Keten', category: 'keten', categoryLabel: 'Doğal Keten', description: '%100 doğal keten ve pamuk lifi harmanı. Terletmez ve nefes alır.' },
  { id: 'kum-keten', name: 'Kum Beji Doğal Keten', color: '#D4C5B0', hex: '#D4C5B0', tag: 'Keten', category: 'keten', categoryLabel: 'Doğal Keten', description: 'Aşınmaya dayanıklı sık dokuma keten kumaş, sıcak tonlar.' },
  { id: 'vizon-boucle', name: 'Vizon Bouclé', color: '#877569', hex: '#877569', tag: 'Bouclé', category: 'boucle', categoryLabel: 'Buklet', description: 'Kabarık dokulu buklet kumaş.' },
  { id: 'zumrut-kadife', name: 'Zümrüt Kadife', color: '#1B382B', hex: '#1B382B', tag: 'Kadife', category: 'boucle', categoryLabel: 'Kadife', description: 'Yumuşak tuşeli kadife döşeme.' },
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
  vizon: { hex: '#877569', category: 'boucle', tag: 'Buklet' },
  zumrut: { hex: '#1B382B', category: 'boucle', tag: 'Kadife' },
  zümrüt: { hex: '#1B382B', category: 'boucle', tag: 'Kadife' },
  haki: { hex: '#2D4A3E', category: 'boucle', tag: 'Doğal Kumaş' },
  yesil: { hex: '#2D4A3E', category: 'boucle', tag: 'Doğal Kumaş' },
  yeşil: { hex: '#2D4A3E', category: 'boucle', tag: 'Doğal Kumaş' },
  lacivert: { hex: '#1E3A8A', category: 'deri', tag: 'Döşeme' },
  mavi: { hex: '#2563EB', category: 'deri', tag: 'Döşeme' },
  bordo: { hex: '#7F1D1D', category: 'deri', tag: 'Özel Seri' },
  krom: { hex: '#D1D5DB', category: 'ahsap', tag: 'Metal Aksam' },
  gold: { hex: '#D4AF37', category: 'ahsap', tag: 'Metal Aksam' },
};

// Sıra önemlidir: "nubuk" deri ailesindendir ama ayrı kategoridir, bu yüzden "deri"den önce aranır.
const MATERIAL_KEYWORDS: Array<{ keywords: string[]; category: LuxurySwatch['category']; tag: string }> = [
  { keywords: ['nubuk'], category: 'nubuk', tag: 'Mat Nubuk' },
  { keywords: ['deri', 'leather'], category: 'deri', tag: 'Hakiki Deri' },
  { keywords: ['keten'], category: 'keten', tag: 'Doğal Keten' },
  { keywords: ['kadife'], category: 'boucle', tag: 'Kadife' },
  { keywords: ['buklet', 'boucle'], category: 'boucle', tag: 'Buklet' },
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
        ? 'Kumaş'
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
  // Mobilde ana butonlar ekrandan çıkınca alttaki sabit satın alma çubuğu görünür
  // Callback ref: ürün sonradan yüklendiğinde de gözlemci bağlansın
  const [actionsEl, setActionsEl] = useState<HTMLDivElement | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const el = actionsEl;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [actionsEl]);
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
    // Kenar geçiş alanındayken büyüteç kapalı; ortaya dönünce yeniden açılır
    const onEdge = (e.target as HTMLElement).closest('[data-edge-nav]');
    if (onEdge) {
      if (isZoomed) setIsZoomed(false);
      return;
    }
    if (!isZoomed) setIsZoomed(true);
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
      <div className="w-full min-h-[60vh] bg-paper flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-wood animate-spin" />
        <span className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">
          Ürün Tasarımı Yükleniyor...
        </span>
      </div>
    );
  }

  if (notFoundState || !product) {
    return (
      <div className="w-full min-h-[60vh] bg-paper flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-6 bg-white border border-line text-neutral-800 rounded-xs max-w-md space-y-4">
          <h2 className="font-display text-xl font-bold tracking-tight">Koleksiyon Bulunamadı</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Aradığınız mobilya modeli üretimden kaldırılmış veya geçici olarak yayından alınmış olabilir.
          </p>
          <Link
            href="/katalog"
            className="inline-block bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-6 rounded-xs transition-colors"
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
      'Takım talep sepetine eklendi',
      `${product.name} ve ${bundleItems.length} tamamlayıcı parça talep sepetinize eklendi.`
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
    <div className="w-full bg-paper min-h-screen py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-line">
          <nav className="text-xs text-neutral-500 flex items-center gap-2">
            <Link href="/" className="hover:text-wood transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/katalog" className="hover:text-wood transition-colors">Katalog</Link>
            <span>/</span>
            <span className="text-neutral-700 font-medium">
              {typeof product.category === 'object' && product.category !== null
                ? (product.category as { name?: string }).name || (product.category as { slug?: string }).slug || ''
                : String(product.category || '')}
            </span>
            <span>/</span>
            <span className="text-wood-dark font-semibold truncate max-w-[200px]">{product.name}</span>
          </nav>

          <Link 
            href="/katalog" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-wood transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Koleksiyon Kataloğu</span>
          </Link>
        </div>

        {/* ÜRÜN SAHNESİ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 md:p-10 rounded-xs border border-line mb-12">
          
          {/* Left Column: Interactive Image Gallery with Lens Zoom */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image with Interactive Hover Magnifier */}
            <div 
              ref={imageContainerRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="relative aspect-[16/11] bg-neutral-100 rounded-xs overflow-hidden border border-line cursor-crosshair group select-none"
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
              <div className={`absolute bottom-3 right-3 bg-white text-ink text-xs font-medium px-2 py-1 rounded-xs flex items-center gap-1.5 transition-opacity duration-300 pointer-events-none ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
                <Eye className="h-3.5 w-3.5" />
                <span>Yakınlaştırmak için üzerine gelin</span>
              </div>

              {/* Kenar okları: görseller arasında geçiş */}
              <EdgeNav
                enabled={imagesList.length > 1}
                onPrev={() => setSelectedImageIndex((i) => (i - 1 + imagesList.length) % imagesList.length)}
                onNext={() => setSelectedImageIndex((i) => (i + 1) % imagesList.length)}
                onEdgeEnter={() => setIsZoomed(false)}
              />

              {/* Tag / Collection Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3 bg-white text-ink font-medium text-xs px-2 py-1 rounded-xs border border-line">
                  {product.badge}
                </div>
              )}
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
                        ? 'border-ink' 
                        : 'border-line opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Ölçü künyesi: yalnız gerçek veri varsa */}
            {(product.dimensions || product.widthCm) && (
              <div className="border border-line rounded-xs p-3.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <Ruler className="h-4 w-4 text-wood" aria-hidden="true" />
                  <span className="text-neutral-600">Ölçüler</span>
                  <span className="font-mono text-ink tabular-nums-all">
                    {product.dimensions || [product.widthCm && `G ${product.widthCm}`, product.depthCm && `D ${product.depthCm}`, product.heightCm && `Y ${product.heightCm}`].filter(Boolean).join(' × ') + ' cm'}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Title, Swatches, Pricing & Actions */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Header & Title */}
            <div className="space-y-1.5">
              {product.erpItemCode && (
                <span className="font-mono text-xs text-neutral-500 block">Ürün kodu {product.erpItemCode}</span>
              )}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight leading-snug">
                {product.name}
              </h1>

              <div className="pt-1">
                <LeadTimeBadge product={product} />
              </div>
            </div>

            {/* Editorial Mini Description */}
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Material / Leather Swatch Color Picker */}
            <div className="space-y-3 pt-1 border-t border-line">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-wood" />
                  <span>Renk ve malzeme</span>
                </label>
                <span className="text-xs font-bold text-wood">
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
                    className={`text-xs font-bold px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                      activeFabricCategory === cat.id
                        ? 'bg-ink-dark text-white'
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
                          ? 'border-wood bg-paper ring-1 ring-wood' 
                          : 'border-line hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div 
                        style={{ backgroundColor: swatchColor }}
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                      />
                      <span className="text-xs font-semibold text-neutral-800">
                        {swatch.name}
                      </span>
                      {swatch.tag && (
                        <span className="text-xs text-neutral-500 font-normal">
                          ({swatch.tag})
                        </span>
                      )}
                      {isSelected && <Check className="h-3 w-3 text-wood shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Selected Fabric Description Box */}
              <div className="bg-paper border border-line p-3.5 rounded-xs space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: selectedSwatch.hex || '#8A4B20' }} />
                    {selectedSwatch.name}
                  </span>
                  <span className="text-sm font-semibold px-2 py-0.5 rounded bg-white border border-line text-wood-dark">
                    {selectedSwatch.tag || 'Özel Seri'}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {(selectedSwatch as LuxurySwatch).description || 'Ermay Mobilya atölyelerinde 1. sınıf işçilikle titizlikle uygulanan özel döşeme seçeneği.'}
                </p>
              </div>
            </div>

            {/* Fiyat */}
            <div className="border-y border-line py-4 space-y-1">
              <span className="text-sm text-neutral-600 block">Fabrika satış fiyatı · KDV dahil</span>
              <div className="flex items-baseline gap-3">
                <span className={`font-mono text-3xl font-semibold tracking-tight tabular-nums-all ${product.originalPrice && product.originalPrice > product.price ? 'text-signal' : 'text-ink'}`}>
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-neutral-500 line-through tabular-nums-all">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">Online ödeme alınmaz; talebinizden sonra temsilcimiz teslimat ve ödemeyi sizinle netleştirir.</p>
              <p className="text-xs text-neutral-600 pt-1">
                3 adet ve üzeri ya da komple ofis kurulumu için{' '}
                <a
                  hidden={!waNumber} href={`https://wa.me/${waNumber}?text=Merhaba%2C%20${encodeURIComponent(product.name)}%20modelinden%20%C5%9Firketimiz%20i%C3%A7in%20adetli%2Ftoplu%20ofis%20al%C4%B1m%C4%B1%20yapmak%20istiyoruz.%20Fabrika%20iskontolu%20toptan%20fiyat%20teklifi%20alabilir%20miyiz%3F`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-wood underline underline-offset-2 hover:text-wood-dark"
                >
                  adetli fiyat isteyin
                </a>
                .
              </p>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div ref={setActionsEl} className="space-y-3 pt-1">
              {/* Action Buttons Row */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2 sm:gap-2.5">
                  <div className="flex items-center justify-between border border-line-strong rounded-xs bg-white shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Adedi azalt"
                      className="h-11 w-11 text-base text-neutral-700 hover:text-ink cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-sm text-ink tabular-nums-all" aria-live="polite">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Adedi artır"
                      className="h-11 w-11 text-base text-neutral-700 hover:text-ink cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCartClick}
                    className="flex-1 min-w-[130px] h-11 flex items-center justify-center gap-1.5 px-3 sm:px-4 rounded-xs text-sm font-semibold bg-ink hover:bg-neutral-800 text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0" />
                    <span>Sepete Ekle</span>
                  </button>

                  {/* Buy Now Button (UNTOUCHABLE: Hemen Al) */}
                  <button
                    onClick={handleBuyNowClick}
                    className="flex-1 min-w-[120px] h-11 flex items-center justify-center gap-1.5 px-3 sm:px-4 rounded-xs text-sm font-semibold bg-brand hover:bg-brand-dark text-ink transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Hemen Al</span>
                  </button>

                  {/* Toggle Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product)}
                    className={`h-11 w-11 flex items-center justify-center rounded-xs border transition-colors cursor-pointer shrink-0 ${
                      isFavorite 
                        ? 'bg-white border-signal text-signal' 
                        : 'bg-white border-line text-neutral-600 hover:text-wood'
                    }`}
                    aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    aria-pressed={isFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* PROMINENT WHATSAPP ORDER LINE - ESNAF DÖNÜŞÜM BUTONU */}
                {(() => {
                  const setPiecesSummaryText = product.setPieces && product.setPieces.length > 0 && selectedSetPieceTitles.length > 0
                    ? `\n• Seçili Takım Parçaları: ${selectedSetPieceTitles.join(', ')} (${selectedSetPieceTitles.length}/${product.setPieces.length} Parça)`
                    : '';
                  // Ölçü/malzeme yalnız ürün kaydında varsa mesaja eklenir (uydurma varsayılan yok)
                  const waDimensions = product.dimensions || (product.widthCm ? `${product.widthCm}x${product.depthCm}x${product.heightCm} cm` : '');
                  const waSpecText = `${waDimensions ? `\n• Ölçüler: ${waDimensions}` : ''}${product.material ? `\n• Malzeme: ${product.material}` : ''}`;
                  return (
                    <a
                      hidden={!waNumber} href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `Merhaba Ermay Mobilya, web sitenizden "${product.name}" modeli hakkında bilgi almak ve sipariş vermek istiyorum.\n• Seçili Renk: ${selectedSwatch.name}${setPiecesSummaryText}${waSpecText}\n• Fiyat: ${formatPrice(product.price)}\n• Ürün Linki: https://ermaymobilya.com/urun/${product.id}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-11 border border-whatsapp text-whatsapp hover:bg-whatsapp hover:text-white font-semibold text-sm px-4 rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp’tan sorun</span>
                    </a>
                  );
                })()}
              </div>

              {addedToCartSuccess && (
                <div role="status" className="bg-ok-soft border border-ok/25 text-ok p-3 rounded-xs text-sm flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  <span><strong>{selectedSwatch.name}</strong> seçeneğiyle talep sepetine eklendi.</span>
                </div>
              )}

              {/* DETAILED TECHNICAL SPECIFICATIONS TABLE (XYZ ÖLÇÜLER, ÇEKMECE & ÜNİTE) */}
              <div className="bg-white border border-line rounded-xs p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-sm font-semibold text-ink flex items-center gap-1.5">
                    <Ruler className="h-4 w-4 text-wood" />
                    <span>Teknik künye</span>
                  </span>
                  <span className="text-xs text-neutral-500">Standart seri üretim</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                  <div className="bg-paper p-2 rounded-xs text-center">
                    <span className="block text-xs font-sans text-neutral-500">Genişlik (X)</span>
                    <strong className="text-ink font-medium">{product.widthCm ? `${product.widthCm} cm` : '—'}</strong>
                  </div>
                  <div className="bg-paper p-2 rounded-xs text-center">
                    <span className="block text-xs font-sans text-neutral-500">Derinlik (Y)</span>
                    <strong className="text-ink font-medium">{product.depthCm ? `${product.depthCm} cm` : '—'}</strong>
                  </div>
                  <div className="bg-paper p-2 rounded-xs text-center">
                    <span className="block text-xs font-sans text-neutral-500">Yükseklik (Z)</span>
                    <strong className="text-ink font-medium">{product.heightCm ? `${product.heightCm} cm` : '—'}</strong>
                  </div>
                  <div className="bg-paper p-2 rounded-xs text-center">
                    <span className="block text-xs font-sans text-neutral-500">Çekmece Adedi</span>
                    <strong className="text-ink font-medium">{product.drawerCount !== undefined && product.drawerCount !== null ? `${product.drawerCount} adet` : '—'}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-600 pt-1 font-sans">
                  <span>Ünite / Takım Parça Sayısı: <strong>{product.unitCount || 1} Parça</strong></span>
                  {product.material && <span>Malzeme: <strong>{product.material}</strong></span>}
                </div>
              </div>
            </div>

            {/* Interactive Modular Set Pieces Breakdown */}
            {product.setPieces && product.setPieces.length > 0 && (
              <div className="bg-paper border border-line rounded-xs p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink flex items-center gap-1.5">
                    <Box className="h-4 w-4 text-wood" />
                    <span>Takım parçaları</span>
                  </span>
                  <span className="font-mono text-xs text-neutral-600 tabular-nums-all">
                    {selectedSetPieceTitles.length} / {product.setPieces.length} parça seçili
                  </span>
                </div>

                <div className="space-y-1.5">
                  {product.setPieces.map((piece, pIdx) => {
                    const isSelected = selectedSetPieceTitles.includes(piece.title);
                    return (
                      <div 
                        key={pIdx} 
                        onClick={() => toggleSetPiece(piece.title)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleSetPiece(piece.title);
                          }
                        }}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`flex items-center justify-between text-xs p-2.5 rounded-xs border transition-all cursor-pointer select-none ${
                          isSelected 
                            ? 'bg-white border-wood/70' 
                            : 'bg-neutral-50/80 border-dashed border-line-strong opacity-60 hover:opacity-85'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-ink border-ink text-white' : 'border-neutral-400 bg-white'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className={`font-semibold ${isSelected ? 'text-neutral-900' : 'text-neutral-500 line-through'}`}>
                              {piece.title}
                            </span>
                            {piece.dimensions && (
                              <span className="text-neutral-500 text-xs ml-1.5">({piece.dimensions})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isSelected && (
                            <span className="text-xs font-medium text-wood-dark">
                              + Dahil Et
                            </span>
                          )}
                          {piece.pieceProductId && (
                            <Link
                              href={`/urun/${piece.pieceProductId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs font-bold text-wood hover:text-wood-dark hover:underline"
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

                <p className="text-xs text-neutral-500 leading-relaxed pt-1 border-t border-line/60">
                  * Takımdan çıkarmak veya geri eklemek istediğiniz parçaların üzerine tıklayabilirsiniz. Tercihiniz sepete ve WhatsApp sipariş temsilcisine otomatik aktarılır.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* AYRINTI SEKMELERİ */}
        <div className="bg-white rounded-xs border border-line overflow-hidden mb-16">
          
          {/* Tab Headers Bar */}
          <div className="flex border-b border-line bg-paper overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('desc')}
              className={`py-4 px-6 text-sm md:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'desc'
                  ? 'border-wood text-neutral-900 bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Ürün Açıklaması
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-6 text-sm md:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-wood text-neutral-900 bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Renk ve Ölçü Seçenekleri
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-4 px-6 text-sm md:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'delivery'
                  ? 'border-wood text-neutral-900 bg-white'
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
                  <h3 className="text-lg font-display font-bold text-ink tracking-tight">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p>
                      {product.description}
                    </p>
                  )}
                  {product.material && (
                    <p>
                      Malzeme: {product.material}.
                    </p>
                  )}
                </div>

                {/* Özellikler: yalnız ürün kaydında varsa */}
                {product.features && product.features.length > 0 && (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pt-4 border-t border-line">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 py-2 border-b border-line">
                        <CheckCircle className="h-4 w-4 text-wood flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-800">{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* TAB 2: RENK VE ÖLÇÜ SEÇENEKLERİ */}
            {activeTab === 'specs' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Dimensions Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-wood" />
                    Ölçü Tablosu ve Spesifikasyonlar
                  </h3>
                  
                  <div className="overflow-x-auto border border-line rounded-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-paper border-b border-line text-neutral-600 font-bold uppercase text-xs tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Parça / Modül</th>
                          <th className="py-3 px-4">Genişlik (cm)</th>
                          <th className="py-3 px-4">Derinlik (cm)</th>
                          <th className="py-3 px-4">Yükseklik (cm)</th>
                          <th className="py-3 px-4">Malzeme / Yapı</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-neutral-800">
                        {product.setPieces && product.setPieces.length > 0 ? (
                          product.setPieces.map((piece, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="py-3 px-4 font-bold text-neutral-900">{piece.title}</td>
                              <td className="py-3 px-4 font-mono">{piece.dimensions?.split('x')[0] || '—'}</td>
                              <td className="py-3 px-4 font-mono">{piece.dimensions?.split('x')[1] || '—'}</td>
                              <td className="py-3 px-4 font-mono">{piece.dimensions?.split('x')[2] || '—'}</td>
                              <td className="py-3 px-4 text-neutral-600">{product.material || '—'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="hover:bg-neutral-50">
                            <td className="py-3 px-4 font-bold text-neutral-900">{product.name}</td>
                            <td className="py-3 px-4 font-mono">{(product.widthCm || product.dimensionSpec?.width) ? `${product.widthCm || product.dimensionSpec?.width} cm` : '—'}</td>
                            <td className="py-3 px-4 font-mono">{(product.depthCm || product.dimensionSpec?.depth) ? `${product.depthCm || product.dimensionSpec?.depth} cm` : '—'}</td>
                            <td className="py-3 px-4 font-mono">{(product.heightCm || product.dimensionSpec?.height) ? `${product.heightCm || product.dimensionSpec?.height} cm` : '—'}</td>
                            <td className="py-3 px-4 text-neutral-600">
                              <div>{product.material || '—'}</div>
                              {product.drawerCount !== undefined && product.drawerCount > 0 && (
                                <div className="text-xs text-neutral-500 font-mono mt-0.5">
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
                <div className="space-y-4 pt-4 border-t border-line">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-wood" />
                    Renk ve döşeme seçenekleri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {productColors.map((col, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-paper rounded-xs border border-line">
                        <div 
                          style={{ backgroundColor: col.hex || col.color || '#8A4B20' }}
                          className="w-7 h-7 rounded-full border border-black/10 flex-shrink-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-neutral-900 block">{col.name}</span>
                          <span className="text-xs text-neutral-500">{col.tag || 'Döşeme'}</span>
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
                  <div className="p-6 bg-paper rounded-xs border border-line space-y-3">
                    <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                      <Truck className="h-5 w-5 text-wood" />
                      <h4>Teslimat ve kurulum</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-600 list-disc list-inside">
                      <li><strong>İstanbul İçi:</strong> Kendi lojistik araçlarımız ve uzman montaj kadromuzla 3-5 iş günü içinde teslimat ve montaj (ücret ve koşullar temsilcimizle netleştirilir).</li>
                      <li><strong>Tüm Türkiye:</strong> Anlaşmalı mobilya lojistik ağımızla dairenize/ofisinize kadar teslim edilir.</li>
                      <li><strong>Fabrika Seri Üretimi:</strong> Depoda hazır olmayan ürünlerimiz fabrikamızda standart seri bant imalatıyla ortalama 3-5 iş gününde hazır hale getirilerek sevk edilir.</li>
                    </ul>
                  </div>

                  {/* Return & Warranty Info */}
                  <div className="p-6 bg-paper rounded-xs border border-line space-y-3">
                    <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                      <ShieldCheck className="h-5 w-5 text-wood" />
                      <h4>Cayma hakkı ve garanti</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-600 list-disc list-inside">
                      <li><strong>14 Gün Cayma Hakkı:</strong> WhatsApp / telefon üzerinden uzaktan tamamlanan satışlarda, teslimat tarihinden itibaren 14 gün içinde 6502 sayılı Kanun kapsamındaki yasal cayma hakkınız bulunmaktadır.</li>
                      <li><strong>2 Yıl Üretici Garantisi:</strong> Tüm mekanik, iskelet ve üretim aksamları 2 yıl süreyle resmi Ermay Mobilya fabrika garantisi altındadır.</li>
                      <li><strong>İstanbul içi teslimat ve montaj:</strong> Kendi montaj ekibimiz tarafından kata kadar teslim ve kurulum yapılır; koşullar temsilcimizle netleştirilir.</li>
                    </ul>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* TAKIMI TAMAMLA (FREQUENTLY BOUGHT TOGETHER / BUNDLE) SECTION */}
        {complementaryPieces.length > 0 && (
          <div className="bg-paper border border-line rounded-xs p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-line pb-5">
              <div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                  Takımı tamamlayın
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Aynı seriden üretilen tamamlayıcı parçaları birlikte seçebilirsiniz.
                </p>
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Product Cards Row */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Main Product Card */}
                <div className="relative bg-white border-2 border-wood rounded-xs p-3 flex flex-col justify-between">
                  <div className="absolute -top-2.5 left-3 bg-brand text-ink text-sm font-semibold px-2 py-0.5 rounded-xs">
                    Ana Parça
                  </div>
                  <div>
                    <div className="aspect-[4/3] w-full bg-paper rounded-xs overflow-hidden relative mb-2.5 mt-1">
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
                    <p className="text-xs text-wood font-medium mt-0.5">
                      Seçilen Doku: {selectedSwatch.name}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-xs font-extrabold text-neutral-900">
                      ₺{mainProductPrice.toLocaleString('tr-TR')}
                    </span>
                    <span className="text-xs font-medium text-ok">
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
                          ? 'border-neutral-900 ring-1 ring-neutral-900'
                          : 'border-line opacity-60 hover:opacity-100 hover:border-line-strong'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Tamamlayıcı
                          </span>
                          <button
                            type="button"
                            aria-label={isSelected ? 'Çıkar' : 'Ekle'}
                            className="text-neutral-900"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-wood" />
                            ) : (
                              <Square className="h-4 w-4 text-neutral-500" />
                            )}
                          </button>
                        </div>

                        <div className="aspect-[4/3] w-full bg-paper rounded-xs overflow-hidden relative mb-2.5">
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
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                          {typeof piece.category === 'object' && piece.category !== null
                            ? (piece.category as { name?: string }).name || 'Koleksiyon Parçası'
                            : String(piece.category || 'Koleksiyon Parçası')}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-line flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">
                          ₺{pPrice.toLocaleString('tr-TR')}
                        </span>
                        <span
                          className={`text-sm font-semibold px-1.5 py-0.5 rounded-xs ${
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
              <div className="lg:col-span-4 bg-white border border-line rounded-xs p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-wood">
                    Takım Özeti
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900">
                    1 Ana Ürün + {bundleItems.length} Tamamlayıcı Parça
                  </h4>
                </div>

                <div className="space-y-2 pt-2 border-t border-line text-xs">
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Birlikte Alım Toplamı:
                    </span>
                    <span className="text-lg font-extrabold text-neutral-900 font-display">
                      ₺{finalBundleTotal.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>


                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  className="w-full bg-ink hover:bg-neutral-800 text-white py-3 px-4 rounded-xs text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {bundleItems.length > 0 ? 'Tüm Takımı Sepete Ekle' : 'Sadece Ana Ürünü Ekle'}
                  </span>
                </button>

                <div className="space-y-1 text-xs text-neutral-500 border-t border-line pt-3">
                  <p className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-wood" />
                    Teslimat ve montaj koşulları temsilcimizle netleştirilir
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-wood" />
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
            <h3 className="font-display text-xl md:text-2xl font-bold text-neutral-900 tracking-tight border-l-4 border-wood pl-4">
              Benzer ürünler
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      
      </div>

      {/* Mobil sabit satın alma çubuğu: yukarıdaki butonlarla aynı işlevler */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-line px-4 py-3 flex items-center gap-3 transition-transform duration-300 print:hidden ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={!showStickyBar}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs text-neutral-600 truncate">{product.name}</p>
          <p className="font-mono text-base font-semibold text-ink tabular-nums-all">{formatPrice(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={handleAddToCartClick}
          tabIndex={showStickyBar ? 0 : -1}
          className="h-11 px-3 bg-ink hover:bg-neutral-800 text-white text-sm font-semibold rounded-xs cursor-pointer"
        >
          Sepete ekle
        </button>
        <button
          type="button"
          onClick={handleBuyNowClick}
          tabIndex={showStickyBar ? 0 : -1}
          className="h-11 px-3 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold rounded-xs cursor-pointer"
        >
          Hemen Al
        </button>
      </div>
    </div>
  );
}
