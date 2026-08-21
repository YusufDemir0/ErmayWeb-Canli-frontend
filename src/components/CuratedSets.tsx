'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Check, Sparkles, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useCMSStore } from '../stores/useCMSStore';

export const CuratedSets: React.FC = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const products = useCMSStore((state) => state.products);

  // Curated package definitions with set items
  const SETS = [
    {
      id: 'set-milano-makam',
      title: 'Milano İtalyan Deri Makam Takımı',
      category: 'Makam & Ofis Takımı',
      tag: 'Tam Takım Avantajı',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=900',
      description: 'Masif meşe gövde, İtalyan taba deri kaplama ve döküm pirinç detaylı prestijli yönetici seti.',
      items: [
        '1 Adet Milano 240cm Makam Masası',
        '1 Adet Entegre Çekmeceli Etajer',
        '1 Adet Ahşap Sehpa',
        '1 Adet Ergonomik Hakiki Deri Makam Koltuğu',
        '2 Adet Misafir Berjeri',
      ],
      originalPrice: 84000,
      price: 69900,
      matchedProduct: products.find((p) => p.slug?.includes('makam') || p.name.includes('Makam')) || products[0],
    },
    {
      id: 'set-floransa-salon',
      title: 'Floransa Masif Ahşap Salon Takımı',
      category: 'Oturma Grubu & Salon',
      tag: 'Atölye Özel Kombinasyon',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=900',
      description: '%100 Fırınlanmış gürgen iskelet, leke tutmaz keten dokuma kumaş ve el işçiliği kapitone detaylar.',
      items: [
        '1 Adet Floransa 4\'lü Ana Koltuk (240cm)',
        '1 Adet Floransa 3\'lü Koltuk (210cm)',
        '2 Adet Hakiki Ahşap Ayaklı Berjer',
        '1 Adet Doğal Traverten Mermer Orta Sehpa',
      ],
      originalPrice: 78500,
      price: 64500,
      matchedProduct: products.find((p) => p.slug?.includes('koltuk') || p.name.includes('Koltuk')) || products[1] || products[0],
    },
    {
      id: 'set-roma-yemek',
      title: 'Roma Doğal Mermer Yemek Odası Takımı',
      category: 'Yemek Odası & Davet',
      tag: 'Özel Seri Paket',
      image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=900',
      description: 'İtalyan Calacatta mermer tabla, masif ceviz ayaklar ve nubuk kumaş sandalyeler.',
      items: [
        '1 Adet Roma 220cm Mermer Yemek Masası',
        '6 Adet Ergonomik Nubuk Yemek Sandalyesi',
        '1 Adet 4 Kapaklı Aynalı Konsol',
      ],
      originalPrice: 62000,
      price: 52900,
      matchedProduct: products.find((p) => p.slug?.includes('yemek') || p.name.includes('Yemek')) || products[2] || products[0],
    },
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount).replace('TRY', 'TL');
  };

  const handleAddSetToCart = (setObj: typeof SETS[0]) => {
    if (setObj.matchedProduct) {
      addToCart(setObj.matchedProduct, 1);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-white border-b border-[#EAE3D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAE3D2] pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Doğrudan Üreticiden
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              Özel Takım Kombinasyonları
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-light max-w-xl">
              Kendi fabrikamızda birbirine tam uyumlu olarak üretilen ve takım avantajıyla sunulan komple yaşam ve makam setleri.
            </p>
          </div>

          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B4966E] hover:text-neutral-900 transition-colors group"
          >
            <span>Tüm Takımları İncele</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Curated Sets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SETS.map((setObj) => (
            <div
              key={setObj.id}
              className="bg-[#FAF8F5] rounded-sm border border-[#EAE3D2] overflow-hidden hover:border-[#C5A880] transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
            >
              <div>
                {/* Visual */}
                <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-200 relative">
                  <img
                    src={setObj.image}
                    alt={setObj.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-2xs border border-white/20">
                    {setObj.tag}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9.5px] uppercase tracking-[0.2em] text-[#C5A880] font-bold block">
                      {setObj.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-neutral-900 tracking-tight">
                      {setObj.title}
                    </h3>
                  </div>

                  <p className="text-neutral-600 text-xs font-light leading-relaxed">
                    {setObj.description}
                  </p>

                  {/* Included Items Checklist */}
                  <div className="bg-white border border-[#EAE3D2] rounded-xs p-3.5 space-y-2">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
                      Paket İçeriği:
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-neutral-700 font-medium">
                      {setObj.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-[#C5A880] flex-shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Price & Actions Footer */}
              <div className="p-6 pt-0 border-t border-[#EAE3D2]/60 mt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-neutral-400 line-through block">
                    {formatPrice(setObj.originalPrice)}
                  </span>
                  <span className="text-base md:text-lg font-extrabold text-neutral-900">
                    {formatPrice(setObj.price)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddSetToCart(setObj)}
                    className="bg-neutral-900 hover:bg-[#C5A880] text-white p-2.5 rounded-xs transition-colors cursor-pointer"
                    title="Takımı Sepete Ekle"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                  <Link
                    href={setObj.matchedProduct ? `/urun/${setObj.matchedProduct.id}` : '/katalog'}
                    className="bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xs transition-colors inline-block"
                  >
                    İncele
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CuratedSets;
