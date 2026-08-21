'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  aspectRatio?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src: initialSrc,
  alt,
  className = '',
  width,
  height,
  fill = false,
  priority = false,
  aspectRatio,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc || '');

  useEffect(() => {
    let cleaned = initialSrc || '';
    if (cleaned.includes('%252F')) {
      cleaned = cleaned.replace(/%252F/g, '%2F');
    }
    setCurrentSrc(cleaned);
    setHasError(false);
    setIsLoading(true);
  }, [initialSrc, fallbackSrc]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  // If no source is provided or image failed to load even after fallback
  if (!currentSrc || (hasError && currentSrc === fallbackSrc)) {
    return (
      <div
        className={`bg-neutral-800 text-neutral-400 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <svg
          className="h-8 w-8 text-brand-camel/60 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
          ERMAY MOBİLYA
        </span>
      </div>
    );
  }

  const isDataUri = currentSrc.startsWith('data:');
  const isSvg = currentSrc.endsWith('.svg') || currentSrc.includes('image/svg+xml');

  // Handle data URIs and inline SVGs directly
  if (isDataUri || isSvg) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'blur-sm scale-102' : 'blur-0 scale-100'} transition-all duration-500`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
      />
    );
  }

  const isFirebaseStorage = currentSrc.includes('firebasestorage.googleapis.com');

  return (
    <div
      className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse z-10" />
      )}
      <Image
        src={currentSrc}
        alt={alt}
        width={!fill ? width || 800 : undefined}
        height={!fill ? height || 600 : undefined}
        fill={fill}
        priority={priority}
        unoptimized={isFirebaseStorage}
        className={`${className} transition-all duration-700 ease-in-out ${
          isLoading ? 'scale-105 blur-sm opacity-50' : 'scale-100 blur-0 opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default OptimizedImage;

