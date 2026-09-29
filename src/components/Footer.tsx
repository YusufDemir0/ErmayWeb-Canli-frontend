'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Sparkles, MessageSquare, Phone, MapPin } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const contactInfo = useCMSStore((state) => state.contactInfo);
  const socialLinks = useCMSStore((state) => state.socialLinks);
  const categories = useCMSStore((state) => state.categories);

  return (
    <footer id="main-footer" className="bg-[#1C1815] text-neutral-400 text-sm font-light mt-auto print:hidden">
      {/* Upper Trust Section */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-amber-500 flex-shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Uzman Montaj & Teslimat</h4>
              <p className="text-neutral-400 text-xs mt-1">Kata taşıma ve montaj hizmeti kendi tecrübeli ustalarımız tarafından sağlanır.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-amber-500 flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Modoko Atölye İmalatı</h4>
              <p className="text-neutral-400 text-xs mt-1">Fırınlanmış gürgen iskelet ve birinci sınıf döşemelik kumaşlar kullanılır.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-amber-500 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">2 Yıl İmalat Garantisi</h4>
              <p className="text-neutral-400 text-xs mt-1">Mekanizmalar, raylar ve masif iskelet yapısı 2 yıl atölye güvencemizdedir.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-amber-500 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Resmi Hesap & Showroom</h4>
              <p className="text-neutral-400 text-xs mt-1">Ödemeler yalnızca şirketimizin resmi IBAN hesabına veya showroom'da kabul edilir.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand details */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h3 className="text-white text-xl font-serif font-black tracking-wider uppercase">
              ERMAY <span className="font-light text-amber-500 text-base">MOBİLYA</span>
            </h3>
            <p className="text-amber-500/90 text-[11px] font-semibold tracking-widest uppercase mt-0.5">
              Modoko Ahşap & Döşeme İmalatı
            </p>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-sm font-normal">
            Aracı olmadan, kendi atölyemizde ürettiğimiz masif ahşap ve modern mobilyaları doğrudan evinize ulaştırıyoruz.
          </p>
          <div className="space-y-1.5 text-xs text-neutral-300">
            <p><strong>Merkez Showroom:</strong> {contactInfo?.address || 'Modoko Mobilyacılar Sitesi 3. Cadde No: 126, Ümraniye / İstanbul'}</p>
            <p><strong>Danışma / WhatsApp:</strong> {socialLinks?.whatsapp || contactInfo?.phone || '+90 532 419 41 51'}</p>
            <p><strong>E-Posta:</strong> {contactInfo?.email || 'bilgi@ermaymobilya.com'}</p>
          </div>
        </div>

        {/* Categories column */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Katalog</h4>
          <ul className="space-y-2.5 text-xs text-neutral-300">
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/kategori/${cat.slug}`} className="hover:text-amber-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/kategori/makam-takimlari" className="hover:text-amber-400 transition-colors">Makam Takımları</Link></li>
                <li><Link href="/kategori/toplanti-masasi-modelleri" className="hover:text-amber-400 transition-colors">Toplantı Masaları</Link></li>
                <li><Link href="/kategori/koltuk-takimlari" className="hover:text-amber-400 transition-colors">Ofis Koltukları</Link></li>
              </>
            )}
            <li><Link href="/katalog" className="hover:text-amber-400 transition-colors font-semibold text-amber-500">Tüm Koleksiyon →</Link></li>
          </ul>
        </div>

        {/* Corporate column */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Kurumsal & Yasal</h4>
          <ul className="space-y-2.5 text-xs text-neutral-300">
            <li><Link href="/kurumsal" className="hover:text-amber-400 transition-colors">Hakkımızda & İmalat</Link></li>
            <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Blog & Mimari Rehber</Link></li>
            <li><Link href="/bayiler" className="hover:text-amber-400 transition-colors">Showroomlarımız & Bayiler</Link></li>
            <li><Link href="/iletisim" className="hover:text-amber-400 transition-colors">İletişim & Fabrika Ulaşım</Link></li>
            <li><Link href="/kurumsal#kvkk" className="hover:text-amber-400 transition-colors text-amber-500/90 font-medium">KVKK Aydınlatma Metni</Link></li>
          </ul>
        </div>

        {/* Direct WhatsApp Consultation CTA */}
        <div className="space-y-4">
          <h4 className="text-white text-xs font-bold uppercase tracking-widest">Danışma & Destek</h4>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Toplu alım teklifleri, fabrika teslimatı veya sipariş talepleriniz için temsilcimizle WhatsApp üzerinden doğrudan iletişime geçebilirsiniz.
          </p>
          <a
            href={`https://wa.me/${(socialLinks?.whatsapp || '+905324194151').replace(/[^0-9]/g, '')}?text=Merhaba%2C%20Ermay%20Mobilya%20koleksiyonlar%C4%B1%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp Danışma Hattı</span>
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800 py-6 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-500">
            © {currentYear} Ermay Mobilya San. Tic. Ltd. Şti. Tüm Hakları Saklıdır.
          </div>
          
          <div className="text-[11px] text-neutral-500">
            <span>Fiyatlı Katalog & Sipariş Talebi Platformu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
