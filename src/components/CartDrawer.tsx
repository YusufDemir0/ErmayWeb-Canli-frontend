'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useCartStore } from '../stores/useCartStore';
import { OptimizedImage } from './OptimizedImage';

export const CartDrawer: React.FC = () => {
  const isOpen = useUIStore((state) => state.isCartOpen);
  const onClose = useUIStore((state) => state.closeCart);

  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  if (!isOpen) return null;

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
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
              <ShoppingBag className="h-5 w-5 text-brand-dark" />
              <h2 className="text-lg font-medium text-neutral-900 tracking-wide uppercase">
                Alışveriş Sepetim
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

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-12 w-12 text-neutral-300 stroke-[1.5] mb-4" />
                <p className="text-neutral-500 font-light text-sm mb-6">
                  Sepetiniz şu anda boş.
                </p>
                <button
                  onClick={onClose}
                  className="bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-wider uppercase py-3 px-6 rounded-sm transition-colors duration-300 cursor-pointer"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const itemKey = item.itemKey || item.product.id;
                  return (
                    <div 
                      key={itemKey} 
                      className="flex gap-4 border-b border-neutral-100 pb-5 items-start"
                    >
                      {/* Item Image */}
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-neutral-50 border border-neutral-100">
                        <OptimizedImage
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-sm font-medium text-neutral-900">
                            <h3 className="line-clamp-1 font-normal tracking-wide text-neutral-800">
                              {item.product.name}
                            </h3>
                            <p className="ml-4 font-semibold tracking-wider">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                          {item.product.selectedColor && (
                            <div className="mt-1">
                              <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-xs">
                                Renk: {item.product.selectedColor}
                              </span>
                            </div>
                          )}
                          {item.product.selectedPieces && item.product.selectedPieces.length > 0 && (
                            <div className="mt-1">
                              <span className="text-[10px] text-neutral-700 bg-amber-50/80 border border-amber-200/80 px-2 py-0.5 rounded-xs font-mono block line-clamp-1">
                                Parçalar: {item.product.selectedPieces.join(', ')}
                              </span>
                            </div>
                          )}
                          <p className="mt-1 text-xs text-neutral-400 font-light capitalize">
                            {item.product.material}
                          </p>

                          {/* Dynamic Manufacturing Lead Time / Stock Status */}
                          <div className="mt-1.5 flex items-center gap-1.5">
                            {item.product.stock && item.product.stock > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-2xs border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Stokta Hazır (1-2 İş Günü Fabrika Sevkiyatı)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-2xs border border-amber-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Fabrika Seri Üretimi (3-5 İş Günü)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls and Trash Button */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-neutral-200 rounded-sm">
                            <button
                              onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                              className="p-1 hover:bg-neutral-50 text-neutral-500 transition-colors cursor-pointer"
                              aria-label="Miktarı azalt"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-medium text-neutral-700 w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                              className="p-1 hover:bg-neutral-50 text-neutral-500 transition-colors cursor-pointer"
                              aria-label="Miktarı arttır"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(itemKey)}
                            className="text-neutral-400 hover:text-brand-terracotta transition-colors p-1 cursor-pointer"
                            aria-label="Ürünü çıkar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Calculations */}
          {cartItems.length > 0 && (
            <div className="border-t border-neutral-100 py-6 px-4 sm:px-6 bg-neutral-50/50">
              <div className="space-y-1.5 mb-6">
                <div className="flex justify-between text-xs text-neutral-500 font-light">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 font-light">
                  <span>KDV (%20)</span>
                  <span>Dahil</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-2 border-t border-neutral-200/60">
                  <span>Tahmini Tutar</span>
                  <span className="text-brand-terracotta">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* B2B Wholesale Notice */}
              <div className="mb-4 p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xs flex items-center justify-between text-[11px] text-amber-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>🏢</span>
                  <span>Çoklu Alım / Ofis Kurulumu</span>
                </span>
                <a
                  href="https://wa.me/905324194151?text=Merhaba%2C%20%C5%9Firketimiz%20i%C3%A7in%20adetli%20ve%20toplu%20ofis%20mobilyas%C4%B1%20al%C4%B1m%C4%B1%20yapmak%20istiyoruz.%20Fabrika%20iskontolu%20fiyat%20teklifi%20alabilir%20miyiz%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#8A4B20] hover:underline shrink-0 ml-2"
                >
                  Toptan İskonto İste &rarr;
                </a>
              </div>

              {/* Checkout CTA */}
              <Link
                id="checkout-btn"
                href="/talep"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-4 transition-colors duration-300 rounded-sm shadow-md cursor-pointer"
              >
                <span>Sipariş Talebi Oluştur</span>
                <ArrowRight className="h-4 w-4" />
              </Link>


              <div className="mt-4 flex justify-center text-center text-xs text-neutral-400 font-light">
                <p>
                  veya{' '}
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-brand-camel font-medium hover:text-brand-camel-dark transition-colors cursor-pointer"
                  >
                    Alışverişe Devam Et<span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
