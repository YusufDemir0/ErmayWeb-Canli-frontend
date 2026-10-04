'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';
import { useWhatsappNumber } from '../lib/whatsapp';

/** "905324194151" -> "+90 532 419 41 51" (tanınmayan biçimler olduğu gibi döner) */
function formatTrPhone(digits: string): string {
  const m = digits.match(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+90 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : digits;
}

export const Footer: React.FC = () => {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const currentYear = new Date().getFullYear();
  const contactInfo = useCMSStore((state) => state.contactInfo);
  const socialLinks = useCMSStore((state) => state.socialLinks);
  const categories = useCMSStore((state) => state.categories);

  const assurances = [
    { title: 'Teslimat ve montaj', text: 'Kata taşıma ve kurulum kendi ustalarımız tarafından yapılır.' },
    { title: 'Atölye imalatı', text: 'Modoko’daki atölyemizde standart seriler halinde üretilir.' },
    { title: '2 yıl imalat garantisi', text: 'Mekanizmalar, raylar ve iskelet yapısı 2 yıl garantilidir.' },
    { title: 'Resmi hesap', text: 'Ödemeler yalnız şirketimizin resmi IBAN hesabına veya showroom’da alınır.' },
  ];

  return (
    <footer id="main-footer" className="bg-ink text-neutral-300 text-sm mt-auto print:hidden">
      {/* Güvenceler */}
      <div className="border-b border-neutral-800">
        <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assurances.map((item, idx) => (
            <li key={item.title} className="grid grid-cols-[2rem_1fr] gap-2">
              <span className="font-mono text-xs text-wood-light pt-0.5 tabular-nums-all">{String(idx + 1).padStart(2, '0')}</span>
              <div>
                <h4 className="text-white text-sm font-semibold">{item.title}</h4>
                <p className="text-neutral-400 text-xs mt-1 leading-relaxed">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Bağlantılar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-white text-xl font-display font-extrabold tracking-tight">
              ERMAY <span className="font-medium text-neutral-400 text-base">Mobilya</span>
            </h3>
            <p className="text-wood-light text-xs mt-1">Modoko · Ümraniye atölyesi</p>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
            Atölyemizde ürettiğimiz ofis mobilyalarını aracısız, doğrudan size ulaştırıyoruz.
          </p>
          <dl className="space-y-1.5 text-xs text-neutral-300">
            <div><dt className="inline text-neutral-400">Showroom: </dt><dd className="inline">{contactInfo?.address || 'Modoko Mobilyacılar Sitesi 1. Cadde No: 42, Ümraniye / İstanbul'}</dd></div>
            <div>
              <dt className="inline text-neutral-400">WhatsApp: </dt>
              <dd className="inline">
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-white underline-offset-2 hover:underline font-mono">
                  {formatTrPhone(waNumber)}
                </a>
              </dd>
            </div>
            <div><dt className="inline text-neutral-400">E-posta: </dt><dd className="inline">{contactInfo?.email || 'info@ermaymobilya.com'}</dd></div>
          </dl>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Katalog</h4>
          <ul className="space-y-2.5 text-sm text-neutral-300">
            {categories && categories.length > 0 ? (
              categories.filter((cat) => !cat.parentId).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/kategori/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/kategori/makam-takimlari" className="hover:text-white transition-colors">Makam Takımları</Link></li>
                <li><Link href="/kategori/toplanti-masasi-modelleri" className="hover:text-white transition-colors">Toplantı Masaları</Link></li>
                <li><Link href="/kategori/koltuk-takimlari" className="hover:text-white transition-colors">Ofis Koltukları</Link></li>
              </>
            )}
            <li><Link href="/katalog" className="text-wood-light hover:text-white transition-colors">Fiyatlı katalog →</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Kurumsal</h4>
          <ul className="space-y-2.5 text-sm text-neutral-300">
            <li><Link href="/kurumsal" className="hover:text-white transition-colors">Hakkımızda</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="/bayiler" className="hover:text-white transition-colors">Showroomlar</Link></li>
            <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim ve ulaşım</Link></li>
            <li><Link href="/kurumsal#kvkk" className="hover:text-white transition-colors">KVKK aydınlatma metni</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-white text-sm font-semibold">Teklif ve destek</h4>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Adetli alım teklifi, teslimat veya mevcut talebiniz için temsilcimize WhatsApp’tan yazabilirsiniz.
          </p>
          <a
            href={`https://wa.me/${waNumber}?text=Merhaba%2C%20Ermay%20Mobilya%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xs transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp’tan yazın</span>
          </a>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div>© {currentYear} Ermay Mobilya San. Tic. Ltd. Şti.</div>
          <div>Fiyatlı katalog ve sipariş talebi platformu · Online ödeme alınmaz</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
