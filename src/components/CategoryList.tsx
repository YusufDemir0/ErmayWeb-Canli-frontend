'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';
import OptimizedImage from './OptimizedImage';

interface CategoryListProps {
  title?: string;
  subtitle?: string;
  selectedCategory?: string;
  onSelectCategory?: (id: string) => void;
}

/**
 * Kategori tipolojisi: numaralı, çizgiyle ayrılmış ızgara. Görsel yalnız gerçekten varsa küçük resim olarak gösterilir;
 * sahte rozet (ÇOK SATAN, FIRSAT…) yok.
 */
export const CategoryList: React.FC<CategoryListProps> = ({
  title: propTitle,
  subtitle: propSubtitle,
  selectedCategory,
  onSelectCategory,
}) => {
  const storeCategories = useCMSStore((state) => state.categories);
  const homeConfig = useCMSStore((state) => state.homeConfig);

  const title = propTitle || homeConfig.categoriesTitle || 'Kategoriler';
  const subtitle = propSubtitle || homeConfig.categoriesSubtitle || '';

  const categoryItems = React.useMemo(() => {
    const roots = storeCategories.filter((c) => !c.parentId);
    const list = roots.length > 0 ? roots : storeCategories;
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [storeCategories]);

  if (categoryItems.length === 0) return null;

  return (
    <section id="quick-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-600 max-w-md md:text-right">{subtitle}</p>}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-line">
        {categoryItems.map((cat, idx) => {
          const isActive = selectedCategory === cat.id || selectedCategory === cat.slug;
          const hasImage = typeof cat.image === 'string' && cat.image.trim().length > 0 && !cat.image.includes('default-furniture');
          const content = (
            <>
              <span className="font-mono text-xs text-steel tabular-nums-all">{String(idx + 1).padStart(2, '0')}</span>
              <span className={`flex-1 font-display text-base font-semibold leading-snug ${isActive ? 'text-wood' : 'text-ink group-hover:text-wood'}`}>
                {cat.name}
              </span>
              {hasImage ? (
                <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-paper">
                  <OptimizedImage src={cat.image} alt="" fill className="object-cover" />
                </span>
              ) : (
                <ArrowUpRight className="h-4 w-4 shrink-0 text-steel group-hover:text-wood transition-colors" aria-hidden="true" />
              )}
            </>
          );
          const cellClass = `group flex items-center gap-4 min-h-16 px-4 py-3 border-r border-b border-line transition-colors ${
            isActive ? 'bg-paper' : 'bg-white hover:bg-paper'
          }`;

          return (
            <li key={cat.id || idx} className="contents">
              {onSelectCategory ? (
                <button type="button" onClick={() => onSelectCategory(cat.id)} className={`${cellClass} text-left cursor-pointer`} aria-pressed={isActive}>
                  {content}
                </button>
              ) : (
                <Link href={`/kategori/${cat.slug || cat.id}`} className={cellClass}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CategoryList;
