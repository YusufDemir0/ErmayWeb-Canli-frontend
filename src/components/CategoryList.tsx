'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';

interface CategoryListProps {
  title?: string;
  subtitle?: string;
  selectedCategory?: string;
  onSelectCategory?: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  title: propTitle,
  subtitle: propSubtitle,
  selectedCategory,
  onSelectCategory,
}) => {
  const storeCategories = useCMSStore((state) => state.categories);
  const homeConfig = useCMSStore((state) => state.homeConfig);

  const title = propTitle || homeConfig.categoriesTitle || 'POPÜLER KATEGORİLER';
  const subtitle = propSubtitle || homeConfig.categoriesSubtitle || 'Eviniz ve yaşam alanınız için en seçkin koleksiyonlar';

  const categoryItems = storeCategories.length > 0 ? storeCategories : [
    { id: 'cat-1', name: 'Koltuk Takımları', slug: 'koltuk-takimlari', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600' },
    { id: 'cat-2', name: 'Yemek Odası', slug: 'yemek-odalari', image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=600' },
    { id: 'cat-3', name: 'Makam Takımları', slug: 'makam-takimlari', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600' },
    { id: 'cat-4', name: 'Yatak Odası', slug: 'yatak-odalari', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600' },
    { id: 'cat-5', name: 'TV Üniteleri', slug: 'tv-uniteleri', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600' },
    { id: 'cat-6', name: 'Aksesuarlar', slug: 'aksesuarlar', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600' },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse Drag to Scroll State
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const checkScrollBoundaries = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScrollBoundaries();
    window.addEventListener('resize', checkScrollBoundaries);
    return () => window.removeEventListener('resize', checkScrollBoundaries);
  }, [categoryItems]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Mouse Drag Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
    checkScrollBoundaries();
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Badges to make categories look like sales channels
  const CATEGORY_BADGES: Record<string, string> = {
    'koltuk-takimlari': 'ÇOK SATAN',
    'yemek-odalari': 'FIRSAT',
    'makam-takimlari': 'PRESTİJ',
    'yatak-odalari': 'YENİ',
    'tv-uniteleri': 'İNDİRİM',
    'aksesuarlar': 'POPÜLER',
  };

  const getCategoryHref = (cat: { id: string; slug: string }) => {
    return `/kategori/${cat.slug || cat.id}`;
  };

  return (
    <section 
      id="quick-categories" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 border-b border-neutral-200"
    >
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A880] uppercase block mb-1">
            Hızlı Erişim & Koleksiyonlar
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-800 uppercase">
            {title}
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleScrollLeft}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border border-[#E5DEC9] bg-white text-neutral-600 transition-all cursor-pointer shadow-xs ${
              canScrollLeft ? 'hover:bg-[#C5A880] hover:text-white hover:border-[#C5A880]' : 'opacity-40 cursor-not-allowed'
            }`}
            aria-label="Sola Kaydır"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border border-[#E5DEC9] bg-white text-neutral-600 transition-all cursor-pointer shadow-xs ${
              canScrollRight ? 'hover:bg-[#C5A880] hover:text-white hover:border-[#C5A880]' : 'opacity-40 cursor-not-allowed'
            }`}
            aria-label="Sağa Kaydır"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Smooth Horizontal Rail Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScrollBoundaries}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="flex items-center justify-start gap-6 md:gap-8 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none"
      >
        {categoryItems.map((cat, idx) => {
          const isActive = selectedCategory === cat.id || selectedCategory === cat.slug;
          const href = getCategoryHref(cat);
          const badgeText = CATEGORY_BADGES[cat.slug] || 'KEŞFET';

          const bubbleContent = (
            <>
              {/* Outer Glowing Ring */}
              <div 
                className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full p-1 transition-all duration-300 flex items-center justify-center ${
                  isActive 
                    ? 'ring-4 ring-[#C5A880] ring-offset-2 shadow-lg scale-105' 
                    : 'ring-2 ring-neutral-200 group-hover:ring-[#C5A880] group-hover:ring-offset-2 group-hover:scale-105 shadow-xs'
                }`}
              >
                {/* Bubble Badge Tag */}
                <span className="absolute -top-1 z-20 bg-[#C5A880] text-white font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full shadow-xs">
                  {badgeText}
                </span>

                <div className="w-full h-full rounded-full overflow-hidden relative bg-[#FBF9F5]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115 pointer-events-none"
                    loading="lazy"
                  />
                  <div 
                    className={`absolute inset-0 bg-neutral-900/10 transition-opacity duration-300 ${
                      isActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
                    }`} 
                  />
                </div>
              </div>

              {/* Title */}
              <span 
                className={`mt-3 text-xs md:text-sm font-bold tracking-wider transition-colors duration-300 uppercase text-center line-clamp-1 ${
                  isActive 
                    ? 'text-[#C5A880] border-b-2 border-[#C5A880] pb-0.5' 
                    : 'text-neutral-700 group-hover:text-[#C5A880]'
                }`}
              >
                {cat.name}
              </span>
            </>
          );

          if (onSelectCategory) {
            return (
              <button
                key={cat.id || idx}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center group cursor-pointer flex-shrink-0 focus:outline-none w-24 md:w-28"
                aria-label={`${cat.name} kategorisini filtrele`}
              >
                {bubbleContent}
              </button>
            );
          }

          return (
            <Link
              key={cat.id || idx}
              href={href}
              className="flex flex-col items-center group cursor-pointer flex-shrink-0 focus:outline-none w-24 md:w-28"
              aria-label={`${cat.name} kategorisine git`}
            >
              {bubbleContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryList;
