'use client';

import React from 'react';
import { ShieldCheck, Truck, Lock } from 'lucide-react';
import type { CartItem } from '../../../types';

interface CheckoutOrderSummaryProps {
  cart: CartItem[];
  totalCartAmount: number;
  discountAmount: number;
  couponCode: string;
  setCouponCode: (val: string) => void;
  couponMsg: { type: 'success' | 'error'; text: string } | null;
  handleApplyCoupon: (e: React.FormEvent) => void;
  formatPrice: (price: number) => string;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  cart,
  totalCartAmount,
  discountAmount,
  couponCode,
  setCouponCode,
  couponMsg,
  handleApplyCoupon,
  formatPrice,
}) => {
  const finalAmount = Math.max(0, totalCartAmount - discountAmount);

  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-6 shadow-xs sticky top-24">
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4">
        Sipariş Özeti ({cart.length} Ürün)
      </h2>

      {/* Cart Mini List */}
      <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
        {cart.map((item) => (
          <div key={item.product.id} className="py-3 flex items-center gap-3">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-12 h-12 object-cover rounded-xs border border-neutral-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-neutral-900 truncate">
                {item.product.name}
              </h4>
              <p className="text-[10px] text-neutral-500">
                {item.quantity} Adet x {formatPrice(item.product.price)}
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-900">
              {formatPrice(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Coupon Input */}
      <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-neutral-100">
        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
          İndirim Kuponu
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Örn: ERMAY10"
            className="flex-1 text-xs border border-neutral-300 rounded-xs px-3 py-2 uppercase font-mono focus:ring-1 focus:ring-brand-camel focus:outline-none"
          />
          <button
            type="submit"
            className="bg-neutral-900 hover:bg-brand-camel text-white text-xs font-bold px-4 py-2 rounded-xs transition-colors cursor-pointer"
          >
            Uygula
          </button>
        </div>

        {couponMsg && (
          <p className={`text-[11px] mt-1 font-medium ${couponMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {couponMsg.text}
          </p>
        )}
      </form>

      {/* Calculations */}
      <div className="space-y-2.5 pt-4 border-t border-neutral-100 text-xs">
        <div className="flex justify-between text-neutral-600">
          <span>Ara Toplam</span>
          <span className="font-semibold text-neutral-900">{formatPrice(totalCartAmount)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Kupon İndirimi</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-neutral-600">
          <span>Kargo Ücreti</span>
          <span className="text-emerald-600 font-bold uppercase">Ücretsiz</span>
        </div>

        <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline text-neutral-900 font-bold">
          <span className="text-sm uppercase tracking-wider">Toplam Tutar</span>
          <span className="text-xl text-brand-dark">{formatPrice(finalAmount)}</span>
        </div>
        <p className="text-[10px] text-neutral-400 text-right">Fiyatlara KDV dahildir.</p>
      </div>

      {/* Badges */}
      <div className="pt-4 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>%100 Güvenli 256-Bit SSL Şifreleme</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-brand-camel flex-shrink-0" />
          <span>Tüm Türkiye'ye Ücretsiz Sigortalı Teslimat</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-neutral-400 flex-shrink-0" />
          <span>Iyzico Güvencesiyle 3D Secure Ödeme</span>
        </div>
      </div>
    </div>
  );
};
