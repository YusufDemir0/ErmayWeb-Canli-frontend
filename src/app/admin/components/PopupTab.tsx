'use client';

import React, { useState, useEffect } from 'react';
import type { CampaignPopupConfig } from '../../../stores/useCMSStore';
import { uploadProductImage } from '../../../lib/uploadHelper';
import { Sparkles, Image as ImageIcon, Tag, Megaphone, Layers, CheckCircle } from 'lucide-react';

interface PopupTabProps {
  campaignPopup: CampaignPopupConfig;
  onUpdateCampaignPopup: (popup: Partial<CampaignPopupConfig>) => void;
  onShowSuccess: (msg: string) => void;
}

export const PopupTab: React.FC<PopupTabProps> = ({
  campaignPopup,
  onUpdateCampaignPopup,
  onShowSuccess,
}) => {
  const [localPopup, setLocalPopup] = useState<CampaignPopupConfig>(campaignPopup);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setLocalPopup(campaignPopup);
  }, [campaignPopup]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadProductImage(e.target.files[0]);
        setLocalPopup((prev) => ({ ...prev, image: url }));
        onShowSuccess('Popup görseli başarıyla yüklendi!');
      } catch (err) {
        console.error('Yükleme hatası:', err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCampaignPopup(localPopup);
    onShowSuccess('Açılış popup ayarları ve görseli güncellendi!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs">
        
        {/* Header */}
        <div className="border-b border-neutral-100 pb-4 mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880] block mb-1">
            Ziyaretçi Etkileşimi
          </span>
          <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#C5A880]" />
            <span>Açılış Kampanya & Tanıtım Popup Yönetimi</span>
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          
          {/* Active Switch */}
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#FAF8F5] border border-[#EAE3D2] rounded-xs">
            <input
              type="checkbox"
              checked={localPopup.enabled}
              onChange={(e) => setLocalPopup({ ...localPopup, enabled: e.target.checked })}
              className="h-5 w-5 text-[#C5A880] rounded-xs border-neutral-300 focus:ring-[#C5A880]"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                Açılış Popupını Aktif Et
              </span>
              <span className="text-[11px] text-neutral-500 font-light">
                Site ilk açıldığında ziyaretçilere hoş geldin kampanya penceresini gösterir.
              </span>
            </div>
          </label>

          {/* Popup Type Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-2">
              Popup Amacı / İçerik Türü *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setLocalPopup({ ...localPopup, popupType: 'coupon' })}
                className={`p-3 rounded-xs border text-left cursor-pointer transition-all ${
                  (localPopup.popupType || 'coupon') === 'coupon'
                    ? 'border-[#C5A880] bg-[#FAF8F5] ring-1 ring-[#C5A880]'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <Tag className="h-4 w-4 text-[#C5A880] mb-1.5" />
                <div className="text-xs font-bold text-neutral-900">İndirim Kuponu</div>
                <div className="text-[10px] text-neutral-500 font-light mt-0.5">Kupon kodu kopyalatır</div>
              </button>

              <button
                type="button"
                onClick={() => setLocalPopup({ ...localPopup, popupType: 'collection' })}
                className={`p-3 rounded-xs border text-left cursor-pointer transition-all ${
                  localPopup.popupType === 'collection'
                    ? 'border-[#C5A880] bg-[#FAF8F5] ring-1 ring-[#C5A880]'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <Layers className="h-4 w-4 text-[#C5A880] mb-1.5" />
                <div className="text-xs font-bold text-neutral-900">Koleksiyon Tanıtımı</div>
                <div className="text-[10px] text-neutral-500 font-light mt-0.5">Yeni sezon modelini tanıtır</div>
              </button>

              <button
                type="button"
                onClick={() => setLocalPopup({ ...localPopup, popupType: 'announcement' })}
                className={`p-3 rounded-xs border text-left cursor-pointer transition-all ${
                  localPopup.popupType === 'announcement'
                    ? 'border-[#C5A880] bg-[#FAF8F5] ring-1 ring-[#C5A880]'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <Megaphone className="h-4 w-4 text-[#C5A880] mb-1.5" />
                <div className="text-xs font-bold text-neutral-900">Genel Duyuru</div>
                <div className="text-[10px] text-neutral-500 font-light mt-0.5">Fuar / İmalat duyurusu</div>
              </button>
            </div>
          </div>

          {/* Popup Image Upload & Preview */}
          <div className="space-y-2 p-4 bg-[#FAF8F5] rounded-xs border border-[#EAE3D2]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
              Popup Üst Kapak Görseli
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 aspect-[16/9] bg-neutral-200 rounded-xs overflow-hidden border border-neutral-300 relative">
                {localPopup.image ? (
                  <img src={localPopup.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                    Görsel Yok
                  </div>
                )}
              </div>
              <div className="sm:col-span-8 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs"
                />
                <input
                  type="text"
                  placeholder="Veya doğrudan görsel URL yapıştırın..."
                  value={localPopup.image}
                  onChange={(e) => setLocalPopup({ ...localPopup, image: e.target.value })}
                  className="w-full text-xs border border-neutral-300 p-2 rounded-xs bg-white"
                />
                {uploading && <span className="text-[10px] text-[#C5A880]">Görsel yükleniyor...</span>}
              </div>
            </div>
          </div>

          {/* Text Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Üst Rozet Metni
              </label>
              <input
                type="text"
                value={localPopup.badgeText}
                onChange={(e) => setLocalPopup({ ...localPopup, badgeText: e.target.value })}
                placeholder="Örn: 2026 YENİ SEZON FIRSATI"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Ana Başlık *
              </label>
              <input
                type="text"
                required
                value={localPopup.title}
                onChange={(e) => setLocalPopup({ ...localPopup, title: e.target.value })}
                placeholder="Örn: Yeni Koleksiyonda Ekstra İndirim"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              Alt Açıklama Metni
            </label>
            <textarea
              rows={2}
              value={localPopup.subtitle}
              onChange={(e) => setLocalPopup({ ...localPopup, subtitle: e.target.value })}
              placeholder="Özel tasarım mobilyalarımızda geçerli avantajları keşfedin..."
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white leading-relaxed"
            />
          </div>

          {/* Coupon Code (Only if coupon mode) */}
          {(localPopup.popupType || 'coupon') === 'coupon' && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                İndirim Kupon Kodu
              </label>
              <input
                type="text"
                value={localPopup.discountCode}
                onChange={(e) => setLocalPopup({ ...localPopup, discountCode: e.target.value.toUpperCase() })}
                placeholder="Örn: ERMAY2026"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white font-mono font-bold text-[#8A4B20]"
              />
            </div>
          )}

          {/* Button Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Yönlendirme Buton Metni
              </label>
              <input
                type="text"
                value={localPopup.buttonText || 'Koleksiyonu İncele'}
                onChange={(e) => setLocalPopup({ ...localPopup, buttonText: e.target.value })}
                placeholder="Koleksiyonu İncele"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Buton Hedef Linki
              </label>
              <input
                type="text"
                value={localPopup.buttonLink || '/katalog'}
                onChange={(e) => setLocalPopup({ ...localPopup, buttonLink: e.target.value })}
                placeholder="/katalog"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs bg-white font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded-xs transition-colors cursor-pointer shadow-xs"
            >
              Popup Ayarlarını Kaydet
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default PopupTab;
