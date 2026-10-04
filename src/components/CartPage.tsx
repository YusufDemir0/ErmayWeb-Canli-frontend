'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useWhatsappNumber } from '../lib/whatsapp';

export const CartPage: React.FC = () => {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price).replace('TRY', 'TL');
  };

  return (
    <div className="w-full bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="text-xs text-neutral-400 font-light flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-brand-camel transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-600 font-normal">Sepetim</span>
        </nav>

        <h2 className="text-2xl md:text-3xl font-light tracking-wide text-brand-dark mb-10 uppercase">
          Alışveriş Sepetim
        </h2>

        {!isMounted ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-camel mb-3"></div>
            <p className="text-xs text-neutral-400 font-light">Sepetiniz yükleniyor...</p>
          </div>
        ) : cartItems.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="text-center py-20 bg-white border border-neutral-200/60 rounded-sm shadow-sm max-w-xl mx-auto">
            <ShoppingBag className="h-16 w-16 text-neutral-300 stroke-[1.5] mx-auto mb-6" />
            <h3 className="text-lg font-normal text-neutral-800 mb-2">Sepetiniz Boş</h3>
            <p className="text-neutral-500 font-light text-sm mb-8 px-6">
              Sepetinizde henüz ürün bulunmuyor. Koleksiyonlarımızı inceleyerek dilediğiniz mobilyayı ekleyebilirsiniz.
            </p>
            <Link
              href="/"
              className="inline-block bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-4 px-8 rounded-sm transition-colors duration-300 cursor-pointer"
            >
              Koleksiyonları İncele
            </Link>
          </div>
        ) : (
          /* --- CART LAYOUT --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 bg-white rounded-sm border border-neutral-200/60 shadow-sm p-6 space-y-6">
              <div className="hidden sm:grid grid-cols-12 text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-3">
                <span className="col-span-6">Ürün Detayı</span>
                <span className="col-span-2 text-center">Birim Fiyat</span>
                <span className="col-span-2 text-center">Adet</span>
                <span className="col-span-2 text-right">Toplam</span>
              </div>

              {cartItems.map((item) => {
                const itemKey = item.itemKey || item.product.id;
                return (
                  <div 
                    key={itemKey}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center border-b border-neutral-100 pb-6 last:border-0 last:pb-0"
                  >
                    {/* Image and Name */}
                    <div className="col-span-1 sm:col-span-6 flex gap-4 items-center">
                      <div className="h-24 w-20 flex-shrink-0 rounded-sm overflow-hidden bg-neutral-50 border border-neutral-100">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-neutral-800 text-sm font-medium tracking-wide">
                          {item.product.name}
                        </h4>
                        {item.product.selectedColor && (
                          <p className="mt-1 text-xs">
                            <span className="inline-block bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-xs font-medium">
                              Renk: {item.product.selectedColor}
                            </span>
                          </p>
                        )}
                        {item.product.selectedPieces && item.product.selectedPieces.length > 0 && (
                          <p className="mt-1 text-[11px]">
                            <span className="inline-block bg-amber-50 text-neutral-800 border border-amber-200/80 px-2 py-0.5 rounded-xs font-mono">
                              Parçalar: {item.product.selectedPieces.join(', ')}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-neutral-400 font-light mt-1 capitalize">
                          {item.product.material}
                        </p>

                        {/* Manufacturing Lead Time Badge */}
                        <div className="mt-2 flex items-center gap-1.5">
                          {item.product.stock && item.product.stock > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Stokta Hazır (1-2 İş Günü Fabrika Sevkiyatı)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Fabrika Seri Üretimi (3-5 İş Günü Bant Çıkışı)
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => removeItem(itemKey)}
                          className="text-xs text-neutral-400 hover:text-brand-terracotta transition-colors flex items-center gap-1 mt-2.5 cursor-pointer"
                          aria-label="Ürünü kaldır"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Kaldır</span>
                        </button>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="col-span-1 sm:col-span-2 text-left sm:text-center">
                      <span className="sm:hidden text-xs text-neutral-400 font-medium mr-2">Birim Fiyat:</span>
                      <span className="text-sm text-neutral-800 font-medium tracking-wider">
                        {formatPrice(item.product.price)}
                      </span>
                    </div>

                    {/* Quantity adjust */}
                    <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                      <div className="flex items-center border border-neutral-200 rounded-sm bg-white">
                        <button
                          onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                          className="p-1.5 hover:bg-neutral-50 text-neutral-500 transition-colors cursor-pointer"
                          aria-label="Miktarı azalt"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-neutral-700 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                          className="p-1.5 hover:bg-neutral-50 text-neutral-500 transition-colors cursor-pointer"
                          aria-label="Miktarı arttır"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Multiply total */}
                    <div className="col-span-1 sm:col-span-2 text-left sm:text-right">
                      <span className="sm:hidden text-xs text-neutral-400 font-medium mr-2">Toplam:</span>
                      <span className="text-sm text-brand-dark font-bold tracking-wider">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Cost Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-sm border border-neutral-200/60 shadow-sm p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-4 mb-6">
                  Talep Özeti
                </h3>

                <div className="space-y-4 text-xs font-light text-neutral-500 border-b border-neutral-100 pb-6 mb-6">
                  <div className="flex justify-between">
                    <span>Katalog Ara Toplam</span>
                    <span className="text-neutral-800 font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KDV (%20)</span>
                    <span className="text-neutral-800">Dahil</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Teslimat & Kurulum</span>
                    <span className="text-neutral-700">Temsilciyle Netleştirilir</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-baseline mb-6 pt-2">
                  <span className="text-sm font-semibold text-neutral-800">Tahmini Tutar:</span>
                  <span className="text-xl font-bold tracking-wider text-brand-terracotta">{formatPrice(subtotal)}</span>
                </div>

                {/* B2B Wholesale Notice */}
                <div className="mb-4 p-3 bg-amber-50/90 border border-amber-200/80 rounded-xs flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏢</span>
                    <span className="font-medium">Çoklu Alım / Şirket Kurulumu</span>
                  </div>
                  <a
                    href={`https://wa.me/${waNumber}?text=Merhaba%2C%20%C5%9Firketimiz%20i%C3%A7in%20adetli%20ve%20toplu%20ofis%20mobilyas%C4%B1%20al%C4%B1m%C4%B1%20yapmak%20istiyoruz.%20Fabrika%20iskontolu%20fiyat%20teklifi%20alabilir%20miyiz%3F`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#8A4B20] hover:underline shrink-0 ml-2"
                  >
                    Toptan İskonto İste &rarr;
                  </a>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/talep"
                  className="w-full flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-4 transition-colors duration-300 rounded-sm shadow-md cursor-pointer"
                >
                  <span>Sipariş Talebi Oluştur</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="text-[11px] text-neutral-400 font-light text-center mt-3 leading-relaxed">
                  Sitemiz üzerinden kredi kartı tahsilatı yapılmamaktadır. Sipariş talebiniz satış temsilcimize veya mağazamıza iletilir.
                </p>
              </div>

              {/* Guarantees */}
              <div className="bg-white rounded-sm border border-neutral-200/60 shadow-sm p-5 space-y-4">
                <div className="flex gap-3.5 items-start">
                  <Sparkles className="h-5 w-5 text-brand-camel flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-semibold text-neutral-800">Doğrudan Fabrikadan Aracısız Satış</h5>
                    <p className="text-[10px] text-neutral-400 font-light mt-0.5 leading-relaxed">
                      Mobilyalarımız kendi üretim tesislerimizde standart seri olarak üretilir. Aracı ve komisyon olmadan doğrudan fabrikadan teslim edilir.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3.5 items-start">
                  <ShieldCheck className="h-5 w-5 text-brand-camel flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-semibold text-neutral-800">Şeffaf Sipariş & Resmi Hesap</h5>
                    <p className="text-[10px] text-neutral-400 font-light mt-0.5 leading-relaxed">
                      Ödemeler sadece resmi şirket banka hesabımıza veya showroomlarımızda kabul edilir.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3.5 items-start">
                  <Truck className="h-5 w-5 text-brand-camel flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-semibold text-neutral-800">Güvenli Montaj ve Teslimat</h5>
                    <p className="text-[10px] text-neutral-400 font-light mt-0.5 leading-relaxed">
                      Uzman ekibimiz tarafından kata teslimat ve montaj hizmeti sağlanır.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
