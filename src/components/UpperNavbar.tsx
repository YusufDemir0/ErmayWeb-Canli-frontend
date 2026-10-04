'use client';

import React from 'react';
import { useCMSStore } from '../stores/useCMSStore';

/**
 * Duyuru bandı: sonsuz kayan şerit. Menüyle birlikte yapışkan başlığın içinde durur (sayfa kayınca kaybolmaz).
 * Renk ve hız Admin > Duyuru Bandı'ndan (CMS: ticker_style) gelir; üzerine gelince durur.
 */
export const UpperNavbar: React.FC = () => {
  const tickerItems = useCMSStore((state) => state.tickerItems);
  const tickerStyle = useCMSStore((state) => state.tickerStyle);

  // CMS metinleri bazen kendi madde işaretiyle ("• ...") girilmiş; ayırıcıyı bileşen çiziyor
  const cleanItems = (tickerItems || [])
    .map((item) => String(item).replace(/^[\s•·●▪\-–—]+/, '').trim())
    .filter(Boolean);
  if (cleanItems.length === 0) return null;

  // Geniş ekranda boşluk kalmasın diye en az 8 madde olacak şekilde çoğaltılır; şerit iki kopya halinde -50% kayar
  const repeats = Math.max(1, Math.ceil(8 / cleanItems.length));
  const run = Array.from({ length: repeats }, () => cleanItems).flat();

  return (
    <div
      className="marquee-pause overflow-hidden select-none print:hidden"
      style={{ backgroundColor: tickerStyle.backgroundColor, color: tickerStyle.textColor }}
      role="region"
      aria-label="Duyurular"
    >
      {/* Ekran okuyucular için sabit liste; görsel şerit aria-hidden */}
      <ul className="sr-only">
        {cleanItems.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <div
        className="animate-marquee py-2 text-xs sm:text-sm font-semibold"
        style={{ ['--marquee-duration' as string]: `${Math.max(10, tickerStyle.speedSeconds || 35) * repeats}s` }}
        aria-hidden="true"
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {run.map((item, idx) => (
              <span key={`${copy}-${idx}`} className="flex items-center gap-6 px-3 whitespace-nowrap">
                <span>{item}</span>
                <span className="opacity-60">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpperNavbar;
