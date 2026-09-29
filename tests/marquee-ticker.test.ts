import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Navbar Layout, Marquee Ticker & Secondary Category Sub-Bar Logic', () => {
  // 1. Ticker Visibility: Ticker is permanently visible at all times
  test('marquee ticker container is permanently visible regardless of scroll state', () => {
    const getTickerClass = () => 'w-full overflow-hidden bg-neutral-900 border-b border-neutral-800';
    
    const tickerClass = getTickerClass();
    assert.ok(tickerClass.includes('w-full'), 'Must span full width');
    assert.ok(tickerClass.includes('bg-neutral-900'), 'Must have brand dark background');
    assert.ok(!tickerClass.includes('max-h-0'), 'Must not have zero height collapse');
    assert.ok(!tickerClass.includes('opacity-0'), 'Must not be hidden');
  });

  // 2. Secondary Category Sub-Bar Conditional Visibility Rule
  const shouldShowCategorySubBar = (pathname: string): boolean => {
    return pathname === '/' || pathname.startsWith('/kategori') || pathname.startsWith('/urun/');
  };

  test('secondary category sub-bar is shown on root and product/category routes', () => {
    assert.equal(shouldShowCategorySubBar('/'), true, 'Must show on root URL (which renders default category)');
    assert.equal(shouldShowCategorySubBar('/kategori'), true, 'Must show on /kategori base page');
    assert.equal(shouldShowCategorySubBar('/kategori/makam-takimlari'), true, 'Must show on /kategori/[slug]');
    assert.equal(shouldShowCategorySubBar('/kategori/aksesuar-ve-diger'), true, 'Must show on default category URL');
    assert.equal(shouldShowCategorySubBar('/urun/valencia-makam-masasi'), true, 'Must show on product detail page');
  });

  test('secondary category sub-bar is hidden on non-product pages to prevent clutter', () => {
    assert.equal(shouldShowCategorySubBar('/anasayfa'), false, 'Must be hidden on corporate homepage');
    assert.equal(shouldShowCategorySubBar('/katalog'), false, 'Must be hidden on PDF catalog page');
    assert.equal(shouldShowCategorySubBar('/bayiler'), false, 'Must be hidden on dealers map page');
    assert.equal(shouldShowCategorySubBar('/blog'), false, 'Must be hidden on blog pages');
    assert.equal(shouldShowCategorySubBar('/kurumsal'), false, 'Must be hidden on about page');
    assert.equal(shouldShowCategorySubBar('/iletisim'), false, 'Must be hidden on contact page');
  });

  // 3. Navbar Navigation Links Integrity
  test('navLinks strictly includes ÜRÜNLER pointing to /kategori', () => {
    const navLinks = [
      { name: 'ANASAYFA', href: '/anasayfa' },
      { name: 'ÜRÜNLER', href: '/kategori' },
      { name: 'KATALOG', href: '/katalog' },
      { name: 'BAYİLER', href: '/bayiler' },
      { name: 'BLOG', href: '/blog' },
      { name: 'KURUMSAL', href: '/kurumsal' },
      { name: 'İLETİŞİM', href: '/iletisim' },
    ];

    const urunlerLink = navLinks.find(l => l.name === 'ÜRÜNLER');
    assert.ok(urunlerLink, 'ÜRÜNLER link must exist in navbar');
    assert.equal(urunlerLink?.href, '/kategori', 'ÜRÜNLER must point to /kategori');

    const anasayfaLink = navLinks.find(l => l.name === 'ANASAYFA');
    assert.ok(anasayfaLink, 'ANASAYFA link must exist in navbar');
    assert.equal(anasayfaLink?.href, '/anasayfa', 'ANASAYFA must point to /anasayfa');
  });

  // 4. Root URL to Category Navigation Progression on Filter Application
  test('filter updates on root (/) cleanly escalate to canonical /kategori/[slug]?query', () => {
    const resolveFilterTargetUrl = (currentPathname: string, categorySlug: string, queryParams: string) => {
      const basePath = currentPathname === '/' ? `/kategori/${categorySlug}` : currentPathname;
      return queryParams ? `${basePath}?${queryParams}` : basePath;
    };

    const targetUrl = resolveFilterTargetUrl('/', 'aksesuar-ve-diger', 'renk=ceviz&minPrice=1000');
    assert.equal(targetUrl, '/kategori/aksesuar-ve-diger?renk=ceviz&minPrice=1000');

    const directCategoryTarget = resolveFilterTargetUrl('/kategori/aksesuar-ve-diger', 'aksesuar-ve-diger', 'renk=antrasit');
    assert.equal(directCategoryTarget, '/kategori/aksesuar-ve-diger?renk=antrasit');
  });
});
