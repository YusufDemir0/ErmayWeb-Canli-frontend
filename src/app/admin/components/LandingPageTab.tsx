'use client';

import React, { useState } from 'react';
import { Home, Compass, Layers, CheckCircle2, Save, Sparkles, ExternalLink } from 'lucide-react';
import { useCMSStore, type LandingPageConfig } from '../../../stores/useCMSStore';

interface LandingPageTabProps {
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
}

export const LandingPageTab: React.FC<LandingPageTabProps> = ({ onShowSuccess, onShowError }) => {
  const landingPageConfig = useCMSStore((state) => state.landingPageConfig);
  const updateLandingPageConfig = useCMSStore((state) => state.updateLandingPageConfig);
  const categories = useCMSStore((state) => state.categories);

  const [selectedType, setSelectedType] = useState<'home' | 'category' | 'catalog'>(
    landingPageConfig?.type || 'home'
  );
  const [selectedSlug, setSelectedSlug] = useState<string>(
    landingPageConfig?.targetSlug || (categories[0]?.slug || '')
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const targetCat = categories.find((c) => c.slug === selectedSlug);
      const newConfig: LandingPageConfig = {
        type: selectedType,
        targetSlug: selectedType === 'category' ? selectedSlug : undefined,
        targetTitle: selectedType === 'category' ? targetCat?.name : undefined,
      };

      await updateLandingPageConfig(newConfig);
      onShowSuccess('Açılış sayfası tercihi başarıyla kaydedildi!');
    } catch {
      onShowError('Açılış sayfası ayarı kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Information Header */}
      <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
          <Compass className="h-4 w-4 text-[#C5A880]" />
          <span>Web Sitesi Açılış Sayfası Tercihi (Landing Route)</span>
        </h2>
        <p className="text-xs text-neutral-500 font-light mt-1 leading-relaxed">
          Kullanıcılar <code className="bg-neutral-100 px-1.5 py-0.5 rounded-xs font-mono text-neutral-800">/</code> kök adresine girdiğinde ilk gösterilecek sayfayı buradan belirleyebilirsiniz. Vitrin sayfası ise navigasyon menüsünden her zaman erişilebilir durumdadır.
        </p>
      </div>

      {/* Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option 1: Standard Home Showcase */}
        <div
          onClick={() => setSelectedType('home')}
          className={`p-6 rounded-sm border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            selectedType === 'home'
              ? 'border-[#C5A880] bg-[#FBF9F5] shadow-xs'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Home className={`h-5 w-5 ${selectedType === 'home' ? 'text-[#C5A880]' : 'text-neutral-400'}`} />
              {selectedType === 'home' && <CheckCircle2 className="h-4 w-4 text-[#C5A880]" />}
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Klasik Vitrin (Ana Sayfa)
            </h3>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Hero kaydırıcı, öne çıkan takımlar, avantaj ikonları ve tüm vitrin bölümleri.
            </p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Rota: /</span>
        </div>

        {/* Option 2: Specific Category */}
        <div
          onClick={() => setSelectedType('category')}
          className={`p-6 rounded-sm border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            selectedType === 'category'
              ? 'border-[#C5A880] bg-[#FBF9F5] shadow-xs'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Layers className={`h-5 w-5 ${selectedType === 'category' ? 'text-[#C5A880]' : 'text-neutral-400'}`} />
              {selectedType === 'category' && <CheckCircle2 className="h-4 w-4 text-[#C5A880]" />}
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Belirli Bir Kategori
            </h3>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Kullanıcı siteye girer girmez seçtiğiniz kategorinin ürün listesi doğrudan açılır.
            </p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Rota: /kategori/{selectedSlug || '...'}
          </span>
        </div>

        {/* Option 3: Full Catalog */}
        <div
          onClick={() => setSelectedType('catalog')}
          className={`p-6 rounded-sm border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            selectedType === 'catalog'
              ? 'border-[#C5A880] bg-[#FBF9F5] shadow-xs'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Sparkles className={`h-5 w-5 ${selectedType === 'catalog' ? 'text-[#C5A880]' : 'text-neutral-400'}`} />
              {selectedType === 'catalog' && <CheckCircle2 className="h-4 w-4 text-[#C5A880]" />}
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Tüm Ürünler Kataloğu
            </h3>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Filtreler, sıralamalar ve tüm masif ahşap koleksiyonu ilk ekranda gösterilir.
            </p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Rota: /katalog</span>
        </div>
      </div>

      {/* Category Dropdown (Active only when category selected) */}
      {selectedType === 'category' && (
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4 animate-fade-in">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900">
            Açılışta Gösterilecek Kategoriyi Seçin:
          </label>

          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-hidden bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name} ({cat.slug})
              </option>
            ))}
          </select>

          <p className="text-[11px] text-neutral-500 font-light">
            Seçilen kategori: <span className="font-semibold text-neutral-800">{categories.find((c) => c.slug === selectedSlug)?.name || selectedSlug}</span>
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Kaydediliyor...' : 'Açılış Sayfası Tercihini Kaydet'}</span>
        </button>
      </div>
    </div>
  );
};
