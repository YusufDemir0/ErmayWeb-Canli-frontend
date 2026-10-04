import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import HomeShowcase from '../../components/HomeShowcase';
import { getLandingPageConfig } from '../../services/landingService';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ERMAY Ofis & Fabrika Satış | Doğrudan Üreticiden Standart Seri Mobilyalar',
  description: 'Doğrudan üreticiden standart seri ofis mobilyaları ve fabrika satış mağazası. Makam takımları, toplantı masaları, ofis koltukları ve çalışma masaları.',
  alternates: {
    canonical: 'https://ermaymobilya.com/anasayfa',
  },
};

/** Vitrin sayfası. Açılış tercihi "home" ise vitrin zaten `/` üzerindedir: çift içerik olmasın diye oraya yönlendir. */
export default async function AnasayfaPage() {
  const landing = await getLandingPageConfig();
  if (landing.type === 'home') {
    redirect('/');
  }
  return <HomeShowcase />;
}
