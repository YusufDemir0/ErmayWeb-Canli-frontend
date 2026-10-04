import React from 'react';

interface BrandLogoProps {
  /** 'onLight': siyah yazılı logo (açık zemin), 'onDark': beyaz yazılı logo (koyu zemin) */
  variant?: 'onLight' | 'onDark';
  className?: string;
  priority?: boolean;
}

// Orijinal logo 2765×924 (≈2.99:1); width/height verilerek yerleşim kayması önlenir.
export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'onLight', className = 'h-10 w-auto', priority = false }) => {
  const base = variant === 'onLight' ? '/brand/logo-dark-text' : '/brand/logo-light-text';
  return (
    <img
      src={`${base}-480.webp`}
      srcSet={`${base}-480.webp 480w, ${base}-960.webp 960w`}
      sizes="(min-width: 768px) 180px, 140px"
      width={480}
      height={160}
      alt="Ermay Mobilya"
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
};

export default BrandLogo;
