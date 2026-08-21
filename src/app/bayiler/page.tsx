'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Store, ExternalLink } from 'lucide-react';
import { useCMSStore } from '../../stores/useCMSStore';

export default function BayilerPage() {
  const stores = useCMSStore((state) => state.stores) || [];
  const activeStores = stores.filter((s) => s.isActive !== false);

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="text-xs text-neutral-400 font-light flex items-center gap-2 mb-8">
          <Link href="/" className="hover:text-[#C5A880] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-600 font-normal">Kurumsal</span>
          <span>/</span>
          <span className="text-[#C5A880] font-semibold">Satış Noktaları & Mağazalarımız</span>
        </nav>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block mb-2">
            DOĞRUDAN ÜRETİCİDEN & FABRİKA SATIŞ AĞI
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 tracking-tight uppercase">
            Satış Noktaları & Mağazalarımız
          </h1>
          <p className="text-neutral-600 font-light text-xs md:text-sm mt-3 leading-relaxed">
            Koleksiyonlarımızı yakından incelemek, masif iskelet sağlamlığını, sünger konforunu ve lüks döşeme kartelalarını deneyimlemek için mağazalarımıza davetlisiniz.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-white text-neutral-900 rounded-sm p-8 mb-12 border border-[#EAE3D2] shadow-xs text-center">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[#C5A880] mb-2">
            TÜRKİYE GENELİ KURUMSAL SATIŞ & BAYİLİK
          </h2>
          <p className="text-xs text-neutral-600 font-light max-w-xl mx-auto leading-relaxed">
            Mevcut mağazalarımızın yanı sıra Türkiye geneli yeni bayilik başvuruları ve toplu kurumsal mobilya alımları için uzman satış temsilcilerimizle iletişime geçebilirsiniz.
          </p>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {activeStores.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-[#EAE3D2] rounded-sm overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                  <img
                    src={store.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#FAF8F5] text-neutral-900 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-xs shadow-xs border border-[#EAE3D2]">
                    {store.city} {store.district ? `/ ${store.district}` : ''}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    {store.name}
                  </h3>

                  <div className="space-y-3 text-xs text-neutral-600">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{store.address}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="font-semibold text-neutral-800 font-mono hover:text-[#C5A880] transition-colors">
                        {store.phone}
                      </a>
                    </div>

                    {store.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                        <a href={`mailto:${store.email}`} className="text-neutral-600 hover:text-neutral-900 transition-colors">
                          {store.email}
                        </a>
                      </div>
                    )}

                    {store.hours && (
                      <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                        <Clock className="h-4 w-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
                        <span>{store.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {store.mapUrl && (
                <div className="p-6 pt-0">
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#8A4B20] text-xs font-bold rounded-xs border border-[#EAE3D2] transition-colors"
                  >
                    <span>Google Haritalarda Aç</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dealership Application CTA */}
        <div className="bg-white border border-[#EAE3D2] rounded-sm p-8 md:p-12 text-center max-w-2xl mx-auto shadow-2xs">
          <Store className="h-10 w-10 text-[#C5A880] mx-auto mb-3" />
          <h4 className="text-base font-bold text-neutral-900 uppercase tracking-wider mb-2">
            Ermay Mobilya Bayisi Olmak İster Misiniz?
          </h4>
          <p className="text-xs text-neutral-600 font-light mb-6 leading-relaxed">
            Doğrudan fabrika imalatı kaliteli ofis ve yaşam mobilyalarımızı şehrinizde müşterilerinizle buluşturmak için bayilik koşullarımızı inceleyin.
          </p>
          <Link
            href="/iletisim"
            className="inline-block bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded-xs transition-colors shadow-xs"
          >
            Bayilik & İletişim Talebi
          </Link>
        </div>

      </div>
    </div>
  );
}
