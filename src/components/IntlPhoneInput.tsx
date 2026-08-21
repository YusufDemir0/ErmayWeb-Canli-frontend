'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Phone } from 'lucide-react';

export interface CountryCode {
  code: string;       // e.g. "TR"
  name: string;       // e.g. "Türkiye"
  dialCode: string;   // e.g. "+90"
  flag: string;       // e.g. "🇹🇷"
  placeholder: string;// e.g. "532 123 45 67"
}

export const COUNTRIES: CountryCode[] = [
  { code: 'TR', name: 'Türkiye', dialCode: '+90', flag: '🇹🇷', placeholder: '532 123 45 67' },
  { code: 'US', name: 'Amerika Birleşik Devletleri', dialCode: '+1', flag: '🇺🇸', placeholder: '202 555 0123' },
  { code: 'GB', name: 'İngiltere', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: 'DE', name: 'Almanya', dialCode: '+49', flag: '🇩🇪', placeholder: '151 23456789' },
  { code: 'FR', name: 'Fransa', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: 'NL', name: 'Hollanda', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { code: 'AE', name: 'B.A.E.', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'SA', name: 'Suudi Arabistan', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: 'AZ', name: 'Azerbaycan', dialCode: '+994', flag: '🇦🇿', placeholder: '50 123 45 67' },
  { code: 'IT', name: 'İtalya', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: 'ES', name: 'İspanya', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { code: 'RU', name: 'Rusya', dialCode: '+7', flag: '🇷🇺', placeholder: '912 345-67-89' },
];

interface IntlPhoneInputProps {
  value: string;
  onChange: (formattedValue: string) => void;
  className?: string;
  required?: boolean;
}

export const IntlPhoneInput: React.FC<IntlPhoneInputProps> = ({
  value,
  onChange,
  className = '',
  required = false,
}) => {
  const findInitialCountry = (): CountryCode => {
    if (!value) return COUNTRIES[0];
    const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
    return matched || COUNTRIES[0];
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(findInitialCountry);
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    if (!value) return '';
    if (value.startsWith(selectedCountry.dialCode)) {
      return value.slice(selectedCountry.dialCode.length).trim();
    }
    return value;
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.startsWith(selectedCountry.dialCode)) {
      const numberPart = value.slice(selectedCountry.dialCode.length).trim();
      setPhoneNumber(numberPart);
    }
  }, [value, selectedCountry.dialCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    const fullVal = phoneNumber ? `${country.dialCode} ${phoneNumber}` : country.dialCode;
    onChange(fullVal);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // E.164 standard: Allow up to 10 digits for TR, and up to 15 digits for international numbers
    const maxDigits = selectedCountry.code === 'TR' ? 10 : 15;
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
    setPhoneNumber(digitsOnly);
    const fullVal = digitsOnly ? `${selectedCountry.dialCode} ${digitsOnly}` : '';
    onChange(fullVal);
  };

  return (
    <div className={`relative flex items-center ${className}`} ref={dropdownRef}>
      {/* Country Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 border border-r-0 border-neutral-300 rounded-l-xs transition-colors cursor-pointer flex-shrink-0 select-none"
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-mono text-neutral-700">{selectedCountry.dialCode}</span>
        <ChevronDown className="h-3 w-3 text-neutral-500" />
      </button>

      {/* Country Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-12 z-50 w-64 bg-white border border-neutral-200 rounded-xs shadow-xl max-h-60 overflow-y-auto divide-y divide-neutral-100 animate-fade-in">
          <div className="p-2 bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Ülke Alan Kodu Seçin
          </div>
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleCountrySelect(country)}
              className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-brand-camel/10 transition-colors cursor-pointer ${
                selectedCountry.code === country.code ? 'bg-brand-camel/15 font-bold text-brand-dark' : 'text-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-base">{country.flag}</span>
                <span className="truncate">{country.name}</span>
              </div>
              <span className="font-mono text-[11px] text-neutral-500 ml-2 flex-shrink-0">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}

      {/* Phone Number Input */}
      <div className="relative flex-1">
        <input
          type="tel"
          required={required}
          value={phoneNumber}
          onChange={handleNumberChange}
          placeholder={selectedCountry.placeholder}
          className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-r-xs focus:ring-1 focus:ring-brand-camel focus:outline-none font-mono"
        />
        <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-400" />
      </div>
    </div>
  );
};

export default IntlPhoneInput;
