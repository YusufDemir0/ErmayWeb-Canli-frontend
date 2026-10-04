'use client';

import React from 'react';
import { useCMSStore } from '../stores/useCMSStore';

/** CMS duyuruları: tek, sabit satır. Kayan şerit ve yanıp sönen noktalar yok; sığmayan maddeler küçük ekranda gizlenir. */
export const UpperNavbar: React.FC = () => {
  const tickerItems = useCMSStore((state) => state.tickerItems);

  if (!tickerItems || tickerItems.length === 0) return null;

  // CMS metinleri bazen kendi madde işaretiyle ("• ...") girilmiş; ayırıcıyı bileşen çiziyor
  const cleanItems = tickerItems
    .map((item) => String(item).replace(/^[\s•·●▪\-–—]+/, '').trim())
    .filter(Boolean);
  if (cleanItems.length === 0) return null;

  return (
    <div className="bg-ink text-neutral-200 text-xs py-2 px-4 select-none print:hidden">
      <ul className="max-w-7xl mx-auto flex items-center justify-center gap-x-6 overflow-hidden whitespace-nowrap">
        {cleanItems.map((item, idx) => (
          <li
            key={idx}
            className={`items-center gap-6 ${idx === 0 ? 'flex' : idx === 1 ? 'hidden md:flex' : 'hidden xl:flex'}`}
          >
            {idx > 0 && <span className="text-neutral-500" aria-hidden="true">/</span>}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpperNavbar;
