'use client';

import React from 'react';

interface AnimatedCreditCardProps {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  isFlipped?: boolean;
  cardType?: 'visa' | 'mastercard' | 'troy' | 'generic';
}

export const AnimatedCreditCard: React.FC<AnimatedCreditCardProps> = ({
  cardNumber,
  cardHolder,
  expiry,
  cvv,
  isFlipped = false,
  cardType,
}) => {
  // Determine card brand from number prefix or prop
  const getCardBrand = () => {
    if (cardType) return cardType;
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) return 'visa';
    if (cleanNum.startsWith('5') || cleanNum.startsWith('2')) return 'mastercard';
    if (cleanNum.startsWith('9') || cleanNum.startsWith('6')) return 'troy';
    return 'generic';
  };

  const brand = getCardBrand();

  // Format card number to 16 digits with spaces
  const formatDisplayNumber = () => {
    const raw = cardNumber.replace(/\D/g, '').slice(0, 16);
    const padded = raw.padEnd(16, '•');
    return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
  };

  const displayHolder = cardHolder.trim() ? cardHolder.toUpperCase() : 'AD SOYAD';
  const displayExpiry = expiry.trim() ? expiry : 'MM/YY';
  const displayCvv = cvv.trim() ? cvv : '•••';

  return (
    <div className="w-full max-w-[380px] h-[220px] mx-auto perspective-[1000px] select-none">
      <div
        className={`relative w-full h-full duration-700 ease-out transform-style-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT FACE OF CREDIT CARD */}
        <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 p-6 text-white shadow-2xl border border-neutral-700/60 backface-hidden overflow-hidden flex flex-col justify-between">
          {/* Subtle Background Sheen & Ermay Watermark */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-camel/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-6 bottom-16 text-[54px] font-black text-white/5 tracking-tighter pointer-events-none select-none">
            ERMAY
          </div>

          {/* Top Row: Chip & Logo */}
          <div className="flex justify-between items-start z-10">
            {/* EMV Gold Chip Graphic */}
            <div className="flex items-center gap-2">
              <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 border border-amber-600/50 p-1 flex flex-col justify-between shadow-inner">
                <div className="w-full h-1/3 border-b border-amber-600/40" />
                <div className="w-full h-1/3 border-b border-amber-600/40" />
              </div>
              {/* Contactless Signal Icon */}
              <svg className="w-5 h-5 text-amber-200/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.24 7.76a9 9 0 010 12.72" />
              </svg>
            </div>

            {/* Ermay Brand Badge & Card Network */}
            <div className="text-right">
              <div className="text-[10px] font-extrabold tracking-widest text-brand-camel uppercase">
                ERMAY PRIVILEGE
              </div>
              <div className="text-xs font-bold tracking-widest text-neutral-300">
                {brand === 'visa' && <span className="font-serif italic font-extrabold text-white text-lg">VISA</span>}
                {brand === 'mastercard' && (
                  <div className="flex items-center justify-end -space-x-2">
                    <div className="w-5 h-5 rounded-full bg-rose-500/90" />
                    <div className="w-5 h-5 rounded-full bg-amber-400/90" />
                  </div>
                )}
                {brand === 'troy' && <span className="font-bold tracking-wider text-sky-400 text-sm">TROY</span>}
                {brand === 'generic' && <span className="text-[10px] text-neutral-400">CREDIT CARD</span>}
              </div>
            </div>
          </div>

          {/* Middle Row: Card Number */}
          <div className="z-10 py-1">
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-0.5 font-medium">
              Kart Numarası
            </span>
            <p className="text-lg md:text-xl font-mono font-bold tracking-[0.2em] text-white shadow-xs">
              {formatDisplayNumber()}
            </p>
          </div>

          {/* Bottom Row: Holder & Expiry */}
          <div className="flex justify-between items-end z-10">
            <div className="max-w-[70%]">
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block font-medium">
                Kart Sahibi
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-100 truncate">
                {displayHolder}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block font-medium">
                S.K.T.
              </span>
              <p className="text-xs font-mono font-bold tracking-widest text-neutral-100">
                {displayExpiry}
              </p>
            </div>
          </div>
        </div>

        {/* BACK FACE OF CREDIT CARD (FLIPPED 180 DEG) */}
        <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 p-6 text-white shadow-2xl border border-neutral-700/60 rotate-y-180 backface-hidden flex flex-col justify-between">
          {/* Magnetic Black Stripe */}
          <div className="absolute top-6 left-0 w-full h-10 bg-neutral-950 shadow-inner" />

          {/* Signature Strip & CVV Box */}
          <div className="mt-14 space-y-1">
            <span className="text-[8px] uppercase tracking-widest text-neutral-400 block font-medium">
              Yetkili İmza & Güvenlik Kodu (CVV)
            </span>
            <div className="w-full h-9 bg-neutral-200 rounded-xs flex items-center justify-end px-3">
              <div className="bg-white px-3 py-1 text-xs font-mono font-bold text-neutral-900 tracking-widest rounded-xs border border-neutral-300 shadow-inner">
                {displayCvv}
              </div>
            </div>
          </div>

          {/* Fine Print / Contact Notice */}
          <div className="text-[8px] text-neutral-400 leading-relaxed font-light">
            Ermay Mobilya Güvenli Ödeme Altyapısı • 256-Bit SSL ve 3D Secure Güvencesiyle Korunmaktadır. Müşteri Destek: 0532 419 41 51 • www.ermaymobilya.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCreditCard;
