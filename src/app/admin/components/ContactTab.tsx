'use client';

import React, { useState } from 'react';
import type { ContactInfoConfig } from '../../../stores/useCMSStore';
import { useCMSStore } from '../../../stores/useCMSStore';
import { 
  Phone, Mail, MapPin, Send, MessageSquare, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, Share2, BellRing, FileSpreadsheet
} from 'lucide-react';
import apiClient from '../../../services/api';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
  </svg>
);

interface ContactTabProps {
  contactInfo: ContactInfoConfig;
  onUpdateContactInfo: (contact: Partial<ContactInfoConfig>) => void;
  onShowSuccess: (msg: string) => void;
}

export const ContactTab: React.FC<ContactTabProps> = ({
  contactInfo,
  onUpdateContactInfo,
  onShowSuccess,
}) => {
  const socialLinks = useCMSStore((state) => state.socialLinks);
  const updateSocialLinks = useCMSStore((state) => state.updateSocialLinks);

  const [localContact, setLocalContact] = useState(contactInfo);
  const [localSocials, setLocalSocials] = useState(socialLinks);

  // Telegram Test State
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramStatusMsg, setTelegramStatusMsg] = useState<string | null>(null);

  // Daily Report Trigger State
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportStatusMsg, setReportStatusMsg] = useState<string | null>(null);

  const handleSaveAll = () => {
    onUpdateContactInfo(localContact);
    updateSocialLinks(localSocials);
    onShowSuccess('İletişim ve sosyal medya bağlantıları başarıyla güncellendi.');
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramStatusMsg(null);
    try {
      const res = await apiClient.post('/cms/telegram/test');
      if (res.data?.success) {
        setTelegramStatusMsg('Telegram test mesajı botunuza başarıyla iletildi! 🎉');
        onShowSuccess('Telegram bildirimi gönderildi!');
      } else {
        setTelegramStatusMsg(res.data?.message || 'Telegram bildirimi gönderilemedi.');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      const msg = errObj.response?.data?.message || 'Telegram servisiyle bağlantı kurulamadı. Lütfen .env dosyasındaki TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID ayarlarını kontrol ediniz.';
      setTelegramStatusMsg(msg);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleSendDailyReport = async () => {
    setIsSendingReport(true);
    setReportStatusMsg(null);
    try {
      const res = await apiClient.post('/orders/daily-report');
      if (res.data?.success) {
        setReportStatusMsg(`Dünün satış raporu admin e-postasına gönderildi! (${res.data.data?.orderCount || 0} sipariş, ${res.data.data?.totalRevenue || 0} TL)`);
        onShowSuccess('Günlük satış bülteni e-postanıza iletildi!');
      } else {
        setReportStatusMsg(res.data?.message || 'Satış raporu gönderilemedi.');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      const msg = errObj.response?.data?.message || 'Rapor servisi çağrılamadı. Lütfen SMTP ve e-posta ayarlarını kontrol ediniz.';
      setReportStatusMsg(msg);
    } finally {
      setIsSendingReport(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      
      {/* 1. Contact & Workshop Physical Details */}
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
        <div className="border-b border-neutral-100 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-1">
            İletişim & Konum Yönetimi
          </span>
          <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-700" />
            <span>Firma İletişim Bilgileri</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              Müşteri Hizmetleri / Sabit Telefon
            </label>
            <input
              type="text"
              value={localContact.phone}
              onChange={(e) => setLocalContact({ ...localContact, phone: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-sm focus:ring-1 focus:ring-amber-600 focus:outline-none"
              placeholder="0216 420 00 00"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              Resmi E-Posta Adresi
            </label>
            <input
              type="email"
              value={localContact.email}
              onChange={(e) => setLocalContact({ ...localContact, email: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-sm focus:ring-1 focus:ring-amber-600 focus:outline-none"
              placeholder="info@ermaymobilya.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              Fabrika & Showroom Açık Adresi
            </label>
            <input
              type="text"
              value={localContact.address}
              onChange={(e) => setLocalContact({ ...localContact, address: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-sm focus:ring-1 focus:ring-amber-600 focus:outline-none"
              placeholder="Modoko Mobilyacılar Sitesi, 3. Cadde No: 42, Ümraniye / İstanbul"
            />
          </div>
        </div>
      </div>

      {/* 2. Social Media Channels CMS */}
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
        <div className="border-b border-neutral-100 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-1">
            Topluluk & Kanal Entegrasyonu
          </span>
          <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-amber-700" />
            <span>Sosyal Medya & Sipariş Hatları</span>
          </h3>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Web sitesinin üst menüsünde, altbilgisinde (footer) ve ürün detaylarında gösterilecek resmi hesap bağlantıları.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1 flex items-center gap-1.5">
              <InstagramIcon className="h-3.5 w-3.5 text-pink-600" />
              <span>Instagram Kanalı (URL / Kullanıcı Adı)</span>
            </label>
            <input
              type="text"
              value={localSocials.instagram}
              onChange={(e) => setLocalSocials({ ...localSocials, instagram: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-sm focus:ring-1 focus:ring-amber-600 focus:outline-none"
              placeholder="https://instagram.com/ermaymobilya"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1 flex items-center gap-1.5">
              <YoutubeIcon className="h-3.5 w-3.5 text-red-600" />
              <span>YouTube Kanalı (Atölye & Üretim Videoları)</span>
            </label>
            <input
              type="text"
              value={localSocials.youtube}
              onChange={(e) => setLocalSocials({ ...localSocials, youtube: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-sm focus:ring-1 focus:ring-amber-600 focus:outline-none"
              placeholder="https://youtube.com/@ermaymobilya"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-sky-600" />
              <span>Telegram Kanalı / İletişim Grubu</span>
            </label>
            <input
              type="text"
              value={localSocials.telegram}
              onChange={(e) => setLocalSocials({ ...localSocials, telegram: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-sm focus:ring-1 focus:ring-amber-600 focus:outline-none"
              placeholder="https://t.me/ermaymobilya"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp Esnaf Sipariş Hattı (Numara)</span>
            </label>
            <input
              type="text"
              value={localSocials.whatsapp}
              onChange={(e) => setLocalSocials({ ...localSocials, whatsapp: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-sm focus:ring-1 focus:ring-amber-600 focus:outline-none font-mono"
              placeholder="+90 532 000 00 00"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveAll}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-sm transition-colors cursor-pointer shadow-sm"
          >
            Tüm İletişim ve Sosyal Bağlantıları Kaydet
          </button>
        </div>
      </div>

      {/* 3. Telegram Instant Order Notification Setup & Testing */}
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-5">
        <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600 block mb-1">
              Anlık Yönetici Bildirimleri
            </span>
            <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-sky-600" />
              <span>Telegram Sipariş Bildirim Altyapısı</span>
            </h3>
          </div>
          <span className="text-xs bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1 rounded-full font-semibold">
            Canlı Entegrasyon Hazır
          </span>
        </div>

        <div className="bg-sky-50/50 p-4 rounded border border-sky-100 text-xs space-y-2 text-neutral-700">
          <p className="font-semibold text-sky-950">
            🔔 Web sitesinden yeni bir sipariş verildiğinde Telegram botunuz üzerinden anında:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600 text-[11px]">
            <li>Sipariş numarası, tutarı ve müşteri adı</li>
            <li>Teslim edilecek şehir ve bölgesel lojistik kodu (Örn: <code>34-MAR</code>)</li>
            <li>Satın alımın yapıldığı cihaz türü (Mobil / Laptop / Masaüstü)</li>
            <li>Sepetteki ürünlerin listesi doğrudan cep telefonunuza gelir.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={handleTestTelegram}
            disabled={isTestingTelegram}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-xs font-bold uppercase py-2.5 px-5 rounded transition-colors cursor-pointer shadow-xs"
          >
            {isTestingTelegram ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Test Gönderiliyor...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Telegram Test Bildirimi Gönder</span>
              </>
            )}
          </button>

          {telegramStatusMsg && (
            <span className={`text-xs font-semibold ${telegramStatusMsg.includes('başarıyla') ? 'text-emerald-700' : 'text-rose-700'}`}>
              {telegramStatusMsg}
            </span>
          )}
        </div>
      </div>

      {/* 4. Daily Sales Report Bulletin */}
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-5">
        <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-1">
              Satış Muhasebe Özeti
            </span>
            <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-amber-700" />
              <span>Günlük Satış Durum Raporu (E-Posta Bülteni)</span>
            </h3>
          </div>
          <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-semibold">
            Her Sabah 09:00 Otomatik
          </span>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Her sabah bir önceki günün toplam satış adedi, toplam cirosu, ödeme dağılımı (Kredi Kartı / Havale) ve sipariş listesi admin e-posta adresinize (<code>{contactInfo.email || 'admin@ermaymobilya.com'}</code>) otomatik HTML bülten olarak iletilir. İsterseniz aşağıdaki butonla dünün raporunu anında talep edebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={handleSendDailyReport}
            disabled={isSendingReport}
            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400 text-white text-xs font-bold uppercase py-2.5 px-5 rounded transition-colors cursor-pointer shadow-xs"
          >
            {isSendingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Rapor Gönderiliyor...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                <span>Günlük Satış Raporunu E-Postama Gönder</span>
              </>
            )}
          </button>

          {reportStatusMsg && (
            <span className={`text-xs font-semibold ${reportStatusMsg.includes('gönderildi') ? 'text-emerald-700' : 'text-rose-700'}`}>
              {reportStatusMsg}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

