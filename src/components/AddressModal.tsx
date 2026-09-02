'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import type { UserAddress } from '../stores/useAuthStore';
import { TURKEY_CITIES, getDistrictsByCityName } from '../lib/turkeyData';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (addr: Omit<UserAddress, 'id'>) => void;
  initialValues?: Partial<UserAddress>;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSaveAddress,
  initialValues,
}) => {
  if (!isOpen) return null;

  // Split fullName if provided
  const fullNameParts = (initialValues?.fullName || '').split(' ');
  const initialFirstName = fullNameParts[0] || '';
  const initialLastName = fullNameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneDigits, setPhoneDigits] = useState((initialValues?.phone || '').replace(/\D/g, '').slice(-10));
  const [city, setCity] = useState(initialValues?.city || 'İstanbul');
  const [district, setDistrict] = useState(initialValues?.district || 'Kadıköy');
  const [neighborhood, setNeighborhood] = useState('');
  const [addressLine, setAddressLine] = useState(initialValues?.addressLine || '');
  const [title, setTitle] = useState(initialValues?.title || 'Ev Adresi');
  const [zipCode, setZipCode] = useState(initialValues?.zipCode || '34000');
  const [errorMsg, setErrorMsg] = useState('');

  const availableDistricts = getDistrictsByCityName(city);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digitsOnly);
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const districts = getDistrictsByCityName(newCity);
    setDistrict(districts[0] || 'Merkez');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Lütfen ad ve soyad alanlarını doldurunuz.');
      return;
    }

    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      setErrorMsg('Lütfen geçerli bir telefon numarası giriniz (8-15 hane arası).');
      return;
    }

    if (!addressLine.trim()) {
      setErrorMsg('Lütfen açık adres detayını giriniz.');
      return;
    }

    const fullAddrLine = neighborhood ? `${neighborhood} Mah. ${addressLine}` : addressLine;
    const fullPhone = `+90 ${phoneDigits}`;

    onSaveAddress({
      title: title || 'Adresim',
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      phone: fullPhone,
      city,
      district,
      addressLine: fullAddrLine,
      zipCode: zipCode || '34000',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden border border-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FBF9F5]">
          <h3 className="text-sm font-bold text-neutral-900 tracking-wide uppercase">
            {initialValues?.title ? 'Adresi Düzenle' : 'Adres Ekle'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ad & Soyad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Ad *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Adınızı giriniz"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Soyad *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Soyadınızı giriniz"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Telefon */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">
              Telefon *
            </label>
            <div className="flex">
              <span className="bg-neutral-100 border border-r-0 border-neutral-300 px-3 py-2.5 text-xs text-neutral-600 font-semibold rounded-l-xs flex items-center">
                +90
              </span>
              <input
                type="text"
                required
                value={phoneDigits}
                onChange={handlePhoneChange}
                placeholder="(5__) ___ __ __"
                maxLength={10}
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-r-xs focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* İl & İlçe */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                İl (Türkiye) *
              </label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none bg-white font-medium cursor-pointer"
              >
                {TURKEY_CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                İlçe *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none bg-white font-medium cursor-pointer"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mahalle */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">
              Mahalle *
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Mahalle ismini giriniz (Örn: Bağdat, Atatürk, Kültür)"
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none bg-white"
            />
          </div>

          {/* Info Callout Box (Luxurious #C5A880 Theme) */}
          <div className="p-3.5 bg-[#FBF9F5] border border-[#C5A880]/40 rounded-xs flex items-start gap-2.5 text-[11px] text-neutral-800 leading-relaxed">
            <AlertCircle className="h-4 w-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
            <span>
              Kargonuzun size sorunsuz bir şekilde ulaşabilmesi için mahalle, cadde, sokak, bina ve daire no gibi detay bilgileri eksiksiz girdiğinizden emin olun.
            </span>
          </div>

          {/* Açık Adres */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">
              Adres Detayı *
            </label>
            <textarea
              rows={2}
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Cadde, sokak, bina ve daire no gibi adres detaylarını yazınız..."
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none resize-none"
            />
          </div>

          {/* Adres Başlığı */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">
              Adres Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Adres Başlığı Giriniz (Örn: Ev, İşyeri)"
              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none bg-white"
            />
          </div>

          {/* Submit #C5A880 Camel Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#C5A880] hover:bg-[#b0926b] text-white font-bold text-sm uppercase py-3.5 px-6 rounded-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Adresi Kaydet</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AddressModal;
