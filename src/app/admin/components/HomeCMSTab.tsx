'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Image as ImageIcon, Link as LinkIcon, Sparkles } from 'lucide-react';
import type { HomeConfig } from '../../../stores/useCMSStore';
import { useCMSStore } from '../../../stores/useCMSStore';
import { uploadProductImage } from '../../../lib/uploadHelper';

interface HomeCMSTabProps {
  homeConfig: HomeConfig;
  onUpdateHomeConfig: (config: Partial<HomeConfig>) => void;
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
}

export const HomeCMSTab: React.FC<HomeCMSTabProps> = ({
  homeConfig,
  onUpdateHomeConfig,
  onShowSuccess,
  onShowError,
}) => {
  const [localHomeConfig, setLocalHomeConfig] = useState(homeConfig);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const categories = useCMSStore((state) => state.categories) || [];
  const products = useCMSStore((state) => state.products) || [];

  useEffect(() => {
    setLocalHomeConfig(homeConfig);
  }, [homeConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHomeConfig(localHomeConfig);
    onShowSuccess('Ana sayfa manşetleri ve vitrin ayarları başarıyla kaydedildi!');
  };

  const handleSlideImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingIndex(index);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        const updated = [...localHomeConfig.heroSlides];
        updated[index] = { ...updated[index], image: url };
        setLocalHomeConfig({ ...localHomeConfig, heroSlides: updated });
        onShowSuccess('Slayt görseli yüklendi!');
      } catch (err) {
        console.error('Görsel yükleme hatası:', err);
      } finally {
        setUploadingIndex(null);
      }
    }
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      title: '2026 Yönetici ve Makam Koleksiyonu',
      subtitle: 'Masif iskelet ve hakiki deri işçiliğiyle üretilmiş zamansız parçalar.',
      badge: 'YENİ SEZON İMALAT',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200',
      buttonText: 'Koleksiyonu Keşfet',
      buttonLink: '/katalog',
    };
    setLocalHomeConfig({
      ...localHomeConfig,
      heroSlides: [...localHomeConfig.heroSlides, newSlide],
    });
  };

  const handleDeleteSlide = (index: number) => {
    if (localHomeConfig.heroSlides.length <= 1) {
      onShowError('En az 1 manşet slaytı bulunmalıdır.');
      return;
    }
    const updated = localHomeConfig.heroSlides.filter((_, i) => i !== index);
    setLocalHomeConfig({ ...localHomeConfig, heroSlides: updated });
    onShowSuccess('Slayt kaldırıldı.');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 mb-6 gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880] block mb-1">
              Vitrin & Manşet Yönetimi
            </span>
            <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
              Ana Sayfa Hero Banner & Slaytlar
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddSlide}
            className="flex items-center gap-1.5 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Slayt Ekle</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Slides List */}
          <div className="space-y-6">
            {localHomeConfig.heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="p-6 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2] space-y-4"
              >
                {/* Slide Card Header */}
                <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#C5A880]" />
                    Slayt #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(index)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>Slaytı Sil</span>
                  </button>
                </div>

                {/* Slide Image Uploader & Preview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 aspect-[16/9] bg-neutral-200 rounded-xs overflow-hidden border border-neutral-300 relative">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-xs gap-1">
                        <ImageIcon className="h-6 w-6 text-neutral-300" />
                        <span>Görsel Yükleyin</span>
                      </div>
                    )}
                    {uploadingIndex === index && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                        Görsel İşleniyor...
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                      Slayt Arka Plan Görseli
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSlideImageUpload(index, e)}
                      className="w-full text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xs file:border-0 file:text-xs file:bg-neutral-900 file:text-white file:cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Veya doğrudan görsel URL yapıştırın..."
                      value={slide.image}
                      onChange={(e) => {
                        const u = [...localHomeConfig.heroSlides];
                        u[index] = { ...u[index], image: e.target.value };
                        setLocalHomeConfig({ ...localHomeConfig, heroSlides: u });
                      }}
                      className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                    />
                  </div>
                </div>

                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Üst Rozet / Etiket
                    </label>
                    <input
                      type="text"
                      value={slide.badge}
                      onChange={(e) => {
                        const u = [...localHomeConfig.heroSlides];
                        u[index] = { ...u[index], badge: e.target.value };
                        setLocalHomeConfig({ ...localHomeConfig, heroSlides: u });
                      }}
                      placeholder="Örn: 2026 YENİ KOLEKSİYON"
                      className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Ana Manşet Başlığı
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => {
                        const u = [...localHomeConfig.heroSlides];
                        u[index] = { ...u[index], title: e.target.value };
                        setLocalHomeConfig({ ...localHomeConfig, heroSlides: u });
                      }}
                      placeholder="Örn: Prestij ve Fonksiyonelliğin Zirvesi"
                      className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white font-serif font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Alt Açıklama Metni
                  </label>
                  <textarea
                    rows={2}
                    value={slide.subtitle}
                    onChange={(e) => {
                      const u = [...localHomeConfig.heroSlides];
                      u[index] = { ...u[index], subtitle: e.target.value };
                      setLocalHomeConfig({ ...localHomeConfig, heroSlides: u });
                    }}
                    placeholder="Makam takımları, çalışma grupları ve lüks dinlenme alanları için özel üretim çözümler."
                    className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white leading-relaxed"
                  />
                </div>

                {/* Button Text & SMART TARGET PICKER (No manual typing required!) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#EAE3D2]">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Buton Üzerindeki Metin
                    </label>
                    <input
                      type="text"
                      value={slide.buttonText}
                      onChange={(e) => {
                        const u = [...localHomeConfig.heroSlides];
                        u[index] = { ...u[index], buttonText: e.target.value };
                        setLocalHomeConfig({ ...localHomeConfig, heroSlides: u });
                      }}
                      placeholder="Örn: Koleksiyonu İncele"
                      className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1 flex items-center gap-1">
                      <LinkIcon className="h-3 w-3 text-[#C5A880]" />
                      <span>Buton Yönlendirme Hedefi (Açılır Menüden Seçin)</span>
                    </label>

                    <select
                      value={
                        ['/katalog', '/iletisim', '/bayiler'].includes(slide.buttonLink) ||
                        categories.some(c => `/kategori/${c.slug}` === slide.buttonLink) ||
                        products.some(p => `/urun/${p.id}` === slide.buttonLink || `/urun/${p.slug}` === slide.buttonLink)
                          ? slide.buttonLink
                          : 'custom'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const u = [...localHomeConfig.heroSlides];
                        if (val !== 'custom') {
                          u[index] = { ...u[index], buttonLink: val };
                        } else {
                          u[index] = { ...u[index], buttonLink: slide.buttonLink || '/katalog' };
                        }
                        setLocalHomeConfig({ ...localHomeConfig, heroSlides: u });
                      }}
                      className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                    >
                      <optgroup label="Genel Sayfalar">
                        <option value="/katalog">Katalog & Tüm Koleksiyon (/katalog)</option>
                        <option value="/bayiler">Satış Noktaları & Bayiler (/bayiler)</option>
                        <option value="/iletisim">İletişim & Sipariş Hattı (/iletisim)</option>
                      </optgroup>

                      {categories.length > 0 && (
                        <optgroup label="Kategoriler">
                          {categories.map((cat) => (
                            <option key={cat.id} value={`/kategori/${cat.slug}`}>
                              Kategori: {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {products.length > 0 && (
                        <optgroup label="Tekil Ürünler">
                          {products.map((prod) => (
                            <option key={prod.id} value={`/urun/${prod.id}`}>
                              Ürün: {prod.name}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <optgroup label="Özel">
                        <option value="custom">Özel Link Gir (Manuel)...</option>
                      </optgroup>
                    </select>

                    <input
                      type="text"
                      value={slide.buttonLink}
                      onChange={(e) => {
                        const u = [...localHomeConfig.heroSlides];
                        u[index] = { ...u[index], buttonLink: e.target.value };
                        setLocalHomeConfig({ ...localHomeConfig, heroSlides: u });
                      }}
                      placeholder="/katalog"
                      className="w-full text-[11px] font-mono border border-neutral-300 p-1.5 rounded-xs bg-white mt-1 text-neutral-600"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Section Titles */}
          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <h4 className="text-xs font-bold text-[#8A4B20] uppercase tracking-wider">
              Ana Sayfa Bölüm Başlıkları
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Öne Çıkan Koleksiyon Başlığı
                </label>
                <input
                  type="text"
                  value={localHomeConfig.featuredTitle}
                  onChange={(e) =>
                    setLocalHomeConfig({ ...localHomeConfig, featuredTitle: e.target.value })
                  }
                  className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Öne Çıkan Koleksiyon Alt Başlığı
                </label>
                <input
                  type="text"
                  value={localHomeConfig.featuredSubtitle}
                  onChange={(e) =>
                    setLocalHomeConfig({ ...localHomeConfig, featuredSubtitle: e.target.value })
                  }
                  className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded-xs transition-colors cursor-pointer shadow-xs"
            >
              Ana Sayfa Değişikliklerini Kaydet
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default HomeCMSTab;
