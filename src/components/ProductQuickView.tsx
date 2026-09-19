'use client';

import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useCartStore } from '../stores/useCartStore';
import type { ProductImages } from '../types';

export const ProductQuickView: React.FC = () => {
  const product = useUIStore((state) => state.selectedQuickViewProduct);
  const onClose = useUIStore((state) => state.closeQuickView);

  const isFavorite = useFavoritesStore((state) => (product ? state.isFavorite(product.id) : false));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const addToCart = useCartStore((state) => state.addToCart);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Reset indices when active product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  const getQuickViewImages = (): string[] => {
    if (product.images && typeof product.images === 'object' && 'gallery' in product.images) {
      const pImgs = product.images as ProductImages;
      return [pImgs.main, ...(pImgs.gallery || [])];
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return [product.image];
  };

  const productImagesList = getQuickViewImages();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  const isDiscounted = !!product.originalPrice;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white w-full max-w-4xl rounded-sm overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row transition-all duration-500 transform animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-neutral-900 bg-white/95 rounded-full shadow-md border border-neutral-100 hover:scale-105 duration-300 cursor-pointer"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 bg-neutral-50/50">
          <div className="aspect-[4/3] w-full rounded-sm overflow-hidden bg-neutral-100 relative">
            <img
              src={productImagesList[activeImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-brand-dark text-white text-[9px] tracking-widest uppercase font-semibold py-1 px-3 shadow-sm rounded-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails grid */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {productImagesList.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`w-20 aspect-square rounded-sm overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                  index === activeImageIndex 
                    ? 'border-brand-camel scale-95 shadow-sm' 
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`${product.name} Görsel ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Content Detail */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[45vh] md:max-h-[90vh]">
          {/* Header metadata */}
          <div className="mb-4">
            <span className="text-[10px] font-semibold text-brand-camel uppercase tracking-[0.2em] block mb-1">
              {(() => {
                const catObj = typeof product.category === 'object' && product.category !== null ? product.category as { name?: string; slug?: string } : null;
                const catSlug = catObj?.slug || (typeof product.category === 'string' ? product.category : '');
                return catObj?.name || catSlug || 'Ermay Mobilya';
              })()}
            </span>
            <h3 className="text-xl md:text-2xl font-light text-neutral-900 tracking-tight">
              {product.name}
            </h3>
          </div>

          {/* Rating and reviews */}
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? 'fill-current' : 'opacity-30'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500 font-medium">{product.rating}</span>
            <span className="text-neutral-300">|</span>
            <span className="text-xs text-neutral-400 font-light">({product.reviewsCount} Değerlendirme)</span>
          </div>

          {/* Prices */}
          <div className="mb-6">
            {isDiscounted && (
              <span className="text-sm text-neutral-400 line-through tracking-wider block">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            <span className={`text-2xl font-semibold tracking-wider ${
              isDiscounted ? 'text-brand-terracotta' : 'text-neutral-900'
            }`}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Short description */}
          <p className="text-neutral-500 text-sm font-light leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Key Specs */}
          <div className="bg-amber-50/40 p-4 rounded-lg border border-amber-200/60 flex flex-col gap-2 mb-4 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-amber-100">
              <span className="font-semibold text-neutral-700">Malzeme:</span>
              <span className="text-neutral-900 font-medium text-right">{product.material || '1. Sınıf Fırınlanmış Masif Ahşap'}</span>
            </div>
            {(product.widthCm || product.heightCm || product.depthCm) ? (
              <div className="flex justify-between items-center py-1 border-b border-amber-100">
                <span className="font-semibold text-neutral-700">Ölçüler (G × D × Y):</span>
                <span className="text-neutral-900 font-medium text-right">
                  {product.widthCm ? `${product.widthCm} cm (G)` : ''}
                  {product.depthCm ? ` × ${product.depthCm} cm (D)` : ''}
                  {product.heightCm ? ` × ${product.heightCm} cm (Y)` : ''}
                </span>
              </div>
            ) : product.dimensions ? (
              <div className="flex justify-between items-center py-1 border-b border-amber-100">
                <span className="font-semibold text-neutral-700">Boyutlar:</span>
                <span className="text-neutral-900 font-medium text-right">{product.dimensions}</span>
              </div>
            ) : null}

            {product.drawerCount !== undefined && product.drawerCount > 0 && (
              <div className="flex justify-between items-center py-1 border-b border-amber-100">
                <span className="font-semibold text-neutral-700">Çekmece Sayısı:</span>
                <span className="text-neutral-900 font-semibold text-right">{product.drawerCount} Adet (Teleskopik Frenli Ray)</span>
              </div>
            )}

            {product.unitCount !== undefined && product.unitCount > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-neutral-700">Modül / Ünite:</span>
                <span className="text-neutral-900 font-semibold text-right">{product.unitCount} Parça Modüler</span>
              </div>
            )}
          </div>

          {/* Color options if available */}
          {((product.colorOptions && product.colorOptions.length > 0) || (product.colors && product.colors.length > 0)) && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-neutral-800 block mb-1.5">Mevcut Renk Opsiyonları:</span>
              <div className="flex flex-wrap gap-1.5">
                {(product.colorOptions || product.colors || []).map((c, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-md font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features bullet list */}
          <div className="mb-6">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">Öne Çıkan Özellikler</h5>
            <ul className="text-neutral-600 text-xs font-normal space-y-1.5 list-disc pl-4">
              {product.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Quantity and CTA Buttons */}
          <div className="mt-auto border-t border-neutral-100 pt-5">
            <div className="flex items-center gap-3 mb-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-neutral-300 rounded-lg bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-bold"
                  aria-label="Miktarı azalt"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-semibold text-neutral-900 w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-bold"
                  aria-label="Miktarı arttır"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs md:text-sm font-semibold py-3.5 px-4 transition-all duration-200 rounded-lg shadow-sm cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Sepete Ekle</span>
              </button>

              {/* Favorite toggle */}
              <button
                onClick={() => toggleFavorite(product)}
                className={`p-3 border rounded-lg transition-all duration-200 cursor-pointer ${
                  isFavorite 
                    ? 'border-red-500 text-red-500 bg-red-50' 
                    : 'border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400'
                }`}
                aria-label="Favorilere Ekle/Çıkar"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* WhatsApp Direct Order CTA */}
            <a
              href={`https://wa.me/905320000000?text=${encodeURIComponent(`Selamlar Ermay Mobilya, "${product.name}" (${formatPrice(product.price)}) ürününüz için WhatsApp üzerinden doğrudan sipariş vermek ve teslimat durumunu öğrenmek istiyorum.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold py-3 px-4 rounded-lg shadow-sm transition-all duration-200 mb-4 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>WhatsApp ile Hızlı Sipariş / Pazarlık</span>
            </a>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-600 font-medium text-center">
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded border border-neutral-100">
                <Truck className="h-4 w-4 text-amber-700" />
                <span>Kendi Aracımızla Teslimat</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded border border-neutral-100">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span>2 Yıl Fabrika Garantisi</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded border border-neutral-100">
                <RefreshCw className="h-4 w-4 text-amber-700" />
                <span>Koşulsuz Değişim</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
