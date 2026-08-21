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
          <div className="bg-neutral-50 p-4 rounded-sm border border-neutral-100 flex flex-col gap-2 mb-6">
            <div className="text-xs flex justify-between">
              <span className="font-medium text-neutral-500">Malzeme:</span>
              <span className="text-neutral-800 text-right">{product.material}</span>
            </div>
            <div className="text-xs flex justify-between">
              <span className="font-medium text-neutral-500">Boyutlar:</span>
              <span className="text-neutral-800 text-right">{product.dimensions}</span>
            </div>
          </div>

          {/* Features bullet list */}
          <div className="mb-6">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">Özellikler</h5>
            <ul className="text-neutral-500 text-xs font-light space-y-1.5 list-disc pl-4">
              {product.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Quantity and CTA Buttons */}
          <div className="mt-auto border-t border-neutral-100 pt-6">
            <div className="flex items-center gap-4 mb-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-neutral-200 rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                  aria-label="Miktarı azalt"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-medium text-neutral-800 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
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
                className="flex-1 flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-camel text-white text-xs md:text-sm font-medium uppercase tracking-widest py-3.5 px-6 transition-colors duration-300 rounded-sm cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Sepete Ekle</span>
              </button>

              {/* Favorite toggle */}
              <button
                onClick={() => toggleFavorite(product)}
                className={`p-3 border rounded-sm transition-all duration-300 cursor-pointer ${
                  isFavorite 
                    ? 'border-brand-terracotta text-brand-terracotta bg-brand-terracotta/5' 
                    : 'border-neutral-200 text-neutral-500 hover:text-brand-camel hover:border-brand-camel'
                }`}
                aria-label="Favorilere Ekle/Çıkar"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400 font-light text-center">
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50/50">
                <Truck className="h-4.5 w-4.5 text-brand-camel" />
                <span>Ücretsiz Kurulum</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50/50">
                <ShieldCheck className="h-4.5 w-4.5 text-brand-camel" />
                <span>2 Yıl Garanti</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50/50">
                <RefreshCw className="h-4.5 w-4.5 text-brand-camel" />
                <span>Kolay İade</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
