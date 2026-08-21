'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Tag, CheckCircle, XCircle } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useDiscountStore } from '../stores/useDiscountStore';

export const CartPage: React.FC = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const validateCoupon = useDiscountStore((state) => state.validateCoupon);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = validateCoupon(couponInput, subtotal);
    if (res.valid) {
      setCouponDiscount(res.discountAmount);
      setAppliedCouponCode(couponInput.toUpperCase().trim());
      setCouponFeedback({ type: 'success', message: res.message });
    } else {
      setCouponDiscount(0);
      setAppliedCouponCode('');
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  const finalTotal = Math.max(0, subtotal - couponDiscount);

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
          <span className="text-neutral-600 font-normal">Sepetim</span>
        </nav>

        <h2 className="text-2xl md:text-3xl font-light tracking-wide text-brand-dark mb-10 uppercase">
          Alışveriş Sepetim
        </h2>

        {cartItems.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="text-center py-20 bg-white border border-neutral-200/60 rounded-sm shadow-sm max-w-xl mx-auto">
            <ShoppingBag className="h-16 w-16 text-neutral-300 stroke-[1.5] mx-auto mb-6" />
            <h3 className="text-lg font-normal text-neutral-800 mb-2">Sepetiniz Boş</h3>
            <p className="text-neutral-500 font-light text-sm mb-8 px-6">
              Sepetinizde henüz ürün bulunmuyor. Koleksiyonlarımızı inceleyerek dilediğiniz ürünü ekleyebilirsiniz.
            </p>
            <Link
              href="/"
              className="inline-block bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-4 px-8 rounded-sm transition-colors duration-300 cursor-pointer"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          /* --- CART LAYOUT --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 bg-white rounded-sm border border-neutral-200/60 shadow-sm p-6 space-y-6">
              <div className="hidden sm:grid grid-cols-12 text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-3">
                <span className="col-span-6">Ürün Detayı</span>
                <span className="col-span-2 text-center">Fiyat</span>
                <span className="col-span-2 text-center">Adet</span>
                <span className="col-span-2 text-right">Toplam</span>
              </div>

              {cartItems.map((item) => (
                <div 
                  key={item.product.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center border-b border-neutral-100 pb-6 last:border-0 last:pb-0"
                >
                  {/* Image and Name */}
                  <div className="col-span-1 sm:col-span-6 flex gap-4 items-center">
                    <div className="h-24 w-18 flex-shrink-0 rounded-sm overflow-hidden bg-neutral-50 border border-neutral-100">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-neutral-800 text-sm font-medium tracking-wide hover:text-brand-camel cursor-pointer">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-neutral-400 font-light mt-1 capitalize">
                        {item.product.material}
                      </p>
                      <button
                        onClick={() => removeItem(item.product.id)}
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
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-neutral-50 text-neutral-500 transition-colors cursor-pointer"
                        aria-label="Miktarı azalt"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-neutral-700 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
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
              ))}

              {/* Order note textarea */}
              <div className="pt-6 border-t border-neutral-100">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2">
                  Sipariş Notu (İsteğe Bağlı)
                </label>
                <textarea
                  placeholder="Kuryeye iletmek istediğiniz not veya kurulum tercihlerinizi buraya yazabilirsiniz..."
                  rows={3}
                  className="w-full text-xs border border-neutral-200 p-3 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none bg-neutral-50/50 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Right Column: Cost Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-sm border border-neutral-200/60 shadow-sm p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-4 mb-6">
                  Sipariş Özeti
                </h3>

                <div className="space-y-4 text-xs font-light text-neutral-500 border-b border-neutral-100 pb-6 mb-6">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span className="text-neutral-800 font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        <span>Kupon İndirimi ({appliedCouponCode})</span>
                      </span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>KDV (%20)</span>
                    <span className="text-neutral-800">Dahil</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo & Teslimat</span>
                    <span className="text-emerald-600 font-semibold">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uzman Montaj Hizmeti</span>
                    <span className="text-emerald-600 font-semibold">Ücretsiz</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCoupon} className="mb-6">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-2">
                    Kupon Kodu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="ERMAY10"
                      className="flex-1 bg-white border border-neutral-200 px-3 py-2 text-xs uppercase font-mono rounded-xs focus:outline-none focus:ring-1 focus:ring-brand-camel focus:border-brand-camel"
                    />
                    <button 
                      type="submit" 
                      className="bg-neutral-900 hover:bg-brand-camel text-white text-[10px] uppercase font-bold tracking-wider px-4 py-2 transition-colors rounded-xs cursor-pointer"
                    >
                      Uygula
                    </button>
                  </div>
                  {couponFeedback && (
                    <div className={`mt-2 text-xs flex items-center gap-1.5 ${
                      couponFeedback.type === 'success' ? 'text-emerald-700 font-medium' : 'text-rose-600'
                    }`}>
                      {couponFeedback.type === 'success' ? (
                        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span>{couponFeedback.message}</span>
                    </div>
                  )}
                </form>

                {/* Grand Total */}
                <div className="flex justify-between items-baseline mb-6 pt-2">
                  <span className="text-sm font-semibold text-neutral-800">Toplam Tutar:</span>
                  <span className="text-xl font-bold tracking-wider text-brand-terracotta">{formatPrice(finalTotal)}</span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/odeme"
                  className="w-full flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-4 transition-colors duration-300 rounded-sm shadow-md cursor-pointer"
                >
                  <span>Alışverişi Tamamla</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Security guarantees */}
              <div className="bg-white rounded-sm border border-neutral-200/60 shadow-sm p-5 space-y-4">
                <div className="flex gap-3.5 items-start">
                  <ShieldCheck className="h-5 w-5 text-brand-camel flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-semibold text-neutral-800">Güvenli Ödeme Garantisi</h5>
                    <p className="text-[10px] text-neutral-400 font-light mt-0.5 leading-relaxed">
                      Kredi kartı bilgileriniz 256-bit SSL şifreleme altyapısıyla korunmaktadır.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3.5 items-start">
                  <Truck className="h-5 w-5 text-brand-camel flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-semibold text-neutral-800">Hasarsız Teslimat Güvencesi</h5>
                    <p className="text-[10px] text-neutral-400 font-light mt-0.5 leading-relaxed">
                      Kargo hasarları Ermay sorumluluğundadır. Ücretsiz yeni ürün gönderilir.
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
