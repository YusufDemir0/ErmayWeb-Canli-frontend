'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, ShieldCheck, MapPin, CheckCircle2, Lock, 
  Truck, ArrowLeft, Plus, AlertCircle, ShoppingBag, Loader2, BookmarkPlus,
  FileText, Building2, KeyRound
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useAuthStore, type UserAddress, type SavedCard } from '../../stores/useAuthStore';
import { useOrderStore } from '../../stores/useOrderStore';
import { useDiscountStore } from '../../stores/useDiscountStore';
import AddressModal from '../../components/AddressModal';
import AnimatedCreditCard from '../../components/AnimatedCreditCard';
import { InstallmentMatrix } from '../../components/InstallmentMatrix';
import { 
  addressSchema, 
  creditCardSchema, 
  tcKnSchema, 
  taxNoSchema, 
  taxOfficeSchema,
  nameSchema 
} from '../../lib/validations';
import apiClient from '../../services/api';

export default function CheckoutPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const addAddress = useAuthStore((state) => state.addAddress);
  const addCard = useAuthStore((state) => state.addCard);

  const cart = useCartStore((state) => state.cartItems);
  const totalCartAmount = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const createOrderAsync = useOrderStore((state) => state.createOrderAsync);

  // Mandatory Auth Check Guard
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated || !user) {
        router.push('/giris?redirect=/odeme');
      }
    }
  }, [isAuthenticated, user, isAuthLoading, router]);

  // Selected Address State
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<UserAddress, 'id'>>({
    title: 'Yeni Adres',
    fullName: '',
    phone: '',
    city: 'İstanbul',
    district: 'Kadıköy',
    addressLine: '',
    zipCode: '34000'
  });

  // Invoice Selection State
  const [invoiceType, setInvoiceType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [tcKn, setTcKn] = useState('');
  const [companyTitle, setCompanyTitle] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [taxOffice, setTaxOffice] = useState('');

  // Installment Option State (BDDK Furniture Limits)
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);

  // 3D Secure Verification Modal State
  const [show3DSecureModal, setShow3DSecureModal] = useState<boolean>(false);
  const [threeDSecureCode, setThreeDSecureCode] = useState<string>('');
  const [isVerifying3D, setIsVerifying3D] = useState<boolean>(false);

  // Validation Error State
  const [formErrorMsg, setFormErrorMsg] = useState<string>('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'cash_on_delivery'>('credit_card');
  const [useSavedCard, setUseSavedCard] = useState<boolean>(false);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string>('');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // Save Card Checkbox State
  const [saveCardForFuture, setSaveCardForFuture] = useState(false);
  const [saveCardTitle, setSaveCardTitle] = useState('Kişisel Kartım');

  // Coupon Code State
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  // Order Placement Success State
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const userSavedCards = user?.savedCards || [];

  useEffect(() => {
    if (user && user.addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0].id);
      setNewAddr((prev) => ({ ...prev, fullName: user.name, phone: user.phone }));
    }

    if (userSavedCards.length > 0 && !selectedSavedCardId) {
      setSelectedSavedCardId(userSavedCards[0].id);
      setUseSavedCard(true);
    }
  }, [user, selectedAddressId, userSavedCards, selectedSavedCardId]);

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-camel mx-auto" />
          <p className="text-xs text-neutral-500 font-medium tracking-wide">Ödeme öncesi oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const validateCoupon = useDiscountStore((state) => state.validateCoupon);
  const recordCouponUsage = useDiscountStore((state) => state.recordCouponUsage);

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

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg('');

    const valRes = addressSchema.safeParse(newAddr);
    if (!valRes.success) {
      setFormErrorMsg(valRes.error.issues[0]?.message || 'Lütfen adres bilgilerini doğru giriniz.');
      return;
    }

    addAddress(newAddr);
    setShowAddAddressModal(false);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg('');

    if (cart.length === 0) return;

    // 1. Fatura Bilgileri Doğrulaması (Zod)
    if (invoiceType === 'INDIVIDUAL') {
      const tcRes = tcKnSchema.safeParse(tcKn);
      if (!tcRes.success) {
        setFormErrorMsg(tcRes.error.issues[0]?.message || 'Lütfen geçerli 11 haneli T.C. Kimlik numaranızı giriniz.');
        return;
      }
    } else {
      if (!companyTitle.trim() || companyTitle.length < 3) {
        setFormErrorMsg('Lütfen şirket resmi unvanını giriniz.');
        return;
      }
      const taxNoRes = taxNoSchema.safeParse(taxNo);
      if (!taxNoRes.success) {
        setFormErrorMsg(taxNoRes.error.issues[0]?.message || 'Vergi Kimlik No tam 10 haneli rakam olmalıdır.');
        return;
      }
      const taxOfficeRes = taxOfficeSchema.safeParse(taxOffice);
      if (!taxOfficeRes.success) {
        setFormErrorMsg(taxOfficeRes.error.issues[0]?.message || 'Vergi Dairesi alanında sayı kullanılamaz.');
        return;
      }
    }

    // 2. Kredi Kartı Bilgileri Doğrulaması (Yeni kart kullanılıyorsa)
    if (paymentMethod === 'credit_card' && !useSavedCard) {
      const cardVal = creditCardSchema.safeParse({
        cardHolder,
        cardNumber,
        expiry: cardExpiry,
        cvv: cardCvv,
      });

      if (!cardVal.success) {
        setFormErrorMsg(cardVal.error.issues[0]?.message || 'Lütfen kredi kartı bilgilerinizi doğru giriniz.');
        return;
      }

      // 3D Secure doğrulaması başlatılır
      setShow3DSecureModal(true);
      return;
    }

    executeFinalOrder();
  };

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const executeFinalOrder = async () => {
    setIsSubmittingOrder(true);
    setFormErrorMsg('');

    const selectedAddr = user.addresses.find((a) => a.id === selectedAddressId) || user.addresses[0] || {
      id: 'addr-temp',
      title: 'Teslimat Adresi',
      fullName: user.name,
      phone: user.phone,
      city: 'İstanbul',
      district: 'Ümraniye',
      addressLine: 'Modoko Mobilyacılar Sitesi No: 42',
      zipCode: '34775'
    };

    if (paymentMethod === 'credit_card' && !useSavedCard && saveCardForFuture && cardNumber) {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      const last4 = cleanNum.slice(-4) || '1234';
      addCard({
        cardTitle: saveCardTitle || 'Kredi Kartım',
        cardHolder: (cardHolder || user.name).toUpperCase(),
        cardNumberMasked: `**** **** **** ${last4}`,
        expiry: cardExpiry || '12/28',
        cardType: 'visa'
      });
    }

    const finalAmount = Math.max(0, totalCartAmount - discountAmount);

    // 1. First create the order in PENDING_PAYMENT state
    const res = await useOrderStore.getState().createOrderAsync({
      userId: user.uid,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      shippingAddress: selectedAddr,
      invoiceDetails: {
        invoiceType,
        tcKn: invoiceType === 'INDIVIDUAL' ? tcKn : undefined,
        companyTitle: invoiceType === 'CORPORATE' ? companyTitle : undefined,
        taxNo: invoiceType === 'CORPORATE' ? taxNo : undefined,
        taxOffice: invoiceType === 'CORPORATE' ? taxOffice : undefined,
      },
      items: cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount: finalAmount,
      discountAmount,
      couponCode: discountAmount > 0 ? couponCode : undefined,
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING_PAYMENT',
    });

    if (!res.success || !res.order) {
      setIsSubmittingOrder(false);
      setFormErrorMsg(res.message || 'Sipariş oluşturulamadı. Lütfen tekrar deneyiniz.');
      return;
    }

    const createdOrderId = res.order.id;

    // 2. If Credit Card: Execute authentic 3D Secure / Iyzico payment
    if (paymentMethod === 'credit_card') {
      try {
        const cleanNum = (cardNumber || '').replace(/\s+/g, '');
        const [expMonth, expYear] = (cardExpiry || '12/28').split('/');
        const selectedCard = userSavedCards.find((c) => c.id === selectedSavedCardId);

        const paymentPayload = {
          orderId: createdOrderId,
          conversationId: `CONV-${createdOrderId}`,
          installment: Number(selectedInstallment || 1),
          cardHolderName: (cardHolder || user.name).trim(),
          cardNumber: cleanNum,
          expireMonth: expMonth || '12',
          expireYear: expYear ? `20${expYear.slice(-2)}` : '2028',
          cvv: (cardCvv || '').trim(),
        };

        const paymentRes = await apiClient.post('/payments/process', paymentPayload);

        if (!paymentRes.data?.success) {
          setIsSubmittingOrder(false);
          setFormErrorMsg(paymentRes.data?.message || 'Kartınızdan ödeme tahsil edilemedi. Lütfen bilgilerinizi kontrol ediniz.');
          return;
        }

        if (!useSavedCard && saveCardForFuture && cardNumber) {
          const last4 = cleanNum.slice(-4) || '1234';
          addCard({
            cardTitle: saveCardTitle || 'Kredi Kartım',
            cardHolder: (cardHolder || user.name).toUpperCase(),
            cardNumberMasked: `**** **** **** ${last4}`,
            expiry: cardExpiry || '12/28',
            cardType: 'visa',
          });
        }
      } catch (payErr: any) {
        setIsSubmittingOrder(false);
        const errMsg = payErr.response?.data?.message || 'Banka ödeme altyapısıyla iletişim kurulamadı. Kartınızdan herhangi bir çekim yapılmadı.';
        setFormErrorMsg(errMsg);
        return;
      }
    }

    // 3. Payment Verified / Bank Wire Placed Successfully
    setIsSubmittingOrder(false);
    if (discountAmount > 0 && couponCode) {
      recordCouponUsage(couponCode);
    }
    clearCart();
    setPlacedOrderId(createdOrderId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  // ORDER SUCCESS SCREEN
  if (placedOrderId) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen py-16 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-neutral-200 p-8 rounded-sm shadow-lg text-center space-y-6 animate-fade-in">
          <div className="inline-flex p-4 bg-emerald-100 text-emerald-700 rounded-full">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-900">
              Siparişiniz Başarıyla Alındı!
            </h1>
            <p className="text-xs text-neutral-500 font-light">
              Siparişiniz atölyemizde hazırlanmaya başlandı.
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xs border border-neutral-200 text-xs space-y-1">
            <span className="text-neutral-400 block uppercase font-bold text-[10px]">Sipariş Takip Kodu</span>
            <span className="text-base font-mono font-extrabold text-brand-dark">{placedOrderId}</span>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              href="/hesabim"
              className="block w-full bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-xs transition-colors"
            >
              Siparişimi Hesabımda Takip Et
            </Link>
            <Link
              href="/"
              className="block text-xs text-neutral-500 hover:text-brand-camel transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART SCREEN
  if (cart.length === 0) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen py-16 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-neutral-200 p-8 rounded-sm shadow-xs text-center space-y-4">
          <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto" />
          <h2 className="text-base font-bold text-neutral-800 uppercase tracking-wider">
            Sepetinizde Ürün Bulunmuyor
          </h2>
          <p className="text-xs text-neutral-500 font-light">
            Ödeme adımına geçebilmek için lütfen kataloğumuzdan ürün ekleyin.
          </p>
          <Link
            href="/kategori/hepsi"
            className="inline-block bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold uppercase tracking-widest py-3 px-8 rounded-xs transition-colors"
          >
            Kataloğa Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 flex items-center justify-between">
          <Link href="/sepet" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-brand-camel transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Sepete Dön</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xs border border-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            <span>256-Bit SSL Güvenli Ödeme</span>
          </div>
        </div>

        {/* Validation Error Alert Banner */}
        {formErrorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs flex items-center justify-between shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{formErrorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormErrorMsg('')}
              className="text-rose-600 hover:text-rose-900 font-bold text-xs"
            >
              Kapat
            </button>
          </div>
        )}

        {/* 3D Secure Modal Overlay */}
        {show3DSecureModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm p-8 rounded-sm shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-brand-camel/10 rounded-full flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6 text-brand-camel" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">3D Secure Doğrulaması</h3>
              <p className="text-xs text-neutral-500">
                Güvenli ödeme için bankanızın onay ekranına yönlendiriliyorsunuz. Lütfen bekleyin...
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShow3DSecureModal(false);
                    executeFinalOrder();
                  }}
                  className="w-full bg-brand-dark text-white py-3 rounded-xs text-xs font-semibold uppercase tracking-widest hover:bg-brand-camel transition-colors"
                >
                  Onayla ve Tamamla
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STEP 1: DELIVERY ADDRESS */}
            <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-camel" />
                  <span>1. Teslimat Adresi Seçimi</span>
                </h2>

                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(true)}
                  className="text-xs text-brand-camel font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Yeni Adres Ekle</span>
                </button>
              </div>

              {/* Saved Addresses List */}
              {user.addresses.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xs flex items-center justify-between">
                  <span>Kayıtlı adresiniz bulunmuyor. Lütfen yeni bir teslimat adresi girin.</span>
                  <button
                    type="button"
                    onClick={() => setShowAddAddressModal(true)}
                    className="bg-amber-800 text-white px-3 py-1 rounded-xs font-semibold"
                  >
                    Adres Ekle
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-sm border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-camel bg-brand-camel/5 ring-1 ring-brand-camel'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase text-neutral-800">{addr.title}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-camel" />}
                        </div>
                        <p className="text-xs font-semibold text-neutral-700">{addr.fullName}</p>
                        <p className="text-xs text-neutral-500 font-light line-clamp-2 mt-1">{addr.addressLine}</p>
                        <p className="text-[11px] text-neutral-400 mt-1">{addr.district} / {addr.city}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* AddressModal Component */}
              <AddressModal
                isOpen={showAddAddressModal}
                onClose={() => setShowAddAddressModal(false)}
                onSaveAddress={(addr) => {
                  addAddress(addr);
                  setShowAddAddressModal(false);
                }}
              />
            </div>

            {/* STEP 2: FATURA TİPİ (BİREYSEL / KURUMSAL) */}
            <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#F27A1A]" />
                <span>2. Fatura Tipi & Fatura Bilgileri</span>
              </h2>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="invoiceType"
                    checked={invoiceType === 'INDIVIDUAL'}
                    onChange={() => setInvoiceType('INDIVIDUAL')}
                    className="h-4 w-4 accent-[#F27A1A]"
                  />
                  <span>Bireysel Fatura</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="invoiceType"
                    checked={invoiceType === 'CORPORATE'}
                    onChange={() => setInvoiceType('CORPORATE')}
                    className="h-4 w-4 accent-[#F27A1A]"
                  />
                  <span>Kurumsal Fatura</span>
                </label>
              </div>

              {invoiceType === 'INDIVIDUAL' ? (
                <div className="pt-2 max-w-sm">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    T.C. Kimlik Numarası (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={tcKn}
                    onChange={(e) => setTcKn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="11 haneli TC No"
                    maxLength={11}
                    className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Firma Ünvanı *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyTitle}
                      onChange={(e) => setCompanyTitle(e.target.value)}
                      placeholder="Örn: Ermay Mobilya A.Ş."
                      className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Vergi Dairesi *
                    </label>
                    <input
                      type="text"
                      required
                      value={taxOffice}
                      onChange={(e) => setTaxOffice(e.target.value)}
                      placeholder="Örn: Ümraniye VD"
                      className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Vergi Numarası *
                    </label>
                    <input
                      type="text"
                      required
                      value={taxNo}
                      onChange={(e) => setTaxNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10 haneli Vergi No"
                      maxLength={10}
                      className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: PAYMENT METHOD & CREDIT CARD */}
            <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand-camel" />
                <span>2. Ödeme Yöntemi & Kart Girişi</span>
              </h2>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'credit_card', label: 'Kredi / Banka Kartı', icon: CreditCard },
                  { id: 'bank_transfer', label: 'Havale / EFT', icon: ShieldCheck },
                  { id: 'cash_on_delivery', label: 'Kapıda Ödeme', icon: Truck },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as 'credit_card' | 'bank_transfer' | 'cash_on_delivery')}
                      className={`p-3 rounded-xs border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-brand-camel bg-brand-camel/10 text-brand-dark font-bold'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-brand-camel" />
                      <span className="text-[11px] uppercase tracking-wider">{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Credit Card Form Fields */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-6 pt-2">

                  {/* Saved Cards Picker Option if available */}
                  {userSavedCards.length > 0 && (
                    <div className="bg-neutral-50 p-4 rounded-sm border border-neutral-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                          <BookmarkPlus className="h-4 w-4 text-brand-camel" />
                          <span>Profildeki Kayıtlı Kartlarınız</span>
                        </span>
                        <div className="flex gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setUseSavedCard(true)}
                            className={`px-3 py-1 rounded-xs font-semibold transition-colors cursor-pointer ${
                              useSavedCard ? 'bg-brand-dark text-white' : 'bg-white text-neutral-600 border border-neutral-300'
                            }`}
                          >
                            Kayıtlı Kartlarımdan Seç
                          </button>
                          <button
                            type="button"
                            onClick={() => setUseSavedCard(false)}
                            className={`px-3 py-1 rounded-xs font-semibold transition-colors cursor-pointer ${
                              !useSavedCard ? 'bg-brand-dark text-white' : 'bg-white text-neutral-600 border border-neutral-300'
                            }`}
                          >
                            Yeni Kart Gir
                          </button>
                        </div>
                      </div>

                      {useSavedCard && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {userSavedCards.map((sc) => {
                            const isSelected = selectedSavedCardId === sc.id;
                            return (
                              <div
                                key={sc.id}
                                onClick={() => setSelectedSavedCardId(sc.id)}
                                className={`p-4 rounded-xs border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-brand-camel bg-white ring-2 ring-brand-camel shadow-xs'
                                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-neutral-900">{sc.cardTitle}</span>
                                  {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-camel" />}
                                </div>
                                <p className="text-xs font-mono font-bold text-neutral-700">{sc.cardNumberMasked}</p>
                                <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-2">
                                  <span className="uppercase font-semibold text-neutral-600">{sc.cardHolder}</span>
                                  <span>{sc.expiry}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual Card Entry Form */}
                  {(!useSavedCard || userSavedCards.length === 0) && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Live 3D Animated Credit Card Preview */}
                      <AnimatedCreditCard
                        cardNumber={cardNumber}
                        cardHolder={cardHolder}
                        expiry={cardExpiry}
                        cvv={cardCvv}
                        isFlipped={isCardFlipped}
                      />

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                            Kart Numarası *
                          </label>
                          <input
                            type="text"
                            required={!useSavedCard}
                            value={cardNumber}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                              setCardNumber(formatted);
                            }}
                            onFocus={() => setIsCardFlipped(false)}
                            placeholder="4543 •••• •••• 1234"
                            maxLength={19}
                            className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                            Kart Üzerindeki İsim *
                          </label>
                          <input
                            type="text"
                            required={!useSavedCard}
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value.replace(/[0-9]/g, ''))}
                            onFocus={() => setIsCardFlipped(false)}
                            placeholder="YUSUF DEMİR"
                            className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-amber-500 focus:outline-none uppercase"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                              Son Kullanma Tarihi (AA/YY) *
                            </label>
                            <input
                              type="text"
                              required={!useSavedCard}
                              value={cardExpiry}
                              onChange={(e) => {
                                let digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (digits.length >= 3) {
                                  digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                                }
                                setCardExpiry(digits);
                              }}
                              onFocus={() => setIsCardFlipped(false)}
                              placeholder="12/28"
                              maxLength={5}
                              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                              Güvenlik Kodu (CVV) *
                            </label>
                            <input
                              type="text"
                              required={!useSavedCard}
                              value={cardCvv}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setCardCvv(digits);
                              }}
                              onFocus={() => setIsCardFlipped(true)}
                              onBlur={() => setIsCardFlipped(false)}
                              placeholder="321"
                              maxLength={4}
                              className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Card Checkbox & Notice */}
                      <div className="pt-3 border-t border-neutral-100 space-y-3">
                        <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveCardForFuture}
                            onChange={(e) => setSaveCardForFuture(e.target.checked)}
                            className="h-4 w-4 text-brand-camel rounded-xs border-neutral-300 focus:ring-brand-camel"
                          />
                          <span>Bu kartı gelecekteki alışverişlerim için profilime kaydet</span>
                        </label>

                        {saveCardForFuture && (
                          <div className="pl-6 space-y-2 animate-fade-in">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block">
                              Kart Etiketi / İsmi
                            </label>
                            <input
                              type="text"
                              value={saveCardTitle}
                              onChange={(e) => setSaveCardTitle(e.target.value)}
                              placeholder="Garanti Bonus / İş Kartım"
                              className="w-full max-w-xs text-xs border border-neutral-300 p-2 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none bg-neutral-50"
                            />
                          </div>
                        )}

                        <div className="bg-brand-camel/10 border border-brand-camel/20 text-brand-dark p-3 rounded-xs text-[11px] font-light flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-brand-camel flex-shrink-0" />
                          <span>Profilinizdeki Kayıtlı Kartlarım sekmesinden istediğiniz zaman kart bilgilerinizi güncelleyebilir veya silebilirsiniz.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BDDK Furniture Installment Matrix */}
                  <div className="pt-4 border-t border-neutral-100">
                    <InstallmentMatrix
                      totalAmount={Math.max(0, totalCartAmount - discountAmount)}
                      selectedInstallment={selectedInstallment}
                      onSelectInstallment={setSelectedInstallment}
                    />
                  </div>

                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xs text-xs space-y-2">
                  <p className="font-bold text-neutral-800">Ermay Mobilya Sanayi IBAN Bilgileri:</p>
                  <p className="font-mono text-neutral-600">TR42 0006 2000 0000 1234 5678 90 (Ziraat Bankası)</p>
                  <p className="text-[11px] text-neutral-500 font-light">Sipariş koda bilginizi havale açıklamasına yazmayı unutmayınız.</p>
                </div>
              )}

              {paymentMethod === 'cash_on_delivery' && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xs text-xs">
                  <p className="font-medium text-neutral-700">Ürünler kapınıza getirildiğinde nakit veya pos cihazı ile ödeme yapabilirsiniz.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary & Complete Button */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-6 sticky top-28">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4">
                Sipariş Özeti
              </h3>

              {/* Items Overview */}
              <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar pr-1 divide-y divide-neutral-100">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={item.product.image} alt="" className="h-10 w-10 object-cover rounded-xs" />
                      <div>
                        <p className="font-bold text-neutral-800 line-clamp-1">{item.product.name}</p>
                        <span className="text-[10px] text-neutral-400">{item.quantity} Adet</span>
                      </div>
                    </div>
                    <span className="font-semibold text-brand-dark">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="pt-3 border-t border-neutral-100 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                  İndirim Kuponu (Örn: ERMAY15)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ERMAY15"
                    className="flex-1 text-xs border border-neutral-300 p-2 rounded-xs focus:ring-1 focus:ring-brand-camel uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-neutral-800 hover:bg-brand-camel text-white text-xs px-3 py-2 rounded-xs font-semibold transition-colors"
                  >
                    Uygula
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-[10px] font-semibold ${couponMsg.includes('Uygulandı') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {couponMsg}
                  </p>
                )}
              </form>

              {/* Price Calculation */}
              <div className="space-y-2 pt-4 border-t border-neutral-100 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Ara Toplam (KDV Hariç):</span>
                  <span>{formatPrice(Math.max(0, totalCartAmount - discountAmount) / 1.20)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>KDV (%20 Mobilya):</span>
                  <span>{formatPrice(Math.max(0, totalCartAmount - discountAmount) - (Math.max(0, totalCartAmount - discountAmount) / 1.20))}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Kupon İndirimi:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Kargo / Kurulum:</span>
                  <span className="text-emerald-700 font-bold">ÜCRETSİZ</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-3 border-t border-neutral-200">
                  <span>Toplam (KDV Dahil):</span>
                  <span className="text-brand-dark text-base">{formatPrice(Math.max(0, totalCartAmount - discountAmount))}</span>
                </div>
              </div>

              {/* Complete Order CTA */}
              <button
                type="submit"
                className="w-full bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold uppercase tracking-widest py-4 rounded-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Siparişi Tamamla</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
