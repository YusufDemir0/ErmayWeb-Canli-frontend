'use client';

import React, { useState, useEffect } from 'react';
import type { CorporateConfig } from '../../../stores/useCMSStore';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { Building2, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CorporateCMSTabProps {
  corporateConfig: CorporateConfig;
  onUpdateCorporateConfig: (config: Partial<CorporateConfig>) => void;
  onShowSuccess: (msg: string) => void;
}

export const CorporateCMSTab: React.FC<CorporateCMSTabProps> = ({
  corporateConfig,
  onUpdateCorporateConfig,
  onShowSuccess,
}) => {
  const [localCorpConfig, setLocalCorpConfig] = useState(corporateConfig);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);

  useEffect(() => {
    // If storyContent is empty but paragraphs exist, merge them
    const initialStory = corporateConfig.storyContent || 
      [corporateConfig.storyParagraph1, corporateConfig.storyParagraph2].filter(Boolean).join('\n\n');
    
    setLocalCorpConfig({
      ...corporateConfig,
      storyContent: initialStory,
    });
  }, [corporateConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCorporateConfig(localCorpConfig);
    onShowSuccess('Kurumsal sayfası tüm içerik ve görselleri güncellendi!');
  };

  const handleCorpHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingHero(true);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        setLocalCorpConfig({ ...localCorpConfig, heroImage: url });
        onShowSuccess('Kurumsal hero görseli yüklendi!');
      } catch (err) {
        console.error('Yükleme hatası:', err);
      } finally {
        setUploadingHero(false);
      }
    }
  };

  const handleCorpStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingStory(true);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        setLocalCorpConfig({ ...localCorpConfig, storyImage: url });
        onShowSuccess('İmalat hikaye görseli yüklendi!');
      } catch (err) {
        console.error('Yükleme hatası:', err);
      } finally {
        setUploadingStory(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs">
        
        {/* Header */}
        <div className="border-b border-neutral-100 pb-4 mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880] block mb-1">
            Kurumsal İçerik & Hikaye Yönetimi
          </span>
          <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#C5A880]" />
            <span>Hakkımızda & İmalat Hikayesi CMS</span>
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
          
          {/* Hero Section */}
          <div className="bg-[#FAF8F5] p-5 rounded-xs border border-[#EAE3D2] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              1. Hero Manşet Bölümü
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Hero Başlık
                </label>
                <input
                  type="text"
                  value={localCorpConfig.heroTitle}
                  onChange={(e) => setLocalCorpConfig({ ...localCorpConfig, heroTitle: e.target.value })}
                  placeholder="Örn: 30 Yılı Aşkın İmalat Tecrübesi"
                  className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white font-serif font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Vurgulu Kelime / Slogan
                </label>
                <input
                  type="text"
                  value={localCorpConfig.heroHighlight}
                  onChange={(e) =>
                    setLocalCorpConfig({ ...localCorpConfig, heroHighlight: e.target.value })
                  }
                  placeholder="Örn: Zanaat ve İmalat Gücü"
                  className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white text-[#8A4B20] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Hero Arka Plan Görseli
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-3 aspect-[16/9] bg-neutral-200 rounded-xs overflow-hidden border border-neutral-300 relative">
                  {localCorpConfig.heroImage ? (
                    <img src={localCorpConfig.heroImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">
                      Görsel Yok
                    </div>
                  )}
                </div>
                <div className="sm:col-span-9 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCorpHeroImageUpload}
                    className="w-full text-[10px]"
                  />
                  <input
                    type="text"
                    placeholder="Veya görsel URL yapıştırın"
                    value={localCorpConfig.heroImage}
                    onChange={(e) => setLocalCorpConfig({ ...localCorpConfig, heroImage: e.target.value })}
                    className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                  />
                  {uploadingHero && <span className="text-[10px] text-[#C5A880]">Görsel yükleniyor...</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Unified Adaptive Story Content Box */}
          <div className="bg-[#FAF8F5] p-5 rounded-xs border border-[#EAE3D2] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                2. Şirket Hikayesi & İmalat Felsefesi (Tek ve Esnek Metin Alanı)
              </h4>
              <span className="text-[10px] text-neutral-500 font-light">
                (Paragrafları ayırmak için Enter tuşuna basmanız yeterlidir)
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Hikaye Metni (İstediğiniz kadar paragraf yazabilirsiniz)
              </label>
              <textarea
                rows={8}
                value={localCorpConfig.storyContent}
                onChange={(e) =>
                  setLocalCorpConfig({ ...localCorpConfig, storyContent: e.target.value })
                }
                placeholder="1995 yılından bu yana kendi üretim tesislerimizde fırınlanmış gürgen ağacını, yüksek dansiteli süngeri ve birinci sınıf döşemeleri harmanlayarak..."
                className="w-full text-xs border border-neutral-300 p-3 rounded-xs bg-white leading-relaxed focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
              />
            </div>

            {/* Story Visual */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Atölye & Üretim Hikayesi Görseli
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-3 aspect-[16/9] bg-neutral-200 rounded-xs overflow-hidden border border-neutral-300 relative">
                  {localCorpConfig.storyImage ? (
                    <img src={localCorpConfig.storyImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">
                      Görsel Yok
                    </div>
                  )}
                </div>
                <div className="sm:col-span-9 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCorpStoryImageUpload}
                    className="w-full text-[10px]"
                  />
                  <input
                    type="text"
                    placeholder="Veya görsel URL yapıştırın"
                    value={localCorpConfig.storyImage}
                    onChange={(e) => setLocalCorpConfig({ ...localCorpConfig, storyImage: e.target.value })}
                    className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                  />
                  {uploadingStory && <span className="text-[10px] text-[#C5A880]">Görsel yükleniyor...</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded-xs transition-colors cursor-pointer shadow-xs"
            >
              Kurumsal Sayfası Değişikliklerini Kaydet
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CorporateCMSTab;
