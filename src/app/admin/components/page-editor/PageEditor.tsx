'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  AlertCircle, ArrowDown, ArrowUp, Copy, ExternalLink, Eye, EyeOff, GripVertical, Lock, Monitor, Plus, Redo2,
  Smartphone, Trash2, Undo2, X,
} from 'lucide-react';
import apiClient from '../../../../services/api';
import {
  BACKGROUND_OPTIONS,
  emptySection,
  FREE_SECTION_TYPES,
  newSectionId,
  PAGE_INFO,
  resolvePageDoc,
  SECTION_META,
  SPACING_OPTIONS,
  str,
  type PageDoc,
  type PageKey,
  type PageSection,
  type SectionType,
} from '../../../../lib/pageLayout';
import {
  EDITOR_SOURCE,
  PREVIEW_SOURCE,
  type EditorMessage,
  type PreviewMessage,
} from '../../../../components/page/PageRenderer';
import { FieldRenderer, inputCls, LabelRow, move } from './fields';
import { cleanDoc, validateDoc } from './validate';

export type EditorMode = 'design' | 'content';

interface PageEditorProps {
  mode: EditorMode;
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
}

const PAGE_KEYS: PageKey[] = ['page_home', 'page_corporate', 'page_contact'];
const PREVIEW_FRAME_NAME = 'ermay-cms-preview';
const HISTORY_LIMIT = 60;

const sectionTitle = (s: PageSection): string => {
  const meta = SECTION_META[s.type];
  const own = str(s.props.title) || str(s.props.badge);
  return own ? own : meta?.name || s.type;
};

export default function PageEditor({ mode, onShowSuccess, onShowError }: PageEditorProps) {
  const [blocks, setBlocks] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageKey, setPageKey] = useState<PageKey>('page_home');
  const [published, setPublished] = useState<PageDoc | null>(null);
  const [draft, setDraft] = useState<PageDoc | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const past = useRef<PageDoc[]>([]);
  const future = useRef<PageDoc[]>([]);
  const lastPush = useRef(0);
  const [, forceHistory] = useState(0);

  const frameRef = useRef<HTMLIFrameElement>(null);

  // ── Yükleme ───────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await apiClient.get('/cms');
      setBlocks((res.data?.cms as Record<string, unknown>) || {});
    } catch {
      setLoadError('Sayfa içerikleri yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.');
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!blocks) return;
    const doc = resolvePageDoc(pageKey, blocks);
    setPublished(doc);
    setDraft(doc);
    setSelectedId(doc.sections[0]?.id ?? null);
    past.current = [];
    future.current = [];
    setServerErrors([]);
  }, [blocks, pageKey]);

  const dirty = useMemo(() => !!draft && !!published && JSON.stringify(cleanDoc(draft)) !== JSON.stringify(cleanDoc(published)), [draft, published]);
  const issues = useMemo(() => (draft ? validateDoc(draft) : {}), [draft]);
  const issueCount = Object.values(issues).reduce((n, l) => n + l.length, 0);

  // Kaydedilmemiş değişiklikle sekme kapatılırsa uyar
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  // ── Taslak değişikliği + geri al ──────────────────────────────────────────
  const commit = useCallback((next: PageDoc, coalesce = false) => {
    setDraft((prev) => {
      if (prev) {
        const now = Date.now();
        if (!coalesce || now - lastPush.current > 800) {
          past.current = [...past.current.slice(-HISTORY_LIMIT + 1), prev];
          future.current = [];
          forceHistory((n) => n + 1);
        }
        lastPush.current = now;
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setDraft((cur) => {
      const prev = past.current.pop();
      if (!prev || !cur) return cur;
      future.current.push(cur);
      forceHistory((n) => n + 1);
      return prev;
    });
  }, []);
  const redo = useCallback(() => {
    setDraft((cur) => {
      const next = future.current.pop();
      if (!next || !cur) return cur;
      past.current.push(cur);
      forceHistory((n) => n + 1);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) return; // metin alanlarında tarayıcının kendi geri alması
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const updateSection = useCallback(
    (id: string, patch: Partial<PageSection>, coalesce = false) => {
      if (!draft) return;
      commit({ ...draft, sections: draft.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) }, coalesce);
    },
    [draft, commit]
  );
  const updateProp = (id: string, key: string, value: unknown) => {
    const s = draft?.sections.find((x) => x.id === id);
    if (!s) return;
    updateSection(id, { props: { ...s.props, [key]: value } }, typeof value === 'string');
  };

  const moveSection = useCallback(
    (id: string, dir: -1 | 1) => {
      if (!draft) return;
      const i = draft.sections.findIndex((s) => s.id === id);
      commit({ ...draft, sections: move(draft.sections, i, dir) });
    },
    [draft, commit]
  );

  // ── Önizleme köprüsü ──────────────────────────────────────────────────────
  const postToFrame = useCallback((msg: EditorMessage) => {
    frameRef.current?.contentWindow?.postMessage(msg, window.location.origin);
  }, []);

  useEffect(() => {
    if (draft) postToFrame({ source: EDITOR_SOURCE, type: 'doc', pageKey, doc: draft });
  }, [draft, pageKey, postToFrame]);

  useEffect(() => {
    postToFrame({ source: EDITOR_SOURCE, type: 'select', id: selectedId });
  }, [selectedId, postToFrame]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== window.location.origin || event.data?.source !== PREVIEW_SOURCE) return;
      const msg = event.data;
      if (msg.type === 'ready') {
        if (draft && msg.pageKey === pageKey) {
          postToFrame({ source: EDITOR_SOURCE, type: 'doc', pageKey, doc: draft });
          postToFrame({ source: EDITOR_SOURCE, type: 'select', id: selectedId });
        }
      } else if (msg.type === 'select') {
        setSelectedId(msg.id);
      } else if (msg.type === 'action' && draft) {
        if (msg.action === 'up') moveSection(msg.id, -1);
        if (msg.action === 'down') moveSection(msg.id, 1);
        if (msg.action === 'toggle-hidden') {
          const s = draft.sections.find((x) => x.id === msg.id);
          if (s) updateSection(s.id, { hidden: !s.hidden });
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [draft, pageKey, selectedId, postToFrame, moveSection, updateSection]);

  const selectFromPanel = (id: string) => {
    setSelectedId(id);
    postToFrame({ source: EDITOR_SOURCE, type: 'select', id, scroll: true });
  };

  // ── Bölüm ekle / çoğalt / sil ─────────────────────────────────────────────
  const addSection = (type: SectionType) => {
    if (!draft) return;
    const sec = emptySection(type);
    const at = selectedId ? draft.sections.findIndex((s) => s.id === selectedId) + 1 : draft.sections.length;
    const sections = [...draft.sections];
    sections.splice(at, 0, sec);
    commit({ ...draft, sections });
    setShowLibrary(false);
    setSelectedId(sec.id);
    setTimeout(() => postToFrame({ source: EDITOR_SOURCE, type: 'select', id: sec.id, scroll: true }), 150);
  };
  const duplicateSection = (s: PageSection) => {
    if (!draft) return;
    const copy: PageSection = { ...JSON.parse(JSON.stringify(s)), id: newSectionId(s.type), anchor: '' };
    const i = draft.sections.findIndex((x) => x.id === s.id);
    const sections = [...draft.sections];
    sections.splice(i + 1, 0, copy);
    commit({ ...draft, sections });
    setSelectedId(copy.id);
  };
  const removeSection = (s: PageSection) => {
    if (!draft || SECTION_META[s.type].system) return;
    if (!window.confirm(`"${sectionTitle(s)}" bölümü silinsin mi? Yayınlamadan önce "Geri al" ile geri getirebilirsiniz.`)) return;
    commit({ ...draft, sections: draft.sections.filter((x) => x.id !== s.id) });
    setSelectedId(null);
  };

  // ── Kaydet ────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!draft || issueCount > 0) return;
    setSaving(true);
    setServerErrors([]);
    const content = cleanDoc(draft);
    try {
      await apiClient.put(`/cms/${pageKey}`, { content });
      setPublished(content);
      setDraft(content);
      setBlocks((b) => ({ ...(b || {}), [pageKey]: content }));
      onShowSuccess(`${PAGE_INFO[pageKey].name} yayınlandı. Sitede en geç bir dakika içinde görünür.`);
    } catch (err) {
      const data = isAxiosError(err) ? (err.response?.data as { message?: string; errors?: { field: string; message: string }[] }) : undefined;
      const list = (data?.errors || []).map((e) => {
        const m = e.field.match(/sections\.(\d+)/);
        const s = m ? content.sections[Number(m[1])] : undefined;
        return s ? `${sectionTitle(s)}: ${e.message}` : e.message;
      });
      setServerErrors(list.length ? list : [data?.message || 'Kaydedilemedi. Bağlantınızı kontrol edip tekrar deneyin.']);
      onShowError('Sayfa kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!published || !window.confirm('Yayınlanmamış tüm değişiklikler silinsin mi?')) return;
    setDraft(published);
    past.current = [];
    future.current = [];
    forceHistory((n) => n + 1);
  };

  const switchPage = (key: PageKey) => {
    if (key === pageKey) return;
    if (dirty && !window.confirm('Bu sayfada yayınlanmamış değişiklikler var. Sayfa değiştirilirse kaybolacak. Devam edilsin mi?')) return;
    setPageKey(key);
  };

  // ── Görünüm ───────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div role="alert" className="bg-white border border-line rounded-xs p-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-signal shrink-0" />
        <div className="space-y-3">
          <p className="text-sm text-ink">{loadError}</p>
          <button type="button" onClick={load} className="h-10 px-4 bg-ink text-white text-sm font-semibold rounded-xs cursor-pointer">
            Yeniden dene
          </button>
        </div>
      </div>
    );
  }
  if (!draft) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4" aria-busy="true">
        <div className="h-[70vh] bg-white border border-line rounded-xs animate-pulse" />
        <div className="h-[70vh] bg-white border border-line rounded-xs animate-pulse" />
      </div>
    );
  }

  const selected = draft.sections.find((s) => s.id === selectedId) || null;
  const info = PAGE_INFO[pageKey];
  const addable = FREE_SECTION_TYPES.filter((t) => info.allowed.includes(t));

  return (
    <div className="space-y-3">
      {/* Üst çubuk */}
      <div className="bg-white border border-line rounded-xs px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-full" role="tablist" aria-label="Sayfa">
          {PAGE_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === pageKey}
              onClick={() => switchPage(k)}
              className={`h-9 px-3 text-sm rounded-xs cursor-pointer ${k === pageKey ? 'bg-ink text-white font-semibold' : 'text-ink hover:bg-paper'}`}
            >
              {PAGE_INFO[k].name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 ml-auto items-center justify-end">
          <button type="button" onClick={undo} disabled={past.current.length === 0} className="h-9 w-9 flex items-center justify-center rounded-xs hover:bg-paper disabled:opacity-30 cursor-pointer" aria-label="Geri al" title="Geri al (Ctrl+Z)">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={redo} disabled={future.current.length === 0} className="h-9 w-9 flex items-center justify-center rounded-xs hover:bg-paper disabled:opacity-30 cursor-pointer" aria-label="Yinele" title="Yinele (Ctrl+Shift+Z)">
            <Redo2 className="h-4 w-4" />
          </button>
          <span className="w-px h-6 bg-line mx-1" aria-hidden="true" />
          <button type="button" onClick={() => setDevice('desktop')} aria-pressed={device === 'desktop'} className={`h-9 w-9 flex items-center justify-center rounded-xs cursor-pointer ${device === 'desktop' ? 'bg-paper text-ink' : 'text-neutral-500 hover:bg-paper'}`} aria-label="Masaüstü önizleme">
            <Monitor className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDevice('mobile')} aria-pressed={device === 'mobile'} className={`h-9 w-9 flex items-center justify-center rounded-xs cursor-pointer ${device === 'mobile' ? 'bg-paper text-ink' : 'text-neutral-500 hover:bg-paper'}`} aria-label="Telefon önizleme">
            <Smartphone className="h-4 w-4" />
          </button>
          <a href={info.path} target="_blank" rel="noopener noreferrer" className="h-9 w-9 flex items-center justify-center rounded-xs text-neutral-500 hover:bg-paper" aria-label="Yayındaki sayfayı yeni sekmede aç" title="Yayındaki sayfa">
            <ExternalLink className="h-4 w-4" />
          </a>
          <span className="w-px h-6 bg-line mx-1" aria-hidden="true" />
          <span className={`text-xs px-2 ${dirty ? 'text-signal font-semibold' : 'text-neutral-500'}`} aria-live="polite">
            {dirty ? 'Yayınlanmamış değişiklik var' : 'Yayındaki hali'}
          </span>
          <button type="button" onClick={discard} disabled={!dirty} className="h-9 px-3 text-sm border border-line-strong rounded-xs hover:bg-paper disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
            Vazgeç
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving || issueCount > 0}
            title={issueCount > 0 ? 'Önce işaretli sorunları düzeltin' : undefined}
            className="h-9 px-4 text-sm font-semibold bg-brand hover:bg-brand-dark text-ink rounded-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Yayınlanıyor…' : 'Yayınla'}
          </button>
        </div>
      </div>

      {(serverErrors.length > 0 || issueCount > 0) && (
        <div role="alert" className="border-l-4 border-signal bg-white p-3 text-sm space-y-1">
          <p className="font-semibold text-ink">
            {serverErrors.length > 0 ? 'Sunucu kaydı kabul etmedi:' : `Yayınlamadan önce ${issueCount} sorunu düzeltin:`}
          </p>
          <ul className="list-disc pl-5 text-neutral-700">
            {serverErrors.map((e, i) => (
              <li key={`s${i}`}>{e}</li>
            ))}
            {draft.sections
              .filter((s) => issues[s.id])
              .flatMap((s) =>
                issues[s.id].map((m, i) => (
                  <li key={`${s.id}${i}`}>
                    <button type="button" onClick={() => selectFromPanel(s.id)} className="underline underline-offset-2 hover:text-ink cursor-pointer">
                      {sectionTitle(s)}
                    </button>
                    : {m}
                  </li>
                ))
              )}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-3 items-start">
        {/* Panel */}
        <aside className="bg-white border border-line rounded-xs lg:sticky lg:top-3 lg:max-h-[calc(100vh-1.5rem)] flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-line">
            <h2 className="text-sm font-semibold text-ink">{mode === 'design' ? 'Bölümler' : 'Düzenlenecek bölüm'}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {mode === 'design'
                ? 'Sürükleyerek ya da oklarla sıralayın; göz simgesiyle gizleyin. Önizlemede bir bölüme tıklayarak da seçebilirsiniz.'
                : 'Bir bölüm seçin ya da önizlemede tıklayın; metinleri aşağıda düzenleyin.'}
            </p>
          </div>

          <div className="overflow-y-auto min-h-0">
            <ol className="p-2 space-y-1">
              {draft.sections.map((s, i) => {
                const meta = SECTION_META[s.type];
                const isSel = s.id === selectedId;
                const hasIssue = !!issues[s.id];
                return (
                  <li
                    key={s.id}
                    draggable={mode === 'design'}
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => mode === 'design' && e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex === null || dragIndex === i) return;
                      const sections = [...draft.sections];
                      const [m] = sections.splice(dragIndex, 1);
                      sections.splice(i, 0, m);
                      commit({ ...draft, sections });
                      setDragIndex(null);
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={`group flex items-center gap-1 rounded-xs border ${isSel ? 'border-ink bg-paper' : 'border-transparent hover:bg-canvas'} ${dragIndex === i ? 'opacity-50' : ''}`}
                  >
                    {mode === 'design' && <GripVertical className="h-4 w-4 text-neutral-400 shrink-0 ml-1 cursor-grab" aria-hidden="true" />}
                    <button type="button" onClick={() => selectFromPanel(s.id)} className="flex-1 min-w-0 text-left px-2 py-2 cursor-pointer" aria-current={isSel ? 'true' : undefined}>
                      <span className={`block text-sm truncate ${s.hidden ? 'text-neutral-400 line-through' : 'text-ink'} ${isSel ? 'font-semibold' : ''}`}>
                        {sectionTitle(s)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                        {meta.system && <Lock className="h-3 w-3" aria-label="Sabit bölüm" />}
                        {meta.name}
                        {s.label && <span className="text-wood">· {s.label}</span>}
                        {hasIssue && <AlertCircle className="h-3.5 w-3.5 text-signal" aria-label="Sorun var" />}
                      </span>
                    </button>
                    {mode === 'design' && (
                      <div className="flex items-center shrink-0 pr-1">
                        <button type="button" onClick={() => moveSection(s.id, -1)} disabled={i === 0} className="h-8 w-7 flex items-center justify-center text-neutral-500 hover:text-ink disabled:opacity-25 cursor-pointer" aria-label="Yukarı taşı">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => moveSection(s.id, 1)} disabled={i === draft.sections.length - 1} className="h-8 w-7 flex items-center justify-center text-neutral-500 hover:text-ink disabled:opacity-25 cursor-pointer" aria-label="Aşağı taşı">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => updateSection(s.id, { hidden: !s.hidden })} className="h-8 w-7 flex items-center justify-center text-neutral-500 hover:text-ink cursor-pointer" aria-label={s.hidden ? 'Göster' : 'Gizle'} title={s.hidden ? 'Göster' : 'Gizle'}>
                          {s.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            {mode === 'design' && (
              <div className="px-3 pb-3">
                {!showLibrary ? (
                  <button
                    type="button"
                    onClick={() => setShowLibrary(true)}
                    disabled={draft.sections.length >= 30}
                    className="w-full h-10 inline-flex items-center justify-center gap-1.5 text-sm font-medium border border-dashed border-line-strong rounded-xs hover:bg-paper cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" /> Bölüm ekle {selected && '(seçilinin altına)'}
                  </button>
                ) : (
                  <div className="border border-line rounded-xs">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-line">
                      <span className="text-sm font-semibold">Bölüm türü seçin</span>
                      <button type="button" onClick={() => setShowLibrary(false)} className="h-8 w-8 flex items-center justify-center cursor-pointer" aria-label="Kapat">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <ul>
                      {addable.map((t) => (
                        <li key={t}>
                          <button type="button" onClick={() => addSection(t)} className="w-full text-left px-3 py-2.5 hover:bg-paper cursor-pointer border-b border-line last:border-b-0">
                            <span className="block text-sm font-medium text-ink">{SECTION_META[t].name}</span>
                            <span className="block text-xs text-neutral-500">{SECTION_META[t].description}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Seçili bölüm ayarları */}
            {selected && (
              <div className="border-t border-line p-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{SECTION_META[selected.type].name}</h3>
                    <p className="text-xs text-neutral-500">{SECTION_META[selected.type].description}</p>
                  </div>
                  {mode === 'design' && !SECTION_META[selected.type].system && (
                    <div className="flex shrink-0">
                      <button type="button" onClick={() => duplicateSection(selected)} className="h-8 w-8 flex items-center justify-center text-neutral-500 hover:text-ink cursor-pointer" aria-label="Çoğalt" title="Çoğalt">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => removeSection(selected)} className="h-8 w-8 flex items-center justify-center text-neutral-500 hover:text-signal cursor-pointer" aria-label="Bölümü sil" title="Sil">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {mode === 'design' ? (
                  <DesignSettings section={selected} onChange={(patch, coalesce) => updateSection(selected.id, patch, coalesce)} />
                ) : (
                  <div className="space-y-4">
                    {SECTION_META[selected.type].fields.map((f) => (
                      <FieldRenderer key={`${selected.id}-${f.key}`} def={f} value={selected.props[f.key]} onChange={(v) => updateProp(selected.id, f.key, v)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Canlı önizleme */}
        <div className="bg-paper-deep/40 border border-line rounded-xs p-2 lg:sticky lg:top-3">
          <div className={`mx-auto bg-white shadow-sm transition-[width] duration-300 ${device === 'mobile' ? 'w-[390px] max-w-full' : 'w-full'}`}>
            <iframe
              ref={frameRef}
              key={pageKey}
              name={PREVIEW_FRAME_NAME}
              title={`${info.name} önizleme`}
              src={`${info.path}?cms-preview=1`}
              className="w-full h-[calc(100vh-9rem)] min-h-[520px] border-0 block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DesignSettings({ section: s, onChange }: { section: PageSection; onChange: (patch: Partial<PageSection>, coalesce?: boolean) => void }) {
  const anchorErr = s.anchor && !/^[a-z0-9-]{1,40}$/.test(s.anchor) ? 'Yalnız küçük harf, rakam ve tire.' : null;
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm font-medium text-ink">Sitede göster</span>
        <input type="checkbox" checked={!s.hidden} onChange={(e) => onChange({ hidden: !e.target.checked })} className="h-4 w-4 accent-ink" />
      </label>

      <div>
        <LabelRow htmlFor={`label-${s.id}`} label="Etiket" counter={<span className="text-xs text-neutral-500 tabular-nums-all">{(s.label || '').length}/40</span>} />
        <input
          id={`label-${s.id}`}
          type="text"
          value={s.label || ''}
          maxLength={40}
          placeholder="Örn: Yeni sezon"
          onChange={(e) => onChange({ label: e.target.value.replace(/[\r\n]/g, ' ') }, true)}
          className={`${inputCls()} h-10`}
        />
        <p className="mt-1 text-xs text-neutral-500">Bölümün üstünde küçük bir etiket olarak görünür. Boş bırakılırsa gösterilmez.</p>
      </div>

      <div>
        <LabelRow label="Zemin" />
        <div className="flex gap-2" role="radiogroup" aria-label="Zemin rengi">
          {BACKGROUND_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={(s.background || 'white') === o.value}
              onClick={() => onChange({ background: o.value })}
              className={`flex-1 h-14 rounded-xs border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer ${(s.background || 'white') === o.value ? 'ring-2 ring-ink ring-offset-1 border-ink' : 'border-line-strong hover:border-ink'}`}
            >
              <span className="h-5 w-5 rounded-full border border-line-strong" style={{ backgroundColor: o.swatch }} />
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <LabelRow label="Boşluk" />
        <div className="flex gap-1" role="radiogroup" aria-label="Dikey boşluk">
          {SPACING_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={(s.spacing || 'normal') === o.value}
              onClick={() => onChange({ spacing: o.value })}
              className={`flex-1 h-9 text-sm rounded-xs border cursor-pointer ${(s.spacing || 'normal') === o.value ? 'border-ink bg-ink text-white' : 'border-line-strong text-ink hover:bg-paper'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <LabelRow htmlFor={`anchor-${s.id}`} label="Sayfa içi bağlantı adı" />
        <input
          id={`anchor-${s.id}`}
          type="text"
          value={s.anchor || ''}
          maxLength={40}
          placeholder="Örn: kvkk"
          onChange={(e) => onChange({ anchor: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }, true)}
          className={`${inputCls(!!anchorErr)} h-10 font-mono text-sm`}
        />
        <p className="mt-1 text-xs text-neutral-500">Doldurulursa bu bölüme doğrudan bağlantı verilebilir (ör. /kurumsal#kvkk).</p>
      </div>
    </div>
  );
}
