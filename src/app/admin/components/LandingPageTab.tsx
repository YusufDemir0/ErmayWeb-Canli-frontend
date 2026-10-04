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
      <div className="bg-white p-6 rounded-xs border border-line">
        <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
          <Compass className="h-4 w-4 text-wood" />
          <span>Web Sitesi Açılış Sayfası Tercihi (Landing Route)</span>
        </h2>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
          Kullanıcılar <code className="bg-neutral-100 px-1.5 py-0.5 rounded-xs font-mono text-neutral-800">/</code> kök adresine girdiğinde ilk gösterilecek sayfayı buradan belirleyebilirsiniz. Vitrin sayfası ise navigasyon menüsünden her zaman erişilebilir durumdadır.
        </p>
      </div>

      {/* Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option 1: Standard Home Showcase */}
        <div
          onClick={() => setSelectedType('home')}
          className={`p-6 rounded-xs border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            selectedType === 'home'
              ? 'border-wood bg-paper'
              : 'border-line bg-white hover:border-line-strong'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Home className={`h-5 w-5 ${selectedType === 'home' ? 'text-wood' : 'text-neutral-500'}`} />
              {selectedType === 'home' && <CheckCircle2 className="h-4 w-4 text-wood" />}
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Klasik Vitrin (Ana Sayfa)
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Hero kaydırıcı, öne çıkan takımlar, avantaj ikonları ve tüm vitrin bölümleri.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500">Rota: /</span>
        </div>

        {/* Option 2: Specific Category */}
        <div
          onClick={() => setSelectedType('category')}
          className={`p-6 rounded-xs border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            selectedType === 'category'
              ? 'border-wood bg-paper'
              : 'border-line bg-white hover:border-line-strong'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Layers className={`h-5 w-5 ${selectedType === 'category' ? 'text-wood' : 'text-neutral-500'}`} />
              {selectedType === 'category' && <CheckCircle2 className="h-4 w-4 text-wood" />}
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Belirli Bir Kategori
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Kullanıcı siteye girer girmez seçtiğiniz kategorinin ürün listesi doğrudan açılır.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            Rota: /kategori/{selectedSlug || '...'}
          </span>
        </div>

        {/* Option 3: Full Catalog */}
        <div
          onClick={() => setSelectedType('catalog')}
          className={`p-6 rounded-xs border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            selectedType === 'catalog'
              ? 'border-wood bg-paper'
              : 'border-line bg-white hover:border-line-strong'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Sparkles className={`h-5 w-5 ${selectedType === 'catalog' ? 'text-wood' : 'text-neutral-500'}`} />
              {selectedType === 'catalog' && <CheckCircle2 className="h-4 w-4 text-wood" />}
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Tüm Ürünler Kataloğu
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Filtreler, sıralamalar ve tüm masif ahşap koleksiyonu ilk ekranda gösterilir.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500">Rota: /katalog</span>
        </div>
      </div>

      {/* Category Dropdown (Active only when category selected) */}
      {selectedType === 'category' && (
        <div className="bg-white p-6 rounded-xs border border-line space-y-4 animate-fade-in">
          <label className="block text-sm font-semibold text-neutral-900">
            Açılışta Gösterilecek Kategoriyi Seçin:
          </label>

          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs border border-line-strong rounded-xs focus:ring-1 focus:ring-wood focus:outline-hidden bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name} ({cat.slug})
              </option>
            ))}
          </select>

          <p className="text-xs text-neutral-500">
            Seçilen kategori: <span className="font-semibold text-neutral-800">{categories.find((c) => c.slug === selectedSlug)?.name || selectedSlug}</span>
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-ink text-ink text-xs font-bold rounded-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Kaydediliyor...' : 'Açılış Sayfası Tercihini Kaydet'}</span>
        </button>
      </div>
    </div>
  );
};
