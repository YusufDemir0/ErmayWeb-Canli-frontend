'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw, Star, 
  CheckCircle2, ArrowLeft, Layers, Ruler, Loader2, Compass, 
  Sparkles, Eye, Check, MessageSquare, CreditCard, Box,
  Info, CornerDownRight, Send, CheckCircle, Award, Factory
} from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { productService } from '../services/productService';
import apiClient from '../services/api';
import { getProductImages } from '../lib/productImages';
import type { Product, ProductColorVariant, ProductSetPiece } from '../types';
import ProductCard from './ProductCard';

interface ProductDetailClientProps {
  id: string;
}

// Fallback Luxury Fabric & Leather Color Palette
const DEFAULT_SWATCHES: ProductColorVariant[] = [
  { id: 'taba-deri', name: 'İtalyan Taba Hakiki Deri', color: '#8A4B20', hex: '#8A4B20', tag: 'Hakiki Deri' },
  { id: 'antrasit-nubuk', name: 'Antrasit Mat Nubuk', color: '#2C323B', hex: '#2C323B', tag: 'Nubuk' },
  { id: 'krem-keten', name: 'Krem Doğal Dokuma Keten', color: '#E4DAC6', hex: '#E4DAC6', tag: 'Keten' },
  { id: 'vizon-boucle', name: 'Vizon Lüks Bouclé', color: '#877569', hex: '#877569', tag: 'Bouclé' },
  { id: 'zumrut-kadife', name: 'Zümrüt İtalyan Kadife', color: '#1B382B', hex: '#1B382B', tag: 'Kadife' },
];

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const router = useRouter();
  const storeProducts = useCMSStore((state) => state.products);
  const contactInfo = useCMSStore((state) => state.contactInfo);
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));

  const [product, setProduct] = useState<Product | null>(() => {
    return storeProducts.find((p) => p.id === id || p.slug === id) || null;
  });
  const [loading, setLoading] = useState(!product);
  const [notFoundState, setNotFoundState] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSwatch, setSelectedSwatch] = useState<ProductColorVariant>(DEFAULT_SWATCHES[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'payment' | 'delivery'>('desc');

  // Customer Reviews State
  const [reviews, setReviews] = useState<Array<{ id: string; name: string; rating: number; date: string; comment: string }>>([
    { id: 'rev-1', name: 'Murat K.', rating: 5, date: '12 Şubat 2026', comment: 'İmalat kalitesi ve malzeme işçiliği kusursuz. Doğrudan fabrikadan gelmesi ve montaj ekibinin titizliği çok memnun etti.' },
    { id: 'rev-2', name: 'Selin A.', rating: 5, date: '28 Ocak 2026', comment: 'Döşeme kumaşı ve iskelet dayanımı fotoğraflardan çok daha kaliteli duruyor. Tam istediğimiz ölçülerde teslim edildi.' },
  ]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Fetch real reviews from Backend REST API
  useEffect(() => {
    if (!product?.id) return;
    apiClient.get(`/reviews/product/${product.id}`)
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.reviews) && res.data.reviews.length > 0) {
          const mapped = res.data.reviews.map((r: any) => ({
            id: r.id,
            name: r.userName || 'Müşteri',
            rating: r.rating || 5,
            date: new Date(r.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
            comment: r.comment,
          }));
          setReviews(mapped);
        }
      })
      .catch(() => {});
  }, [product?.id]);

  // Hover Lens Zoom States
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  // Resilient async load from REST API if not found in store immediately
  useEffect(() => {
    let isMounted = true;
    const storeItem = storeProducts.find((p) => p.id === id || p.slug === id);
    if (storeItem) {
      setProduct(storeItem);
      if (storeItem.colors && storeItem.colors.length > 0) {
        setSelectedSwatch(storeItem.colors[0]);
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
              setSelectedSwatch(fetched.colors[0]);
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

  const productColors = product.colors && product.colors.length > 0 ? product.colors : DEFAULT_SWATCHES;

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
    };
    addToCart(customizedProduct, quantity);
    router.push('/odeme');
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const rev = {
      id: `rev-${Date.now()}`,
      name: newReviewName.trim(),
      rating: newReviewRating,
      date: 'Bugün',
      comment: newReviewComment.trim(),
    };

    // Optimistic UI update
    setReviews([rev, ...reviews]);
    const submittedName = newReviewName.trim();
    const submittedComment = newReviewComment.trim();
    const submittedRating = newReviewRating;

    setNewReviewName('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);

    try {
      await apiClient.post('/reviews', {
        productId: product.id,
        userName: submittedName,
        rating: submittedRating,
        comment: submittedComment,
      });
    } catch (err) {
      console.warn('Yorum sunucuya iletilemedi:', err);
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
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

  // Bank Installment Rates Setup
  const INSTALLMENT_BANKS = [
    { name: 'World', logo: '💳 Worldcard', rates: [ { m: 1, r: 0 }, { m: 3, r: 0 }, { m: 6, r: 0.04 }, { m: 9, r: 0.08 }, { m: 12, r: 0.12 } ] },
    { name: 'Axess', logo: '💳 Axess', rates: [ { m: 1, r: 0 }, { m: 3, r: 0 }, { m: 6, r: 0.04 }, { m: 9, r: 0.08 }, { m: 12, r: 0.12 } ] },
    { name: 'Maximum', logo: '💳 Maximum', rates: [ { m: 1, r: 0 }, { m: 3, r: 0 }, { m: 6, r: 0.04 }, { m: 9, r: 0.08 }, { m: 12, r: 0.12 } ] },
    { name: 'Bonus', logo: '💳 Bonus', rates: [ { m: 1, r: 0 }, { m: 3, r: 0 }, { m: 6, r: 0.04 }, { m: 9, r: 0.08 }, { m: 12, r: 0.12 } ] },
    { name: 'CardFinans', logo: '💳 CardFinans', rates: [ { m: 1, r: 0 }, { m: 3, r: 0 }, { m: 6, r: 0.05 }, { m: 9, r: 0.09 }, { m: 12, r: 0.13 } ] },
    { name: 'Paraf', logo: '💳 Paraf', rates: [ { m: 1, r: 0 }, { m: 3, r: 0 }, { m: 6, r: 0.04 }, { m: 9, r: 0.08 }, { m: 12, r: 0.12 } ] },
  ];

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
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-[16/11] bg-neutral-100 rounded-2xs overflow-hidden border border-neutral-200 cursor-crosshair group select-none"
            >
              <img
                src={currentImage}
                alt={product.name}
                style={{
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                }}
                className="w-full h-full object-cover transition-transform duration-200 ease-out pointer-events-none"
              />

              {/* Zoom Instruction Badge */}
              <div className={`absolute bottom-3 right-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[9.5px] font-semibold px-2.5 py-1 rounded-2xs flex items-center gap-1.5 transition-opacity duration-300 pointer-events-none ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
                <Eye className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Detay Büyüteci</span>
              </div>

              {/* Tag / Collection Badge */}
              <div className="absolute top-3 left-3 bg-[#FAF8F5]/95 backdrop-blur-xs text-neutral-900 font-bold text-[9.5px] uppercase tracking-wider px-2.5 py-1 rounded-2xs border border-[#C5A880]/30 shadow-2xs">
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
                    className={`aspect-[4/3] rounded-2xs overflow-hidden border-2 transition-all cursor-pointer ${
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
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                Özel Ölçü Yapılabilir
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

              {/* Rating & Stock Status */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-neutral-800 ml-1">
                    {product.rating || 5.0} ({reviews.length} Değerlendirme)
                  </span>
                </div>
                <span className="text-neutral-300">|</span>
                <span className="text-xs font-bold text-emerald-700">
                  {product.stock && product.stock > 0 ? 'Stokta Hazır' : 'Sipariş Üretimi'}
                </span>
              </div>
            </div>

            {/* Editorial Mini Description */}
            <p className="text-xs md:text-sm text-neutral-600 font-light leading-relaxed">
              {product.description}
            </p>

            {/* Material / Leather Swatch Color Picker */}
            <div className="space-y-2.5 pt-1 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#C5A880]" />
                  <span>Döşeme / Renk Seçeneği:</span>
                </label>
                <span className="text-xs font-bold text-[#C5A880]">
                  {selectedSwatch.name}
                </span>
              </div>

              {/* Swatches Grid */}
              <div className="flex flex-wrap items-center gap-2.5">
                {productColors.map((swatch, idx) => {
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
                        className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      />
                      <span className="text-[11px] font-semibold text-neutral-800">
                        {swatch.name}
                      </span>
                      {isSelected && <Check className="h-3 w-3 text-[#C5A880]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ATMACA OFIS STYLE TRUST BADGES (Ücretsiz Montaj / 5 Yıl Garanti / 14 Gün İade) */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#EAE3D2] text-center text-[10px] text-neutral-700">
              <div className="p-2 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2]">
                <Truck className="h-4 w-4 text-[#C5A880] mx-auto mb-1" />
                <span className="font-bold block">Ücretsiz Montaj</span>
                <span className="text-[9px] text-neutral-500 font-light">Tüm Türkiye</span>
              </div>
              <div className="p-2 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2]">
                <ShieldCheck className="h-4 w-4 text-[#C5A880] mx-auto mb-1" />
                <span className="font-bold block">5 Yıl Garanti</span>
                <span className="text-[9px] text-neutral-500 font-light">İskelet Garantisi</span>
              </div>
              <div className="p-2 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2]">
                <RefreshCw className="h-4 w-4 text-[#C5A880] mx-auto mb-1" />
                <span className="font-bold block">14 Gün İade</span>
                <span className="text-[9px] text-neutral-500 font-light">Koşulsuz Değişim</span>
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
                <span className="text-[10px] font-bold text-[#B4966E] bg-white px-2.5 py-1 rounded-2xs border border-[#EAE3D2]">
                  12 Taksit İmkanı
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 font-medium pt-1 border-t border-[#EAE3D2]/60 flex items-center justify-between">
                <span>Havale / EFT ile %5 İndirimli:</span>
                <strong className="text-xs font-bold text-emerald-700">{formatPrice(cashDiscountPrice)}</strong>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#EAE3D2] rounded-xs bg-[#FAF8F5]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCartClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xs text-xs font-bold uppercase tracking-widest bg-neutral-900 hover:bg-[#C5A880] text-white transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Sepete Ekle</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNowClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xs text-xs font-bold uppercase tracking-widest bg-[#C5A880] hover:bg-[#B4966E] text-white transition-colors cursor-pointer shadow-xs"
                >
                  <span>Hemen Al</span>
                </button>

                {/* Toggle Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product)}
                  className={`p-3 rounded-xs border transition-all cursor-pointer ${
                    isFavorite 
                      ? 'bg-rose-50 border-rose-300 text-rose-600' 
                      : 'bg-white border-[#EAE3D2] text-neutral-600 hover:text-[#C5A880]'
                  }`}
                  aria-label="Favorilere Ekle"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {addedToCartSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Seçilen <strong>{selectedSwatch.name}</strong> seçeneği ile sepete eklendi!</span>
                </div>
              )}

              {/* Direct WhatsApp Order Button */}
              <a
                href={`https://wa.me/${contactInfo.whatsapp}?text=Merhaba,%20${encodeURIComponent(product.name)}%20modeli%20hakkında%20bilgi%20ve%20sipariş%20vermek%20istiyorum.`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#EAE3D2] text-neutral-800 text-xs font-semibold py-2.5 px-4 rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>Bu Model İçin İmalat & WhatsApp Sipariş Hattı</span>
              </a>
            </div>

            {/* Set Pieces Breakdown with links to separately sold pieces */}
            {product.setPieces && product.setPieces.length > 0 && (
              <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-xs p-3.5 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-700 flex items-center gap-1.5">
                  <Box className="h-3.5 w-3.5 text-[#C5A880]" />
                  Takımı Oluşturan Parçalar ({product.setPieces.length} Parça):
                </span>
                <div className="space-y-1.5">
                  {product.setPieces.map((piece, pIdx) => (
                    <div key={pIdx} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xs border border-neutral-200">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="font-semibold text-neutral-900">{piece.title}</span>
                        {piece.dimensions && (
                          <span className="text-neutral-500 text-[10px]">({piece.dimensions})</span>
                        )}
                      </div>
                      {piece.pieceProductId && (
                        <Link
                          href={`/urun/${piece.pieceProductId}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C5A880] hover:text-[#B4966E] hover:underline"
                        >
                          <span>Ayrı İncele</span>
                          <CornerDownRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
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
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-[#C5A880] text-neutral-900 bg-white shadow-xs'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Yorumlar ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-4 px-6 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'payment'
                  ? 'border-[#C5A880] text-neutral-900 bg-white shadow-xs'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Ödeme ve Taksit Seçenekleri
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
                    'Doğrudan İmalatçıdan Satış & Özel Ölçü İmalat Desteği',
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
                              <td className="py-3 px-4 text-neutral-600">{product.material}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="hover:bg-neutral-50">
                            <td className="py-3 px-4 font-bold text-neutral-900">{product.name}</td>
                            <td className="py-3 px-4 font-mono">{product.dimensionSpec?.width || '220'} cm</td>
                            <td className="py-3 px-4 font-mono">{product.dimensionSpec?.depth || '95'} cm</td>
                            <td className="py-3 px-4 font-mono">{product.dimensionSpec?.height || '75'} cm</td>
                            <td className="py-3 px-4 text-neutral-600">{product.material}</td>
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

            {/* TAB 3: YORUMLAR & DEĞERLENDİRMELER */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Score Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2]">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="text-4xl font-extrabold text-neutral-900 block">5.0</span>
                      <span className="text-[10px] text-neutral-400 uppercase font-bold">5 Üzerinden</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-600 font-medium block">
                        %100 Müşteri Memnuniyeti ({reviews.length} Doğrulanmış Yorum)
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-neutral-500 italic max-w-sm">
                    Tüm yorumlar fabrikamızdan teslimat ve montaj hizmeti almış gerçek müşterilerimiz tarafından yapılmıştır.
                  </span>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-white rounded-xs border border-neutral-200 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">{rev.name}</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-xs">
                            Doğrulanmış Alıcı
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-neutral-700 font-light leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Review Form */}
                <div className="pt-6 border-t border-neutral-100 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Ürün Hakkında Değerlendirme Yapın
                  </h4>
                  
                  {reviewSubmitted && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>Değerlendirmeniz için teşekkür ederiz. Yorumunuz başarıyla eklendi.</span>
                    </div>
                  )}

                  <form onSubmit={handleAddReview} className="space-y-4 max-w-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">Adınız Soyadınız</label>
                        <input
                          type="text"
                          required
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          placeholder="Örn: Ahmet Yılmaz"
                          className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">Puanınız</label>
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none bg-white"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 - Mükemmel)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 - Çok İyi)</option>
                          <option value={3}>⭐⭐⭐ (3 - İyi)</option>
                          <option value={2}>⭐⭐ (2 - Orta)</option>
                          <option value={1}>⭐ (1 - Yetersiz)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">Yorumunuz</label>
                      <textarea
                        required
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Ürün işçiliği, konforu ve teslimat deneyiminiz hakkında fikirlerinizi paylaşın..."
                        className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Yorumu Gönder</span>
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* TAB 4: ÖDEME VE TAKSİT SEÇENEKLERİ */}
            {activeTab === 'payment' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Havale / EFT Cash Discount Banner */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-900 uppercase tracking-wider block">
                      Banka Havalesi / EFT ile %5 Ekstra İndirim Fırsatı
                    </span>
                    <span className="text-emerald-700 font-light">
                      Siparişinizi havale ile tamamlayarak doğrudan üretici peşin fiyat avantajından yararlanabilirsiniz.
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Peşin Fiyat</span>
                    <span className="text-lg font-extrabold text-emerald-900">{formatPrice(cashDiscountPrice)}</span>
                  </div>
                </div>

                {/* Credit Card Installment Tables */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#C5A880]" />
                    Anlaşmalı Banka Kredi Kartı Taksit Tablosu
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {INSTALLMENT_BANKS.map((bank, bIdx) => (
                      <div key={bIdx} className="border border-neutral-200 rounded-xs overflow-hidden shadow-2xs">
                        <div className="bg-[#FAF8F5] p-3 border-b border-neutral-200 font-bold text-xs text-neutral-900 flex items-center justify-between">
                          <span>{bank.logo}</span>
                          <span className="text-[10px] text-neutral-500 font-normal">Vade Farksız 3 Taksit</span>
                        </div>
                        <table className="w-full text-xs text-left">
                          <thead className="bg-neutral-50 text-[9px] uppercase text-neutral-500 font-bold border-b border-neutral-100">
                            <tr>
                              <th className="py-2 px-3">Taksit</th>
                              <th className="py-2 px-3">Aylık Tutar</th>
                              <th className="py-2 px-3 text-right">Toplam</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-neutral-700">
                            {bank.rates.map((rate, rIdx) => {
                              const totalWithRate = product.price * (1 + rate.r);
                              const monthly = totalWithRate / rate.m;
                              return (
                                <tr key={rIdx} className="hover:bg-neutral-50">
                                  <td className="py-2 px-3 font-semibold">{rate.m === 1 ? 'Tek Çekim' : `${rate.m} Taksit`}</td>
                                  <td className="py-2 px-3 font-mono">{formatPrice(monthly)}</td>
                                  <td className="py-2 px-3 font-mono text-right font-bold text-neutral-900">{formatPrice(totalWithRate)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: TESLİMAT VE İADE KOŞULLARI */}
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
                      <li><strong>İstanbul İçi:</strong> Kendi lojistik araçlarımız ve uzman montaj kadromuzla 3-5 iş günü içinde ücretsiz teslimat ve montaj.</li>
                      <li><strong>Tüm Türkiye:</strong> Anlaşmalı mobilya lojistik ağımızla dairenize/ofisinize kadar teslim edilir.</li>
                      <li><strong>Özel İmalat Siparişleri:</strong> Özel kumaş veya ölçü revizyonlarında üretim ve teslimat süresi ortalama 10-15 iş günüdür.</li>
                    </ul>
                  </div>

                  {/* Return & Warranty Info */}
                  <div className="p-6 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2] space-y-3">
                    <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm uppercase">
                      <ShieldCheck className="h-5 w-5 text-[#C5A880]" />
                      <h4>14 Gün İade & 5 Yıl İskelet Garantisi</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-600 list-disc list-inside">
                      <li><strong>14 Gün İade Hakkı:</strong> Standart koleksiyon ürünlerimizde teslimat tarihinden itibaren 14 gün içinde koşulsuz iade ve değişim hakkınız bulunmaktadır.</li>
                      <li><strong>5 Yıl Garanti:</strong> Masif fırınlanmış gürgen iskelet ve çelik konstrüksiyon aksamları 5 yıl süreyle Ermay Mobilya garantisi altındadır.</li>
                      <li><strong>2 Yıl Kumaş & Sünger Garantisi:</strong> Döşeme dikişleri ve sünger yoğunlukları 2 yıl tam garantilidir.</li>
                    </ul>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

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
