'use client';

import React from 'react';
import type { ContactInfoConfig } from '../../../stores/useCMSStore';

interface ContactTabProps {
  contactInfo: ContactInfoConfig;
  onUpdateContactInfo: (contact: Partial<ContactInfoConfig>) => void;
  onShowSuccess: (msg: string) => void;
}

export const ContactTab: React.FC<ContactTabProps> = ({
  contactInfo,
  onUpdateContactInfo,
  onShowSuccess,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 mb-6">
          İletişim & Kurumsal Ayarlar
        </h3>

        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              Telefon Numarası
            </label>
            <input
              type="text"
              value={contactInfo.phone}
              onChange={(e) => onUpdateContactInfo({ phone: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              E-Posta Adresi
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => onUpdateContactInfo({ email: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              Adres
            </label>
            <input
              type="text"
              value={contactInfo.address}
              onChange={(e) => onUpdateContactInfo({ address: e.target.value })}
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
            />
          </div>

          <button
            onClick={() => onShowSuccess('İletişim bilgileri kaydedildi.')}
            className="bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold uppercase tracking-widest py-3 px-8 rounded-xs transition-colors cursor-pointer"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
