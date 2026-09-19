'use client';

import React from 'react';
import { X, ShieldCheck, Printer, CheckCircle } from 'lucide-react';

interface KvkkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const KvkkModal: React.FC<KvkkModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-sm shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#C5A880]" />
            <div>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white">
                Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni
              </h3>
              <p className="text-[10px] text-neutral-400">
                6698 Sayılı Kanun Kapsamında Müşteri Bilgilendirme ve Açık Rıza
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-xs transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>Yazdır</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-xs transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Legal Text Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-700 leading-relaxed font-light">
          <div className="bg-[#FAF8F5] p-3.5 rounded-xs border border-[#EAE3D2]">
            <strong className="text-neutral-900 block mb-1">1. Veri Sorumlusunun Kimliği</strong>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, <strong>Ermay Mobilya Sanayi ve Ticaret Ltd. Şti.</strong> (“Ermay Mobilya”) olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar doğrultusunda hukuka ve dürüstlük kurallarına uygun olarak işlemekte, saklamakta ve korumaktayız.
            </p>
          </div>

          <div>
            <strong className="text-neutral-900 block mb-1">2. İşlenen Kişisel Verileriniz</strong>
            <p className="mb-2">E-ticaret sitemiz üzerinden sunduğumuz mobilya siparişi ve teslimat hizmetleri kapsamında aşağıdaki verileriniz işlenmektedir:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. Kimlik Numarası (bireysel faturalandırma için).</li>
              <li><strong>İletişim Bilgileri:</strong> Teslimat ve fatura adresi, cep telefonu numarası, e-posta adresi.</li>
              <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, sepet içeriği, talep ve şikayet kayıtları.</li>
              <li><strong>Finans ve Ödeme Bilgileri:</strong> Fatura bilgileri, ödeme yöntemi, banka havale dekontu, maskeli kart bilgisi (PCI-DSS güvencesinde).</li>
              <li><strong>İşlem Güvenliği ve Cihaz Bilgileri:</strong> IP adresi, oturum açma kayıtları, kullanılan cihaz türü (mobil/masaüstü), tarayıcı ve işletim sistemi bilgileri (yetkisiz işlem ve sahtekarlık önleme).</li>
            </ul>
          </div>

          <div>
            <strong className="text-neutral-900 block mb-1">3. Kişisel Verilerin İşlenme Amaçları</strong>
            <p>Kişisel verileriniz;</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Web sitemiz üzerinden mobilya satın alma siparişlerinin oluşturulması ve işleme alınması,</li>
              <li>Mobilyaların atölyemizde imalatı, montajı ve kendi araçlarımızla veya kargo/lojistik firmalarıyla adrese teslim edilmesi,</li>
              <li>Yasal fatura ve muhasebe kayıtlarının Gelir İdaresi Başkanlığı standartlarında düzenlenmesi,</li>
              <li>Sipariş durumu ve teslimat süreçlerine dair SMS, e-posta veya telefon ile bilgilendirme yapılması,</li>
              <li>Yetkisiz veya şüpheli işlem tespiti (fraud prevention) ile sistem güvenliğinin temini amaçlarıyla işlenir.</li>
            </ul>
          </div>

          <div>
            <strong className="text-neutral-900 block mb-1">4. Kişisel Verilerin Aktarılması</strong>
            <p>
              Kişisel verileriniz, kanunun 8. ve 9. maddeleri gereğince yalnızca; sipariş teslimatı için anlaşmalı lojistik/kargo firmalarına, yasal zorunluluk kapsamında GİB ve adli/idari kurumlara, ödeme işlemleri için BDDK lisanslı ödeme kuruluşlarına (İyzico) ve hukuki danışmanlarımıza aktarılabilmektedir.
            </p>
          </div>

          <div>
            <strong className="text-neutral-900 block mb-1">5. İlgili Kişi Olarak Haklarınız (KVKK Madde 11)</strong>
            <p>
              KVKK’nın 11. maddesi uyarınca veri sorumlusu Ermay Mobilya’ya başvurarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme ve silinmesini talep etme haklarına sahipsiniz.
            </p>
          </div>

          <div className="text-[11px] text-neutral-500 border-t border-neutral-200 pt-3">
            <strong>İletişim & Başvuru:</strong> Modoko Mobilyacılar Sitesi 1. Cadde No: 42, Ümraniye / İstanbul • E-posta: kvkk@ermaymobilya.com
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF8F5] p-4 px-6 border-t border-[#EAE3D2] flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Ermay Mobilya Veri Güvenliği Taahhüdü
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xs hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Kapat
            </button>
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2 bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle className="h-4 w-4 text-[#C5A880]" />
                <span>Okudum ve Onaylıyorum</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KvkkModal;
