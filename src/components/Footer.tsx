'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Shield, Truck, RefreshCw, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="bg-brand-dark text-neutral-400 text-sm font-light mt-auto print:hidden">
      {/* Upper Trust Section */}
      <div className="border-b border-neutral-800 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-brand-camel flex-shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Ücretsiz Teslimat & Kurulum</h4>
              <p className="text-neutral-500 text-xs mt-1">10.000 TL üzeri tüm siparişlerde uzman ekibimiz tarafından montaj dahil ücretsiz gönderim.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-brand-camel flex-shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">2 Yıl Garanti Garantisi</h4>
              <p className="text-neutral-500 text-xs mt-1">Tüm koleksiyonlarımız üretime, mekanizmaya ve iskelet yapısına karşı 2 yıl Ermay garantisindedir.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-brand-camel flex-shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Kolay & Esnek İade</h4>
              <p className="text-neutral-500 text-xs mt-1">Ürününüzü teslim aldıktan sonraki 14 gün içerisinde koşulsuz şartsız iade talebi oluşturabilirsiniz.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-brand-camel flex-shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Güvenli Virtual POS Altyapısı</h4>
              <p className="text-neutral-500 text-xs mt-1">128-bit SSL şifreleme ve 3D Secure güvencesiyle tüm kredi kartlarına vade farksız taksit.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Links and Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand details */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-white text-lg font-bold tracking-[0.25em] uppercase">
            Ermay <span className="font-light text-brand-camel">Mobilya</span>
          </h3>
          <p className="text-neutral-500 text-xs md:text-sm leading-relaxed max-w-sm">
            Ermay Mobilya, modern ve lüks yaşam alanları için özenle tasarlanmış, doğal ahşap ve el işçiliğini ön planda tutan zamansız tasarımlar üretir.
          </p>
          <div className="space-y-2 text-xs md:text-sm">
            <p><strong>Merkez Mağaza:</strong> Modoko Mobilyacılar Sitesi, No: 42, Ümraniye / İstanbul</p>
            <p><strong>Telefon:</strong> +90 (216) 555 42 42</p>
            <p><strong>E-posta:</strong> info@ermaymobilya.com</p>
          </div>
        </div>

        {/* Categories column */}
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-6">Koleksiyonlar</h4>
          <ul className="space-y-3.5 text-xs md:text-sm">
            <li><Link href="/kategori/oturma-odasi" className="hover:text-brand-camel transition-colors">Oturma Odası</Link></li>
            <li><Link href="/kategori/yemek-odasi" className="hover:text-brand-camel transition-colors">Yemek Odası</Link></li>
            <li><Link href="/kategori/yatak-odasi" className="hover:text-brand-camel transition-colors">Yatak Odası</Link></li>
            <li><Link href="/kategori/aksesuar" className="hover:text-brand-camel transition-colors">Aksesuar & Aydınlatma</Link></li>
            <li><Link href="/indirimler" className="hover:text-brand-camel transition-colors">İndirimli Ürünler</Link></li>
          </ul>
        </div>

        {/* Corporate column */}
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-6">Kurumsal</h4>
          <ul className="space-y-3.5 text-xs md:text-sm">
            <li><Link href="/kurumsal" className="hover:text-brand-camel transition-colors">Hakkımızda</Link></li>
            <li><Link href="/bayiler" className="hover:text-brand-camel transition-colors">Mağazalar & Bayiler</Link></li>
            <li><Link href="/katalog" className="hover:text-brand-camel transition-colors">2026 Koleksiyon Kataloğu</Link></li>
            <li><Link href="/iletisim" className="hover:text-brand-camel transition-colors">İletişim & Sipariş</Link></li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div className="space-y-6">
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-2">E-Bülten Üyeliği</h4>
          <p className="text-neutral-500 text-xs leading-relaxed">
            Yeni çıkan koleksiyonlar, özel indirimler ve tasarım önerilerinden ilk siz haberdar olun.
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
              className="bg-transparent border-none text-xs text-white placeholder-neutral-600 focus:outline-none w-full pr-2"
            />
            <button 
              type="submit" 
              className="text-neutral-500 hover:text-brand-camel transition-colors p-1 cursor-pointer"
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
