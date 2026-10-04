import React from 'react';

interface DimensionLineProps {
  /** Ölçü değeri (cm). Yoksa bileşen hiçbir şey çizmez. */
  value?: number | null;
  label?: string;
  className?: string;
}

/**
 * Teknik çizimdeki ölçü çizgisi: |←—— 220 cm ——→|
 * Ürün künyesinin imza öğesi; yalnız gerçek ölçü verisi varken görünür.
 */
export const DimensionLine: React.FC<DimensionLineProps> = ({ value, label = 'G', className = '' }) => {
  if (!value || !Number.isFinite(value) || value <= 0) return null;

  return (
    <div className={`flex items-center gap-2 text-steel ${className}`} aria-label={`Genişlik ${value} cm`}>
      <svg className="h-2.5 flex-1 min-w-4" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden="true">
        <line x1="0.5" y1="0" x2="0.5" y2="10" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="5" x2="100" y2="5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M0 5 L6 2 M0 5 L6 8" stroke="currentColor" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="font-mono text-xs text-neutral-600 whitespace-nowrap tabular-nums-all">
        {label} {value} cm
      </span>
      <svg className="h-2.5 flex-1 min-w-4" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden="true">
        <line x1="0" y1="5" x2="100" y2="5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="99.5" y1="0" x2="99.5" y2="10" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M100 5 L94 2 M100 5 L94 8" stroke="currentColor" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default DimensionLine;
