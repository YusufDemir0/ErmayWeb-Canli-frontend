'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Sparkles, Copy, Check, ArrowRight, Tag, Megaphone, Layers } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';

export const CampaignPopup: React.FC = () => {
  const pathname = usePathname();
  const popupConfig = useCMSStore((state) => state.campaignPopup);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!popupConfig.enabled || pathname === '/katalog' || pathname?.startsWith('/admin')) return;

    // Check if dismissed in this session
    const hasSeenPopup = sessionStorage.getItem('ermay_campaign_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [popupConfig.enabled, pathname]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('ermay_campaign_popup_seen', 'true');
  };

  const handleCopyCode = () => {
    if (popupConfig.discountCode) {
      navigator.clipboard.writeText(popupConfig.discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !popupConfig.enabled) return null;

  const popupType = popupConfig.popupType || (popupConfig.discountCode ? 'coupon' : 'announcement');
  const targetLink = popupConfig.buttonLink || '/katalog';
  const buttonLabel = popupConfig.buttonText || (popupType === 'coupon' ? 'Kuponu Kullan' : 'Koleksiyonu İncele');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden border border-[#EAE3D2]">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 text-neutral-400 hover:text-neutral-900 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all cursor-pointer"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image Banner */}
        <div className="relative h-48 bg-neutral-900 overflow-hidden">
          <img
            src={popupConfig.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'}
            alt={popupConfig.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            {popupConfig.badgeText && (
              <span className="inline-block bg-[#C5A880] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xs mb-1.5 shadow-xs">
                {popupConfig.badgeText}
              </span>
            )}
            <h3 className="text-lg font-serif font-bold tracking-tight uppercase leading-tight text-white">
              {popupConfig.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center space-y-4">
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            {popupConfig.subtitle}
          </p>

          {/* Discount Coupon Box (if coupon type and code exists) */}
          {popupType === 'coupon' && popupConfig.discountCode && (
            <div className="flex items-center justify-between bg-[#FAF8F5] border-2 border-dashed border-[#C5A880]/60 p-3 rounded-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-sm font-mono font-bold tracking-wider text-neutral-900">
                  {popupConfig.discountCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-bold text-[#8A4B20] hover:text-neutral-900 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Kodu Kopyala</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Link
              href={targetLink}
              onClick={handleClose}
              className="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold tracking-widest uppercase py-3.5 rounded-xs transition-colors shadow-xs"
            >
              <span>{buttonLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={handleClose}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 py-1 transition-colors cursor-pointer"
            >
              Şimdilik Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPopup;
