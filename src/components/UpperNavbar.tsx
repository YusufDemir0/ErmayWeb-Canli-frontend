'use client';

import React from 'react';
import { useCMSStore } from '../stores/useCMSStore';

export const UpperNavbar: React.FC = () => {
  const tickerItems = useCMSStore((state) => state.tickerItems);

  if (!tickerItems || tickerItems.length === 0) return null;

  // CMS metinleri bazen kendi madde işaretiyle ("• ...") girilmiş; bileşen zaten nokta çizdiği için çift görünüyordu
  const cleanItems = tickerItems
    .map((item) => String(item).replace(/^[\s•·●▪\-–—]+/, '').trim())
    .filter(Boolean);
  if (cleanItems.length === 0) return null;

  // Duplicate items array for smooth infinite marquee effect
  const repeatedItems = [...cleanItems, ...cleanItems, ...cleanItems, ...cleanItems];

  return (
    <div className="bg-gradient-to-r from-brand-camel via-brand-camel-dark to-brand-camel text-white text-xs font-semibold py-2 overflow-hidden shadow-xs select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {repeatedItems.map((item, idx) => (
          <span key={idx} className="mx-6 tracking-wider uppercase flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default UpperNavbar;
