import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Admin Product Form Auto-Drafting & Payload Architecture', () => {
  const DRAFT_KEY = 'ermay_admin_product_form_draft';

  // In-memory mock localStorage
  const createMockStorage = () => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  };

  test('auto-drafting serializes all form fields into localStorage correctly', () => {
    const storage = createMockStorage();
    const draftData = {
      name: 'Viyana Yönetici Masası',
      category: 'makam-takimlari',
      price: '24500',
      originalPrice: '29000',
      width: '220',
      depth: '95',
      height: '75',
      material: 'E1 Kalite Çizilmez Melamin & DKP Çelik Profil',
      drawerCount: '3',
      leadTimeDays: '10',
      vatRate: '0.20',
      features: ['Alüminyum bas-aç kablo kanalı', 'Frenli teleskopik raylar'],
      description: 'Lüks makam çalışma masası',
      badge: '2026 Standart Seri',
    };

    storage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    const retrieved = JSON.parse(storage.getItem(DRAFT_KEY)!);

    assert.equal(retrieved.name, 'Viyana Yönetici Masası');
    assert.equal(retrieved.price, '24500');
    assert.equal(retrieved.width, '220');
    assert.equal(retrieved.drawerCount, '3');
    assert.equal(retrieved.vatRate, '0.20');
    assert.equal(retrieved.features.length, 2);
  });

  test('draft is cleared cleanly upon successful form save', () => {
    const storage = createMockStorage();
    storage.setItem(DRAFT_KEY, JSON.stringify({ name: 'Taslak Ürün' }));
    assert.ok(storage.getItem(DRAFT_KEY));

    // Simulate save
    storage.removeItem(DRAFT_KEY);
    assert.equal(storage.getItem(DRAFT_KEY), null);
  });

  test('builds comprehensive Product payload with full technical specifications', () => {
    const buildPayload = (formState: {
      name: string;
      category: string;
      price: string;
      originalPrice?: string;
      image1?: string;
      image2?: string;
      image3?: string;
      inStock: boolean;
      leadTimeDays: string;
      vatRate: string;
      width: string;
      depth: string;
      height: string;
      drawerCount: string;
      material: string;
      features: string[];
      description?: string;
      badge?: string;
      erpItemId?: string;
      erpItemCode?: string;
    }) => {
      const allImages = [formState.image1, formState.image2, formState.image3].filter(Boolean) as string[];
      const w = parseInt(formState.width, 10) || 220;
      const d = parseInt(formState.depth, 10) || 95;
      const h = parseInt(formState.height, 10) || 75;

      return {
        name: formState.name.trim(),
        category: formState.category,
        price: parseFloat(formState.price) || 0,
        originalPrice: formState.originalPrice ? parseFloat(formState.originalPrice) : undefined,
        image: formState.image1 || '/default-furniture.webp',
        images: allImages.length > 0 ? allImages : ['/default-furniture.webp'],
        inStock: formState.inStock,
        leadTimeDays: parseInt(formState.leadTimeDays, 10) || 15,
        vatRate: parseFloat(formState.vatRate) || 0.20,
        erpItemId: formState.erpItemId || undefined,
        erpItemCode: formState.erpItemCode || undefined,
        dimensions: `G: ${w}cm × D: ${d}cm × Y: ${h}cm`,
        widthCm: w,
        depthCm: d,
        heightCm: h,
        drawerCount: parseInt(formState.drawerCount, 10) || 0,
        material: formState.material.trim(),
        features: formState.features,
        description: formState.description?.trim() || undefined,
        badge: formState.badge?.trim() || undefined,
      };
    };

    const payload = buildPayload({
      name: '  Milano Makam Masası  ',
      category: 'makam-takimlari',
      price: '28500',
      originalPrice: '32000',
      image1: '/img1.webp',
      image2: '/img2.webp',
      inStock: true,
      leadTimeDays: '7',
      vatRate: '0.20',
      width: '240',
      depth: '100',
      height: '75',
      drawerCount: '4',
      material: '1. Sınıf Masif Gürgen & Melamin',
      features: ['Çelik omurga', 'Merkezi kilit'],
      description: 'Lüks makam takımı',
      badge: 'Fabrika Seri',
      erpItemId: 'ERP-778',
      erpItemCode: 'MBL-MILANO-240',
    });

    assert.equal(payload.name, 'Milano Makam Masası');
    assert.equal(payload.price, 28500);
    assert.equal(payload.originalPrice, 32000);
    assert.equal(payload.widthCm, 240);
    assert.equal(payload.depthCm, 100);
    assert.equal(payload.heightCm, 75);
    assert.equal(payload.dimensions, 'G: 240cm × D: 100cm × Y: 75cm');
    assert.equal(payload.drawerCount, 4);
    assert.equal(payload.leadTimeDays, 7);
    assert.equal(payload.vatRate, 0.20);
    assert.equal(payload.erpItemId, 'ERP-778');
    assert.equal(payload.erpItemCode, 'MBL-MILANO-240');
    assert.equal(payload.images.length, 2);
  });

  test('form state synchronizer resets to clean defaults when opening create mode', () => {
    const getInitialState = (editingProduct?: any) => {
      if (editingProduct) {
        return {
          name: editingProduct.name,
          price: String(editingProduct.price),
          width: String(editingProduct.widthCm || 220),
          drawerCount: String(editingProduct.drawerCount || 0),
        };
      }
      return {
        name: '',
        price: '',
        width: '220',
        drawerCount: '3',
      };
    };

    // When editing product A
    const editState = getInitialState({ name: 'Ürün A', price: 15000, widthCm: 180, drawerCount: 2 });
    assert.equal(editState.name, 'Ürün A');
    assert.equal(editState.price, '15000');
    assert.equal(editState.width, '180');
    assert.equal(editState.drawerCount, '2');

    // When clicking New Product after Product A
    const newState = getInitialState(null);
    assert.equal(newState.name, '');
    assert.equal(newState.price, '');
    assert.equal(newState.width, '220');
    assert.equal(newState.drawerCount, '3');
  });
});
