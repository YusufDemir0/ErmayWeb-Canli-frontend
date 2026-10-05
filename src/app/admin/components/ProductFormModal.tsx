'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowDown, ArrowUp, Check, ExternalLink, ImagePlus, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import type { Product, Category } from '../../../types';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { useModalDismiss } from '../../../lib/useModalDismiss';
import { LUXURY_SWATCHES } from '../../../components/ProductDetailClient';

export interface ErpCatalogItem {
  erpId: string;
  erpCode: string;
  erpName: string;
  erpSalePrice: number;
  erpStock: number;
  erpType?: string;
  erpImage?: string | null;
}

/** Sunucuya giden ürün verisi (backend CreateProductSchema ile aynı alanlar) */
export interface ProductPayload {
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  leadTimeDays: number | null;
  vatRate: number;
  erpItemId?: string;
  erpItemCode?: string;
  colors: string[];
  dimensions: string;
  widthCm: number | null;
  depthCm: number | null;
  heightCm: number | null;
  drawerCount: number | null;
  material: string;
  features: string[];
  description: string;
  badge: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  erpCatalog: ErpCatalogItem[];
  editingProduct?: Product | null;
  /** Hata durumunda fırlatmalı; mesaj formda gösterilir ve form açık kalır */
  onSave: (productData: ProductPayload) => Promise<void>;
}

// Backend limitleri (backend/src/validations/index.ts ProductFields)
const L = { name: 150, badge: 40, description: 5000, material: 200, feature: 160, features: 20, color: 60, colors: 40, images: 12 };

// Öneri listeleri: seçmek zorunlu değil, yazarken tamamlama olarak çıkar
const MATERIAL_SUGGESTIONS = [
  'E1 sınıfı melamin',
  'E1 melamin gövde, elektrostatik boyalı DKP çelik ayak',
  'Masif gürgen iskelet',
  'Ceviz kaplama',
  'File sırt, HR sünger oturak',
];
const FEATURE_SUGGESTIONS = [
  '2 mm PVC kenar bandı',
  'Frenli teleskopik çekmece rayı',
  'Kilitli keson',
  'Kablo kanalı ve priz yuvası',
  'Zemin dengeleme ayakları',
];

const VAT_OPTIONS = [
  { label: '%20', value: '0.2' },
  { label: '%10', value: '0.1' },
  { label: '%1', value: '0.01' },
  { label: '%0', value: '0' },
];

const DRAFT_KEY = 'ermay_admin_product_form_draft_v2';

interface FormState {
  name: string;
  category: string;
  erpItemId: string;
  erpItemCode: string;
  images: string[];
  price: string;
  originalPrice: string;
  vatRate: string;
  inStock: boolean;
  leadTimeDays: string;
  width: string;
  depth: string;
  height: string;
  drawerCount: string;
  material: string;
  features: string[];
  colors: string[];
  description: string;
  badge: string;
}

const categoryKey = (c: Product['category'] | undefined): string =>
  typeof c === 'object' && c !== null ? c.slug || c.id : String(c || '');

const numStr = (v: unknown): string => (v === null || v === undefined || v === '' ? '' : String(v));

function fromProduct(p: Product | null | undefined, categories: Category[]): FormState {
  if (!p) {
    return {
      name: '',
      category: categories[0]?.slug || categories[0]?.id || '',
      erpItemId: '',
      erpItemCode: '',
      images: [],
      price: '',
      originalPrice: '',
      vatRate: '0.2',
      inStock: true,
      leadTimeDays: '',
      width: '',
      depth: '',
      height: '',
      drawerCount: '',
      material: '',
      features: [],
      colors: [],
      description: '',
      badge: '',
    };
  }
  const imgs = Array.isArray(p.images) ? (p.images as string[]).filter(Boolean) : [];
  const images = imgs.length ? imgs : [p.image, p.image2, p.image3].filter((x): x is string => Boolean(x));
  return {
    name: p.name || '',
    category: categoryKey(p.category),
    erpItemId: p.erpItemId ? String(p.erpItemId) : '',
    erpItemCode: p.erpItemCode || '',
    images,
    price: numStr(p.price),
    originalPrice: numStr(p.originalPrice),
    vatRate: p.vatRate !== undefined && p.vatRate !== null ? String(Number(p.vatRate)) : '0.2',
    inStock: p.inStock !== false,
    leadTimeDays: numStr(p.leadTimeDays),
    width: numStr(p.widthCm),
    depth: numStr(p.depthCm),
    height: numStr(p.heightCm),
    drawerCount: numStr(p.drawerCount),
    material: p.material || '',
    features: Array.isArray(p.features) ? p.features : [],
    // Renkler sunucuda ad listesi olarak tutulur
    colors: Array.isArray(p.colors) ? p.colors.map((c) => (typeof c === 'string' ? c : c?.name || '')).filter(Boolean) : [],
    description: p.description || '',
    badge: p.badge || '',
  };
}

type Errors = Partial<Record<keyof FormState | 'form', string>>;

const PRICE_RE = /^\d{1,8}([.,]\d{1,2})?$/;
const toNumber = (s: string) => Number(s.replace(',', '.'));

function intField(v: string, min: number, max: number, label: string): string | undefined {
  if (!v.trim()) return undefined;
  if (!/^\d+$/.test(v.trim())) return `${label} tam sayı olmalıdır.`;
  const n = Number(v);
  if (n < min || n > max) return `${label} ${min} ile ${max} arasında olmalıdır.`;
  return undefined;
}

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Ürün adı en az 2 karakter olmalıdır.';
  if (!f.category) e.category = 'Kategori seçin.';
  if (!f.erpItemId) e.erpItemId = 'ERP’deki karşılığını seçin. Eşleşmeyen ürün kaydedilemez.';
  if (!PRICE_RE.test(f.price.trim()) || toNumber(f.price) <= 0) e.price = 'Geçerli bir fiyat yazın (ör. 24500 veya 24500,90).';
  if (f.originalPrice.trim()) {
    if (!PRICE_RE.test(f.originalPrice.trim())) e.originalPrice = 'Geçerli bir fiyat yazın.';
    else if (!e.price && toNumber(f.originalPrice) <= toNumber(f.price)) e.originalPrice = 'Eski fiyat, satış fiyatından büyük olmalıdır.';
  }
  e.leadTimeDays = intField(f.leadTimeDays, 0, 365, 'Teslim süresi');
  e.width = intField(f.width, 1, 2000, 'Genişlik');
  e.depth = intField(f.depth, 1, 2000, 'Derinlik');
  e.height = intField(f.height, 1, 500, 'Yükseklik');
  e.drawerCount = intField(f.drawerCount, 0, 50, 'Çekmece sayısı');
  if (f.features.some((x) => !x.trim())) e.features = 'Boş özellik maddesi var; silin ya da doldurun.';
  if (f.colors.some((x) => !x.trim())) e.colors = 'Boş renk satırı var; silin ya da doldurun.';
  for (const k of Object.keys(e) as (keyof Errors)[]) if (!e[k]) delete e[k];
  return e;
}

function toPayload(f: FormState): ProductPayload {
  const int = (s: string) => (s.trim() ? Number(s) : null);
  const dims = [
    f.width && `G: ${f.width} cm`,
    f.depth && `D: ${f.depth} cm`,
    f.height && `Y: ${f.height} cm`,
  ].filter(Boolean);
  return {
    name: f.name.trim(),
    category: f.category,
    price: toNumber(f.price),
    originalPrice: f.originalPrice.trim() ? toNumber(f.originalPrice) : null,
    image: f.images[0] || '',
    images: f.images,
    leadTimeDays: int(f.leadTimeDays),
    vatRate: Number(f.vatRate),
    erpItemId: f.erpItemId || undefined,
    erpItemCode: f.erpItemCode || undefined,
    colors: f.colors.map((c) => c.trim()).filter(Boolean),
    dimensions: dims.join(' × '),
    widthCm: int(f.width),
    depthCm: int(f.depth),
    heightCm: int(f.height),
    drawerCount: int(f.drawerCount),
    material: f.material.trim(),
    features: f.features.map((x) => x.trim()).filter(Boolean),
    description: f.description.trim(),
    badge: f.badge.trim(),
  };
}

// Sunucu alan adları -> form alanları
const SERVER_FIELD: Record<string, keyof FormState> = {
  name: 'name',
  price: 'price',
  originalPrice: 'originalPrice',
  leadTimeDays: 'leadTimeDays',
  widthCm: 'width',
  depthCm: 'depth',
  heightCm: 'height',
  drawerCount: 'drawerCount',
  material: 'material',
  description: 'description',
  badge: 'badge',
  erpItemId: 'erpItemId',
  category: 'category',
};

// ── Küçük bileşenler ─────────────────────────────────────────────────────────

const inputCls = (invalid?: boolean) =>
  `w-full h-10 text-sm px-3 border ${invalid ? 'border-signal' : 'border-line-strong'} rounded-xs bg-white focus:outline-none focus:ring-2 focus:ring-wood/30 focus:border-wood`;

const Field: React.FC<{ id: string; label: string; required?: boolean; error?: string; hint?: string; count?: [number, number]; children: React.ReactNode }> = ({
  id,
  label,
  required,
  error,
  hint,
  count,
  children,
}) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-signal"> *</span>}
      </label>
      {count && (
        <span className={`text-xs tabular-nums-all ${count[0] > count[1] * 0.9 ? 'text-signal' : 'text-neutral-500'}`}>
          {count[0]}/{count[1]}
        </span>
      )}
    </div>
    {children}
    {error ? (
      <p id={`${id}-err`} className="mt-1 text-xs text-signal">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>
    )}
  </div>
);

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <section className="space-y-4 py-5 border-b border-line last:border-b-0">
    <div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
    </div>
    {children}
  </section>
);

function moveItem<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

const StringList: React.FC<{
  id: string;
  values: string[];
  max: number;
  itemMax: number;
  addLabel: string;
  suggestions: string[];
  placeholder: string;
  onChange: (v: string[]) => void;
}> = ({ id, values, max, itemMax, addLabel, suggestions, placeholder, onChange }) => (
  <div className="space-y-2">
    <datalist id={`${id}-suggest`}>
      {suggestions.map((s) => (
        <option key={s} value={s} />
      ))}
    </datalist>
    {values.map((v, i) => (
      <div key={i} className="flex items-center gap-1">
        <input
          type="text"
          value={v}
          maxLength={itemMax}
          list={`${id}-suggest`}
          placeholder={placeholder}
          aria-label={`${i + 1}. satır`}
          onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value.replace(/[\r\n]/g, ' ') : x)))}
          className={`${inputCls(!v.trim())} flex-1`}
        />
        <button type="button" onClick={() => onChange(moveItem(values, i, -1))} disabled={i === 0} className="h-9 w-8 flex items-center justify-center text-neutral-500 hover:text-ink disabled:opacity-25 cursor-pointer" aria-label="Yukarı taşı">
          <ArrowUp className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onChange(moveItem(values, i, 1))} disabled={i === values.length - 1} className="h-9 w-8 flex items-center justify-center text-neutral-500 hover:text-ink disabled:opacity-25 cursor-pointer" aria-label="Aşağı taşı">
          <ArrowDown className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="h-9 w-8 flex items-center justify-center text-neutral-500 hover:text-signal cursor-pointer" aria-label="Sil">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...values, ''])}
      disabled={values.length >= max}
      className="inline-flex items-center gap-1.5 h-9 px-3 text-sm border border-dashed border-line-strong rounded-xs hover:bg-paper disabled:opacity-40 cursor-pointer"
    >
      <Plus className="h-4 w-4" /> {addLabel} {values.length >= max && `(en fazla ${max})`}
    </button>
  </div>
);

// ── Form ─────────────────────────────────────────────────────────────────────

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, categories, erpCatalog, editingProduct, onSave }) => {
  const [form, setForm] = useState<FormState>(() => fromProduct(editingProduct, categories));
  const [initial, setInitial] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [erpSearch, setErpSearch] = useState('');
  const [showErpList, setShowErpList] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const f = fromProduct(editingProduct, categories);
    setForm(f);
    setInitial(JSON.stringify(f));
    setTouched(false);
    setServerErrors({});
    setErpSearch('');
    setShowErpList(false);
    if (!editingProduct) {
      try {
        setDraftAvailable(Boolean(localStorage.getItem(DRAFT_KEY)));
      } catch {
        setDraftAvailable(false);
      }
    }
  }, [isOpen, editingProduct, categories]);

  // Yeni ürün taslağı tarayıcıda saklanır (yalnız ürün bilgisi, kişisel veri yok)
  useEffect(() => {
    if (!isOpen || editingProduct || !form.name.trim()) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // depolama kapalıysa taslak tutulmaz
    }
  }, [form, isOpen, editingProduct]);

  const dirty = JSON.stringify(form) !== initial;
  const requestClose = useCallback(() => {
    if (dirty && !window.confirm('Kaydedilmemiş değişiklikler kaybolacak. Kapatılsın mı?')) return;
    onClose();
  }, [dirty, onClose]);
  useModalDismiss(isOpen, requestClose);

  const errors = useMemo(() => ({ ...validate(form), ...serverErrors }), [form, serverErrors]);
  const shown = (k: keyof Errors) => (touched || serverErrors[k] ? errors[k] : undefined);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (serverErrors[k]) setServerErrors((s) => ({ ...s, [k]: undefined, form: undefined }));
  };

  const filteredErp = useMemo(() => {
    const q = erpSearch.trim().toLocaleLowerCase('tr-TR');
    const list = q ? erpCatalog.filter((i) => i.erpName.toLocaleLowerCase('tr-TR').includes(q) || i.erpCode.toLocaleLowerCase('tr-TR').includes(q)) : erpCatalog;
    return list.slice(0, 30);
  }, [erpCatalog, erpSearch]);

  if (!isOpen) return null;

  const numericPrice = PRICE_RE.test(form.price.trim()) ? toNumber(form.price) : 0;
  const vat = Number(form.vatRate);
  const net = numericPrice > 0 ? numericPrice / (1 + vat) : 0;
  const errorCount = Object.keys(validate(form)).length;

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setServerErrors((s) => ({ ...s, images: undefined }));
    try {
      const room = L.images - form.images.length;
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, room)) {
        if (file.size > 5 * 1024 * 1024) throw new Error(`"${file.name}" 5 MB'tan büyük.`);
        urls.push(await uploadProductImage(file));
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (e) {
      setServerErrors((s) => ({ ...s, images: e instanceof Error ? e.message : 'Görsel yüklenemedi.' }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validate(form)).length > 0) return;
    setIsSubmitting(true);
    setServerErrors({});
    try {
      await onSave(toPayload(form));
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // yok say
      }
      onClose();
    } catch (err) {
      const fieldErrors = (err as { fieldErrors?: { field: string; message: string }[] })?.fieldErrors || [];
      const mapped: Errors = {};
      for (const fe of fieldErrors) {
        const k = SERVER_FIELD[fe.field.split('.')[0]];
        if (k && !mapped[k]) mapped[k] = fe.message;
      }
      mapped.form = err instanceof Error ? err.message : 'Ürün kaydedilemedi.';
      setServerErrors(mapped);
    } finally {
      setIsSubmitting(false);
    }
  };

  const productUrl = editingProduct ? `/urun/${editingProduct.slug || editingProduct.id}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4 bg-ink/60 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
      <div className="relative w-full max-w-3xl bg-white sm:rounded-xs shadow-2xl flex flex-col sm:max-h-[94vh] overflow-hidden">
        <header className="px-5 py-4 border-b border-line flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id="product-form-title" className="text-lg font-semibold text-ink truncate">
              {editingProduct ? editingProduct.name : 'Yeni ürün'}
            </h2>
            <p className="text-xs text-neutral-500">Yıldızlı alanlar zorunludur. Diğerleri boş bırakılırsa sitede gösterilmez.</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {productUrl && (
              <a href={productUrl} target="_blank" rel="noopener noreferrer" className="h-10 px-3 inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-ink">
                <ExternalLink className="h-4 w-4" /> Sitede gör
              </a>
            )}
            <button type="button" onClick={requestClose} className="h-10 w-10 flex items-center justify-center text-neutral-500 hover:text-ink cursor-pointer" aria-label="Kapat">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-5">
          {draftAvailable && !editingProduct && !dirty && (
            <div className="mt-4 p-3 bg-paper border border-line rounded-xs flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>Kaydedilmemiş bir ürün taslağı var.</span>
              <span className="flex gap-2">
                <button
                  type="button"
                  className="h-8 px-3 bg-ink text-white text-xs font-semibold rounded-xs cursor-pointer"
                  onClick={() => {
                    try {
                      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') as Partial<FormState> | null;
                      if (saved) setForm((f) => ({ ...f, ...saved }));
                    } catch {
                      // bozuk taslak yok sayılır
                    }
                    setDraftAvailable(false);
                  }}
                >
                  Taslağı yükle
                </button>
                <button
                  type="button"
                  className="h-8 px-3 text-xs text-neutral-600 hover:text-ink cursor-pointer"
                  onClick={() => {
                    try {
                      localStorage.removeItem(DRAFT_KEY);
                    } catch {
                      // yok say
                    }
                    setDraftAvailable(false);
                  }}
                >
                  Sil
                </button>
              </span>
            </div>
          )}

          <Section title="Temel bilgiler">
            <Field id="pf-name" label="Ürün adı" required error={shown('name')} count={[form.name.length, L.name]}>
              <input id="pf-name" type="text" value={form.name} maxLength={L.name} onChange={(e) => set('name', e.target.value.replace(/[\r\n]/g, ' '))} className={inputCls(!!shown('name'))} aria-invalid={!!shown('name')} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="pf-category" label="Kategori" required error={shown('category')}>
                <select id="pf-category" value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls(!!shown('category'))}>
                  <option value="" disabled>
                    Kategori seçin
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug || c.id}>
                      {c.parentId ? '— ' : ''}
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="pf-badge" label="Rozet" hint="Kartın köşesinde kısa etiket (ör. Yeni). Boşsa gösterilmez." count={[form.badge.length, L.badge]}>
                <input id="pf-badge" type="text" value={form.badge} maxLength={L.badge} onChange={(e) => set('badge', e.target.value.replace(/[\r\n]/g, ' '))} className={inputCls()} />
              </Field>
            </div>

            <Field id="pf-erp" label="ERP eşleşmesi" required error={shown('erpItemId')} hint="Fiyat ve stok eşitlemesi bu kayıt üzerinden yapılır.">
              {form.erpItemId ? (
                <div className="flex items-center justify-between gap-2 h-10 px-3 border border-ok/40 bg-ok-soft rounded-xs text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <Check className="h-4 w-4 text-ok shrink-0" />
                    <span className="font-mono text-xs truncate">{form.erpItemCode || form.erpItemId}</span>
                  </span>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, erpItemId: '', erpItemCode: '' }))} className="text-xs text-neutral-600 hover:text-signal cursor-pointer">
                    Değiştir
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" aria-hidden="true" />
                  <input
                    id="pf-erp"
                    type="search"
                    value={erpSearch}
                    maxLength={100}
                    placeholder={erpCatalog.length ? 'ERP ürün kodu veya adıyla arayın' : 'ERP kataloğu yükleniyor…'}
                    onChange={(e) => {
                      setErpSearch(e.target.value);
                      setShowErpList(true);
                    }}
                    onFocus={() => setShowErpList(true)}
                    className={`${inputCls(!!shown('erpItemId'))} pl-9`}
                  />
                  {showErpList && filteredErp.length > 0 && (
                    <ul className="absolute z-10 left-0 right-0 mt-1 border border-line rounded-xs max-h-56 overflow-y-auto bg-white shadow-lg divide-y divide-line">
                      {filteredErp.map((item) => (
                        <li key={item.erpId}>
                          <button
                            type="button"
                            onClick={() => {
                              setForm((f) => ({
                                ...f,
                                erpItemId: String(item.erpId),
                                erpItemCode: item.erpCode,
                                name: f.name.trim() ? f.name : item.erpName.slice(0, L.name),
                                price: f.price.trim() ? f.price : item.erpSalePrice ? String(item.erpSalePrice) : '',
                                images: f.images.length || !item.erpImage ? f.images : [item.erpImage],
                              }));
                              setShowErpList(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-paper flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <span className="min-w-0">
                              <span className="font-mono text-xs text-neutral-600 mr-2">{item.erpCode}</span>
                              <span className="text-ink">{item.erpName}</span>
                            </span>
                            {item.erpSalePrice > 0 && (
                              <span className="font-mono text-xs text-neutral-500 shrink-0">{Number(item.erpSalePrice).toLocaleString('tr-TR')} TL</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Field>

            <Field id="pf-desc" label="Açıklama" count={[form.description.length, L.description]} hint="Ürün sayfasında gösterilir.">
              <textarea id="pf-desc" rows={4} value={form.description} maxLength={L.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls()} h-auto py-2 leading-relaxed resize-y`} />
            </Field>
          </Section>

          <Section title="Görseller" description={`İlk görsel kapak olarak kullanılır. En fazla ${L.images} görsel; PNG, JPEG veya WEBP, en fazla 5 MB.`}>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {form.images.map((src, i) => (
                <li key={`${src}-${i}`} className="relative aspect-[4/3] border border-line rounded-xs overflow-hidden bg-paper group">
                  <img src={src} alt={`${i + 1}. görsel`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1.5 left-1.5 bg-ink text-white text-xs px-1.5 py-0.5 rounded-xs">Kapak</span>}
                  <div className="absolute bottom-1 right-1 flex gap-1">
                    {i > 0 && (
                      <button type="button" onClick={() => set('images', moveItem(form.images, i, -1))} className="h-7 w-7 flex items-center justify-center bg-white/90 rounded-xs text-ink cursor-pointer" aria-label="Öne al">
                        <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                      </button>
                    )}
                    <button type="button" onClick={() => set('images', form.images.filter((_, j) => j !== i))} className="h-7 w-7 flex items-center justify-center bg-white/90 rounded-xs text-signal cursor-pointer" aria-label="Görseli kaldır">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
              {form.images.length < L.images && (
                <li>
                  <label className="aspect-[4/3] border-2 border-dashed border-line-strong hover:border-wood rounded-xs flex flex-col items-center justify-center gap-1 text-sm text-neutral-600 cursor-pointer">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                    {uploading ? 'Yükleniyor' : 'Görsel ekle'}
                    <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" disabled={uploading} onChange={(e) => uploadImages(e.target.files).finally(() => (e.target.value = ''))} />
                  </label>
                </li>
              )}
            </ul>
            {serverErrors.images && <p className="text-xs text-signal">{serverErrors.images}</p>}
            {form.images.length === 0 && <p className="text-xs text-neutral-500">Görseli olmayan ürün kaydedilebilir ama yayına alınamaz.</p>}
          </Section>

          <Section title="Fiyat ve teslimat">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field id="pf-price" label="Satış fiyatı (TL, KDV dahil)" required error={shown('price')}>
                <input id="pf-price" type="text" inputMode="decimal" value={form.price} maxLength={12} onChange={(e) => set('price', e.target.value.replace(/[^\d.,]/g, ''))} className={inputCls(!!shown('price'))} />
              </Field>
              <Field id="pf-old" label="Eski fiyat (üstü çizili)" error={shown('originalPrice')} hint="İndirim yoksa boş bırakın.">
                <input id="pf-old" type="text" inputMode="decimal" value={form.originalPrice} maxLength={12} onChange={(e) => set('originalPrice', e.target.value.replace(/[^\d.,]/g, ''))} className={inputCls(!!shown('originalPrice'))} />
              </Field>
              <Field id="pf-lead" label="Teslim süresi (gün)" error={shown('leadTimeDays')} hint="Boşsa stoktaki ürünler için 3–5 gün yazar.">
                <input id="pf-lead" type="text" inputMode="numeric" value={form.leadTimeDays} maxLength={3} onChange={(e) => set('leadTimeDays', e.target.value.replace(/\D/g, ''))} className={inputCls(!!shown('leadTimeDays'))} />
              </Field>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <fieldset>
                <legend className="text-sm font-medium text-ink mb-1">KDV oranı</legend>
                <div className="flex gap-1" role="radiogroup">
                  {VAT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={form.vatRate === o.value}
                      onClick={() => set('vatRate', o.value)}
                      className={`h-9 px-3 text-sm rounded-xs border cursor-pointer ${form.vatRate === o.value ? 'border-ink bg-ink text-white' : 'border-line-strong hover:bg-paper'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              {numericPrice > 0 && (
                <p className="text-xs text-neutral-600 tabular-nums-all">
                  KDV hariç {net.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL · KDV {(numericPrice - net).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
                </p>
              )}
            </div>
            <p className="text-xs text-neutral-500">Stok adedi ERP’den eşitlenir; burada değiştirilmez.</p>
          </Section>

          <Section title="Ölçü ve malzeme" description="Boş bırakılan ölçü ürün sayfasında gösterilmez.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(
                [
                  ['width', 'Genişlik (cm)'],
                  ['depth', 'Derinlik (cm)'],
                  ['height', 'Yükseklik (cm)'],
                  ['drawerCount', 'Çekmece sayısı'],
                ] as const
              ).map(([k, label]) => (
                <Field key={k} id={`pf-${k}`} label={label} error={shown(k)}>
                  <input id={`pf-${k}`} type="text" inputMode="numeric" value={form[k]} maxLength={4} onChange={(e) => set(k, e.target.value.replace(/\D/g, ''))} className={inputCls(!!shown(k))} />
                </Field>
              ))}
            </div>
            <Field id="pf-material" label="Malzeme" count={[form.material.length, L.material]} hint="Yazarken öneriler çıkar; dilediğinizi yazabilirsiniz.">
              <datalist id="pf-material-suggest">
                {MATERIAL_SUGGESTIONS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              <input id="pf-material" type="text" list="pf-material-suggest" value={form.material} maxLength={L.material} onChange={(e) => set('material', e.target.value.replace(/[\r\n]/g, ' '))} className={inputCls()} />
            </Field>
          </Section>

          <Section title="Özellik maddeleri" description="Ürün sayfasında madde listesi olarak görünür.">
            <StringList id="pf-features" values={form.features} max={L.features} itemMax={L.feature} addLabel="Madde ekle" suggestions={FEATURE_SUGGESTIONS} placeholder="Ör. Kilitli keson" onChange={(v) => set('features', v)} />
            {shown('features') && <p className="text-xs text-signal">{shown('features')}</p>}
          </Section>

          <Section title="Renk seçenekleri" description="Ürün sayfasında seçilebilir renkler. Listede tanımlı bir ad yazarsanız renk örneği otomatik gösterilir.">
            <StringList
              id="pf-colors"
              values={form.colors}
              max={L.colors}
              itemMax={L.color}
              addLabel="Renk ekle"
              suggestions={LUXURY_SWATCHES.map((s) => s.name)}
              placeholder="Ör. Antrasit"
              onChange={(v) => set('colors', v)}
            />
            {shown('colors') && <p className="text-xs text-signal">{shown('colors')}</p>}
          </Section>
        </form>

        <footer className="px-5 py-3 border-t border-line bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 text-sm" aria-live="polite">
            {serverErrors.form ? (
              <span className="flex items-start gap-1.5 text-signal">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {serverErrors.form}
              </span>
            ) : touched && errorCount > 0 ? (
              <span className="text-signal">{errorCount} alanı düzeltin.</span>
            ) : null}
          </div>
          <div className="flex gap-2 ml-auto">
            <button type="button" onClick={requestClose} className="h-10 px-4 border border-line-strong text-sm rounded-xs hover:bg-paper cursor-pointer">
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || uploading}
              className="h-10 px-5 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold rounded-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Kaydediliyor…' : editingProduct ? 'Değişiklikleri kaydet' : 'Ürünü ekle'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProductFormModal;
