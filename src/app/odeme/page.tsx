'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, User, Phone, Mail, MapPin, FileText, CheckCircle2, 
  AlertCircle, ShoppingBag, Loader2, MessageSquare, Printer, 
  ArrowLeft, Share2, Copy, Check, ShieldCheck, Tag, Info, ArrowRight
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useDiscountStore } from '../../stores/useDiscountStore';
import apiClient from '../../services/api';
import { TURKEY_CITIES, getDistrictsByCityName } from '../../lib/turkeyData';
import type { Order, OrderItem } from '../../stores/useOrderStore';

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cartItems);
  const totalCartAmount = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const validateCoupon = useDiscountStore((state) => state.validateCoupon);
  const recordCouponUsage = useDiscountStore((state) => state.recordCouponUsage);

  // Delivery Zones / Serviceability Configuration State
  const [deliveryConfig, setDeliveryConfig] = useState<{
    disabledCityIds: number[];
    disabledCityNames: string[];
    customNotice?: string;
  }>({ disabledCityIds: [], disabledCityNames: [] });
  const [isLoadingZones, setIsLoadingZones] = useState<boolean>(true);

  // Form State
  const [customerType, setCustomerType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [fullName, setFullName] = useState<string>('');
  const [phone1, setPhone1] = useState<string>('');
  const [phone2, setPhone2] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [city, setCity] = useState<string>('İstanbul');
  const [district, setDistrict] = useState<string>('Kadıköy');
  const [customDistrict, setCustomDistrict] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');

  // Fetch Delivery Zones on mount
  useEffect(() => {
    const fetchDeliveryZones = async () => {
      try {
        const res = await apiClient.get('/geo/delivery-zones');
        const zonesData = res.data?.zones || res.data?.data;
        if (res.data?.success && zonesData) {
          setDeliveryConfig(zonesData);
        }
      } catch (err) {
        console.error('Teslimat bölgeleri yüklenemedi:', err);
      } finally {
        setIsLoadingZones(false);
      }
    };
    fetchDeliveryZones();
  }, []);

  const isCurrentCityDisabled = Boolean(
    city &&
    deliveryConfig.disabledCityNames?.some(
      (d) => d.trim().toLowerCase() === city.trim().toLowerCase()
    )
  );

  const availableDistricts = getDistrictsByCityName(city);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const districts = getDistrictsByCityName(newCity);
    if (districts && districts.length > 0) {
      setDistrict(districts[0]);
    } else {
      setDistrict('Merkez');
    }
  };

  // Tax Info State
  const [tcKn, setTcKn] = useState<string>('');
  const [companyTitle, setCompanyTitle] = useState<string>('');
  const [taxNo, setTaxNo] = useState<string>('');
  const [taxOffice, setTaxOffice] = useState<string>('');

  // Coupon State
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<string>('');

  // KVKK & Submission State
  const [kvkkAccepted, setKvkkAccepted] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrorMsg, setFormErrorMsg] = useState<string>('');

  // Order Success State
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Scroll to top on success
  useEffect(() => {
    if (placedOrder) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [placedOrder]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = validateCoupon(couponCode, totalCartAmount);
    if (res.valid) {
      setDiscountAmount(res.discountAmount);
      setCouponMsg(res.message);
    } else {
      setDiscountAmount(0);
      setCouponMsg(res.message);
    }
  };

  const finalAmount = Math.max(0, totalCartAmount - discountAmount);
  const vatAmount = Number((finalAmount * 0.20 / 1.20).toFixed(2));
  const subtotalWithoutVat = Number((finalAmount - vatAmount).toFixed(2));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg('');

    if (cart.length === 0) {
      setFormErrorMsg('Sipariş sepetiniz boştur.');
      return;
    }

    // Validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setFormErrorMsg('Lütfen geçerli bir Ad Soyad giriniz.');
      return;
    }

    const cleanPhone1 = phone1.replace(/\D/g, '');
    if (cleanPhone1.length < 10) {
      setFormErrorMsg('Lütfen en az 10 haneli geçerli bir GSM / Telefon numarası giriniz.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormErrorMsg('Lütfen sipariş bilgilendirme e-postanız için geçerli bir e-posta adresi giriniz.');
      return;
    }

    // Check delivery zone serviceability
    if (isCurrentCityDisabled) {
      setFormErrorMsg(
        deliveryConfig.customNotice ||
        `${city} iline lojistik ve montaj operasyonları nedeniyle geçici olarak web üzerinden teslimat yapılamamaktadır. Lütfen aktif bir il seçiniz veya WhatsApp danışma hattımızla irtibata geçiniz.`
      );
      return;
    }

    const finalDistrict = district === 'Diğer' ? customDistrict.trim() : district.trim();
    if (!finalDistrict) {
      setFormErrorMsg('Lütfen teslimat yapılacak ilçeyi seçiniz veya giriniz.');
      return;
    }

    if (!address.trim() || address.trim().length < 10) {
      setFormErrorMsg('Lütfen detaylı teslimat adresinizi (mahalle, cadde, sokak, no) eksiksiz giriniz.');
      return;
    }

    if (customerType === 'CORPORATE') {
      if (!companyTitle.trim()) {
        setFormErrorMsg('Kurumsal fatura için Firma Resmi Unvanı zorunludur.');
        return;
      }
      const cleanTaxNo = taxNo.replace(/\D/g, '');
      if (cleanTaxNo.length < 10) {
        setFormErrorMsg('Kurumsal fatura için 10 haneli Vergi Kimlik Numarası (VKN) zorunludur.');
        return;
      }
      if (!taxOffice.trim()) {
        setFormErrorMsg('Kurumsal fatura için Vergi Dairesi bilgisi zorunludur.');
        return;
      }
    } else {
      if (tcKn.trim()) {
        const cleanTcKn = tcKn.replace(/\D/g, '');
        if (cleanTcKn.length !== 11) {
          setFormErrorMsg('T.C. Kimlik Numarası 11 haneli olmalıdır.');
          return;
        }
      }
    }

    if (!kvkkAccepted) {
      setFormErrorMsg('Lütfen KVKK Aydınlatma Metni ve Mesafeli Satış Sözleşmesi koşullarını onaylayınız.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone1.trim(),
        customerPhone2: phone2.trim() || undefined,
        shippingCity: city.trim(),
        shippingDistrict: finalDistrict,
        shippingAddressLine: address.trim(),
        orderNote: orderNote.trim() || undefined,
        invoiceType: customerType,
        tcKn: customerType === 'INDIVIDUAL' && tcKn.trim() ? tcKn.trim() : undefined,
        companyTitle: customerType === 'CORPORATE' ? companyTitle.trim() : undefined,
        taxNo: customerType === 'CORPORATE' ? taxNo.trim() : undefined,
        taxOffice: customerType === 'CORPORATE' ? taxOffice.trim() : undefined,
        paymentMethod: 'WHATSAPP_ORDER',
        totalAmount: finalAmount,
        discountAmount,
        couponCode: discountAmount > 0 ? couponCode : undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          variantId: item.product.variantId || undefined,
          quantity: item.quantity,
          price: item.product.price,
        })),
        kvkkAccepted: true,
      };

      const res = await apiClient.post('/orders', orderPayload);

      if (res.data?.success && res.data.order) {
        if (discountAmount > 0 && couponCode) {
          recordCouponUsage(couponCode);
        }
        clearCart();
        setPlacedOrder(res.data.order);
      } else {
        setFormErrorMsg(res.data?.message || 'Sipariş işlenirken bir hata oluştu.');
      }
    } catch (err: unknown) {
      console.error('Sipariş oluşturma hatası:', err);
      const errObj = err as { response?: { data?: { message?: string } } };
      setFormErrorMsg(errObj.response?.data?.message || 'Sipariş sunucuya iletilemedi. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // SUCCESS / CONFIRMATION & WHATSAPP PAYMENT VIEW
  // =========================================================================
  if (placedOrder) {
    const orderNo = placedOrder.orderNumber || (placedOrder as { erpSaleCode?: string }).erpSaleCode || placedOrder.id;
    const items = placedOrder.items || [];
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ermaymobilya.com';
    const proformaSlipUrl = `${origin}/siparis/${orderNo}`;

    // Format rich WhatsApp message for direct order processing
    const itemsListText = items
      .map((item: OrderItem, idx: number) => {
        const pName = item.product?.name || 'Mobilya Modeli';
        const pPrice = formatPrice(item.unitPrice || item.price);
        const pImg = item.product?.image || (Array.isArray(item.product?.images) && item.product.images[0] ? `${origin}${item.product.images[0]}` : '');
        return `${idx + 1}. *${pName}* (x${item.quantity}) - ${pPrice}${pImg ? `\n   📸 Görsel: ${pImg}` : ''}`;
      })
      .join('\n');

    const rawWaMessage = `*ERMAY MOBİLYA - YENİ WEB SİPARİŞİ VE ÖDEME TEYİT TALEBİ*

📋 *Sipariş / ERP Satış Kodu:* ${orderNo}
👤 *Müşteri:* ${placedOrder.customerName} (${placedOrder.invoiceType === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'})
📞 *Telefon 1:* ${placedOrder.customerPhone}
${placedOrder.customerPhone2 ? `📞 *Telefon 2:* ${placedOrder.customerPhone2}\n` : ''}📧 *E-Posta:* ${placedOrder.customerEmail || '-'}
📍 *Teslimat:* ${placedOrder.shippingAddressLine} - ${placedOrder.shippingDistrict} / ${placedOrder.shippingCity}
${placedOrder.companyTitle ? `🏢 *Firma Unvanı:* ${placedOrder.companyTitle}\n` : ''}${placedOrder.taxNo ? `🏛 *Vergi No & Dairesi:* ${placedOrder.taxNo} (${placedOrder.taxOffice || '-'})\n` : ''}${placedOrder.orderNote ? `📝 *Sipariş Notu:* ${placedOrder.orderNote}\n` : ''}
🛒 *Sipariş Edilen Ürünler:*
${itemsListText}

💰 *Toplam Tutar (KDV Dahil):* ${formatPrice(Number(placedOrder.totalAmount))}
🔗 *Sipariş & Proforma Fişi Linki:* ${proformaSlipUrl}

Sayın Satış Sorumlusu, siparişim Web Depo üzerinden #${placedOrder.orderNumber} koduyla oluşturulmuştur. Ödeme ve teyit işlemlerimi tamamlayarak atölye üretim onayını başlatmak istiyorum.`;

    const whatsappUrl = `https://wa.me/905324194151?text=${encodeURIComponent(rawWaMessage)}`;

    return (
      <div className="w-full bg-[#FBF9F5] min-h-screen py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in print:p-0">
          
          {/* Header Card */}
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 text-center space-y-4 shadow-sm">
            <div className="inline-flex p-3.5 bg-emerald-100 text-emerald-800 rounded-full">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#7A6140] uppercase tracking-widest block">
                Atölye Satış Kaydı Oluşturuldu
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
                Siparişiniz Başarıyla Alındı!
              </h1>
              <p className="text-xs text-neutral-600 max-w-lg mx-auto leading-relaxed">
                Siparişiniz ERP sistemimize kaydedilmiş olup <strong>Ödeme Bekliyor</strong> statüsündedir. Satış sorumlumuz üzerinden ödemeyi teyit ettikten sonra siparişiniz <strong>Onaylandı</strong> durumuna geçecek ve tarafınıza e-posta bildirimi iletilecektir.
              </p>
            </div>

            {/* ERP Code Badge */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  Resmi CRM / ERP Sipariş Numaranız
                </span>
                <span className="text-2xl font-mono font-black text-neutral-900 tracking-wider">
                  {orderNo}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/70 text-amber-900 text-xs font-bold rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  Ödeme Bekleniyor
                </span>
              </div>
            </div>

            {/* =============================================================== */}
            {/* PRIMARY WHATSAPP BUTTON (Direct Customer to Sales Action)       */}
            {/* =============================================================== */}
            <div className="pt-2 space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <MessageSquare className="h-5 w-5" />
                <span>WhatsApp Sipariş Hattı ile Ödemeyi Tamamla (0532 419 41 51)</span>
              </a>
              <p className="text-[11px] text-neutral-500">
                Butona tıkladığınızda sipariş numaranız, ürün görselleri ve proforma raporunuz WhatsApp satış sorumlumuza otomatik aktarılacaktır.
              </p>
            </div>
          </div>

          {/* Printable Order Details / Proforma Slip */}
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-xs" id="proforma-slip">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <span className="font-serif font-black text-xl tracking-tight text-neutral-900">
                  ERMAY MOBİLYA
                </span>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                  Atölye Sipariş & Satış Fişi
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-neutral-800 block">
                  Kod: {orderNo}
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  {new Date().toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 bg-neutral-50 p-3.5 rounded-xs border border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Müşteri Bilgileri
                </span>
                <p className="font-bold text-neutral-900">{placedOrder.customerName}</p>
                <p className="text-neutral-600">{placedOrder.customerPhone} {placedOrder.customerPhone2 ? ` / ${placedOrder.customerPhone2}` : ''}</p>
                <p className="text-neutral-600">{placedOrder.customerEmail || '-'}</p>
                {placedOrder.companyTitle && (
                  <p className="font-semibold text-neutral-800 pt-1">
                    {placedOrder.companyTitle} (VKN: {placedOrder.taxNo} - {placedOrder.taxOffice})
                  </p>
                )}
              </div>

              <div className="space-y-1 bg-neutral-50 p-3.5 rounded-xs border border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Teslimat & Sevkiyat Adresi
                </span>
                <p className="font-bold text-neutral-900">
                  {placedOrder.shippingDistrict} / {placedOrder.shippingCity}
                </p>
                <p className="text-neutral-600 leading-relaxed">
                  {placedOrder.shippingAddressLine}
                </p>
                {placedOrder.orderNote && (
                  <p className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded-xs border border-amber-200 mt-1">
                    <strong>Not:</strong> {placedOrder.orderNote}
                  </p>
                )}
              </div>
            </div>

            {/* Products List with Photos */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                Sipariş Edilen Ürünler
              </span>

              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xs overflow-hidden">
                {items.map((item: OrderItem) => {
                  const imgUrl = item.product?.image || (Array.isArray(item.product?.images) ? item.product.images[0] : '');
                  return (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3.5">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.product?.name || 'Ürün'}
                            className="w-14 h-14 object-cover rounded-xs border border-neutral-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-neutral-100 rounded-xs flex items-center justify-center text-neutral-400 text-[10px] font-bold">
                            Görsel Yok
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-neutral-900 text-xs">
                            {item.product?.name || 'Mobilya'}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Adet: <strong className="text-neutral-800">{item.quantity}</strong>
                          </p>
                          {item.product?.erpItemCode && (
                            <span className="text-[9px] font-mono text-neutral-400">
                              ERP Kod: {item.product.erpItemCode}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-neutral-900 text-xs">
                          {formatPrice(Number(item.totalPrice))}
                        </span>
                        <span className="text-[10px] text-neutral-400 block">KDV Dahil</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financials Breakdown */}
            <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Ara Toplam (KDV Hariç):</span>
                <span className="font-mono">{formatPrice(Number(placedOrder.totalAmount) / 1.20)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Hesaplanan KDV (%20):</span>
                <span className="font-mono">{formatPrice(Number(placedOrder.totalAmount) - (Number(placedOrder.totalAmount) / 1.20))}</span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Genel Toplam:</span>
                <span className="text-[#7A6140] font-mono">{formatPrice(Number(placedOrder.totalAmount))}</span>
              </div>
            </div>

            {/* Print & Share Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Sipariş Fişini PDF Yazdır</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(proformaSlipUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 3000);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{isCopied ? 'Link Kopyalandı' : 'Sipariş Linkini Kopyala'}</span>
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-neutral-300 hover:border-[#C5A880] text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
              >
                <span>Ana Sayfaya Dön</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHECKOUT FORM VIEW
  // =========================================================================
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 p-4 py-16">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-sm shadow-sm p-8 text-center space-y-4">
          <div className="inline-flex p-3.5 bg-neutral-100 text-neutral-500 rounded-full">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="text-base font-bold uppercase tracking-wider text-neutral-900">
            Sepetiniz Boş
          </h1>
          <p className="text-xs text-neutral-500">
            Sipariş adımına geçebilmek için lütfen koleksiyonlarımızdan ürün seçiniz.
          </p>
          <Link
            href="/"
            className="w-full bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-widest py-3.5 px-4 rounded-xs transition-colors inline-block shadow-xs"
          >
            Koleksiyonları İncele
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FBF9F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back to Cart link */}
        <div className="mb-6">
          <Link
            href="/sepet"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sepete Geri Dön</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================================================= */}
          {/* LEFT: CUSTOMER DETAILS FORM (Requirements 6 & 7)              */}
          {/* ============================================================= */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              {/* Form Error Banner */}
              {formErrorMsg && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-xs text-xs flex items-start gap-3 animate-fade-in shadow-xs">
                  <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Lütfen Bilgileri Kontrol Ediniz:</span>
                    <span>{formErrorMsg}</span>
                  </div>
                </div>
              )}

              {/* 1. Müşteri Türü Seçimi: Kurumsal mı Şahıs mı? */}
              <div className="bg-white border border-neutral-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                    1. Fatura & Müşteri Türü
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Siparişiniz şahıs adına mı yoksa kurumsal firma adına mı düzenlenecektir?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomerType('INDIVIDUAL')}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xs border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      customerType === 'INDIVIDUAL'
                        ? 'border-[#C5A880] bg-[#FAF8F5] text-[#7A6140] ring-1 ring-[#C5A880]'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Şahıs / Bireysel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomerType('CORPORATE')}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xs border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      customerType === 'CORPORATE'
                        ? 'border-[#C5A880] bg-[#FAF8F5] text-[#7A6140] ring-1 ring-[#C5A880]'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Kurumsal Şirket</span>
                  </button>
                </div>
              </div>

              {/* 2. Kişisel & İletişim Bilgileri */}
              <div className="bg-white border border-neutral-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                    2. İletişim Bilgileri
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Sipariş onayınız ve teslimat koordinasyonu için kullanılacaktır.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Ad Soyad <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Telefon 1 (GSM / Cep) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phone1}
                          onChange={(e) => setPhone1(e.target.value)}
                          placeholder="0532 123 45 67"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Telefon 2 (İkinci Tel / Sabit)
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone2}
                          onChange={(e) => setPhone2(e.target.value)}
                          placeholder="0216 123 45 67 (Opsiyonel)"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      E-Posta Adresi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="siparis@ornek.com"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Teslimat Adresi Bilgileri */}
              <div className="bg-white border border-neutral-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                    3. Teslimat Adresi & Montaj Notu
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Ürünlerinizin sevk edileceği ve gerekirse montajın yapılacağı adres.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        İl (81 İl Kapsamı) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xs text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer ${
                          isCurrentCityDisabled
                            ? 'border-amber-400 bg-amber-50/40 text-amber-900'
                            : 'border-neutral-200 focus:border-[#C5A880]'
                        }`}
                      >
                        {TURKEY_CITIES.map((c) => {
                          const isCityServiceDisabled = deliveryConfig.disabledCityNames?.some(
                            (d) => d.trim().toLowerCase() === c.name.trim().toLowerCase()
                          );
                          return (
                            <option key={c.id} value={c.name}>
                              {c.name} {isCityServiceDisabled ? '⚠️ (Geçici Olarak Hizmet Dışı)' : ''}
                            </option>
                          );
                        })}
                        <option value="Diğer">Diğer İl / Bölge</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        İlçe <span className="text-rose-500">*</span>
                      </label>
                      {city === 'Diğer' || !availableDistricts || availableDistricts.length === 0 ? (
                        <input
                          type="text"
                          required
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Örn: Kadıköy, Nilüfer vb."
                          className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                        />
                      ) : (
                        <div className="space-y-2">
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white cursor-pointer"
                          >
                            {availableDistricts.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                            <option value="Diğer">Diğer / Belirtilmemiş</option>
                          </select>
                          {district === 'Diğer' && (
                            <input
                              type="text"
                              required
                              value={customDistrict}
                              onChange={(e) => setCustomDistrict(e.target.value)}
                              placeholder="Lütfen ilçe adını yazınız"
                              className="w-full px-3.5 py-2 bg-white border border-[#C5A880] rounded-xs text-xs font-semibold focus:outline-none"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Disabled City Notice Alert Banner */}
                  {isCurrentCityDisabled && (
                    <div className="bg-amber-50/90 border border-amber-300 text-amber-900 p-4 rounded-xs text-xs flex items-start gap-3 animate-fade-in shadow-xs">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-amber-950 block">
                          {city} İline Teslimat Hizmeti Geçici Olarak Durdurulmuştur
                        </span>
                        <p className="text-[11px] text-amber-900/90 leading-relaxed">
                          {deliveryConfig.customNotice ||
                            `${city} il ve ilçelerine lojistik ve montaj operasyonları yoğunluğu nedeniyle geçici olarak web sitemiz üzerinden doğrudan sipariş alınamamaktadır.`}
                        </p>
                        <p className="text-[11px] text-neutral-700 font-medium">
                          Özel sevkiyat, toptan proje veya teslimat durumu hakkında bilgi almak için lütfen{' '}
                          <span className="font-bold text-neutral-900 underline">WhatsApp Destek Hattımız</span>{' '}
                          ile iletişime geçiniz.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Açık Teslimat Adresi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Mahalle, Cadde/Sokak, Bina No, Kat ve Daire No"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Sipariş Notu / Özel Talep (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Örn: Montaj öncesi arayınız, bina asansörü mevcuttur vb."
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs focus:outline-none focus:border-[#C5A880] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Vergi & Fatura Bilgileri (TCKN veya Kurumsal VKN/Vergi Dairesi) */}
              <div className="bg-white border border-neutral-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                    4. Fatura & Vergi Bilgileri
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {customerType === 'CORPORATE' 
                      ? 'E-Fatura veya E-Arşiv düzenlenmesi için firma bilgilerinizi eksiksiz giriniz.'
                      : 'Bireysel fatura için T.C. Kimlik numaranızı girebilirsiniz.'}
                  </p>
                </div>

                {customerType === 'INDIVIDUAL' ? (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      T.C. Kimlik Numarası (TCKN)
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={tcKn}
                      onChange={(e) => setTcKn(e.target.value.replace(/\D/g, ''))}
                      placeholder="11 haneli T.C. Kimlik No (Opsiyonel)"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Belirtilmediği takdirde fatura 11111111111 nihai tüketici kodu ile düzenlenir.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Şirket / Firma Resmi Unvanı <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={companyTitle}
                        onChange={(e) => setCompanyTitle(e.target.value)}
                        placeholder="Örn: Ermay Mobilya Mimarlık San. ve Tic. Ltd. Şti."
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Vergi Kimlik Numarası (VKN) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={taxNo}
                          onChange={(e) => setTaxNo(e.target.value.replace(/\D/g, ''))}
                          placeholder="10 haneli VKN"
                          className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Vergi Dairesi <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={taxOffice}
                          onChange={(e) => setTaxOffice(e.target.value)}
                          placeholder="Örn: Kadıköy, Ümraniye vb."
                          className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. KVKK Onayı & Siparişi Tamamla Butonu */}
              <div className="bg-white border border-neutral-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-4">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={kvkkAccepted}
                    onChange={(e) => setKvkkAccepted(e.target.checked)}
                    className="accent-[#C5A880] h-4 w-4 rounded mt-0.5"
                  />
                  <span>
                    6698 Sayılı <strong>Kişisel Verilerin Korunması Kanunu (KVKK)</strong> Aydınlatma Metni'ni ve <strong>Mesafeli Satış Sözleşmesi</strong> şartlarını okudum, kabul ediyorum.
                  </span>
                </label>

                {isCurrentCityDisabled && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    <span>Seçtiğiniz il ({city}) için teslimat hizmeti şu anda kapalıdır. Siparişi tamamlamak için lütfen teslimat bölgesini güncelleyiniz.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isCurrentCityDisabled}
                  className={`w-full text-white text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-xs transition-colors flex items-center justify-center gap-2.5 shadow-md ${
                    isCurrentCityDisabled
                      ? 'bg-neutral-400 cursor-not-allowed opacity-75'
                      : 'bg-neutral-900 hover:bg-[#C5A880] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sipariş ERP Sistemine İletiliyor...</span>
                    </>
                  ) : isCurrentCityDisabled ? (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span>Teslimat Bölgesi Hizmet Dışı ({city})</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Alışverişi Tamamla & WhatsApp Ödeme Hattına İlerle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ============================================================= */}
          {/* RIGHT: ORDER SUMMARY SIDEBAR                                   */}
          {/* ============================================================= */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-white border border-neutral-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block pb-2 border-b border-neutral-100">
                Sipariş Özeti ({cart.length} Ürün)
              </span>

              {/* Cart Items List */}
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const img = item.product.image || item.product.images?.[0] || '';
                  return (
                    <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img
                            src={img}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-xs border border-neutral-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-100 rounded-xs flex items-center justify-center text-neutral-400 text-[10px]">
                            Görsel
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1">{item.product.name}</p>
                          <p className="text-[11px] text-neutral-500">Miktar: {item.quantity} adet</p>
                        </div>
                      </div>
                      <span className="font-bold text-neutral-900 whitespace-nowrap">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-neutral-100 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="İndirim Kuponu"
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#C5A880]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                  >
                    Uygula
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-[11px] font-semibold ${discountAmount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {couponMsg}
                  </p>
                )}
              </form>

              {/* Price Calculation */}
              <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Ara Toplam:</span>
                  <span className="font-mono">{formatPrice(totalCartAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Kupon İndirimi:</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>KDV (%20 Dahil):</span>
                  <span className="font-mono">{formatPrice(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Ödenecek Tutar:</span>
                  <span className="text-[#7A6140] font-mono">{formatPrice(finalAmount)}</span>
                </div>
              </div>

              {/* Safe Shopping Guarantee */}
              <div className="bg-[#FAF8F5] p-3 rounded-xs border border-neutral-200/80 space-y-1 text-[11px] text-neutral-600">
                <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                  <ShieldCheck className="h-4 w-4 text-[#C5A880]" />
                  <span>Ermay Güvencesi & WhatsApp Doğrudan Satış</span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-normal">
                  Siparişiniz atölye satış sorumlumuz tarafından teyit edilir, ödemeniz tamamlandıktan sonra üretime ve sevkiyata yönlendirilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
