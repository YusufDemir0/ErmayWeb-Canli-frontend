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

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  NEW: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  CONTACTED: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  STORE_VISIT_SCHEDULED: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  AWAITING_PAYMENT: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  PAID_OFFLINE: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  SPAM: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200' },
  EXPIRED: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200' },
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
      <div className="w-full bg-neutral-50 min-h-screen py-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-camel mx-auto" />
          <p className="text-xs text-neutral-500 font-light">Dijital talep fişiniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-neutral-200/80 rounded-sm p-8 shadow-sm">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-lg font-normal text-neutral-800 mb-2">Fiş Bulunamadı</h2>
            <p className="text-xs text-neutral-500 font-light mb-6">
              {error || 'Aradığınız sipariş talebi mevcut değil veya bağlantı süresi dolmuş.'}
            </p>
            <Link
              href="/"
              className="inline-block bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold px-6 py-3 rounded-xs uppercase tracking-wider transition-colors"
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

  const statusStyle = STATUS_COLORS[receipt.status] || STATUS_COLORS.NEW;

  return (
    <div className="w-full bg-neutral-50 min-h-screen py-10 md:py-16 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Top Navigation & Print Button */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-brand-dark flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-700 hover:text-brand-camel bg-white border border-neutral-200 px-4 py-2 rounded-xs shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Fişi Yazdır</span>
          </button>
        </div>

        {/* Main Receipt Container */}
        <div className="bg-white border border-neutral-200/80 rounded-sm shadow-sm overflow-hidden print:border-none print:shadow-none">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-camel">
                  Ermay Mobilya • Dijital Sipariş Fişi
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-neutral-900">
                    {receipt.code}
                  </h1>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-brand-dark bg-white border border-neutral-200 px-2 py-1 rounded-xs transition-colors cursor-pointer print:hidden"
                    title="Kodu Kopyala"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-400 font-light mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(receipt.createdAt)}</span>
                </p>
              </div>

              {/* Status Badge */}
              <div className="sm:text-right">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {receipt.statusLabel}
                </span>
                <p className="text-[11px] text-neutral-400 font-light mt-1.5">
                  {receipt.preference === 'WHATSAPP' ? 'İletişim: WhatsApp' : 'İletişim: Mağaza Ziyareti'}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Location Summary (Masked) */}
          <div className="p-6 sm:p-8 border-b border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Müşteri Bilgisi (Maskeli)
              </span>
              <p className="text-sm font-medium text-neutral-800">{receipt.maskedName}</p>
              <p className="text-neutral-500 font-mono mt-0.5">{receipt.maskedPhone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Teslimat Bölgesi
              </span>
              <p className="text-sm font-medium text-neutral-800">
                {receipt.city}{receipt.district ? ` / ${receipt.district}` : ''}
              </p>
              <p className="text-neutral-400 font-light mt-0.5">Türkiye</p>
            </div>
          </div>

          {/* Action CTA Banner depending on Preference */}
          <div className="p-6 sm:p-8 bg-neutral-50/70 border-b border-neutral-100 print:hidden">
            {receipt.preference === 'WHATSAPP' ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-emerald-50/60 border border-emerald-200/80 p-6 rounded-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950">
                      WhatsApp Satış Temsilcisine Bağlanın
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-800 font-light leading-relaxed max-w-lg">
                    Talebiniz kayıt altına alınmıştır. Teslimat tarihi, montaj randevusu ve şirket fatura bilgisi teyidi için doğrudan temsilcimizle görüşebilirsiniz.
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-3.5 rounded-sm uppercase tracking-wider transition-colors shadow-xs"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp'tan Yaz</span>
                </a>
              </div>
            ) : (
              <div className="bg-sky-50/60 border border-sky-200/80 p-6 rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="h-5 w-5 text-sky-700" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-sky-950">
                      Showroom Ziyaretiniz İçin Bilgiler
                    </h3>
                  </div>
                  {receipt.preferredStore?.phone && (
                    <a
                      href={`tel:${receipt.preferredStore.phone}`}
                      className="text-xs font-medium text-sky-800 hover:text-sky-950 underline flex items-center gap-1"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{receipt.preferredStore.phone}</span>
                    </a>
                  )}
                </div>

                {receipt.preferredStore ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-sky-900 pt-2">
                    <div>
                      <p className="font-semibold text-neutral-800">{receipt.preferredStore.name}</p>
                      <p className="text-neutral-600 font-light mt-1 flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
                        <span>{receipt.preferredStore.address}</span>
                      </p>
                      {receipt.preferredStore.hours && (
                        <p className="text-neutral-500 font-light mt-2 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-sky-600 flex-shrink-0" />
                          <span>Çalışma Saatleri: {receipt.preferredStore.hours}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col justify-end gap-2 sm:items-end">
                      {receipt.preferredStore.mapUrl && (
                        <a
                          href={receipt.preferredStore.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-4 py-2.5 rounded-xs transition-colors shadow-xs"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Google Maps'te Aç</span>
                        </a>
                      )}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Ziyaret Saatini WhatsApp ile Bildir</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-600 font-light">
                    Temsilcimiz showroom ziyareti saatinizi teyit etmek için sizinle iletişime geçecektir.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Talep Edilen Ürünler ({receipt.items.length} Kalem)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Ürün Bilgisi</th>
                    <th className="py-2.5 font-bold text-center">Adet</th>
                    <th className="py-2.5 font-bold text-right">Birim Fiyat</th>
                    <th className="py-2.5 font-bold text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {receipt.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <p className="font-medium text-neutral-800">{item.productName}</p>
                        {item.colorLabel && (
                          <span className="inline-block mt-0.5 text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-xs">
                            {item.colorLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-center text-neutral-700 font-medium">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 text-right text-neutral-600 font-mono">
                        {formatPrice(item.unitPrice)}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-neutral-900 font-mono">
                        {formatPrice(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Footer */}
            <div className="mt-6 pt-6 border-t border-neutral-200/80 flex flex-col items-end space-y-2 text-xs">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-neutral-600 font-light">
                  <span>Katalog Ara Toplam:</span>
                  <span className="font-mono text-neutral-800">{formatPrice(receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 font-light">
                  <span>KDV (%20):</span>
                  <span className="text-neutral-800">Dahil</span>
                </div>
                <div className="flex justify-between text-neutral-600 font-light">
                  <span>Nakliye & Kurulum:</span>
                  <span className="text-neutral-800 font-medium">Temsilciyle Netleştirilir</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-200 text-sm font-bold text-neutral-900">
                  <span>Tahmini Tutar:</span>
                  <span className="font-mono text-brand-terracotta">{formatPrice(receipt.subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Bank Account and Security Notice */}
          <div className="p-6 sm:p-8 bg-neutral-50/80 border-t border-neutral-100 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                  Resmi Şirket Hesabı ve Güvenlik Bildirimi
                </h4>
                <p className="text-neutral-600 font-light leading-relaxed">
                  {receipt.officialIbanNotice}
                </p>
                <p className="text-[11px] text-neutral-500 font-light pt-1">
                  Ermay Mobilya personeli veya satış temsilcileri şahsi banka hesaplarına asla para transferi kabul etmemektedir.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer help text */}
        <div className="text-center mt-8 text-xs text-neutral-400 font-light print:hidden">
          <p>
            Her türlü soru ve talebiniz için{' '}
            <a href={`tel:${whatsappNumber}`} className="text-brand-camel underline hover:text-brand-dark">
              Showroom Danışma Hattı
            </a>
            'nı arayabilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
