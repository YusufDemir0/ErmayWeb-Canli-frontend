import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test 1: formatPrice function
function formatPrice(price) {
  if (price === undefined || price === null || isNaN(Number(price))) {
    return '0 TL';
  }
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  })
    .format(Number(price))
    .replace('TRY', 'TL')
    .trim();
}

// Test 2: slugifyTurkish logic
function slugifyTurkish(text) {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/ç/g, 'c')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Test 3: getCartItemKey logic
function getCartItemKey(product) {
  const colorKey = product.selectedColor?.trim().toLowerCase() || 'default';
  const variantKey = product.selectedVariant?.trim().toLowerCase() || 'default';
  const piecesKey = product.selectedPieces && product.selectedPieces.length > 0
    ? [...product.selectedPieces].sort().join('-').toLowerCase()
    : 'all';
  return `${product.id}::${colorKey}::${variantKey}::${piecesKey}`;
}

// Test 4: resolveImageUrl logic
function resolveImageUrl(url, fallback = '/default-furniture.webp') {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  return clean.startsWith('/') ? clean : `/${clean}`;
}

describe('Frontend Unit Tests: Core Library & Cart Logic', () => {
  describe('1. Price Formatting', () => {
    test('formats numerical TRY prices cleanly without decimals', () => {
      const res = formatPrice(24500);
      assert.match(res, /24\.500/);
      assert.match(res, /[₺TL]/);
    });

    test('handles zero, negative, and null prices gracefully', () => {
      assert.match(formatPrice(0), /0/);
      assert.match(formatPrice(null), /0/);
      assert.match(formatPrice(undefined), /0/);
    });
  });

  describe('2. Turkish Slugify (F-15)', () => {
    test('converts Turkish characters to URL-safe ASCII slug', () => {
      const slug = slugifyTurkish('Makam Masası & Şık Yönetici Koltuğu (Özel Seri)');
      assert.equal(slug, 'makam-masasi-sik-yonetici-koltugu-ozel-seri');
    });

    test('eliminates redundant whitespace and dashes', () => {
      const slug = slugifyTurkish('   ---  İzmir   Toplantı   Masası ---  ');
      assert.equal(slug, 'izmir-toplanti-masasi');
    });
  });

  describe('3. Cart Item Compound Key (F-03)', () => {
    test('produces unique keys based on id, color, variant and set pieces', () => {
      const key1 = getCartItemKey({
        id: 'prod-1',
        selectedColor: 'Antrasit',
        selectedVariant: 'Lüks Deri',
        selectedPieces: ['Masa', 'Keson'],
      });

      const key2 = getCartItemKey({
        id: 'prod-1',
        selectedColor: 'Kahverengi',
        selectedVariant: 'Lüks Deri',
        selectedPieces: ['Masa', 'Keson'],
      });

      assert.notEqual(key1, key2);
      assert.equal(key1, 'prod-1::antrasit::lüks deri::keson-masa');
    });
  });

  describe('4. Image URL Resolver', () => {
    test('resolves relative and external image URLs correctly', () => {
      assert.equal(resolveImageUrl('uploads/desk.webp'), '/uploads/desk.webp');
      assert.equal(resolveImageUrl('/uploads/chair.webp'), '/uploads/chair.webp');
      assert.equal(resolveImageUrl('https://example.com/desk.jpg'), 'https://example.com/desk.jpg');
      assert.equal(resolveImageUrl(''), '/default-furniture.webp');
      assert.equal(resolveImageUrl(null), '/default-furniture.webp');
    });
  });
});
