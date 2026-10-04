'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { isAxiosError } from 'axios';
import { contactFormSchema } from '../../lib/validations';
import apiClient from '../../services/api';

export default function ContactFormClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Özel İmalat & Mobilya Talebi',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Bot tuzağı (honeypot): gerçek kullanıcılar bu alanı görmez ve doldurmaz
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await apiClient.post('/contact', { ...valRes.data, website });
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: 'Özel İmalat & Mobilya Talebi', message: '' });
        setSubmitted(false);
      }, 4000);
    } catch (err) {
      const serverMsg = isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined;
      setErrorMsg(serverMsg || 'Mesajınız iletilemedi. Lütfen tekrar deneyiniz veya WhatsApp hattımızdan bize ulaşınız.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-neutral-800 p-6 md:p-8 rounded-xs border border-line">
      <h2 className="text-sm font-bold text-neutral-900 mb-6 border-b border-line pb-3">
        Bize Ulaşın / Mesaj Gönderin
      </h2>

      {submitted ? (
        <div className="bg-ok-soft border border-ok/25 p-6 rounded-xs text-center space-y-2 animate-fade-in">
          <CheckCircle2 className="h-10 w-10 text-ok mx-auto" />
          <h3 className="text-sm font-bold text-ok">Mesajınız Alındı</h3>
          <p className="text-xs text-ok">
            Müşteri temsilcilerimiz en kısa sürede sizinle iletişime geçecektir.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {errorMsg && (
            <div className="bg-signal/5 border border-signal/40 text-signal p-3 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">
              Adınız / Soyadınız
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[0-9]/g, '') })}
              placeholder="Adınız Soyadınız"
              className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 block mb-1">
                E-Posta Adresiniz
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ornek@domain.com"
                className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 block mb-1">
                Telefon Numaranız
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0532 000 00 00"
                className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">
              İletişim / Talep Konusu
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
            >
              <option value="Özel İmalat & Mobilya Talebi">Özel İmalat & Mobilya Talebi</option>
              <option value="Sipariş & Teslimat Durumu">Sipariş & Teslimat Durumu</option>
              <option value="Kurumsal Proje & Toplu Alım">Kurumsal Proje & Toplu Alım</option>
              <option value="Bayilik & Satış Noktası Başvurusu">Bayilik & Satış Noktası Başvurusu</option>
              <option value="Diğer Talepler">Diğer Talepler</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">
              Mesajınız
            </label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Mobilya talebiniz, ölçü detayları veya sorunuz..."
              className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none resize-none"
            />
          </div>

          <div aria-hidden="true" className="absolute -left-[10000px] h-0 w-0 overflow-hidden">
            <label>
              Web siteniz
              <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-ink hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 px-8 rounded-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'GÖNDERİLİYOR...' : 'GÖNDER'}</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}
