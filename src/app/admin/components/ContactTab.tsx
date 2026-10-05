'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, FileSpreadsheet, Loader2, Phone, Send, Share2 } from 'lucide-react';
import type { ContactInfoConfig } from '../../../stores/useCMSStore';
import { useCMSStore, describeApiError } from '../../../stores/useCMSStore';
import apiClient from '../../../services/api';
import { PhoneInput } from '../../../components/form/PhoneInput';
import { EmailInput, EMAIL_RE } from '../../../components/form/EmailInput';
import { isValidTrPhone, toE164, toWhatsappDigits } from '../../../lib/phone';
import { AdminCard, AdminField, SaveBar, adminInput } from './ui';

interface ContactTabProps {
  contactInfo: ContactInfoConfig;
  onUpdateContactInfo?: (contact: Partial<ContactInfoConfig>) => void;
  onShowSuccess: (msg: string) => void;
}

interface FormState {
  phone: string;
  phoneSecondary: string;
  whatsapp: string;
  email: string;
  address: string;
  showroom: string;
  workingHours: string;
  instagram: string;
  youtube: string;
  telegram: string;
}

const HTTPS = /^https:\/\/[^\s]+$/;

/**
 * İletişim bilgileri: sitede görünen her telefon, e-posta, adres ve sosyal bağlantının tek kaynağı.
 * Telefonlar +90 biçiminde kaydedilir; WhatsApp numarası tek yerde tutulur.
 */
export const ContactTab: React.FC<ContactTabProps> = ({ contactInfo, onShowSuccess }) => {
  const socialLinks = useCMSStore((s) => s.socialLinks);

  const initial = useMemo<FormState>(
    () => ({
      phone: toE164(contactInfo.phone) || contactInfo.phone || '',
      phoneSecondary: toE164(contactInfo.phoneSecondary) || contactInfo.phoneSecondary || '',
      whatsapp: toE164(contactInfo.whatsapp || socialLinks.whatsapp) || '',
      email: contactInfo.email || '',
      address: contactInfo.address || '',
      showroom: contactInfo.showroom || '',
      workingHours: contactInfo.workingHours || '',
      instagram: socialLinks.instagram || '',
      youtube: socialLinks.youtube || '',
      telegram: socialLinks.telegram || '',
    }),
    [contactInfo, socialLinks]
  );

  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  useEffect(() => setForm(initial), [initial]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaveError(null);
  };

  const errors: Partial<Record<keyof FormState, string>> = {};
  if (form.phone && !isValidTrPhone(form.phone)) errors.phone = 'Numarayı 10 hane olarak yazın.';
  if (form.phoneSecondary && !isValidTrPhone(form.phoneSecondary)) errors.phoneSecondary = 'Numarayı 10 hane olarak yazın.';
  if (form.whatsapp && !isValidTrPhone(form.whatsapp, { mobile: true })) errors.whatsapp = 'WhatsApp için 5 ile başlayan cep numarası yazın.';
  if (form.email && !EMAIL_RE.test(form.email)) errors.email = 'E-posta adresini kontrol edin.';
  for (const k of ['instagram', 'youtube', 'telegram'] as const) {
    if (form[k] && !HTTPS.test(form[k])) errors[k] = 'Bağlantı https:// ile başlamalı.';
  }
  const hasErrors = Object.keys(errors).length > 0;

  // Sunucu onaylamadan "kaydedildi" denmez
  const save = async () => {
    if (hasErrors) return;
    setSaving(true);
    setSaveError(null);
    const contact = {
      ...contactInfo,
      phone: toE164(form.phone),
      phoneSecondary: toE164(form.phoneSecondary),
      whatsapp: toWhatsappDigits(form.whatsapp),
      email: form.email.trim(),
      address: form.address.trim(),
      showroom: form.showroom.trim(),
      workingHours: form.workingHours.trim(),
    };
    const social = {
      ...socialLinks,
      instagram: form.instagram.trim(),
      youtube: form.youtube.trim(),
      telegram: form.telegram.trim(),
      // Tek WhatsApp numarası: sosyal ayar da aynı numarayı taşır
      whatsapp: toWhatsappDigits(form.whatsapp),
    };
    try {
      await apiClient.put('/cms/contact', { content: contact });
      await apiClient.put('/cms/social_links', { content: social });
      useCMSStore.setState({ contactInfo: contact, socialLinks: social });
      onShowSuccess('İletişim bilgileri kaydedildi.');
    } catch (err) {
      setSaveError(describeApiError(err, 'İletişim bilgileri kaydedilemedi.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <AdminCard title="İletişim bilgileri" icon={Phone} description="Footer, İletişim sayfası, katalog çıktısı ve tüm WhatsApp butonları bu bilgileri kullanır. Boş bırakılan bilgi sitede gösterilmez.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminField id="ct-phone" label="Telefon" error={errors.phone} hint="İletişim sayfası ve harita baloncuğunda görünür.">
            <PhoneInput id="ct-phone" value={form.phone} onChange={(v) => set('phone', v)} className="h-10" />
          </AdminField>
          <AdminField id="ct-phone2" label="İkinci telefon" error={errors.phoneSecondary} hint="İsteğe bağlı.">
            <PhoneInput id="ct-phone2" value={form.phoneSecondary} onChange={(v) => set('phoneSecondary', v)} className="h-10" />
          </AdminField>
          <AdminField id="ct-wa" label="WhatsApp hattı" error={errors.whatsapp} hint="Sitedeki tüm WhatsApp butonları bu numaraya gider. Boşsa butonlar gizlenir.">
            <PhoneInput id="ct-wa" mobile value={form.whatsapp} onChange={(v) => set('whatsapp', v)} className="h-10" />
          </AdminField>
          <AdminField id="ct-email" label="E-posta" error={errors.email}>
            <EmailInput id="ct-email" value={form.email} onChange={(v) => set('email', v)} extraDomains={['ermaymobilya.com']} className={adminInput(!!errors.email)} />
          </AdminField>
          <AdminField id="ct-address" label="Adres" count={[form.address.length, 300]} hint="Footer ve İletişim sayfasında görünür.">
            <input id="ct-address" type="text" value={form.address} maxLength={300} onChange={(e) => set('address', e.target.value)} className={adminInput()} />
          </AdminField>
          <AdminField id="ct-showroom" label="Showroom adresi" count={[form.showroom.length, 300]} hint="Adresten farklıysa doldurun; katalog çıktısında kullanılır.">
            <input id="ct-showroom" type="text" value={form.showroom} maxLength={300} onChange={(e) => set('showroom', e.target.value)} className={adminInput()} />
          </AdminField>
          <AdminField id="ct-hours" label="Çalışma saatleri" count={[form.workingHours.length, 120]} hint="Ör. Pazartesi–Cumartesi 09:00–19:30, Pazar 11:00–18:30">
            <input id="ct-hours" type="text" value={form.workingHours} maxLength={120} onChange={(e) => set('workingHours', e.target.value)} className={adminInput()} />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard title="Sosyal medya" icon={Share2} description="Mobil menünün altında simge olarak görünür. Boş bırakılan hesap gösterilmez.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(
            [
              ['instagram', 'Instagram', 'https://instagram.com/…'],
              ['youtube', 'YouTube', 'https://youtube.com/@…'],
              ['telegram', 'Telegram', 'https://t.me/…'],
            ] as const
          ).map(([k, label, ph]) => (
            <AdminField key={k} id={`ct-${k}`} label={label} error={errors[k]}>
              <input id={`ct-${k}`} type="url" inputMode="url" value={form[k]} maxLength={500} placeholder={ph} onChange={(e) => set(k, e.target.value.trim())} className={adminInput(!!errors[k])} />
            </AdminField>
          ))}
        </div>
      </AdminCard>

      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={() => setForm(initial)} disabled={hasErrors} error={saveError || (hasErrors ? 'İşaretli alanları düzeltin.' : null)} />

      <NotificationsCard />
    </div>
  );
};

/** Telegram bildirimi ve günlük talep özeti: ne gönderildiği olduğu gibi anlatılır */
function NotificationsCard() {
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [reportMsg, setReportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const test = async () => {
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await apiClient.post('/cms/telegram/test');
      setTestMsg({ ok: !!res.data?.success, text: res.data?.message || (res.data?.success ? 'Test mesajı gönderildi.' : 'Gönderilemedi.') });
    } catch (err) {
      setTestMsg({ ok: false, text: describeApiError(err, 'Telegram bağlantısı kurulamadı. Sunucudaki TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID ayarlarını kontrol edin.') });
    } finally {
      setTesting(false);
    }
  };

  const report = async () => {
    setSending(true);
    setReportMsg(null);
    try {
      const res = await apiClient.post('/orders/daily-report');
      const d = res.data?.data as { totalRequests?: number; totalVolume?: number } | undefined;
      setReportMsg({
        ok: !!res.data?.success,
        text: res.data?.success
          ? `Dünün özeti gönderildi: ${d?.totalRequests ?? 0} talep, ${(d?.totalVolume ?? 0).toLocaleString('tr-TR')} TL tahmini tutar.`
          : res.data?.message || 'Özet gönderilemedi.',
      });
    } catch (err) {
      setReportMsg({ ok: false, text: describeApiError(err, 'Özet gönderilemedi.') });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminCard
      title="Telegram bildirimleri"
      icon={BellRing}
      description="Yeni sipariş talebi ve iletişim mesajı geldiğinde Telegram’a kısa bir bildirim gider. Bot ayarları sunucudadır."
    >
      <div className="text-sm text-neutral-700 space-y-1">
        <p>Talep bildiriminde: talep numarası, il/ilçe, ürün kalem sayısı, tahmini tutar ve müşteri tercihi (WhatsApp ya da mağaza).</p>
        <p className="text-neutral-500">Ad, telefon ve adres gibi kişisel veriler gönderilmez (KVKK).</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={test} disabled={testing} className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold border border-line-strong rounded-xs hover:bg-paper disabled:opacity-50 cursor-pointer">
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Test bildirimi gönder
        </button>
        {testMsg && <span className={`text-sm ${testMsg.ok ? 'text-ok' : 'text-signal'}`}>{testMsg.text}</span>}
      </div>
      <div className="border-t border-line pt-4 space-y-3">
        <p className="text-sm text-neutral-700 flex items-start gap-2">
          <FileSpreadsheet className="h-4 w-4 text-wood-dark shrink-0 mt-0.5" />
          Dünün talep özeti (talep sayısı, durum ve tercih dağılımı, toplam tahmini tutar) isteğe bağlı olarak Telegram’a gönderilir. Otomatik zamanlama yoktur.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={report} disabled={sending} className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold border border-line-strong rounded-xs hover:bg-paper disabled:opacity-50 cursor-pointer">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Dünün özetini gönder
          </button>
          {reportMsg && <span className={`text-sm ${reportMsg.ok ? 'text-ok' : 'text-signal'}`}>{reportMsg.text}</span>}
        </div>
      </div>
    </AdminCard>
  );
}

export default ContactTab;
