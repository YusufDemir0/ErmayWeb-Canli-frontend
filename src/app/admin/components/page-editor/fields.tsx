'use client';

import React, { useId, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { uploadProductImage } from '../../../../lib/uploadHelper';
import {
  arr,
  isSafeHref,
  LIMITS,
  SAFE_IMAGE,
  str,
  type FieldDef,
  type PageButton,
  type PageItem,
  type RichBlock,
} from '../../../../lib/pageLayout';
import type { HeroSlide } from '../../../../stores/useCMSStore';

/**
 * İçerik formunun alan bileşenleri. Her metin alanı backend ile aynı karakter limitini taşır ve sayaç gösterir;
 * bağlantı ve görsel adresleri yazılırken doğrulanır.
 */

export const inputCls = (invalid = false) =>
  `w-full text-sm border ${invalid ? 'border-signal' : 'border-line-strong'} rounded-xs px-3 bg-white focus:outline-none focus:ring-2 focus:ring-wood/30 focus:border-wood`;

const Counter: React.FC<{ value: string; max: number }> = ({ value, max }) => {
  const near = value.length > max * 0.9;
  return (
    <span className={`text-xs tabular-nums-all ${near ? 'text-signal' : 'text-neutral-500'}`} aria-live="polite">
      {value.length}/{max}
    </span>
  );
};

interface LabelRowProps {
  htmlFor?: string;
  label: string;
  required?: boolean;
  counter?: React.ReactNode;
}
export const LabelRow: React.FC<LabelRowProps> = ({ htmlFor, label, required, counter }) => (
  <div className="flex items-center justify-between gap-2 mb-1">
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
      {label}
      {required && <span className="text-signal"> *</span>}
    </label>
    {counter}
  </div>
);

export const FieldError: React.FC<{ id?: string; message?: string | null }> = ({ id, message }) =>
  message ? (
    <p id={id} className="mt-1 text-xs text-signal">
      {message}
    </p>
  ) : null;

interface TextInputProps {
  label: string;
  value: string;
  max: number;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  help?: string;
  multiline?: boolean;
  rows?: number;
  error?: string | null;
}

export const TextInput: React.FC<TextInputProps> = ({ label, value, max, onChange, required, placeholder, help, multiline, rows = 3, error }) => {
  const id = useId();
  const err = error ?? (required && !value.trim() ? 'Bu alan boş bırakılamaz.' : null);
  const common = {
    id,
    value,
    maxLength: max,
    placeholder,
    'aria-invalid': !!err,
    'aria-describedby': err ? `${id}-err` : help ? `${id}-help` : undefined,
  };
  return (
    <div>
      <LabelRow htmlFor={id} label={label} required={required} counter={<Counter value={value} max={max} />} />
      {multiline ? (
        <textarea {...common} rows={rows} onChange={(e) => onChange(e.target.value)} className={`${inputCls(!!err)} py-2 leading-relaxed resize-y`} />
      ) : (
        <input
          {...common}
          type="text"
          onChange={(e) => onChange(e.target.value.replace(/[\r\n]/g, ' '))}
          className={`${inputCls(!!err)} h-10`}
        />
      )}
      {help && !err && (
        <p id={`${id}-help`} className="mt-1 text-xs text-neutral-500">
          {help}
        </p>
      )}
      <FieldError id={`${id}-err`} message={err} />
    </div>
  );
};

export const hrefError = (href: string): string | null =>
  !href.trim() ? 'Bağlantı boş bırakılamaz.' : isSafeHref(href) ? null : 'Bağlantı /sayfa, #bolum, https://, tel: veya mailto: ile başlamalı.';

export const ImageInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; help?: string }> = ({ label, value, onChange, help }) => {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const err = value && !SAFE_IMAGE.test(value) ? 'Görsel adresi /uploads/... ya da https:// ile başlamalı.' : uploadError;
  return (
    <div>
      <LabelRow htmlFor={id} label={label} />
      <div className="flex gap-3 items-start">
        <div className="h-16 w-24 shrink-0 rounded-xs border border-line bg-paper overflow-hidden flex items-center justify-center">
          {value && !err ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-neutral-400" />}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <input
            id={id}
            type="text"
            value={value}
            maxLength={500}
            placeholder="/uploads/... veya https://..."
            onChange={(e) => onChange(e.target.value.trim())}
            className={`${inputCls(!!err)} h-9 font-mono text-xs`}
          />
          <div className="flex gap-2">
            <label className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold border border-line-strong rounded-xs hover:bg-paper cursor-pointer">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              {uploading ? 'Yükleniyor' : 'Bilgisayardan yükle'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    setUploadError('Görsel en fazla 5 MB olabilir.');
                    return;
                  }
                  setUploading(true);
                  setUploadError(null);
                  try {
                    onChange(await uploadProductImage(file));
                  } catch (ex) {
                    setUploadError(ex instanceof Error ? ex.message : 'Görsel yüklenemedi.');
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
            {value && (
              <button type="button" onClick={() => onChange('')} className="h-8 px-3 text-xs text-neutral-600 hover:text-signal cursor-pointer">
                Kaldır
              </button>
            )}
          </div>
        </div>
      </div>
      {help && <p className="mt-1 text-xs text-neutral-500">{help}</p>}
      <FieldError message={err} />
    </div>
  );
};

/** Liste satırı için sıralama/silme düğmeleri */
export const RowTools: React.FC<{ index: number; count: number; onMove: (dir: -1 | 1) => void; onRemove: () => void; removeLabel: string }> = ({
  index,
  count,
  onMove,
  onRemove,
  removeLabel,
}) => (
  <div className="flex items-center gap-0.5 shrink-0">
    <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="h-8 w-8 flex items-center justify-center text-neutral-600 hover:text-ink disabled:opacity-30 cursor-pointer" aria-label="Yukarı taşı">
      <ArrowUp className="h-4 w-4" />
    </button>
    <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="h-8 w-8 flex items-center justify-center text-neutral-600 hover:text-ink disabled:opacity-30 cursor-pointer" aria-label="Aşağı taşı">
      <ArrowDown className="h-4 w-4" />
    </button>
    <button type="button" onClick={onRemove} className="h-8 w-8 flex items-center justify-center text-neutral-500 hover:text-signal cursor-pointer" aria-label={removeLabel}>
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
);

export const move = <T,>(list: T[], index: number, dir: -1 | 1): T[] => {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const AddButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode }> = ({ onClick, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium border border-dashed border-line-strong rounded-xs text-ink hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
  >
    <Plus className="h-4 w-4" />
    {children}
  </button>
);

// ── Liste alanları ───────────────────────────────────────────────────────────

const ButtonsField: React.FC<{ value: PageButton[]; max: number; onChange: (v: PageButton[]) => void }> = ({ value, max, onChange }) => (
  <div className="space-y-3">
    {value.map((b, i) => (
      <div key={i} className="border border-line rounded-xs p-3 space-y-2 bg-canvas">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-600">Buton {i + 1}</span>
          <RowTools index={i} count={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} removeLabel="Butonu sil" />
        </div>
        <TextInput label="Yazı" value={b.label} max={LIMITS.buttonLabel} required onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
        <TextInput
          label="Bağlantı"
          value={b.href}
          max={LIMITS.href}
          placeholder="/katalog"
          error={hrefError(b.href)}
          onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, href: v.trim() } : x)))}
        />
        <div className="flex gap-2" role="radiogroup" aria-label="Buton görünümü">
          {(['primary', 'secondary'] as const).map((variant) => (
            <button
              key={variant}
              type="button"
              role="radio"
              aria-checked={b.variant === variant}
              onClick={() => onChange(value.map((x, j) => (j === i ? { ...x, variant } : x)))}
              className={`h-8 px-3 text-xs font-semibold rounded-xs border cursor-pointer ${b.variant === variant ? 'border-ink bg-ink text-white' : 'border-line-strong text-ink hover:bg-paper'}`}
            >
              {variant === 'primary' ? 'Dolu (sarı)' : 'Çerçeveli'}
            </button>
          ))}
        </div>
      </div>
    ))}
    <AddButton disabled={value.length >= max} onClick={() => onChange([...value, { label: '', href: '/', variant: value.length === 0 ? 'primary' : 'secondary' }])}>
      Buton ekle {value.length >= max && `(en fazla ${max})`}
    </AddButton>
  </div>
);

const ItemsField: React.FC<{ value: PageItem[]; def: Extract<FieldDef, { kind: 'items' }>; onChange: (v: PageItem[]) => void }> = ({ value, def, onChange }) => (
  <div className="space-y-3">
    {value.map((item, i) => (
      <div key={i} className="border border-line rounded-xs p-3 space-y-2 bg-canvas">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-600">{i + 1}. madde</span>
          <RowTools index={i} count={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} removeLabel="Maddeyi sil" />
        </div>
        <TextInput label="Başlık" value={item.title} max={def.titleMax} required onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
        <TextInput label="Metin" value={item.text} max={def.textMax} multiline rows={2} onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, text: v } : x)))} />
      </div>
    ))}
    <AddButton disabled={value.length >= def.maxItems} onClick={() => onChange([...value, { title: '', text: '' }])}>
      Madde ekle
    </AddButton>
  </div>
);

const BulletsField: React.FC<{ value: string[]; def: Extract<FieldDef, { kind: 'bullets' }>; onChange: (v: string[]) => void }> = ({ value, def, onChange }) => (
  <div className="space-y-2">
    {value.map((b, i) => (
      <div key={i} className="flex items-start gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={b}
            maxLength={def.itemMax}
            aria-label={`${i + 1}. madde`}
            onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
            className={`${inputCls(!b.trim())} h-9`}
          />
        </div>
        <RowTools index={i} count={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} removeLabel="Maddeyi sil" />
      </div>
    ))}
    <AddButton disabled={value.length >= def.maxItems} onClick={() => onChange([...value, ''])}>
      Madde ekle
    </AddButton>
  </div>
);

const BLOCK_LABEL: Record<RichBlock['type'], string> = {
  heading: 'Ara başlık',
  paragraph: 'Paragraf',
  list: 'Liste',
  quote: 'Alıntı',
};

/** Serbest metin: sabit paragraf sayısı yok; admin istediği kadar ara başlık, paragraf, liste ekler. */
const BlocksField: React.FC<{ value: RichBlock[]; max: number; onChange: (v: RichBlock[]) => void }> = ({ value, max, onChange }) => {
  const set = (i: number, b: RichBlock) => onChange(value.map((x, j) => (j === i ? b : x)));
  const convert = (b: RichBlock, type: RichBlock['type']): RichBlock => {
    const text = b.type === 'list' ? b.items.join('\n') : b.text;
    if (type === 'list') return { type, items: text.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 30) };
    return { type, text: type === 'heading' ? text.replace(/\n+/g, ' ').slice(0, LIMITS.heading) : text } as RichBlock;
  };
  return (
    <div className="space-y-3">
      {value.map((b, i) => {
        const limit = b.type === 'heading' ? LIMITS.heading : b.type === 'quote' ? LIMITS.quote : LIMITS.paragraph;
        return (
          <div key={i} className="border border-line rounded-xs bg-canvas">
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-line">
              <select
                value={b.type}
                onChange={(e) => set(i, convert(b, e.target.value as RichBlock['type']))}
                className="h-8 text-xs font-semibold bg-transparent border-0 focus:ring-2 focus:ring-wood/30 rounded-xs cursor-pointer"
                aria-label="Blok türü"
              >
                {(Object.keys(BLOCK_LABEL) as RichBlock['type'][]).map((t) => (
                  <option key={t} value={t}>
                    {BLOCK_LABEL[t]}
                  </option>
                ))}
              </select>
              <RowTools index={i} count={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} removeLabel="Bloğu sil" />
            </div>
            <div className="p-3">
              {b.type === 'list' ? (
                <>
                  <textarea
                    value={b.items.join('\n')}
                    rows={Math.max(3, b.items.length + 1)}
                    onChange={(e) => set(i, { type: 'list', items: e.target.value.split('\n').slice(0, 30).map((s) => s.slice(0, LIMITS.listItem)) })}
                    onBlur={() => set(i, { type: 'list', items: b.items.map((s) => s.trim()).filter(Boolean) })}
                    className={`${inputCls(b.items.filter((s) => s.trim()).length === 0)} py-2 resize-y`}
                    aria-label="Liste maddeleri"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Her satır bir madde (en fazla 30).</p>
                </>
              ) : b.type === 'heading' ? (
                <input
                  type="text"
                  value={b.text}
                  maxLength={limit}
                  onChange={(e) => set(i, { type: 'heading', text: e.target.value.replace(/[\r\n]/g, ' ') })}
                  className={`${inputCls(!b.text.trim())} h-9 font-semibold`}
                  aria-label="Ara başlık"
                />
              ) : (
                <>
                  <textarea
                    value={b.text}
                    maxLength={limit}
                    rows={b.type === 'paragraph' ? 4 : 2}
                    onChange={(e) => set(i, { type: b.type, text: e.target.value })}
                    className={`${inputCls(!b.text.trim())} py-2 leading-relaxed resize-y`}
                    aria-label={BLOCK_LABEL[b.type]}
                  />
                  <div className="text-right">
                    <Counter value={b.text} max={limit} />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2">
        <AddButton disabled={value.length >= max} onClick={() => onChange([...value, { type: 'heading', text: '' }])}>
          Ara başlık
        </AddButton>
        <AddButton disabled={value.length >= max} onClick={() => onChange([...value, { type: 'paragraph', text: '' }])}>
          Paragraf
        </AddButton>
        <AddButton disabled={value.length >= max} onClick={() => onChange([...value, { type: 'list', items: [] }])}>
          Liste
        </AddButton>
      </div>
    </div>
  );
};

const newSlideId = () => `slide-${Math.random().toString(36).slice(2, 8)}`;

const SlidesField: React.FC<{ value: HeroSlide[]; max: number; onChange: (v: HeroSlide[]) => void }> = ({ value, max, onChange }) => (
  <div className="space-y-4">
    {value.length === 0 && <p className="text-sm text-neutral-600">Slayt yoksa kapak bölümü sitede görünmez.</p>}
    {value.map((s, i) => {
      const upd = (patch: Partial<HeroSlide>) => onChange(value.map((x, j) => (j === i ? { ...x, ...patch } : x)));
      return (
        <div key={s.id || i} className="border border-line rounded-xs p-3 space-y-3 bg-canvas">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">{i + 1}. slayt</span>
            <RowTools index={i} count={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} removeLabel="Slaytı sil" />
          </div>
          <ImageInput label="Görsel" value={s.image || ''} onChange={(v) => upd({ image: v })} help="Yatay, en az 1600 px genişlikte bir fotoğraf önerilir." />
          <TextInput label="Üst etiket" value={s.badge || ''} max={LIMITS.slideBadge} onChange={(v) => upd({ badge: v })} />
          <TextInput label="Başlık" value={s.title || ''} max={LIMITS.slideTitle} required onChange={(v) => upd({ title: v })} />
          <TextInput label="Alt metin" value={s.subtitle || ''} max={LIMITS.slideSubtitle} multiline rows={2} onChange={(v) => upd({ subtitle: v })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput label="Buton yazısı" value={s.buttonText || ''} max={LIMITS.buttonLabel} onChange={(v) => upd({ buttonText: v })} />
            <TextInput
              label="Buton bağlantısı"
              value={s.buttonLink || ''}
              max={LIMITS.href}
              placeholder="/kategori/..."
              error={s.buttonLink ? (isSafeHref(s.buttonLink) ? null : hrefError(s.buttonLink)) : null}
              onChange={(v) => upd({ buttonLink: v.trim() })}
            />
          </div>
        </div>
      );
    })}
    <AddButton disabled={value.length >= max} onClick={() => onChange([...value, { id: newSlideId(), title: '', subtitle: '', badge: '', image: '', buttonText: '', buttonLink: '' }])}>
      Slayt ekle {value.length >= max && `(en fazla ${max})`}
    </AddButton>
  </div>
);

// ── Alan türüne göre bileşen ─────────────────────────────────────────────────

export const FieldRenderer: React.FC<{ def: FieldDef; value: unknown; onChange: (v: unknown) => void }> = ({ def, value, onChange }) => {
  switch (def.kind) {
    case 'line':
      return <TextInput label={def.label} value={str(value)} max={def.max} required={def.required} placeholder={def.placeholder} help={def.help} onChange={onChange} />;
    case 'text':
      return <TextInput label={def.label} value={str(value)} max={def.max} required={def.required} help={def.help} multiline rows={def.rows} onChange={onChange} />;
    case 'image':
      return <ImageInput label={def.label} value={str(value)} onChange={onChange} help={def.help} />;
    case 'select':
      return (
        <div>
          <LabelRow label={def.label} />
          <div className="flex gap-2" role="radiogroup" aria-label={def.label}>
            {def.options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                onClick={() => onChange(o.value)}
                className={`h-9 px-3 text-sm rounded-xs border cursor-pointer ${value === o.value ? 'border-ink bg-ink text-white' : 'border-line-strong text-ink hover:bg-paper'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      );
    case 'number': {
      const n = typeof value === 'number' ? value : def.min;
      return (
        <div>
          <LabelRow label={def.label} counter={<span className="text-sm font-semibold tabular-nums-all">{n}</span>} />
          <input type="range" min={def.min} max={def.max} value={n} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-ink" aria-label={def.label} />
        </div>
      );
    }
    case 'toggle':
      return (
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-ink" />
          <span>
            <span className="text-sm font-medium text-ink block">{def.label}</span>
            {def.help && <span className="text-xs text-neutral-500">{def.help}</span>}
          </span>
        </label>
      );
    case 'buttons':
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink mb-1">{def.label}</legend>
          <ButtonsField value={arr<PageButton>(value)} max={def.maxItems} onChange={onChange} />
        </fieldset>
      );
    case 'items':
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink mb-1">{def.label}</legend>
          <ItemsField value={arr<PageItem>(value)} def={def} onChange={onChange} />
        </fieldset>
      );
    case 'bullets':
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink mb-1">{def.label}</legend>
          <BulletsField value={arr<string>(value)} def={def} onChange={onChange} />
        </fieldset>
      );
    case 'blocks':
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink mb-1">{def.label}</legend>
          <BlocksField value={arr<RichBlock>(value)} max={def.maxItems} onChange={onChange} />
        </fieldset>
      );
    case 'slides':
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink mb-1">{def.label}</legend>
          <SlidesField value={arr<HeroSlide>(value)} max={def.maxItems} onChange={onChange} />
        </fieldset>
      );
    default:
      return null;
  }
};
