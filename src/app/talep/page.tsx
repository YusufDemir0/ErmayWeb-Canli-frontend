'use client';

import React, { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  MessageSquare, 
  Store as StoreIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { requestService, QuoteResponseItem } from '../../services/requestService';
import apiClient from '../../services/api';
import { TURKEY_CITIES, getDistrictsByCityName } from '../../lib/turkeyData';
import type { StoreItem } from '../../types';

export default function OrderRequestPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const totalCartAmount = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [preference, setPreference] = useState<'WHATSAPP' | 'STORE_VISIT'>('WHATSAPP');
  const [preferredStoreId, setPreferredStoreId] = useState<string>('');
  const [note, setNote] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // UI & Loading States
  const [isQuoting, setIsQuoting] = useState(true);
  const [quoteItems, setQuoteItems] = useState<QuoteResponseItem[]>([]);
  const [verifiedSubtotal, setVerifiedSubtotal] = useState(totalCartAmount);
  const [quoteWarning, setQuoteWarning] = useState<string | null>(null);

  const [stores, setStores] = useState<StoreItem[]>([]);
  const [disabledCities, setDisabledCities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showKvkkModal, setShowKvkkModal] = useState(false);

  // Stable session idempotency key
  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  });

  const availableDistricts = city ? getDistrictsByCityName(city) : [];
  // İller plaka sırasıyla geliyor; kullanıcı alfabetik arar
  const sortedCities = [...TURKEY_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  // 1. Fetch stores and delivery zones
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [storesList, geoRes] = await Promise.allSettled([
          requestService.getStores(),
          apiClient.get('/geo/delivery-zones'),
        ]);

        if (isMounted) {
          if (storesList.status === 'fulfilled') {
            setStores(storesList.value);
            if (storesList.value.length > 0) {
              setPreferredStoreId(storesList.value[0].id);
            }
          }
          if (geoRes.status === 'fulfilled') {
            const zonesData = geoRes.value.data?.zones || geoRes.value.data?.data;
            if (zonesData?.disabledCityNames) {
              setDisabledCities(zonesData.disabledCityNames);
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Quote current cart items from server DB
  useEffect(() => {
    let isMounted = true;

    async function verifyQuote() {
      if (cartItems.length === 0) {
        setIsQuoting(false);
        return;
      }

      setIsQuoting(true);
      setQuoteWarning(null);

      try {
        const itemsPayload = cartItems.map((item) => ({
          productId: item.product.id,
          colorKey: item.product.selectedColor || null,
          quantity: item.quantity,
        }));

        const quoteRes = await requestService.quoteCart(itemsPayload);

        if (isMounted && quoteRes.success && quoteRes.quote) {
          setQuoteItems(quoteRes.quote.items);
          setVerifiedSubtotal(quoteRes.quote.subtotal);

          if (Math.abs(quoteRes.quote.subtotal - totalCartAmount) > 0.01) {
            setQuoteWarning('Bazı ürünlerin güncel katalog fiyatları yenilenmiştir.');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Katalog fiyatları doğrulanamadı.';
          setQuoteWarning(msg);
        }
      } finally {
        if (isMounted) {
          setIsQuoting(false);
        }
      }
    }

    verifyQuote();

    return () => {
      isMounted = false;
    };
  }, [cartItems, totalCartAmount]);

  // Handle city change
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    // İlçe otomatik seçilmez: fark edilmeyen yanlış ilçe hatalı teslimat planlamasına yol açar
    setDistrict('');
  };

  const isCityDisabled = disabledCities.some(
    (c) => c.toLocaleLowerCase('tr-TR') === city.toLocaleLowerCase('tr-TR')
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price).replace('TRY', 'TL');
  };

  // 3. Submit Order Request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Bot trap check
    if (honeypot.trim().length > 0) {
      router.push('/');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('Sepetinizde ürün bulunmamaktadır.');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Lütfen ad ve soyadınızı eksiksiz giriniz.');
      return;
    }

    // Phone validation
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Lütfen geçerli bir cep telefonu numarası giriniz (05XX XXX XX XX).');
      return;
    }

    if (!city || !district) {
      setFormError('Lütfen il ve ilçe seçiniz.');
      return;
    }

    if (isCityDisabled) {
      setFormError(`Üzgünüz, geçici olarak ${city} iline teslimat ve kurulum hizmetimiz bulunmamaktadır.`);
      return;
    }

    if (preference === 'STORE_VISIT' && !preferredStoreId) {
      setFormError('Lütfen ziyaret etmek istediğiniz showroom/mağazayı seçiniz.');
      return;
    }

    if (!kvkkAccepted) {
      setFormError('Lütfen KVKK Aydınlatma Metni\'ni okuduğunuzu işaretleyiniz.');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = cartItems.map((item) => ({
        productId: item.product.id,
        colorKey: item.product.selectedColor || null,
        colorLabel: item.product.selectedColor || null,
        quantity: item.quantity,
      }));

      const res = await requestService.createRequest(
        {
          items: itemsPayload,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          city: city.trim(),
          district: district.trim(),
          addressLine: addressLine.trim() || undefined,
          preference,
          preferredStoreId: preference === 'STORE_VISIT' ? preferredStoreId : undefined,
          note: note.trim() || undefined,
          kvkkNoticeAcknowledged: true,
          marketingConsent,
          website: honeypot,
        },
        idempotencyKey
      );

      if (res.success && res.publicToken) {
        clearCart();
        router.push(`/talep/${res.publicToken}`);
      } else {
        setFormError(res.message || 'Sipariş talebi oluşturulamadı. Lütfen tekrar deneyiniz.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sipariş talebi gönderilirken bir hata oluştu.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is completely empty
  if (!isQuoting && cartItems.length === 0) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="bg-white border border-neutral-200/80 rounded-sm p-10 shadow-sm">
            <ShoppingBag className="h-16 w-16 text-neutral-300 stroke-[1.5] mx-auto mb-4" />
            <h2 className="text-xl font-normal text-neutral-800 mb-2">Sepetiniz Boş</h2>
            <p className="text-neutral-500 font-light text-sm mb-6">
              Sipariş talebi oluşturabilmek için sepetinize en az bir ürün eklemeniz gerekmektedir.
            </p>
            <Link
              href="/"
              className="inline-block bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-3.5 px-8 rounded-sm transition-colors"
            >
              Koleksiyonları İncele
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50 min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="text-xs text-neutral-400 font-light flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-brand-camel transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/sepet" className="hover:text-brand-camel transition-colors">Sepetim</Link>
          <span>/</span>
          <span className="text-neutral-700 font-normal">Sipariş Talebi</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-neutral-200/80 pb-6 mb-10">
          <h1 className="text-2xl md:text-3xl font-light text-brand-dark tracking-wide uppercase">
            Sipariş Talebi Oluştur
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 font-light mt-1.5">
            Sitemiz üzerinden kredi kartı tahsilatı yapılmaz. Talebinizi oluşturduktan sonra uzman danışmanımız sizinle iletişime geçer.
          </p>
        </div>

        {quoteWarning && (
          <div className="mb-8 p-4 bg-amber-50/90 border border-amber-200/80 rounded-sm flex items-center gap-3 text-amber-900 text-xs">
            <Info className="h-5 w-5 text-amber-700 flex-shrink-0" />
            <span>{quoteWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Honeypot Input for Bot Suppression */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* LEFT COLUMN: Customer Info, Location, Preference (8 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. İletişim Bilgileri */}
            <div className="bg-white rounded-sm border border-neutral-200/80 shadow-sm p-6 sm:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-3 mb-6 flex items-center gap-2">
                <span>1. İletişim Bilgileriniz</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="talep-name" className="block text-xs font-medium text-neutral-700 mb-1">
                    Ad Soyad <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="talep-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xs px-3.5 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-camel focus:border-brand-camel transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="talep-phone" className="block text-xs font-medium text-neutral-700 mb-1">
                      Telefon Numarası <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="talep-phone"
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xs px-3.5 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-camel focus:border-brand-camel transition-colors"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">WhatsApp veya telefon görüşmesi için kullanılır.</p>
                  </div>

                  <div>
                    <label htmlFor="talep-email" className="block text-xs font-medium text-neutral-700 mb-1">
                      E-posta Adresi <span className="text-neutral-400 font-light">(İsteğe Bağlı)</span>
                    </label>
                    <input
                      id="talep-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ahmet@ornek.com"
                      className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xs px-3.5 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-camel focus:border-brand-camel transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Teslimat & Lokasyon Bilgileri */}
            <div className="bg-white rounded-sm border border-neutral-200/80 shadow-sm p-6 sm:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-3 mb-6">
                2. Teslimat & Lokasyon
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="talep-city" className="block text-xs font-medium text-neutral-700 mb-1">
                      İl <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="talep-city"
                      name="address-level1"
                      autoComplete="address-level1"
                      required
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xs px-3 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-camel focus:border-brand-camel transition-colors"
                    >
                      <option value="" disabled>İl seçiniz</option>
                      {sortedCities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="talep-district" className="block text-xs font-medium text-neutral-700 mb-1">
                      İlçe <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="talep-district"
                      name="address-level2"
                      autoComplete="address-level2"
                      required
                      disabled={!city}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xs px-3 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-camel focus:border-brand-camel transition-colors"
                    >
                      <option value="" disabled>{city ? 'İlçe seçiniz' : 'Önce il seçiniz'}</option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isCityDisabled && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs">
                    Üzgünüz, geçici olarak {city} iline mobilya sevkiyat hizmetimiz bulunmamaktadır.
                  </div>
                )}

                <div>
                  <label htmlFor="talep-address" className="block text-xs font-medium text-neutral-700 mb-1">
                    Açık Adres / Semt <span className="text-neutral-400 font-light">(İsteğe Bağlı)</span>
                  </label>
                  <input
                    id="talep-address"
                    name="street-address"
                    type="text"
                    autoComplete="street-address"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Mahalle, Cadde, Sokak veya site adı..."
                    className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xs px-3.5 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-camel focus:border-brand-camel transition-colors"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Nakliye planlaması ve kat uygunluğu için kullanılır.</p>
                </div>
              </div>
            </div>

            {/* 3. Talep Tamamlama Tercihi */}
            <div className="bg-white rounded-sm border border-neutral-200/80 shadow-sm p-6 sm:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-3 mb-6">
                3. İşlem Tercihiniz <span className="text-rose-500">*</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Option 1: WhatsApp */}
                <div
                  onClick={() => setPreference('WHATSAPP')}
                  className={`p-5 rounded-sm border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    preference === 'WHATSAPP'
                      ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className={`h-5 w-5 ${preference === 'WHATSAPP' ? 'text-emerald-600' : 'text-neutral-400'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">WhatsApp ile İletişim</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        preference === 'WHATSAPP' ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300'
                      }`}>
                        {preference === 'WHATSAPP' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Satış temsilcimiz kumaş kartelası, teslim süresi ve ödeme koşullarını WhatsApp üzerinden sizinle netleştirir.
                    </p>
                  </div>
                </div>

                {/* Option 2: Store Visit */}
                <div
                  onClick={() => setPreference('STORE_VISIT')}
                  className={`p-5 rounded-sm border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    preference === 'STORE_VISIT'
                      ? 'border-brand-dark bg-neutral-50/70 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StoreIcon className={`h-5 w-5 ${preference === 'STORE_VISIT' ? 'text-brand-dark' : 'text-neutral-400'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">Mağazaya Geleceğim</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        preference === 'STORE_VISIT' ? 'border-brand-dark bg-brand-dark' : 'border-neutral-300'
                      }`}>
                        {preference === 'STORE_VISIT' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Showroom veya atölyemizi ziyaret ederek ürünleri yakından incelemek ve mağazada sipariş oluşturmak istiyorum.
                    </p>
                  </div>
                </div>
              </div>

              {/* Showroom Selector if STORE_VISIT selected */}
              {preference === 'STORE_VISIT' && (
                <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-sm space-y-3">
                  <label htmlFor="talep-store" className="block text-xs font-semibold text-neutral-800">
                    Ziyaret Etmek İstediğiniz Showroom / Mağaza <span className="text-rose-500">*</span>
                  </label>
                  {stores.length === 0 ? (
                    <p className="text-xs text-neutral-500">Showroom bilgileri yükleniyor...</p>
                  ) : (
                    <select
                      id="talep-store"
                      required
                      value={preferredStoreId}
                      onChange={(e) => setPreferredStoreId(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xs px-3.5 py-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-camel"
                    >
                      <option value="" disabled>Showroom / mağaza seçiniz</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.city}{s.district ? ` / ${s.district}` : ''}) - {s.address}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[11px] text-neutral-500 font-light">
                    Talep fişinizde seçtiğiniz mağazanın yol tarifi, açık adresi ve randevu teyit hattı yer alacaktır.
                  </p>
                </div>
              )}

              {/* Note input */}
              <div className="mt-6">
                <label htmlFor="talep-note" className="block text-xs font-medium text-neutral-700 mb-1">
                  Özel Not / İstekleriniz <span className="text-neutral-400 font-light">(İsteğe Bağlı)</span>
                </label>
                <textarea
                  id="talep-note"
                  name="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Varsa kat/asansör durumu, teslimat randevu talebi veya çoklu alım notunuz..."
                  className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xs p-3 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-camel focus:border-brand-camel transition-colors resize-none"
                />
              </div>
            </div>

            {/* 4. Yasal Onaylar (KVKK) */}
            <div className="bg-white rounded-sm border border-neutral-200/80 shadow-sm p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={kvkkAccepted}
                  onChange={(e) => setKvkkAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-xs border-neutral-300 text-brand-dark focus:ring-brand-camel cursor-pointer"
                />
                <span className="text-xs text-neutral-600 font-light leading-relaxed">
                  <button
                    type="button"
                    onClick={() => setShowKvkkModal(true)}
                    className="text-brand-dark font-medium underline hover:text-brand-camel cursor-pointer"
                  >
                    KVKK Aydınlatma Metni
                  </button>
                  &apos;ni okudum; sipariş talebimin değerlendirilmesi ve benimle iletişime geçilmesi için bilgilerimin işleneceği konusunda bilgilendirildim. <span className="text-rose-500">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-xs border-neutral-300 text-brand-dark focus:ring-brand-camel cursor-pointer"
                />
                <span className="text-xs text-neutral-500 font-light leading-relaxed">
                  Ermay Mobilya yeni koleksiyon, kampanya ve duyurulardan haberdar olmak istiyorum (İsteğe bağlı).
                </span>
              </label>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-sm border border-neutral-200/80 shadow-sm p-6 sticky top-24">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-4 mb-6">
                Talep Sepetiniz ({cartItems.length} Kalem)
              </h3>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 pr-1 mb-6">
                {cartItems.map((item) => {
                  const key = item.itemKey || item.product.id;
                  return (
                    <div key={key} className="py-3 flex gap-3 items-center">
                      <div className="h-16 w-14 rounded-xs overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-neutral-800 truncate">
                          {item.product.name}
                        </h4>
                        {item.product.selectedColor && (
                          <p className="text-[11px] text-neutral-500">Renk: {item.product.selectedColor}</p>
                        )}
                        <p className="text-[11px] text-neutral-400 font-light">
                          {item.quantity} adet x {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-neutral-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <div className="border-t border-neutral-100 pt-4 space-y-2 mb-6 text-xs text-neutral-600 font-light">
                <div className="flex justify-between">
                  <span>Katalog Ara Toplam</span>
                  <span className="font-medium text-neutral-800">{formatPrice(verifiedSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%20)</span>
                  <span>Dahil</span>
                </div>
                <div className="flex justify-between">
                  <span>Teslimat & Kurulum</span>
                  <span className="text-neutral-700">Temsilciyle Netleştirilir</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-200/60 text-sm font-bold text-neutral-900">
                  <span>Tahmini Tutar</span>
                  <span className="text-brand-terracotta">{formatPrice(verifiedSubtotal)}</span>
                </div>
              </div>

              {formError && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || isQuoting || isCityDisabled}
                className="w-full flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold tracking-widest uppercase py-4 transition-colors duration-300 rounded-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Talep İletiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>Talebi Gönder ve Fiş Al</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Safe & Transparent Furniture Guarantees */}
              <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3">
                <div className="flex items-start gap-2 text-neutral-500 text-[11px] font-light">
                  <ShieldCheck className="h-4 w-4 text-brand-camel flex-shrink-0 mt-0.5" />
                  <span>Ödemeler yalnızca şirketimizin resmi banka hesabına veya showroom'da kabul edilir.</span>
                </div>
                <div className="flex items-start gap-2 text-neutral-500 text-[11px] font-light">
                  <Sparkles className="h-4 w-4 text-brand-camel flex-shrink-0 mt-0.5" />
                  <span>Kumaş ve ahşap numuneleri için satış temsilcimiz veya atölyemiz tam destek sağlar.</span>
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>

      {/* KVKK Modal */}
      {showKvkkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setShowKvkkModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-neutral-900 mb-4 uppercase tracking-wider">
              KVKK Aydınlatma Metni
            </h3>
            <div className="text-xs text-neutral-600 font-light space-y-3 leading-relaxed">
              <p>
                <strong>Ermay Mobilya San. Tic. Ltd. Şti.</strong> olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla kişisel verilerinizin güvenliğine en üst seviyede önem veriyoruz.
              </p>
              <p>
                <strong>İşlenen Veriler:</strong> Adınız, soyadınız, telefon numaranız, e-posta adresiniz ve talep ettiğiniz teslimat ili/ilçesi.
              </p>
              <p>
                <strong>İşlenme Amacı:</strong> İlettiğiniz mobilya sipariş talebinin işleme alınması, sipariş detaylarının teyidi, kumaş/renk seçeneklerinin netleştirilmesi, teslimat planlaması ve müşteri memnuniyeti süreçlerinin yürütülmesi.
              </p>
              <p>
                <strong>Aktarım:</strong> Kişisel verileriniz hiçbir üçüncü şahsa veya reklam platformuna satılmaz. Yalnızca siparişin ERP entegrasyonu ve nakliye/montaj süreçleri için zorunlu olan operasyonel iş ortaklarıyla mevzuata uygun olarak paylaşılır.
              </p>
            </div>
            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => {
                  setKvkkAccepted(true);
                  setShowKvkkModal(false);
                }}
                className="bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold px-6 py-2.5 rounded-xs uppercase tracking-wider cursor-pointer"
              >
                Okudum, Onaylıyorum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
