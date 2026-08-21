import type { Product, ProductImages } from '../types';

/**
 * Standard Product Image Resolver with robust fallbacks
 */
export function getProductImage(
  product?: Product | { image?: string; images?: string[] | ProductImages; image1?: string } | null
): string {
  if (!product) {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800';
  }
  if (product.image && typeof product.image === 'string' && product.image.trim().length > 0) {
    return product.image;
  }
  if ('image1' in product && typeof product.image1 === 'string' && product.image1.trim().length > 0) {
    return product.image1;
  }
  if (product.images) {
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string') {
      return product.images[0];
    }
    if (typeof product.images === 'object' && 'main' in product.images && typeof product.images.main === 'string') {
      return product.images.main;
    }
  }
  return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800';
}

/**
 * Multiple Product Images Resolver (Returns clean string array)
 */
export function getProductImages(
  product?: Product | { image?: string; images?: string[] | ProductImages; image1?: string; image2?: string; image3?: string } | null
): string[] {
  if (!product) {
    return ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'];
  }

  const list: string[] = [];

  const add = (url?: string) => {
    if (url && typeof url === 'string' && url.trim().length > 0 && !list.includes(url.trim())) {
      list.push(url.trim());
    }
  };

  add(product.image);
  if ('image1' in product) add(product.image1);
  if ('image2' in product) add(product.image2);
  if ('image3' in product) add(product.image3);

  if (product.images) {
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (typeof img === 'string') add(img);
      });
    } else if (typeof product.images === 'object') {
      if ('main' in product.images && typeof product.images.main === 'string') add(product.images.main);
      if ('gallery' in product.images && Array.isArray(product.images.gallery)) {
        product.images.gallery.forEach((img) => {
          if (typeof img === 'string') add(img);
        });
      }
    }
  }

  return list.length > 0
    ? list
    : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'];
}

export default getProductImage;
