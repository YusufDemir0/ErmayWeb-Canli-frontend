'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2, Upload } from 'lucide-react';
import { resolveCorporateConfig, type CorporateConfig } from '../../../lib/corporateContent';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { toast } from '../../../stores/useToastStore';

interface CorporateCMSTabProps {
  corporateConfig: CorporateConfig;
  onUpdateCorporateConfig: (config: Partial<CorporateConfig>) => void;
  onShowSuccess: (msg: string) => void;
}

const inputCls =
  'w-full text-sm border border-line-strong px-3 h-10 rounded-xs bg-white focus:ring-2 focus:ring-wood/30 focus:outline-none';
const areaCls =
  'w-full text-sm border border-line-strong p-3 rounded-xs bg-white focus:ring-2 focus:ring-wood/30 focus:outline-none leading-relaxed';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block space-y-1.5">
    <span className="block text-sm font-medium text-ink">{label}</span>
    {children}
    {hint && <span className="block text-xs text-neutral-500">{hint}</span>}
  </label>
);

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <section className="bg-white border border-line rounded-xs">
    <div className="px-5 py-4 border-b border-line">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description && <p className="text-sm text-neutral-600 mt-0.5">{description}</p>}
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </section>
);

/** Sıralanabilir liste satırı kontrolleri */
const RowControls: React.FC<{ index: number; length: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }> = ({
  index,
  length,
  onMove,
  onRemove,
}) => (
  <div className="flex items-start gap-1 shrink-0">
    <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="h-9 w-9 flex items-center justify-center text-neutral-600 hover:text-ink disabled:opacity-30 cursor-pointer" aria-label="Yukarı taşı">
      <ArrowUp className="h-4 w-4" />
    </button>
    <button type="button" onClick={() => onMove(1)} disabled={index === length - 1} className="h-9 w-9 flex items-center justify-center text-neutral-600 hover:text-ink disabled:opacity-30 cursor-pointer" aria-label="Aşağı taşı">
      <ArrowDown className="h-4 w-4" />
    </button>
    <button type="button" onClick={onRemove} className="h-9 w-9 flex items-center justify-center text-neutral-500 hover:text-signal cursor-pointer" aria-label="Sil">
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
);

const move = <T,>(list: T[], index: number, dir: -1 | 1): T[] => {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export const CorporateCMSTab: React.FC<CorporateCMSTabProps> = ({ corporateConfig, onUpdateCorporateConfig, onShowSuccess }) => {
  const [form, setForm] = useState<CorporateConfig>(() => resolveCorporateConfig(corporateConfig));
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState<'hero' | 'story' | null>(null);

  useEffect(() => {
    setForm(resolveCorporateConfig(corporateConfig));
    setDirty(false);
  }, [corporateConfig]);

  // Kaydedilmemiş değişiklik varken sekme kapatılırsa tarayıcı uyarır
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof CorporateConfig>(key: K, value: CorporateConfig[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const upload = async (which: 'hero' | 'story', file?: File) => {
    if (!file) return;
    setUploading(which);
    try {
      const url = await uploadProductImage(file);
      set(which === 'hero' ? 'heroImage' : 'storyImage', url);
    } catch (err) {
      toast.error('Görsel yüklenemedi', err instanceof Error ? err.message : 'Lütfen tekrar deneyin.');
    } finally {
      setUploading(null);
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // Eski şema alanları (vision/mission/quality, storyParagraph1/2) artık kart listesinde; kayda dahil edilmez
    const clean: Partial<CorporateConfig> = { ...form };
    for (const k of ['visionTitle', 'visionText', 'missionTitle', 'missionText', 'qualityTitle', 'qualityText', 'storyParagraph1', 'storyParagraph2'] as const) {
      delete clean[k];
    }
    onUpdateCorporateConfig({
      ...clean,
      highlights: (form.highlights || []).map((h) => h.trim()).filter(Boolean),
      cards: (form.cards || []).filter((c) => c.title.trim() || c.text.trim()),
      kvkkSections: (form.kvkkSections || []).filter((s) => s.heading.trim() || s.text.trim()),
    });
    setDirty(false);
    onShowSuccess('Kurumsal sayfa kaydedildi.');
  };

  const imageField = (which: 'hero' | 'story', label: string, hint: string) => {
    const key = which === 'hero' ? 'heroImage' : 'storyImage';
    const value = form[key];
    return (
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <div className="flex items-start gap-3">
          <div className="h-20 w-28 rounded-xs border border-line bg-paper overflow-hidden shrink-0">
            {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-1.5 h-10 px-3 border border-line-strong rounded-xs text-sm text-ink hover:bg-paper cursor-pointer">
                <Upload className="h-4 w-4" />
                {uploading === which ? 'Yükleniyor…' : 'Görsel yükle'}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(which, e.target.files?.[0])} />
              </label>
              {value && (
                <button type="button" onClick={() => set(key, '')} className="h-10 px-3 text-sm text-neutral-600 hover:text-signal cursor-pointer">
                  Kaldır
                </button>
              )}
            </div>
            <input className={inputCls} value={value} placeholder="veya görsel adresi yapıştırın" aria-label={`${label} adresi`} onChange={(e) => set(key, e.target.value)} />
          </div>
        </div>
        <span className="block text-xs text-neutral-500">{hint}</span>
      </div>
    );
  };

  const highlights = form.highlights || [];
  const cards = form.cards || [];
  const kvkk = form.kvkkSections || [];

  return (
    <form onSubmit={save} className="space-y-6 animate-fade-in pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">Sayfadaki her metin buradan düzenlenir. Boş bırakılan bölüm sitede gösterilmez.</p>
        <a href="/kurumsal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-wood hover:text-ink">
          Sayfayı görüntüle <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <Section title="Üst bölüm" description="Sayfanın en üstündeki başlık alanı.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Küçük etiket">
            <input className={inputCls} value={form.heroBadge} onChange={(e) => set('heroBadge', e.target.value)} />
          </Field>
          <Field label="Başlık">
            <input className={inputCls} value={form.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} />
          </Field>
        </div>
        <Field label="Başlığın vurgulu devamı" hint="Başlıktan sonra kahve renkte görünür.">
          <input className={inputCls} value={form.heroHighlight} onChange={(e) => set('heroHighlight', e.target.value)} />
        </Field>
        <Field label="Açıklama">
          <textarea rows={3} className={areaCls} value={form.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} />
        </Field>
        {imageField('hero', 'Görsel (isteğe bağlı)', 'Eklenirse başlığın sağında gösterilir.')}
      </Section>

      <Section title="Hikâye" description="Görsel, başlık, metin ve deneyim rozeti.">
        <Field label="Başlık">
          <input className={inputCls} value={form.storyTitle} onChange={(e) => set('storyTitle', e.target.value)} />
        </Field>
        <Field label="Metin" hint="Paragrafları boş bir satırla ayırın.">
          <textarea rows={7} className={areaCls} value={form.storyContent || ''} onChange={(e) => set('storyContent', e.target.value)} />
        </Field>
        {imageField('story', 'Görsel', 'Metnin solunda gösterilir.')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Rozet: büyük yazı" hint="Örn: 1986. Boş bırakılırsa rozet gösterilmez.">
            <input className={inputCls} value={form.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} />
          </Field>
          <Field label="Rozet: alt yazı">
            <input className={inputCls} value={form.experienceSubtitle} onChange={(e) => set('experienceSubtitle', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Güvenceler listesi" description="Hikâyenin altında onay işaretiyle gösterilen kısa maddeler.">
        <ol className="space-y-2">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-500 w-5">{i + 1}</span>
              <input
                className={inputCls}
                value={h}
                onChange={(e) => set('highlights', highlights.map((x, j) => (j === i ? e.target.value : x)))}
                aria-label={`Madde ${i + 1}`}
              />
              <RowControls
                index={i}
                length={highlights.length}
                onMove={(d) => set('highlights', move(highlights, i, d))}
                onRemove={() => set('highlights', highlights.filter((_, j) => j !== i))}
              />
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => set('highlights', [...highlights, ''])} className="inline-flex items-center gap-1.5 h-10 px-3 border border-line-strong rounded-xs text-sm text-ink hover:bg-paper cursor-pointer">
          <Plus className="h-4 w-4" /> Madde ekle
        </button>
      </Section>

      <Section title="Değer kartları" description="Hedefimiz, üretim standardımız, müşteri memnuniyeti gibi kartlar. İstediğiniz kadar ekleyin.">
        <ol className="space-y-3">
          {cards.map((card, i) => (
            <li key={i} className="flex gap-2 border border-line rounded-xs p-3">
              <span className="font-mono text-xs text-neutral-500 w-5 pt-2.5">{i + 1}</span>
              <div className="flex-1 space-y-2">
                <input
                  className={inputCls}
                  placeholder="Kart başlığı"
                  aria-label={`Kart ${i + 1} başlığı`}
                  value={card.title}
                  onChange={(e) => set('cards', cards.map((c, j) => (j === i ? { ...c, title: e.target.value } : c)))}
                />
                <textarea
                  rows={3}
                  className={areaCls}
                  placeholder="Kart metni"
                  aria-label={`Kart ${i + 1} metni`}
                  value={card.text}
                  onChange={(e) => set('cards', cards.map((c, j) => (j === i ? { ...c, text: e.target.value } : c)))}
                />
              </div>
              <RowControls index={i} length={cards.length} onMove={(d) => set('cards', move(cards, i, d))} onRemove={() => set('cards', cards.filter((_, j) => j !== i))} />
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => set('cards', [...cards, { title: '', text: '' }])} className="inline-flex items-center gap-1.5 h-10 px-3 border border-line-strong rounded-xs text-sm text-ink hover:bg-paper cursor-pointer">
          <Plus className="h-4 w-4" /> Kart ekle
        </button>
      </Section>

      <Section title="KVKK aydınlatma metni" description="Sayfanın altındaki yasal metin (bağlantısı: /kurumsal#kvkk). Değiştirmeden önce hukuki onay almanız önerilir.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Küçük etiket">
            <input className={inputCls} value={form.kvkkBadge || ''} onChange={(e) => set('kvkkBadge', e.target.value)} />
          </Field>
          <Field label="Başvuru e-postası">
            <input type="email" className={inputCls} value={form.kvkkEmail || ''} onChange={(e) => set('kvkkEmail', e.target.value)} />
          </Field>
        </div>
        <Field label="Başlık">
          <input className={inputCls} value={form.kvkkTitle || ''} onChange={(e) => set('kvkkTitle', e.target.value)} />
        </Field>
        <ol className="space-y-3">
          {kvkk.map((sec, i) => (
            <li key={i} className="flex gap-2 border border-line rounded-xs p-3">
              <span className="font-mono text-xs text-neutral-500 w-5 pt-2.5">{i + 1}</span>
              <div className="flex-1 space-y-2">
                <input
                  className={inputCls}
                  placeholder="Bölüm başlığı (örn. Haklarınız)"
                  aria-label={`KVKK bölüm ${i + 1} başlığı`}
                  value={sec.heading}
                  onChange={(e) => set('kvkkSections', kvkk.map((s, j) => (j === i ? { ...s, heading: e.target.value } : s)))}
                />
                <textarea
                  rows={4}
                  className={areaCls}
                  aria-label={`KVKK bölüm ${i + 1} metni`}
                  value={sec.text}
                  onChange={(e) => set('kvkkSections', kvkk.map((s, j) => (j === i ? { ...s, text: e.target.value } : s)))}
                />
              </div>
              <RowControls index={i} length={kvkk.length} onMove={(d) => set('kvkkSections', move(kvkk, i, d))} onRemove={() => set('kvkkSections', kvkk.filter((_, j) => j !== i))} />
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => set('kvkkSections', [...kvkk, { heading: '', text: '' }])} className="inline-flex items-center gap-1.5 h-10 px-3 border border-line-strong rounded-xs text-sm text-ink hover:bg-paper cursor-pointer">
          <Plus className="h-4 w-4" /> Bölüm ekle
        </button>
      </Section>

      {/* Sabit kaydet çubuğu */}
      <div className="fixed bottom-0 inset-x-0 lg:left-64 z-30 bg-white border-t border-line px-6 py-3 flex items-center justify-end gap-3">
        {dirty && <span className="text-sm text-signal">Kaydedilmemiş değişiklikler var</span>}
        <button
          type="submit"
          disabled={!dirty}
          className="h-11 px-6 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold rounded-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Kaydet
        </button>
      </div>
    </form>
  );
};

export default CorporateCMSTab;
