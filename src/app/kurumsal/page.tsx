import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, ShieldCheck, Building2, CheckCircle, Hammer, Truck } from 'lucide-react';

import { cmsService } from '../../services/cmsService';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'Hakkımızda & İmalat Gücümüz | Ermay Mobilya',
  description: 'Kendi modern üretim tesislerimizde standart seri olarak imal edilen dayanıklı, kaliteli ofis mobilyaları. Doğrudan fabrikadan aracısız satış güvencesi ve kurumsal çözümler.',
  keywords: 'ermay mobilya hakkında, ofis mobilyası üreticisi, doğrudan fabrikadan ofis mobilyası, makam takımları imalatı',
  openGraph: {
    title: 'Hakkımızda & İmalat Gücümüz | Ermay Mobilya',
    description: 'Doğrudan üretim tesislerimizden aracısız fabrika satış güvencesi ve standart seri ofis çözümleri.',
    url: 'https://ermaymobilya.com/kurumsal',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: '/default-furniture.webp',
        width: 1200,
        height: 800,
        alt: 'Ermay Mobilya Üretim Tesisleri',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ermaymobilya.com/kurumsal',
  },
};

const DEFAULT_CORP_DATA = {
  heroBadge: 'DOĞRUDAN ÜRETİCİDEN',
  heroTitle: 'Fabrikadan Aracısız,',
  heroHighlight: 'Standart Seri Güvencesi.',
  heroSubtitle: 'Kendi üretim tesislerimizde standart seri olarak imal edilen dayanıklı ofis mobilyaları ve kurumsal çalışma alanları.',
  experienceYears: '40+ Yıl',
  experienceSubtitle: 'Kesintisiz İmalat Güvencesi',
  storyImage: '/default-furniture.webp',
  storyTitle: 'İmalat Felsefemiz ve Üretim Standartlarımız',
  storyContent: `Ermay Mobilya, modern üretim tesislerinde standart seri ofis mobilyası imalatı yaparak doğrudan kurumsal firmalara ve son kullanıcıya aracısız ulaştırmaktadır.\n\nÜrünlerimizde 1. sınıf E1 melamin paneller, darbe emici 2mm PVC kenar bantları ve elektrostatik fırın boyalı DKP çelik profil ayaklar kullanılarak sağlamlık ve uzun ömür güvence altına alınır. Aracı ve mağaza komisyonlarını ortadan kaldırarak en rekabetçi fabrika fiyatlarını sunuyoruz.`,
  visionTitle: 'İmalat Vizyonumuz',
  visionText: 'Ofis ve çalışma alanlarında uzun ömürlü, dayanıklı ve ergonomik standart seri mobilyaları en uygun fabrika fiyatıyla müşterilerimize ulaştırmak.',
  missionTitle: 'Üretim Standartlarımız',
  missionText: '1. Sınıf E1 melamin paneller, 2mm darbe koruyucu PVC ve elektrostatik boyalı çelik konstrüksiyon ile yüksek kalite standartlarında seri üretim.',
};

export default async function KurumsalPage() {
  const remoteConfig = await cmsService.getCorporateConfig();
  const corporateConfig = remoteConfig ? { ...DEFAULT_CORP_DATA, ...remoteConfig } : DEFAULT_CORP_DATA;

  const paragraphs = (corporateConfig.storyContent || DEFAULT_CORP_DATA.storyContent)
    .split('\n')
    .map((p: string) => p.trim())
    .filter(Boolean);

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-neutral-400 font-light flex items-center gap-2 mb-8">
          <Link href="/" className="hover:text-[#C5A880] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-600 font-normal">Kurumsal</span>
          <span>/</span>
          <span className="text-[#C5A880] font-semibold">Hakkımızda & İmalat Gücümüz</span>
        </nav>

        {/* Hero Header Section */}
        <div className="relative bg-white text-neutral-900 rounded-sm overflow-hidden p-8 md:p-14 mb-12 border border-[#EAE3D2] shadow-2xs">
          <div className="max-w-3xl">
            <span className="inline-block bg-[#FAF8F5] text-[#8A4B20] font-bold text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-xs mb-4 border border-[#EAE3D2]">
              {corporateConfig.heroBadge}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight uppercase leading-tight mb-6 text-neutral-900">
              {corporateConfig.heroTitle} <span className="text-[#C5A880]">{corporateConfig.heroHighlight}</span>
            </h1>
            <p className="text-neutral-600 font-light text-xs md:text-sm leading-relaxed">
              {corporateConfig.heroSubtitle}
            </p>
          </div>
        </div>

        {/* Main Content Grid: Story & Images */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/3] rounded-xs overflow-hidden shadow-md border border-[#EAE3D2]">
              <img
                src={corporateConfig.storyImage}
                alt="Ermay Mobilya Atölyesi"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden sm:flex flex-col bg-[#C5A880] text-white p-6 rounded-xs shadow-xl font-bold max-w-xs">
              <span className="text-3xl font-extrabold">{corporateConfig.experienceYears}</span>
              <span className="text-xs uppercase tracking-wider font-semibold mt-1">
                {corporateConfig.experienceSubtitle}
              </span>
            </div>
          </div>

          {/* Story Text Content */}
          <div className="lg:col-span-7 space-y-5 text-neutral-700 font-light leading-relaxed text-xs md:text-sm">
            <h2 className="text-xl md:text-2xl font-serif font-bold tracking-wide text-neutral-900 uppercase border-l-4 border-[#C5A880] pl-4">
              {corporateConfig.storyTitle}
            </h2>

            {paragraphs.map((para, pIdx) => (
              <p key={pIdx} className="leading-relaxed">
                {para}
              </p>
            ))}

            {/* Quality Checklist Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EAE3D2]">
              <div className="flex items-center gap-2.5">
                <Hammer className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-xs font-semibold text-neutral-800">1. Sınıf E1 Melamin & Çelik Profil İmalatı</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-xs font-semibold text-neutral-800">2 Yıl Resmi Fabrika Garantisi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-xs font-semibold text-neutral-800">İstanbul İçi Kendi Aracımızla Teslimat & Montaj</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-xs font-semibold text-neutral-800">Doğrudan Fabrikadan Aracısız Satış</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-sm border border-[#EAE3D2] shadow-2xs text-center">
            <Building2 className="h-10 w-10 text-[#C5A880] mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2">
              {corporateConfig.visionTitle}
            </h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              {corporateConfig.visionText}
            </p>
          </div>

          <div className="bg-white p-8 rounded-sm border border-[#EAE3D2] shadow-2xs text-center">
            <Award className="h-10 w-10 text-[#C5A880] mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2">
              {corporateConfig.missionTitle}
            </h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              {corporateConfig.missionText}
            </p>
          </div>

          <div className="bg-white p-8 rounded-sm border border-[#EAE3D2] shadow-2xs text-center">
            <ShieldCheck className="h-10 w-10 text-[#C5A880] mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2">
              Müşteri Memnuniyeti
            </h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              14 gün içinde değişim/iade garantisi, 5 yıl iskelet garantisi ve hızlı teslimat ağıyla güven veren satış sonrası hizmet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
