'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Store as StoreIcon, 
  MapPin, 
  Phone, 
  Printer, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { requestService, PublicReceiptDto } from '../../../services/requestService';
import { cmsService } from '../../../services/cmsService';

// Durum çizgisi, backend'deki geçiş haritasının (orderStateMachine.service.ts) mutlu yolunu gösterir; yeni durum üretmez.
const STEP_LABELS: Record<string, string> = {
  NEW: 'Talep alındı',
  CONTACTED: 'Temsilci iletişime geçti',
  STORE_VISIT_SCHEDULED: 'Mağaza ziyareti planlandı',
  AWAITING_PAYMENT: 'Ödeme bekleniyor',
  PAID_OFFLINE: 'Ödeme teyit edildi',
  COMPLETED: 'Sipariş tamamlandı',
};
const TERMINAL_OFF_PATH = ['CANCELLED', 'SPAM', 'EXPIRED'];

function getStatusSteps(status: string, preference: string): string[] {
  const includeVisit = preference === 'STORE_VISIT' || status === 'STORE_VISIT_SCHEDULED';
  return ['NEW', 'CONTACTED', ...(includeVisit ? ['STORE_VISIT_SCHEDULED'] : []), 'AWAITING_PAYMENT', 'PAID_OFFLINE', 'COMPLETED'];
}

const StatusTimeline: React.FC<{ status: string; preference: string }> = ({ status, preference }) => {
  const steps = getStatusSteps(status, preference);
  const currentIdx = status === 'COMPLETED' ? steps.length - 1 : steps.indexOf(status);
  return (
    <ol className="grid gap-0 sm:grid-flow-col sm:auto-cols-fr">
      {steps.map((step, idx) => {
        const done = idx < currentIdx || status === 'COMPLETED';
        const current = idx === currentIdx && status !== 'COMPLETED';
        return (
          <li key={step} className="relative flex sm:flex-col gap-3 sm:gap-2 pb-4 sm:pb-0 sm:pr-3" aria-current={current ? 'step' : undefined}>
            {idx < steps.length - 1 && (
              <span
                className={`absolute left-[9px] top-5 bottom-0 w-px sm:left-5 sm:right-0 sm:top-[9px] sm:bottom-auto sm:h-px sm:w-auto ${done ? 'bg-ink' : 'bg-line-strong'}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 h-[19px] w-[19px] shrink-0 rounded-full border-2 flex items-center justify-center ${
                done ? 'bg-ink border-ink text-white' : current ? 'bg-white border-wood' : 'bg-white border-line-strong'
              }`}
            >
              {done && <Check className="h-3 w-3" strokeWidth={3} />}
              {current && <span className="h-2 w-2 rounded-full bg-wood" />}
            </span>
            <span className={`text-sm leading-snug ${current ? 'font-semibold text-ink' : done ? 'text-neutral-700' : 'text-neutral-500'}`}>
              {STEP_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default function PublicReceiptPage() {
  const params = useParams();
  const token = params?.token as string;

  const [receipt, setReceipt] = useState<PublicReceiptDto | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('905324194151');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReceipt() {
      if (!token) return;
      setIsLoading(true);
      setError(null);

      try {
        const [receiptData, contactData] = await Promise.allSettled([
          requestService.getPublicReceipt(token),
          cmsService.getContactConfig(),
        ]);

        if (isMounted) {
          if (receiptData.status === 'fulfilled') {
            setReceipt(receiptData.value);
          } else {
            setError('Talep bulunamadı veya fiş bağlantısı geçersiz.');
          }

          if (contactData.status === 'fulfilled' && contactData.value.whatsapp) {
            const clean = contactData.value.whatsapp.replace(/[^0-9]/g, '');
            if (clean.length >= 10) {
              setWhatsappNumber(clean.startsWith('90') ? clean : `90${clean}`);
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Talep bilgisi yüklenemedi.';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReceipt();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleCopyCode = () => {
    if (!receipt?.code) return;
    navigator.clipboard.writeText(receipt.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price).replace('TRY', 'TL');
  };

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-canvas min-h-screen py-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-wood mx-auto" />
          <p className="text-xs text-neutral-500">Dijital talep fişiniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="w-full bg-canvas min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-line rounded-xs p-8">
            <AlertCircle className="h-12 w-12 text-signal mx-auto mb-4" />
            <h2 className="text-lg font-normal text-neutral-800 mb-2">Fiş Bulunamadı</h2>
            <p className="text-xs text-neutral-500 mb-6">
              {error || 'Aradığınız sipariş talebi mevcut değil veya bağlantı süresi dolmuş.'}
            </p>
            <Link
              href="/"
              className="inline-block bg-ink hover:bg-neutral-800 text-white text-sm font-semibold px-6 py-3 rounded-xs transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Construct dynamic WhatsApp message URL
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ermaymobilya.com';
  const receiptUrl = `${siteUrl}/talep/${token}`;
  const whatsappMessage = `Merhaba, ${receipt.code} numaralı sipariş talebim hakkında görüşmek istiyorum.\n\nTalep Fişim:\n${receiptUrl}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;


  return (
    <div className="w-full bg-canvas min-h-screen py-10 md:py-14 print:py-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Top Navigation & Print Button */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-ink flex items-center gap-1.5 transition-colors py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ana sayfa</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:bg-paper border border-line-strong px-4 h-11 rounded-xs transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Fişi yazdır</span>
          </button>
        </div>

        {/* Main Receipt Container */}
        <div className="bg-white border border-line rounded-xs overflow-hidden print:border-none">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-line bg-paper">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-sm text-neutral-600">
                  Ermay Mobilya · Talep fişi
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <h1 className="text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-ink">
                    {receipt.code}
                  </h1>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-ink bg-white border border-line-strong px-2 h-8 rounded-xs transition-colors cursor-pointer print:hidden"
                    title="Kodu Kopyala"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-ok" />
                        <span className="text-ok font-medium">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-600 mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(receipt.createdAt)}</span>
                </p>
              </div>

              <p className="text-sm text-neutral-600 sm:text-right">
                {receipt.preference === 'WHATSAPP' ? 'İletişim: WhatsApp' : 'İletişim: mağaza ziyareti'}
              </p>
            </div>

            {/* Durum: akış çizgisi; akış dışı son durumlar (iptal, spam, süre aşımı) düz mesajla */}
            <div className="mt-6 pt-5 border-t border-line">
              <h2 className="sr-only">Talep durumu</h2>
              {TERMINAL_OFF_PATH.includes(receipt.status) ? (
                <p className="text-sm text-ink border-l-4 border-signal pl-3">
                  <strong>{receipt.statusLabel}.</strong> Sorunuz varsa temsilcimize WhatsApp&apos;tan yazabilirsiniz.
                </p>
              ) : (
                <StatusTimeline status={receipt.status} preference={receipt.preference} />
              )}
            </div>
          </div>

          {/* Customer & Location Summary (Masked) */}
          <div className="p-6 sm:p-8 border-b border-line grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white text-sm">
            <div>
              <span className="text-xs text-neutral-500 block mb-1">
                Müşteri (maskelenmiş)
              </span>
              <p className="text-sm font-medium text-ink">{receipt.maskedName}</p>
              <p className="text-neutral-500 font-mono mt-0.5">{receipt.maskedPhone}</p>
            </div>
            <div>
              <span className="text-xs text-neutral-500 block mb-1">
                Teslimat bölgesi
              </span>
              <p className="text-sm font-medium text-ink">
                {receipt.city}{receipt.district ? ` / ${receipt.district}` : ''}
              </p>
              <p className="text-neutral-500 mt-0.5">Türkiye</p>
            </div>
          </div>

          {/* Action CTA Banner depending on Preference */}
          <div className="p-6 sm:p-8 border-b border-line print:hidden">
            {receipt.preference === 'WHATSAPP' ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-wood">Sıradaki adım</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">
                      Talep kodunuzla temsilcimize yazın
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed max-w-lg">
                    Talebiniz kaydedildi. Teslimat tarihi, montaj randevusu ve fatura bilgisini temsilcimizle netleştirebilirsiniz.
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white text-sm font-semibold px-5 h-12 rounded-xs transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp’tan yazın</span>
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="h-5 w-5 text-wood" />
                    <h3 className="text-base font-semibold text-ink">
                      Showroom ziyaretiniz
                    </h3>
                  </div>
                  {receipt.preferredStore?.phone && (
                    <a
                      href={`tel:${receipt.preferredStore.phone}`}
                      className="text-sm font-mono text-ink hover:text-wood underline flex items-center gap-1"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{receipt.preferredStore.phone}</span>
                    </a>
                  )}
                </div>

                {receipt.preferredStore ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-1">
                    <div>
                      <p className="font-semibold text-ink">{receipt.preferredStore.name}</p>
                      <p className="text-neutral-600 mt-1 flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-wood flex-shrink-0 mt-0.5" />
                        <span>{receipt.preferredStore.address}</span>
                      </p>
                      {receipt.preferredStore.hours && (
                        <p className="text-neutral-500 mt-2 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-wood flex-shrink-0" />
                          <span>Çalışma saatleri: {receipt.preferredStore.hours}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col justify-end gap-2 sm:items-end">
                      {receipt.preferredStore.mapUrl && (
                        <a
                          href={receipt.preferredStore.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-ink hover:bg-neutral-800 text-white text-sm font-semibold px-4 h-11 rounded-xs transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Haritada aç</span>
                        </a>
                      )}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-whatsapp hover:text-whatsapp-dark font-medium py-2"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Ziyaret saatinizi WhatsApp’tan bildirin</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600">
                    Temsilcimiz ziyaret saatinizi teyit etmek için sizinle iletişime geçecek.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="p-6 sm:p-8">
            <h3 className="text-base font-semibold text-ink mb-3">
              Ürünler <span className="font-mono text-xs font-normal text-neutral-500">{receipt.items.length} kalem</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-neutral-500 text-xs">
                    <th className="py-2.5 font-medium">Ürün</th>
                    <th className="py-2.5 font-medium text-center">Adet</th>
                    <th className="py-2.5 font-medium text-right">Birim fiyat</th>
                    <th className="py-2.5 font-medium text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {receipt.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 pr-4">
                        <p className="font-medium text-ink">{item.productName}</p>
                        {item.colorLabel && (
                          <span className="inline-block mt-0.5 text-xs text-neutral-600">
                            {item.colorLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-center text-ink font-mono tabular-nums-all">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 text-right text-neutral-700 font-mono tabular-nums-all">
                        {formatPrice(item.unitPrice)}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-ink font-mono tabular-nums-all">
                        {formatPrice(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Footer */}
            <div className="mt-6 pt-6 border-t border-line flex flex-col items-end space-y-2 text-sm">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-neutral-600">
                  <span>Katalog ara toplamı</span>
                  <span className="font-mono text-ink tabular-nums-all">{formatPrice(receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>KDV (%20)</span>
                  <span className="text-neutral-800">Dahil</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Teslimat ve kurulum</span>
                  <span className="text-ink">Temsilciyle netleşir</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-line text-base font-semibold text-ink">
                  <span>Tahmini tutar</span>
                  <span className="font-mono tabular-nums-all">{formatPrice(receipt.subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Bank Account and Security Notice */}
          <div className="p-6 sm:p-8 bg-paper border-t border-line space-y-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-signal flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <h4 className="font-semibold text-ink">
                  Ödeme yalnız resmi şirket hesabına
                </h4>
                <p className="text-neutral-600 leading-relaxed">
                  {receipt.officialIbanNotice}
                </p>
                <p className="text-xs text-neutral-600 pt-1">
                  Ermay Mobilya personeli veya satış temsilcileri şahsi banka hesabına para kabul etmez.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer help text */}
        <div className="text-center mt-8 text-sm text-neutral-600 print:hidden">
          <p>
            Sorularınız için{' '}
            <a href={`tel:+${whatsappNumber}`} className="text-wood underline underline-offset-2 hover:text-ink">
              showroom danışma hattını
            </a>{' '}
            arayabilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
