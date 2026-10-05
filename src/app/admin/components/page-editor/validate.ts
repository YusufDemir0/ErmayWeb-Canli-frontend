import { arr, isSafeHref, SAFE_IMAGE, SECTION_META, str, type PageButton, type PageDoc, type PageItem, type PageSection, type RichBlock } from '../../../../lib/pageLayout';
import type { HeroSlide } from '../../../../stores/useCMSStore';

/**
 * Kaydetmeden önce istemci tarafı kontrol (backend aynı kuralları ayrıca uygular).
 * Bölüm kimliği -> o bölümdeki sorunlar.
 */
export function validateDoc(doc: PageDoc): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const add = (s: PageSection, msg: string) => {
    (out[s.id] ||= []).push(msg);
  };
  const anchors = new Map<string, string>();

  for (const s of doc.sections) {
    const meta = SECTION_META[s.type];
    if (!meta) continue;
    if ((s.label || '').length > 40) add(s, 'Etiket en fazla 40 karakter olabilir.');
    if (s.anchor) {
      if (!/^[a-z0-9-]{1,40}$/.test(s.anchor)) add(s, 'Bağlantı adı yalnız küçük harf, rakam ve tire içerebilir.');
      if (anchors.has(s.anchor)) add(s, `"${s.anchor}" bağlantı adı başka bölümde de kullanılıyor.`);
      anchors.set(s.anchor, s.id);
    }

    for (const f of meta.fields) {
      const v = s.props[f.key];
      switch (f.kind) {
        case 'line':
        case 'text':
          if (f.required && !str(v).trim()) add(s, `${f.label} boş bırakılamaz.`);
          if (str(v).length > f.max) add(s, `${f.label} en fazla ${f.max} karakter olabilir.`);
          break;
        case 'image':
          if (str(v) && !SAFE_IMAGE.test(str(v))) add(s, `${f.label}: görsel adresi geçersiz.`);
          break;
        case 'buttons':
          arr<PageButton>(v).forEach((b, i) => {
            if (!str(b.label).trim()) add(s, `${i + 1}. butonun yazısı boş.`);
            if (!isSafeHref(str(b.href))) add(s, `${i + 1}. butonun bağlantısı geçersiz.`);
          });
          break;
        case 'items':
          arr<PageItem>(v).forEach((it, i) => {
            if (!str(it.title).trim()) add(s, `${i + 1}. maddenin başlığı boş.`);
          });
          break;
        case 'bullets':
          if (arr<string>(v).some((b) => !str(b).trim())) add(s, 'Boş madde var; silin ya da doldurun.');
          break;
        case 'blocks':
          arr<RichBlock>(v).forEach((b, i) => {
            const empty = b.type === 'list' ? b.items.filter((x) => x.trim()).length === 0 : !str(b.text).trim();
            if (empty) add(s, `${i + 1}. metin bloğu boş; silin ya da doldurun.`);
          });
          break;
        case 'slides':
          arr<HeroSlide>(v).forEach((sl, i) => {
            if (!str(sl.title).trim()) add(s, `${i + 1}. slaytın başlığı boş.`);
            if (sl.buttonLink && !isSafeHref(sl.buttonLink)) add(s, `${i + 1}. slaytın buton bağlantısı geçersiz.`);
            if (sl.image && !SAFE_IMAGE.test(sl.image)) add(s, `${i + 1}. slaytın görsel adresi geçersiz.`);
          });
          break;
      }
    }
  }
  return out;
}

/** Kaydedilecek belgeyi temizler: liste boşlukları, kırpılmış metinler. */
export function cleanDoc(doc: PageDoc): PageDoc {
  return {
    version: 1,
    sections: doc.sections.map((s) => {
      const props: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(s.props)) {
        if (typeof v === 'string') props[k] = v.trim();
        else if (k === 'blocks') {
          props[k] = arr<RichBlock>(v).map((b) => (b.type === 'list' ? { type: 'list', items: b.items.map((x) => x.trim()).filter(Boolean) } : { ...b, text: str(b.text).trim() }));
        } else props[k] = v;
      }
      return {
        id: s.id,
        type: s.type,
        hidden: !!s.hidden,
        label: (s.label || '').trim(),
        anchor: (s.anchor || '').trim(),
        background: s.background || 'white',
        spacing: s.spacing || 'normal',
        props,
      };
    }),
  };
}
