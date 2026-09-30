'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product, ProductImages } from '../types';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddToCart?: () => void;
}

// Module-level cached formatter to avoid expensive re-allocations on render cycles
const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

const formatPrice = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num) || num === undefined || num === null) return '0 TL';
  return currencyFormatter.format(num).replace('TRY', 'TL');
};

interface CardProductImages {
  main: string;
  secondary?: string;
}

const getProductImages = (product: Product): CardProductImages => {
  if (product.images && typeof product.images === 'object' && 'main' in product.images) {
    const imgs = product.images as ProductImages;
    return {
      main: imgs.main || product.image || '',
      secondary: imgs.gallery && imgs.gallery.length > 0 ? imgs.gallery[0] : undefined,
    };
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    return {
      main: product.images[0] || product.image || '',
      secondary: product.images.length > 1 ? product.images[1] : undefined,
    };
  }
  return {
    main: product.image1 || product.image || '',
    secondary: product.image2 || undefined,
  };
};

const getCategoryLabel = (category: Product['category']): string => {
  const catObj = typeof category === 'object' && category !== null ? (category as { name?: string; slug?: string }) : null;
  if (catObj?.name) return catObj.name;
  const catSlug = catObj?.slug || (typeof category === 'string' ? category : '');
  if (catSlug === 'oturma-odasi' || catSlug === 'living-room' || catSlug === 'koltuk-takimlari') return 'Oturma Odası';
  if (catSlug === 'yemek-odasi' || catSlug === 'dining-room' || catSlug === 'yemek-odalari') return 'Yemek Odası';
  if (catSlug === 'yatak-odasi' || catSlug === 'bedroom' || catSlug === 'yatak-odalari') return 'Yatak Odası';
  return catSlug || 'Ermay Mobilya';
};

export const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  isFavorite: isFavoriteProp,
  onToggleFavorite: onToggleFavoriteProp,
  onAddToCart: onAddToCartProp,
}) => {
  const storeIsFavorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const storeToggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const storeAddToCart = useCartStore((state) => state.addToCart);

  const isFav = isFavoriteProp !== undefined ? isFavoriteProp : storeIsFavorite;

  const handleToggleFavorite = () => {
    if (onToggleFavoriteProp) {
      onToggleFavoriteProp();
    } else {
      storeToggleFavorite(product);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCartProp) {
      onAddToCartProp();
    } else {
      storeAddToCart(product, 1);
    }
  };

  const isDiscounted = !!product.originalPrice;
  const { main: mainImage, secondary: secondaryImage } = getProductImages(product);
  const categoryLabel = getCategoryLabel(product.category);

  return (
    <div 
      className="group relative flex flex-col bg-white border border-[#EAE3D2]/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#C5A880]/60"
    >
      {/* Image and Badges/Actions */}
      <Link href={`/urun/${product.slug || product.id}`} className="relative aspect-[4/5] bg-neutral-100/60 overflow-hidden block">
        {/* Primary Angle Image */}
        <OptimizedImage
          src={mainImage}
          alt={product.name}
          fill
          className={`object-cover transform-gpu transition-all duration-700 ease-out will-change-transform ${
            secondaryImage 
              ? 'group-hover:scale-105 group-hover:opacity-0' 
              : 'group-hover:scale-105'
          }`}
        />

        {/* Secondary Angle Image (Reveals on Hover if exists) */}
        {secondaryImage && (
          <OptimizedImage
            src={secondaryImage}
            alt={`${product.name} - Detay`}
            fill
            className="object-cover absolute inset-0 opacity-0 transform-gpu transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105 will-change-transform"
          />
        )}

        {/* Brand/Promo Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1">
          {product.badge && (
            <span 
              className={`text-[9px] tracking-[0.15em] font-semibold uppercase py-1 px-2.5 shadow-sm rounded-xs border ${
                product.badge.includes('İndirim') || product.badge.includes('%')
                  ? 'bg-brand-terracotta text-white border-brand-terracotta-dark'
                  : 'bg-white text-neutral-900 border-neutral-200'
              }`}
            >
              {product.badge}
            </span>
          )}
          <span className="text-[8px] font-bold uppercase tracking-wider bg-neutral-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-xs w-fit">
            Fabrika Satış
          </span>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleFavorite();
          }}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-100/50 shadow-sm transition-transform duration-200 hover:scale-110 hover:bg-white cursor-pointer transform-gpu ${
            isFav ? 'text-brand-terracotta' : 'text-neutral-500 hover:text-brand-camel'
          }`}
          aria-label={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

      </Link>

      {/* Details Section */}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">
            {categoryLabel}
          </span>
          {/* Name */}
          <Link 
            href={`/urun/${product.slug || product.id}`}
            className="text-neutral-800 text-sm md:text-base font-normal tracking-wide hover:text-brand-camel transition-colors duration-200 line-clamp-1 block mb-2"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Primary Action */}
        <div className="mt-2 flex items-end justify-between">
          <div className="flex flex-col">
            {isDiscounted && (
              <span className="text-xs text-neutral-400 line-through tracking-wider">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            <span className={`text-sm md:text-base font-semibold tracking-wider ${
              isDiscounted ? 'text-brand-terracotta' : 'text-brand-dark'
            }`}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Quick Add to Cart (Mobile) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="md:hidden flex items-center justify-center bg-neutral-100 hover:bg-brand-camel hover:text-white text-neutral-700 h-9 w-9 rounded-full transition-colors duration-200 cursor-pointer"
            aria-label="Sepete Ekle"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          
          {/* Quick Add to Cart (Desktop) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="hidden md:flex items-center gap-1.5 border border-neutral-200 text-neutral-700 group-hover:border-brand-camel group-hover:bg-brand-camel group-hover:text-white text-[10px] tracking-widest font-semibold uppercase py-2 px-3.5 transition-colors duration-200 rounded-sm cursor-pointer"
          >
            <ShoppingBag className="h-3 w-3" />
            <span>Sepete Ekle</span>
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
