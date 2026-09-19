'use client';

import React from 'react';
import { useCMSStore } from '../stores/useCMSStore';

export const FloatingWhatsApp: React.FC = () => {
  const socialLinks = useCMSStore((state) => state.socialLinks);
  const rawNumber = socialLinks?.whatsapp || '0532 000 00 00';
  const cleanNumber = rawNumber.replace(/\D/g, '') || '905320000000';
  const formattedNumber = cleanNumber.startsWith('90') ? cleanNumber : `90${cleanNumber.replace(/^0/, '')}`;

  const message = encodeURIComponent(
    'Selamlar Ermay Mobilya, web sitenizdeki modeller ve atölye teslimatınız hakkında bilgi almak istiyorum.'
  );

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center group print:hidden">
      {/* Tooltip Label */}
      <a
        href={`https://wa.me/${formattedNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 bg-white text-neutral-800 shadow-xl border border-neutral-200 rounded-full py-2 px-3.5 pr-2.5 hover:bg-emerald-50 transition-all duration-300 hover:scale-105"
        aria-label="WhatsApp ile Atölyeye Danış"
      >
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Canlı Atölye Hattı
          </span>
          <span className="text-xs font-black text-neutral-900 leading-tight">
            WhatsApp ile Sipariş Ver
          </span>
        </div>

        {/* WhatsApp Icon Circle */}
        <div className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:rotate-12">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
          </svg>
        </div>
      </a>
    </div>
  );
};

export default FloatingWhatsApp;
