'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Printer, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCMSStore } from '../../stores/useCMSStore';
import { contactFormSchema } from '../../lib/validations';

export default function IletisimPage() {
  const contactInfo = useCMSStore((state) => state.contactInfo);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Özel İmalat & Mobilya Talebi',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const valRes = contactFormSchema.safeParse({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
    });

    if (!valRes.success) {
      setErrorMsg(valRes.error.issues[0]?.message || 'Lütfen bilgilerinizi kontrol ediniz.');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', subject: 'Özel İmalat & Mobilya Talebi', message: '' });
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="w-full bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="text-xs text-neutral-400 font-light flex items-center gap-2 mb-8">
          <Link href="/" className="hover:text-brand-camel transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-600 font-normal">İletişim</span>
        </nav>

        {/* Light Hero Header */}
        <div className="bg-white text-neutral-900 rounded-sm p-8 md:p-12 mb-12 border border-neutral-200 shadow-sm text-center">
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase mb-2 text-neutral-900">
            İLETİŞİM
          </h1>
          <p className="text-xs text-neutral-500 font-light tracking-wider">
            Anasayfa ■ İletişim
          </p>
        </div>

        {/* Main 2-Column Contact Grid (Crisp White & Cream Light Theme) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white text-neutral-800 p-6 md:p-8 rounded-sm shadow-sm border border-neutral-200">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-6 border-b border-neutral-100 pb-3">
              Bize Ulaşın / Mesaj Gönderin
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-xs text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900 uppercase">Mesajınız Alındı</h3>
                <p className="text-xs text-emerald-700 font-light">
                  Müşteri temsilcilerimiz en kısa sürede sizinle iletişime geçecektir.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Adınız / Soyadınız
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[0-9]/g, '') })}
                    placeholder="Adınız Soyadınız"
                    className="w-full bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs p-3 rounded-xs focus:bg-white focus:ring-1 focus:ring-brand-camel focus:border-brand-camel focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      E-Posta Adresiniz
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ornek@domain.com"
                      className="w-full bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs p-3 rounded-xs focus:bg-white focus:ring-1 focus:ring-brand-camel focus:border-brand-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Telefon Numaranız
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0532 000 00 00"
                      className="w-full bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs p-3 rounded-xs focus:bg-white focus:ring-1 focus:ring-brand-camel focus:border-brand-camel focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    İletişim / Talep Konusu
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs p-3 rounded-xs focus:bg-white focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none"
                  >
                    <option value="Özel İmalat & Mobilya Talebi">Özel İmalat & Mobilya Talebi</option>
                    <option value="Sipariş & Teslimat Durumu">Sipariş & Teslimat Durumu</option>
                    <option value="Kurumsal Proje & Toplu Alım">Kurumsal Proje & Toplu Alım</option>
                    <option value="Bayilik & Satış Noktası Başvurusu">Bayilik & Satış Noktası Başvurusu</option>
                    <option value="Diğer Talepler">Diğer Talepler</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Mesajınız
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Mobilya talebiniz, ölçü detayları veya sorunuz..."
                    className="w-full bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs p-3 rounded-xs focus:bg-white focus:ring-1 focus:ring-brand-camel focus:border-brand-camel focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-dark hover:bg-brand-camel text-white font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>GÖNDER</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Clean White Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Telefon Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-sm border border-neutral-200 flex items-start gap-4 shadow-xs">
              <div className="p-3 bg-brand-camel/10 border border-brand-camel/30 rounded-sm text-brand-camel flex-shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Telefon</h3>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{contactInfo.phone}</p>
              </div>
            </div>

            {/* Fax Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-sm border border-neutral-200 flex items-start gap-4 shadow-xs">
              <div className="p-3 bg-brand-camel/10 border border-brand-camel/30 rounded-sm text-brand-camel flex-shrink-0">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Fax</h3>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{contactInfo.fax}</p>
              </div>
            </div>

            {/* E-Posta Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-sm border border-neutral-200 flex items-start gap-4 shadow-xs">
              <div className="p-3 bg-brand-camel/10 border border-brand-camel/30 rounded-sm text-brand-camel flex-shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">E-Posta</h3>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{contactInfo.email}</p>
              </div>
            </div>

            {/* Adres Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-sm border border-neutral-200 flex items-start gap-4 shadow-xs">
              <div className="p-3 bg-brand-camel/10 border border-brand-camel/30 rounded-sm text-brand-camel flex-shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Adres</h3>
                <p className="text-xs font-light text-neutral-700 mt-1 leading-relaxed">{contactInfo.address}</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
