'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useCMSStore, DEFAULT_TICKER_STYLE, type TickerStyleConfig } from '../../../stores/useCMSStore';

interface TickerTabProps {
  tickerItems: string[];
  onAddTickerItem: (item: string) => void;
  onRemoveTickerItem: (index: number) => void;
  onShowSuccess: (msg: string) => void;
}

// Hazır renk çiftleri: marka sarısı varsayılan, diğerleri kampanya dönemleri için
const PRESETS: { name: string; backgroundColor: string; textColor: string }[] = [
  { name: 'Marka sarısı', backgroundColor: '#FECC00', textColor: '#161514' },
  { name: 'Siyah', backgroundColor: '#161514', textColor: '#FECC00' },
  { name: 'Kampanya kırmızısı', backgroundColor: '#B8431A', textColor: '#FFFFFF' },
  { name: 'Sepya krem', backgroundColor: '#F3ECDE', textColor: '#161514' },
];

/** WCAG kontrast oranı (önizlemede okunabilirlik uyarısı için) */
const contrastRatio = (a: string, b: string): number => {
  const lum = (hex: string) => {
    const m = hex.replace('#', '').match(/.{2}/g);
    if (!m || m.length < 3) return 0;
    const [r, g, bl] = m.slice(0, 3).map((x) => {
      const c = parseInt(x, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

export const TickerTab: React.FC<TickerTabProps> = ({ tickerItems, onAddTickerItem, onRemoveTickerItem, onShowSuccess }) => {
  const tickerStyle = useCMSStore((state) => state.tickerStyle);
  const updateTickerStyle = useCMSStore((state) => state.updateTickerStyle);
  const setTickerItems = useCMSStore((state) => state.setTickerItems);

  const [newText, setNewText] = useState('');
  const [style, setStyle] = useState<TickerStyleConfig>(tickerStyle);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => setStyle(tickerStyle), [tickerStyle]);

  const styleDirty =
    style.backgroundColor !== tickerStyle.backgroundColor ||
    style.textColor !== tickerStyle.textColor ||
    style.speedSeconds !== tickerStyle.speedSeconds;
  const ratio = contrastRatio(style.backgroundColor, style.textColor);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...tickerItems];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setTickerItems(next);
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const text = editText.trim();
    if (text && text !== tickerItems[editingIdx]) {
      const next = [...tickerItems];
      next[editingIdx] = text;
      setTickerItems(next);
      onShowSuccess('Duyuru güncellendi.');
    }
    setEditingIdx(null);
  };

  const previewItems = tickerItems.length > 0 ? tickerItems : ['Duyuru metni burada görünür'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Canlı önizleme */}
      <section className="bg-white border border-line rounded-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-ink">Önizleme</h2>
          <span className="text-xs text-neutral-500">Sitede menünün üstünde durur, sayfa kaydırılınca da görünür kalır.</span>
        </div>
        <div className="overflow-hidden" style={{ backgroundColor: style.backgroundColor, color: style.textColor }}>
          <div
            className="animate-marquee py-2 text-sm font-semibold"
            style={{ ['--marquee-duration' as string]: `${Math.max(10, style.speedSeconds)}s` }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0">
                {[...previewItems, ...previewItems].map((item, idx) => (
                  <span key={`${copy}-${idx}`} className="flex items-center gap-6 px-3 whitespace-nowrap">
                    <span>{item}</span>
                    <span className="opacity-60">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Metinler */}
        <section className="lg:col-span-3 bg-white border border-line rounded-xs p-5 space-y-4">
          <h2 className="text-base font-semibold text-ink">Duyuru metinleri</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newText.trim()) return;
              onAddTickerItem(newText.trim());
              setNewText('');
              onShowSuccess('Duyuru eklendi.');
            }}
            className="flex gap-2"
          >
            <label htmlFor="ticker-new" className="sr-only">Yeni duyuru</label>
            <input
              id="ticker-new"
              type="text"
              placeholder="Örn: Adetli alımda fabrika iskontosu"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              maxLength={120}
              className="flex-1 h-11 text-sm border border-line-strong px-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-ink hover:bg-neutral-800 text-white text-sm font-semibold px-4 h-11 rounded-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Ekle
            </button>
          </form>

          {tickerItems.length === 0 ? (
            <p className="text-sm text-neutral-600">Henüz duyuru yok. Duyuru yoksa bant sitede gösterilmez.</p>
          ) : (
            <ol className="divide-y divide-line border border-line rounded-xs">
              {tickerItems.map((item, idx) => (
                <li key={`${idx}-${item}`} className="flex items-center gap-2 px-3 py-2">
                  <span className="font-mono text-xs text-neutral-500 w-5">{idx + 1}</span>
                  {editingIdx === idx ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditingIdx(null);
                      }}
                      className="flex-1 h-9 text-sm border border-wood px-2 rounded-xs focus:outline-none"
                      aria-label="Duyuruyu düzenle"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIdx(idx);
                        setEditText(item);
                      }}
                      className="flex-1 text-left text-sm text-ink py-1.5 hover:text-wood cursor-text"
                      title="Düzenlemek için tıklayın"
                    >
                      {item}
                    </button>
                  )}
                  <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="h-9 w-9 flex items-center justify-center text-neutral-600 hover:text-ink disabled:opacity-30 cursor-pointer" aria-label="Yukarı taşı">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => move(idx, 1)} disabled={idx === tickerItems.length - 1} className="h-9 w-9 flex items-center justify-center text-neutral-600 hover:text-ink disabled:opacity-30 cursor-pointer" aria-label="Aşağı taşı">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(`"${item}" duyurusu silinsin mi?`)) return;
                      onRemoveTickerItem(idx);
                      onShowSuccess('Duyuru silindi.');
                    }}
                    className="h-9 w-9 flex items-center justify-center text-neutral-500 hover:text-signal cursor-pointer"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ol>
          )}
          <p className="text-xs text-neutral-500">Metne tıklayarak düzenleyebilir, oklarla sırasını değiştirebilirsiniz. Değişiklikler hemen kaydedilir.</p>
        </section>

        {/* Görünüm */}
        <section className="lg:col-span-2 bg-white border border-line rounded-xs p-5 space-y-5">
          <h2 className="text-base font-semibold text-ink">Renk ve hız</h2>

          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setStyle((s) => ({ ...s, backgroundColor: p.backgroundColor, textColor: p.textColor }))}
                className={`h-11 rounded-xs border text-sm font-semibold cursor-pointer ${
                  style.backgroundColor === p.backgroundColor && style.textColor === p.textColor ? 'ring-2 ring-offset-2 ring-ink' : 'border-line'
                }`}
                style={{ backgroundColor: p.backgroundColor, color: p.textColor }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm text-ink space-y-1.5">
              <span className="block font-medium">Zemin rengi</span>
              <span className="flex items-center gap-2">
                <input type="color" value={style.backgroundColor} onChange={(e) => setStyle((s) => ({ ...s, backgroundColor: e.target.value.toUpperCase() }))} className="h-10 w-12 border border-line-strong rounded-xs cursor-pointer" />
                <span className="font-mono text-xs">{style.backgroundColor}</span>
              </span>
            </label>
            <label className="text-sm text-ink space-y-1.5">
              <span className="block font-medium">Yazı rengi</span>
              <span className="flex items-center gap-2">
                <input type="color" value={style.textColor} onChange={(e) => setStyle((s) => ({ ...s, textColor: e.target.value.toUpperCase() }))} className="h-10 w-12 border border-line-strong rounded-xs cursor-pointer" />
                <span className="font-mono text-xs">{style.textColor}</span>
              </span>
            </label>
          </div>
          {ratio < 4.5 && (
            <p className="text-sm text-signal">Bu renklerle yazı zor okunur (kontrast {ratio.toFixed(1)}:1). En az 4.5:1 önerilir.</p>
          )}

          <label className="block text-sm text-ink space-y-1.5">
            <span className="flex justify-between font-medium">
              <span>Kayma hızı</span>
              <span className="text-neutral-600 font-normal">{style.speedSeconds <= 25 ? 'Hızlı' : style.speedSeconds <= 45 ? 'Orta' : 'Yavaş'}</span>
            </span>
            <input
              type="range"
              min={15}
              max={70}
              step={5}
              value={style.speedSeconds}
              onChange={(e) => setStyle((s) => ({ ...s, speedSeconds: Number(e.target.value) }))}
              className="w-full accent-ink"
              aria-label="Kayma hızı (saniye)"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!styleDirty}
              onClick={async () => {
                await updateTickerStyle(style);
                onShowSuccess('Duyuru bandı görünümü kaydedildi.');
              }}
              className="flex-1 h-11 bg-brand hover:bg-ink text-ink text-sm font-semibold rounded-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Görünümü kaydet
            </button>
            <button
              type="button"
              onClick={() => setStyle(DEFAULT_TICKER_STYLE)}
              className="h-11 px-3 border border-line-strong text-sm text-ink rounded-xs hover:bg-paper cursor-pointer"
            >
              Varsayılan
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TickerTab;
