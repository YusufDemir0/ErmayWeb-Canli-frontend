'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
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

export const ProductCard: React.FC<ProductCardProps> = ({
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  const isDiscounted = !!product.originalPrice;

  // Safe Extraction of Main Image
  const getProductImage = (): string => {
    if (product.images && typeof product.images === 'object' && 'main' in product.images) {
      return (product.images as ProductImages).main;
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || '';
  };

  return (
    <div 
      className="group relative flex flex-col bg-white border border-neutral-100 rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-neutral-200"
    >
      {/* Image and Badges/Actions */}
      <Link href={`/urun/${product.id}`} className="relative aspect-[4/5] bg-neutral-100 overflow-hidden block">
        <OptimizedImage
          src={getProductImage()}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />

        {/* Brand/Promo Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span 
              className={`text-[9px] tracking-[0.15em] font-semibold uppercase py-1 px-3 shadow-sm rounded-sm border ${
                product.badge.includes('İndirim') || product.badge.includes('%')
                  ? 'bg-brand-terracotta text-white border-brand-terracotta-dark'
                  : 'bg-white text-brand-dark border-neutral-100'
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleFavorite();
          }}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-100/50 shadow-sm transition-all duration-300 hover:scale-110 hover:bg-white cursor-pointer ${
            isFav ? 'text-brand-terracotta' : 'text-neutral-500 hover:text-brand-camel'
          }`}
          aria-label={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Action Bar: Directly view product page */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center justify-center gap-3">
          <span className="flex items-center justify-center gap-1.5 bg-white/95 hover:bg-white text-neutral-800 text-[10px] tracking-widest font-semibold uppercase py-2.5 px-4 rounded-sm transition-colors shadow-lg">
            <Eye className="h-3 w-3" />
            <span>Detayları İncele</span>
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            className="flex items-center justify-center gap-1.5 bg-brand-camel hover:bg-brand-camel-dark text-white text-[10px] tracking-widest font-semibold uppercase py-2.5 px-4 rounded-sm transition-colors shadow-lg cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Ekle</span>
          </button>
        </div>
      </Link>

      {/* Details Section */}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">
            {(() => {
              const catObj = typeof product.category === 'object' && product.category !== null ? product.category as { name?: string; slug?: string } : null;
              const catSlug = catObj?.slug || (typeof product.category === 'string' ? product.category : '');
              const catName = catObj?.name;

              if (catSlug === 'living-room' || catSlug === 'koltuk-takimlari') return 'Koltuk Takımları';
              if (catSlug === 'dining-room' || catSlug === 'yemek-odalari') return 'Yemek Masaları';
              if (catSlug === 'bedroom' || catSlug === 'yatak-odalari') return 'Yatak Odası';
              if (catSlug === 'work-desks' || catSlug === 'makam-takimlari') return 'Makam Takımları';
              if (catSlug === 'reception' || catSlug === 'tv-uniteleri') return 'TV Üniteleri';
              if (catSlug === 'accessories' || catSlug === 'aksesuarlar') return 'Aksesuarlar';
              return catName || catSlug || 'Ermay Mobilya';
            })()}
          </span>
          {/* Name */}
          <Link 
            href={`/urun/${product.id}`}
            className="text-neutral-800 text-sm md:text-base font-normal tracking-wide hover:text-brand-camel transition-colors duration-300 line-clamp-1 block mb-2"
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

          {/* Quick Add to Cart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="md:hidden flex items-center justify-center bg-neutral-100 hover:bg-brand-camel hover:text-white text-neutral-700 h-9 w-9 rounded-full transition-all duration-300 cursor-pointer"
            aria-label="Sepete Ekle"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="hidden md:flex items-center gap-1.5 border border-neutral-200 text-neutral-700 group-hover:border-brand-camel group-hover:bg-brand-camel group-hover:text-white text-[10px] tracking-widest font-semibold uppercase py-2 px-3.5 transition-all duration-300 rounded-sm cursor-pointer"
          >
            <ShoppingBag className="h-3 w-3" />
            <span>Sepete Ekle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
