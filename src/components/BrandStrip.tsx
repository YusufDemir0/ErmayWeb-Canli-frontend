'use client';

import React from 'react';
import { ShieldCheck, Truck, Award, Sparkles } from 'lucide-react';

export const BrandStrip: React.FC = () => {
  const TRUST_ITEMS = [
    {
      icon: Truck,
      title: 'ÜCRETSİZ TESLİMAT & MONTAJ',
      desc: 'Tüm Türkiye adrese teslim ve profesyonel kurulum',
    },
    {
      icon: Award,
      title: '5 YIL İSKELET GARANTİSİ',
      desc: '%100 Fırınlanmış gürgen ağacı ve çelik iskelet',
    },
    {
      icon: Sparkles,
      title: 'DOĞRUDAN FABRİKA ÜRETİMİ',
      desc: 'Kendi üretim tesislerimizde %100 yerli usta imalatı',
    },
    {
      icon: ShieldCheck,
      title: 'BDDK UYUMLU 12 TAKSİT',
      desc: 'Tüm kartlara vade farksız taksit imkanı',
    },
  ];

  return (
    <section className="bg-[#FAF8F5] border-y border-[#EAE3D2] py-4 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-center">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 group"
              >
                <div className="p-2 rounded-xs bg-[#C5A880]/15 text-[#B4966E] flex-shrink-0 group-hover:bg-[#C5A880] group-hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] md:text-[11px] font-bold text-neutral-900 uppercase tracking-wider truncate">
                    {item.title}
                  </h4>
                  <p className="text-[9.5px] md:text-[10px] text-neutral-500 font-light truncate hidden sm:block">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandStrip;
