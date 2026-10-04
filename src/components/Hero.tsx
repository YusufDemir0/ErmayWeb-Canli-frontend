'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';
import OptimizedImage from './OptimizedImage';

export const Hero: React.FC = () => {
  const homeConfig = useCMSStore((state) => state.homeConfig);
  const slides = homeConfig?.heroSlides || [];
  const categories = useCMSStore((state) => state.categories);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[currentSlide];

  // CMS'te silinmiş bir kategoriye işaret eden buton 404'e düşmesin: tüm ürünler sayfasına yönlendir.
  const resolveButtonLink = (link?: string): string => {
    if (!link) return '/kategori';
    const match = link.match(/^\/kategori\/([^/?#]+)/);
    if (match && categories.length > 0 && !categories.some((c) => c.slug === match[1])) {
      return '/kategori';
    }
    return link;
  };

  return (
    <section 
      id="hero-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[65vh] md:h-[82vh] bg-ink overflow-hidden select-none"
    >
      {/* Background Slides */}
      {slides.map((slide, index) => {
        const isCurrent = (currentSlide % slides.length) === index;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {slide.image ? (
              <OptimizedImage
                src={slide.image}
                alt={slide.title || 'Ermay Mobilya'}
                fill
                priority={index === 0}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-ink" />
            )}
            <div className="absolute inset-0 bg-ink/25" />
          </div>
        );
      })}

      {/* Content Overlay: düz, opak panel (cam efekti yok) */}
      <div className="absolute inset-0 z-20 flex items-end md:items-center justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-0">
        <div key={currentSlide} className="max-w-xl bg-white p-6 md:p-10 border-l-4 border-wood animate-fade-in">
          {activeSlide.badge && (
            <span className="text-xs font-semibold text-wood uppercase tracking-wider block mb-3">
              {activeSlide.badge}
            </span>
          )}
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.08] tracking-tight mb-4">
            {activeSlide.title}
          </h2>
          {activeSlide.subtitle && (
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-6 md:mb-8">
              {activeSlide.subtitle}
            </p>
          )}
          <Link
            href={resolveButtonLink(activeSlide.buttonLink)}
            className="group inline-flex items-center gap-2.5 bg-ink hover:bg-wood text-white text-sm font-semibold py-3.5 px-6 transition-colors duration-200 rounded-xs"
          >
            <span>{activeSlide.buttonText || 'Ürünleri incele'}</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Slayt kontrolleri: köşeli düğmeler ve mono sayaç */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-30 flex items-center gap-1 bg-white">
          <button
            onClick={handlePrev}
            className="h-11 w-11 flex items-center justify-center text-ink hover:bg-paper transition-colors cursor-pointer"
            aria-label="Önceki slayt"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-mono text-xs text-neutral-600 tabular-nums-all px-1" aria-live="polite">
            {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
          <button
            onClick={handleNext}
            className="h-11 w-11 flex items-center justify-center text-ink hover:bg-paper transition-colors cursor-pointer"
            aria-label="Sonraki slayt"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Hero;
