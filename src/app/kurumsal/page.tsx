import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, ShieldCheck, Building2, CheckCircle, Hammer, Truck } from 'lucide-react';

import { cmsService } from '../../services/cmsService';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'Hakkımızda & İmalat Gücümüz | Ermay Mobilya Modoko',
  description: '1986 yılından bu yana Modoko merkezli atölyelerimizde üretilen %100 masif fırınlanmış gürgen iskeletli lüks ev ve ofis mobilyaları. İmalat felsefemiz ve üretim standartlarımız.',
  keywords: 'ermay mobilya hakkında, modoko mobilya üreticisi, masif mobilya atölyesi, kaliteli ofis mobilyası imalatı',
  openGraph: {
    title: 'Hakkımızda & İmalat Gücümüz | Ermay Mobilya',
    description: '40 yıllık ahşap ustalığı ve modern İtalyan çizgisiyle doğrudan fabrikadan satış güvencesi.',
    url: 'https://ermaymobilya.com/kurumsal',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 800,
        alt: 'Ermay Mobilya Atölyesi',
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
  heroBadge: '40 YILLIK TECRÜBE',
  heroTitle: 'Geleneksel Ahşap Ustalığı,',
  heroHighlight: 'Modern İtalyan Çizgisi.',
  heroSubtitle: '1986 yılından bu yana Modoko merkezli atölyelerimizde üretilen lüks ev ve ofis mobilyaları.',
  experienceYears: '40+ Yıl',
  experienceSubtitle: 'Kesintisiz İmalat Güvencesi',
  storyImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
  storyTitle: 'İmalat Felsefemiz ve Zanaat Geleneğimiz',
  storyContent: `Ermay Mobilya, kurucumuzun ahşaba olan tutkusuyla küçük bir atölyede başlayan yolculuğunu bugün modern üretim tesisleri ve geniş satış ağı ile sürdürmektedir.\n\nHer bir parçada kullanılan %100 fırınlanmış gürgen ağacı, birinci sınıf çelik konstrüksiyon ve hakiki döşemelik kumaşlar, usta zanaatkarlarımızın elinde zamansız mobilyalara dönüşür.`,
  visionTitle: 'İmalat Vizyonumuz',
  visionText: 'Estetik ve ergonomiyi en yüksek malzeme kalitesiyle buluşturarak uzun ömürlü ve zamansız mobilyalar üretmek.',
  missionTitle: 'Üretim Standartlarımız',
  missionText: 'Her parçada fırınlanmış gürgen iskelet, leke tutmaz birinci sınıf kumaş ve yüksek dansiteli sünger kullanımı.',
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
                <span className="text-xs font-semibold text-neutral-800">%100 Masif Gürgen İskelet İmalatı</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-xs font-semibold text-neutral-800">5 Yıl Koşulsuz İskelet Garantisi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-xs font-semibold text-neutral-800">Ücretsiz Kurulum & Sevkiyat Desteği</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-xs font-semibold text-neutral-800">Doğrudan Fabrika Satış Fiyatları</span>
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
