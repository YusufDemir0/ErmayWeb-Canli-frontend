'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useCartStore } from '../stores/useCartStore';
import { useUIStore } from '../stores/useUIStore';

export const FavoritesPage: React.FC = () => {
  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  const addToCart = useCartStore((state) => state.addToCart);
  const openQuickView = useUIStore((state) => state.openQuickView);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  return (
    <div className="w-full bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="text-xs text-neutral-400 font-light flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-brand-camel transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-600 font-normal">Favorilerim</span>
        </nav>

        <h2 className="text-2xl md:text-3xl font-light tracking-wide text-brand-dark mb-10 uppercase">
          Beğendiğim Tasarımlar
        </h2>

        {favorites.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="text-center py-20 bg-white border border-neutral-200/60 rounded-sm shadow-sm max-w-xl mx-auto">
            <Heart className="h-16 w-16 text-neutral-300 stroke-[1.5] mx-auto mb-6" />
            <h3 className="text-lg font-normal text-neutral-800 mb-2">Favori Ürününüz Yok</h3>
            <p className="text-neutral-500 font-light text-sm mb-8 px-6">
              Beğendiğiniz mobilya ve aksesuarları ürün kartlarının sağ üst köşesinde yer alan kalp simgesine tıklayarak buraya ekleyebilirsiniz.
            </p>
            <Link
              href="/"
              className="inline-block bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-4 px-8 rounded-sm transition-colors duration-300 cursor-pointer"
            >
              Koleksiyonları Keşfet
            </Link>
          </div>
        ) : (
          /* --- FAVORITES GRID --- */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {favorites.map((product) => {
              const discount = product.originalPrice 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                : 0;

              return (
                <div 
                  key={product.id}
                  className="group relative flex flex-col bg-white border border-neutral-200/60 rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-neutral-300 animate-fade-in-up"
                >
                  {/* Image and Badges */}
                  <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden cursor-pointer" onClick={() => openQuickView(product)}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      {discount > 0 && (
                        <span className="text-[9px] tracking-widest font-bold uppercase py-1 px-2.5 bg-brand-terracotta text-white shadow-sm rounded-xs">
                          %{discount} İndirim
                        </span>
                      )}
                      {product.badge && discount === 0 && (
                        <span className="text-[9px] tracking-widest font-semibold uppercase py-1 px-2.5 bg-white text-brand-dark shadow-sm border border-neutral-100 rounded-xs">
                          {product.badge}
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="text-[9px] tracking-widest font-semibold uppercase py-1 px-2.5 bg-neutral-600 text-white shadow-sm rounded-xs">
                          Tükendi
                        </span>
                      )}
                    </div>

                    {/* Heart Button to remove */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(product.id);
                      }}
                      className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-xs border border-neutral-100 transition-all duration-300 hover:scale-110 text-brand-terracotta cursor-pointer"
                      aria-label="Favorilerden Çıkar"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>

                    {/* Hover actions */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickView(product);
                        }}
                        className="flex items-center gap-1.5 bg-white text-neutral-800 text-[10px] tracking-widest font-semibold uppercase py-2.5 px-4 rounded-xs shadow-md transition-all hover:bg-neutral-100 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Detay</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.inStock) {
                            addToCart(product, 1);
                            removeFavorite(product.id);
                          }
                        }}
                        disabled={!product.inStock}
                        className={`flex items-center gap-1.5 text-white text-[10px] tracking-widest font-semibold uppercase py-2.5 px-4 rounded-xs shadow-md transition-all cursor-pointer ${
                          product.inStock ? 'bg-brand-camel hover:bg-brand-camel-dark' : 'bg-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{product.inStock ? 'Ekle' : 'Stok Yok'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">
                        {(() => {
                          const catObj = typeof product.category === 'object' && product.category !== null ? product.category as { name?: string; slug?: string } : null;
                          const catSlug = catObj?.slug || (typeof product.category === 'string' ? product.category : '');
                          return catObj?.name || catSlug || 'Ermay Mobilya';
                        })()}
                      </span>
                      <h4 
                        onClick={() => openQuickView(product)}
                        className="text-neutral-800 text-sm md:text-base font-normal tracking-wide hover:text-brand-camel transition-colors duration-300 line-clamp-1 cursor-pointer mb-2"
                      >
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-2 flex items-end justify-between">
                      <div className="flex flex-col">
                        {product.originalPrice && (
                          <span className="text-xs text-neutral-400 line-through tracking-wider">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        <span className={`text-sm md:text-base font-semibold tracking-wider ${
                          product.originalPrice ? 'text-brand-terracotta' : 'text-neutral-900'
                        }`}>
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.inStock) {
                            addToCart(product, 1);
                            removeFavorite(product.id);
                          }
                        }}
                        disabled={!product.inStock}
                        className={`hidden sm:flex items-center gap-1 border text-[10px] tracking-widest font-semibold uppercase py-2 px-3.5 transition-all duration-300 rounded-xs cursor-pointer ${
                          product.inStock 
                            ? 'border-neutral-200 text-neutral-700 hover:border-brand-camel hover:bg-brand-camel hover:text-white' 
                            : 'border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="h-3 w-3" />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
