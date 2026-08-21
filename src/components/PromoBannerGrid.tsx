'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const PromoBannerGrid: React.FC = () => {
  const topBanners = [
    {
      title: 'İTALYAN DERİ KOLTUKLAR',
      subtitle: 'Hakiki Dana Derisi • Özel Üretim',
      badge: 'POPÜLER',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
      link: '/kategori/koltuk-takimlari',
    },
    {
      title: 'MASİF AHŞAP YEMEK MASALARI',
      subtitle: 'Doğal Ceviz & Meşe Kaplama',
      badge: 'YENİ SEZON',
      image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=800',
      link: '/kategori/yemek-odalari',
    },
    {
      title: 'LÜKS MAKAM VE OFİS TAKIMLARI',
      subtitle: 'Ergonomik & Prestijli Çözümler',
      badge: '%20 İNDİRİM',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800',
      link: '/kategori/makam-takimlari',
    },
    {
      title: 'AYDINLATMA & AKSESUARLAR',
      subtitle: 'Mekanınıza Şıklık Katın',
      badge: 'FIRSAT',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
      link: '/kategori/aksesuarlar',
    },
  ];

  const wideBanners = [
    {
      title: 'SEZONUN ÖNE ÇIKAN İNDİRİMLERİ',
      subtitle: 'Seçili Modüler Takımlarda Özel Fırsatlar',
      buttonText: 'KAMPANYAYI İNCELE',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
      link: '/indirimler',
    },
    {
      title: 'İÇ MİMARLIK DANIŞMANLIĞI',
      subtitle: 'Eviniz İçin Ücretsiz 3D Projelendirme Hizmeti',
      buttonText: 'İLETİŞİME GEÇİN',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
      link: '/iletisim',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C5A880] block mb-1">
            Öne Çıkan Koleksiyonlar
          </span>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-800 uppercase">
            Özel Kampanyalar ve Kategori Fırsatları
          </h3>
        </div>

        {/* 4-Card Grid Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {topBanners.map((banner, idx) => (
            <Link
              key={idx}
              href={banner.link}
              className="group relative h-64 rounded-xs overflow-hidden shadow-xs border border-[#E5DEC9] block"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Soft warm gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/30 to-transparent transition-opacity group-hover:opacity-90" />

              {/* Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#C5A880] text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-xs tracking-widest shadow-xs">
                  {banner.badge}
                </span>
              </div>

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10 space-y-1">
                <h4 className="font-bold text-sm tracking-wide group-hover:text-[#E5DEC9] transition-colors leading-snug">
                  {banner.title}
                </h4>
                <p className="text-[11px] text-neutral-200 font-light line-clamp-1">
                  {banner.subtitle}
                </p>
                <div className="pt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#E5DEC9] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  <span>İncele</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 2-Wide Banner Pair */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {wideBanners.map((banner, idx) => (
            <div
              key={idx}
              className="group relative h-56 md:h-64 rounded-xs overflow-hidden shadow-xs border border-[#E5DEC9]"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/75 via-neutral-900/40 to-transparent" />

              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center max-w-md text-white space-y-2 z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">
                  Özel Koleksiyon
                </span>
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight leading-tight">
                  {banner.title}
                </h3>
                <p className="text-xs text-neutral-200 font-light">
                  {banner.subtitle}
                </p>
                <div className="pt-2">
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-2 bg-[#C5A880] hover:bg-[#B4966E] text-white font-bold text-xs uppercase tracking-widest py-2.5 px-5 rounded-xs transition-colors shadow-xs"
                  >
                    <span>{banner.buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PromoBannerGrid;
