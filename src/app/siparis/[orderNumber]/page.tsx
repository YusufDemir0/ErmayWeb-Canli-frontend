'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageSquare, ArrowLeft } from 'lucide-react';

export default function OrderTrackingPage() {
  return (
    <div className="w-full bg-neutral-50 min-h-screen py-20 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="bg-white border border-neutral-200/80 rounded-sm p-8 sm:p-10 shadow-sm space-y-4">
          <ShieldCheck className="h-12 w-12 text-brand-camel mx-auto" />
          <h1 className="text-lg font-normal text-neutral-800 uppercase tracking-wide">
            Gizlilik ve Güvenlik Bilgilendirmesi
          </h1>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            Kişisel verilerin korunması ve sipariş gizliliği gereği genel numara ile sorgulama kapatılmıştır. Sipariş talebinizi size özel oluşturulan <strong>Dijital Fiş</strong> bağlantınız üzerinden veya WhatsApp müşteri temsilcimizden takip edebilirsiniz.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold px-5 py-3 rounded-xs uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Ana Sayfa</span>
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold px-5 py-3 rounded-xs uppercase tracking-wider transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Müşteri Hizmetleri</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
