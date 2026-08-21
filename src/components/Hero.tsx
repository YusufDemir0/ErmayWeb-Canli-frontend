'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';

export const Hero: React.FC = () => {
  const homeConfig = useCMSStore((state) => state.homeConfig);
  const slides = homeConfig?.heroSlides || [];

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

  return (
    <section 
      id="hero-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[65vh] md:h-[82vh] bg-neutral-900 overflow-hidden select-none"
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
              <img
                src={slide.image}
                alt={slide.title || 'Ermay Mobilya'}
                className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
                  isCurrent ? 'scale-105' : 'scale-100'
                }`}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
        );
      })}

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl bg-white/95 backdrop-blur-md p-8 md:p-12 shadow-2xl rounded-sm border border-neutral-100 animate-fade-in-up">
          <span className="text-[10px] md:text-xs font-black tracking-[0.3em] text-[#C5A880] uppercase block mb-3 md:mb-4">
            {activeSlide.badge || 'ERMAY MOBİLYA • ÖZEL İMALAT'}
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-neutral-900 leading-tight tracking-tight mb-4 md:mb-6">
            {activeSlide.title}
          </h2>
          <p className="text-neutral-600 text-xs md:text-sm font-light leading-relaxed mb-6 md:mb-8">
            {activeSlide.subtitle}
          </p>
          <Link
            href={activeSlide.buttonLink || '/katalog'}
            className="group inline-flex items-center gap-2.5 bg-neutral-900 hover:bg-[#C5A880] text-white text-xs md:text-sm uppercase tracking-widest font-bold py-3.5 px-7 md:py-4 md:px-8 transition-colors duration-300 rounded-xs cursor-pointer shadow-lg"
          >
            <span>{activeSlide.buttonText || 'Koleksiyonu İncele'}</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Slider Left & Right Floating Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-[#C5A880] text-white backdrop-blur-xs transition-all cursor-pointer border border-white/20 shadow-md"
            aria-label="Önceki Slayt"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-[#C5A880] text-white backdrop-blur-xs transition-all cursor-pointer border border-white/20 shadow-md"
            aria-label="Sonraki Slayt"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Bottom Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  index === currentSlide ? 'w-8 bg-[#C5A880]' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slayta git ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Hero;
