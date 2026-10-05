import React from 'react';
import type { Metadata } from 'next';
import { CheckCircle } from 'lucide-react';
import { resolveCorporateConfig, type CorporateConfig } from '../../lib/corporateContent';

import { cmsService } from '../../services/cmsService';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'Hakkımızda | Ermay Mobilya',
  description: 'Kendi modern üretim tesislerimizde standart seri olarak imal edilen dayanıklı, kaliteli ofis mobilyaları. Doğrudan fabrikadan aracısız satış güvencesi ve kurumsal çözümler.',
  keywords: 'ermay mobilya hakkında, ofis mobilyası üreticisi, doğrudan fabrikadan ofis mobilyası, makam takımları imalatı',
  openGraph: {
    title: 'Hakkımızda | Ermay Mobilya',
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

export default async function KurumsalPage() {
  const remoteConfig = await cmsService.getCorporateConfig();
  const c = resolveCorporateConfig(remoteConfig as Partial<CorporateConfig> | null);

  const paragraphs = (c.storyContent || '')
    .split(/\n+/)
    .map((p: string) => p.trim())
    .filter(Boolean);
  const highlights = (c.highlights || []).filter(Boolean);
  const cards = (c.cards || []).filter((card) => card.title || card.text);
  const kvkkSections = (c.kvkkSections || []).filter((sec) => sec.heading || sec.text);

  return (
    <div className="w-full bg-canvas min-h-screen pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Üst bölüm */}
        <section className="bg-white rounded-xs border border-line overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12">
          <div className={`p-8 md:p-14 ${c.heroImage ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl'}`}>
            {c.heroBadge && (
              <span className="inline-block bg-paper text-wood-dark text-sm px-3 py-1 rounded-xs mb-4 border border-line">
                {c.heroBadge}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight mb-6 text-ink">
              {c.heroTitle} {c.heroHighlight && <span className="text-wood">{c.heroHighlight}</span>}
            </h1>
            {c.heroSubtitle && <p className="text-neutral-600 text-base leading-relaxed">{c.heroSubtitle}</p>}
          </div>
          {c.heroImage && (
            <div className="lg:col-span-5 min-h-56 bg-paper">
              <img src={c.heroImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </section>

        {/* Hikâye */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {c.storyImage && (
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-xs overflow-hidden border border-line bg-paper">
                <img src={c.storyImage} alt="Ermay Mobilya atölyesi" className="w-full h-full object-cover" />
              </div>
              {c.experienceYears && (
                <div className="absolute -bottom-6 -right-6 hidden sm:flex flex-col bg-brand text-ink p-6 rounded-xs shadow-xl max-w-xs">
                  <span className="text-3xl font-display font-extrabold">{c.experienceYears}</span>
                  {c.experienceSubtitle && <span className="text-sm font-medium mt-1">{c.experienceSubtitle}</span>}
                </div>
              )}
            </div>
          )}

          <div className={`${c.storyImage ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-5 text-neutral-700 leading-relaxed text-base`}>
            {c.storyTitle && (
              <h2 className="text-2xl font-display font-bold tracking-tight text-ink border-l-4 border-brand pl-4">{c.storyTitle}</h2>
            )}
            {paragraphs.map((para, pIdx) => (
              <p key={pIdx}>{para}</p>
            ))}

            {highlights.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-line">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-ink">
                    <CheckCircle className="h-4 w-4 text-wood flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Değer kartları */}
        {cards.length > 0 && (
          <section className={`grid grid-cols-1 gap-6 mb-16 ${cards.length >= 3 ? 'md:grid-cols-3' : cards.length === 2 ? 'md:grid-cols-2' : ''}`}>
            {cards.map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-xs border border-line border-t-4 border-t-brand">
                <span className="font-mono text-sm text-wood">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-lg font-display font-semibold text-ink mt-2 mb-2">{card.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </section>
        )}

        {/* KVKK aydınlatma metni (#kvkk) */}
        {kvkkSections.length > 0 && (
          <section id="kvkk" className="scroll-mt-28 bg-white rounded-xs border border-line p-8 md:p-12">
            <div className="max-w-4xl">
              {c.kvkkBadge && (
                <span className="inline-block bg-paper text-wood-dark text-sm px-3 py-1 rounded-xs mb-3 border border-line">
                  {c.kvkkBadge}
                </span>
              )}
              {c.kvkkTitle && <h2 className="text-2xl font-display font-bold text-ink tracking-tight mb-4">{c.kvkkTitle}</h2>}
              <div className="space-y-4 text-neutral-700 text-sm leading-relaxed">
                {kvkkSections.map((sec, i) => (
                  <p key={i}>
                    {sec.heading && <strong className="text-ink">{sec.heading}: </strong>}
                    {sec.text}
                  </p>
                ))}
                {c.kvkkEmail && (
                  <p>
                    Başvurularınızı{' '}
                    <a href={`mailto:${c.kvkkEmail}`} className="text-wood underline underline-offset-2">
                      {c.kvkkEmail}
                    </a>{' '}
                    adresine iletebilirsiniz.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
