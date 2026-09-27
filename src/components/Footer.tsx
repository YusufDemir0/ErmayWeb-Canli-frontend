'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Shield, Truck, RefreshCw, Send, MessageSquare } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';

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
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Kendi Aracımızla Teslimat</h4>
              <p className="text-neutral-400 text-xs mt-1">Marmara bölgesi başta olmak üzere tüm siparişlerde montaj dahil kendi ekibimizle adrese teslim.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-amber-500 flex-shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">2 Yıl Fabrika Garantisi</h4>
              <p className="text-neutral-400 text-xs mt-1">Fırınlanmış masif iskelet, teleskopik frenli ray ve mekanizmalar 2 yıl atölye güvencemizdedir.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-amber-500 flex-shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Esnaf Sözü & Değişim</h4>
              <p className="text-neutral-400 text-xs mt-1">Ürününüzü teslim aldığınızda kontrol edin; beğenmediğiniz veya hasarlı parçayı koşulsuz değiştiriyoruz.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-amber-500 flex-shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Güvenli Ödeme & Taksit</h4>
              <p className="text-neutral-400 text-xs mt-1">128-bit SSL ve BDDK uyumlu mobilya taksit imkanı veya kapıda nakit/POS ile güvenli ödeme.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Links and Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand details */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h3 className="text-white text-xl font-serif font-black tracking-wider uppercase">
              ERMAY <span className="font-light text-amber-500 text-base">MOBİLYA</span>
            </h3>
            <p className="text-amber-500/90 text-[11px] font-semibold tracking-widest uppercase mt-0.5">
              Modoko 40 Yıllık Ahşap İmalatçısı
            </p>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-sm font-normal">
            Aracı, komisyoncu veya gereksiz masraf olmadan; kendi atölyemizde ürettiğimiz masif ahşap ve modern mobilyaları doğrudan evinize ulaştırıyoruz.
          </p>
          <div className="space-y-1.5 text-xs text-neutral-300">
            <p><strong>Merkez Showroom:</strong> {contactInfo?.address || 'Modoko Mobilyacılar Sitesi, No: 42, Ümraniye / İstanbul'}</p>
            <p><strong>Telefon / WhatsApp:</strong> {socialLinks?.whatsapp || contactInfo?.phone || '0532 000 00 00'}</p>
            <p><strong>E-Posta:</strong> {contactInfo?.email || 'info@ermaymobilya.com'}</p>
          </div>

          {/* Social Media Links */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Bizi Takip Edin & Sipariş Verin:</span>
            <div className="flex items-center gap-2">
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-neutral-900 hover:bg-pink-600 text-neutral-300 hover:text-white rounded transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-neutral-900 hover:bg-red-600 text-neutral-300 hover:text-white rounded transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-neutral-900 hover:bg-sky-600 text-neutral-300 hover:text-white rounded transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Merhaba Ermay Mobilya, mobilyalarınız ve atölye üretiminiz hakkında bilgi almak istiyorum.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded transition-colors flex items-center gap-1.5 px-3 text-xs font-bold"
                  aria-label="WhatsApp"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Sipariş</span>
                </a>
              )}
            </div>
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
                <li><Link href="/kategori/oturma-odasi" className="hover:text-amber-400 transition-colors">Oturma Odası</Link></li>
                <li><Link href="/kategori/yemek-odasi" className="hover:text-amber-400 transition-colors">Yemek Odası</Link></li>
                <li><Link href="/kategori/yatak-odasi" className="hover:text-amber-400 transition-colors">Yatak Odası</Link></li>
              </>
            )}
            <li><Link href="/kategori/hepsi" className="hover:text-amber-400 transition-colors font-semibold text-amber-500">Tüm Ürünler →</Link></li>
          </ul>
        </div>

        {/* Corporate column */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Kurumsal & Yasal</h4>
          <ul className="space-y-2.5 text-xs text-neutral-300">
            <li><Link href="/kurumsal" className="hover:text-amber-400 transition-colors">Hakkımızda & İmalat</Link></li>
            <li><Link href="/bayiler" className="hover:text-amber-400 transition-colors">Mağazalarımız</Link></li>
            <li><Link href="/katalog" className="hover:text-amber-400 transition-colors">2026 Koleksiyon Kataloğu</Link></li>
            <li><Link href="/iletisim" className="hover:text-amber-400 transition-colors">İletişim & Ulaşım</Link></li>
            <li><Link href="/kurumsal" className="hover:text-amber-400 transition-colors text-amber-500/90 font-medium">KVKK Aydınlatma Metni</Link></li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div className="space-y-4">
          <h4 className="text-white text-xs font-bold uppercase tracking-widest">Esnaf İndirimleri</h4>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Atölyeden yeni çıkan modeller ve dönemsel fabrika indirimlerinden haberdar olun.
          </p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert('Bültene başarıyla abone olundu.');
              (e.target as HTMLFormElement).reset();
            }}
            className="flex border-b border-neutral-700 pb-1.5"
          >
            <input
              type="email"
              required
              placeholder="E-posta adresiniz"
              className="bg-transparent border-none text-xs text-white placeholder-neutral-500 focus:outline-none w-full pr-2"
            />
            <button 
              type="submit" 
              className="text-amber-500 hover:text-amber-400 transition-colors p-1 cursor-pointer"
              aria-label="Kaydol"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar with copyright and payment icons */}
      <div className="border-t border-neutral-800 py-8 bg-neutral-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-500">
            © {currentYear} Ermay Mobilya A.Ş. Tüm Hakları Saklıdır.
          </div>
          
          <div className="flex gap-4 items-center">
            <span className="text-[10px] text-neutral-600 tracking-wider">GÜVENLİ ÖDEME ALTYAPISI:</span>
            <div className="flex items-center gap-2">
              <div className="bg-neutral-800/80 px-2 py-1 rounded-sm text-[9px] font-bold text-white tracking-widest border border-neutral-700 flex items-center justify-center h-6">
                VISA
              </div>
              <div className="bg-neutral-800/80 px-2 py-1 rounded-sm text-[9px] font-bold text-white tracking-widest border border-neutral-700 flex items-center justify-center h-6">
                MC
              </div>
              <div className="bg-neutral-800/80 px-2 py-1 rounded-sm text-[9px] font-bold text-white tracking-widest border border-neutral-700 flex items-center justify-center h-6">
                TROY
              </div>
              <div className="bg-neutral-800/80 px-2 py-1 rounded-sm text-[9px] font-bold text-white tracking-widest border border-neutral-700 flex items-center justify-center h-6">
                AMEX
              </div>
              <div className="bg-neutral-800/80 px-2 py-1 rounded-sm text-[8px] font-bold text-emerald-500 tracking-widest border border-neutral-700 flex items-center justify-center h-6">
                128BIT SSL
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
