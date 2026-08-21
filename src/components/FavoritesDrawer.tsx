'use client';

import React from 'react';
import { X, Trash2, Heart, ShoppingBag } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useCartStore } from '../stores/useCartStore';
import { OptimizedImage } from './OptimizedImage';

export const FavoritesDrawer: React.FC = () => {
  const isOpen = useUIStore((state) => state.isFavoritesOpen);
  const onClose = useUIStore((state) => state.closeFavorites);

  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const addToCart = useCartStore((state) => state.addToCart);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  if (!isOpen) return null;

  return (
    <div id="favorites-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-500" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white flex flex-col shadow-2xl animate-fade-in-up duration-300">
          {/* Header */}
          <div className="px-4 sm:px-6 py-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-brand-terracotta fill-brand-terracotta" />
              <h2 className="text-lg font-medium text-neutral-900 tracking-wide uppercase">
                Favorilerim
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-900 hover:scale-105 duration-200 cursor-pointer"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Favorites List */}
          <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
            {favorites.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Heart className="h-12 w-12 text-neutral-300 stroke-[1.5] mb-4" />
                <p className="text-neutral-500 font-light text-sm">
                  Henüz favori ürününüz bulunmuyor.
                </p>
                <p className="text-neutral-400 font-light text-xs mt-2 max-w-xs">
                  Ürün kartlarındaki kalp simgesine tıklayarak beğendiğiniz tasarımları buraya ekleyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {favorites.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex gap-4 border-b border-neutral-100 pb-5 items-start"
                  >
                    {/* Item Image */}
                    <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-neutral-50 border border-neutral-100">
                      <OptimizedImage
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between h-20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-normal tracking-wide text-neutral-800 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-sm font-semibold tracking-wider text-brand-dark">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFavorite(product.id)}
                          className="text-neutral-400 hover:text-brand-terracotta transition-colors p-1 cursor-pointer"
                          aria-label="Favorilerden çıkar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Direct Add to Cart Action */}
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => {
                            addToCart(product, 1);
                            removeFavorite(product.id);
                          }}
                          className="flex items-center gap-1 bg-neutral-100 hover:bg-brand-camel hover:text-white text-neutral-700 text-[10px] tracking-widest font-semibold uppercase py-1.5 px-3 transition-colors duration-300 rounded-sm cursor-pointer"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>Sepete Ekle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesDrawer;
