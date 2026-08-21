'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, Package, MapPin, CreditCard, LogOut, Plus, Trash2, Edit3, 
  Check, AlertCircle, ShoppingBag, Loader2, ArrowLeft, KeyRound, 
  ShieldCheck, Sparkles, ChevronRight, Eye, EyeOff, Lock, FileText, Upload, Printer
} from 'lucide-react';
import { useAuthStore, type UserAddress, type SavedCard } from '../../stores/useAuthStore';
import { useOrderStore, type Order } from '../../stores/useOrderStore';
import IntlPhoneInput from '../../components/IntlPhoneInput';
import AddressModal from '../../components/AddressModal';
import AnimatedCreditCard from '../../components/AnimatedCreditCard';
import { InvoiceModal } from '../../components/InvoiceModal';
import { ReceiptUploadModal } from '../../components/ReceiptUploadModal';
import { apiClient } from '../../services/api';

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  type AccountTabId = 'overview' | 'orders' | 'addresses' | 'cards' | 'ayarlar';
  const initialTab = (searchParams.get('tab') || 'overview') as AccountTabId;

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const logout = useAuthStore((state) => state.logout);
  const updateProfileInfo = useAuthStore((state) => state.updateProfileInfo);
  const addAddress = useAuthStore((state) => state.addAddress);
  const updateAddress = useAuthStore((state) => state.updateAddress);
  const deleteAddress = useAuthStore((state) => state.deleteAddress);
  const addCard = useAuthStore((state) => state.addCard);
  const deleteCard = useAuthStore((state) => state.deleteCard);

  const allOrders = useOrderStore((state) => state.orders);
  const userOrders = React.useMemo(() => {
    if (!user) return [];
    return allOrders.filter((o) => o.userId === user.uid);
  }, [allOrders, user]);

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'cards' | 'ayarlar'>(initialTab);

  // Sync activeTab with URL search params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'orders', 'addresses', 'cards', 'ayarlar'].includes(tabParam)) {
      setActiveTab(tabParam as AccountTabId);
    }
  }, [searchParams]);

  // Handle Tab Switch & Update URL searchParams
  const switchTab = (tab: 'overview' | 'orders' | 'addresses' | 'cards' | 'ayarlar') => {
    setActiveTab(tab);
    router.push(`/hesabim?tab=${tab}`, { scroll: false });
  };

  // Auth Protection Guard
  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || !user)) {
      router.push('/giris?redirect=/hesabim');
    }
  }, [isAuthenticated, user, isAuthLoading, router]);

  // Profile Settings Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  // Address Form Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<UserAddress, 'id'>>({
    title: '',
    fullName: '',
    phone: '',
    city: 'İstanbul',
    district: 'Kadıköy',
    addressLine: '',
    zipCode: '34000'
  });

  // Card Form Modal & 3D Card Animation State
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('Kişisel Kartım');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Enterprise Invoice & Receipt Modals State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName((prev) => prev || user.name || '');
      setProfilePhone((prev) => (prev && prev !== '+90 ' ? prev : (user.phone || '+90 ')));
    }
  }, [user?.name, user?.phone]);

  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C5A880] mx-auto" />
          <p className="text-xs text-neutral-500 font-medium tracking-wide">Oturum bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Handle Profile Update Submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    if (/\d/.test(profileName)) {
      setProfileErrorMsg('Ad Soyad alanında rakam bulunamaz.');
      return;
    }

    const nationalDigits = profilePhone.replace(/^\+\d+\s*/, '').replace(/\D/g, '');
    if (nationalDigits.length !== 10) {
      setProfileErrorMsg('Telefon numarası alan kodu hariç tam 10 haneli olmalıdır. (Örn: 5321234567)');
      return;
    }

    const res = await updateProfileInfo(profileName, profilePhone);
    if (res.success) {
      setProfileSuccessMsg('Profil bilgileriniz başarıyla güncellendi.');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } else {
      setProfileErrorMsg(res.message);
    }
  };

  // Handle Password Update Submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg('');
    setPassErrorMsg('');

    if (newPass.length < 6) {
      setPassErrorMsg('Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassErrorMsg('Yeni şifreniz ile şifre tekrarı birbiriyle eşleşmiyor.');
      return;
    }

    try {
      const res = await apiClient.post('/auth/change-password', {
        currentPassword: currentPass,
        newPassword: newPass,
      });

      if (res.data?.success) {
        setPassSuccessMsg(res.data.message || 'Şifreniz başarıyla güncellendi.');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        setTimeout(() => setPassSuccessMsg(''), 4000);
      } else {
        setPassErrorMsg(res.data?.message || 'Şifre güncellenemedi.');
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message)
        : 'Şifreniz güncellenirken bir hata oluştu.';
      setPassErrorMsg(msg || 'Şifreniz güncellenirken bir hata oluştu.');
    }
  };

  // Handle Address Form Submission
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.title || !addrForm.addressLine) return;

    if (editingAddrId) {
      updateAddress(editingAddrId, addrForm);
    } else {
      addAddress(addrForm);
    }

    setShowAddressModal(false);
    setEditingAddrId(null);
    setAddrForm({
      title: '',
      fullName: user.name,
      phone: user.phone,
      city: 'İstanbul',
      district: 'Kadıköy',
      addressLine: '',
      zipCode: '34000'
    });
  };

  // Handle Card Form Submission
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber) return;

    const cleanNum = newCardNumber.replace(/\s+/g, '');
    const last4 = cleanNum.slice(-4) || '1234';

    addCard({
      cardTitle: newCardTitle || 'Kişisel Kartım',
      cardHolder: (newCardHolder || user.name).toUpperCase(),
      cardNumberMasked: `**** **** **** ${last4}`,
      expiry: newCardExpiry || '12/28',
      cardType: cleanNum.startsWith('4') ? 'visa' : cleanNum.startsWith('5') ? 'mastercard' : 'troy'
    });

    setShowCardModal(false);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setNewCardCvv('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Bugün';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full bg-neutral-50 min-h-screen py-10 text-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ---------------------------------------------------- */}
        {/* CLEAN WHITE & CAMEL HEADER BANNER                    */}
        {/* ---------------------------------------------------- */}
        <div className="bg-white rounded-sm border border-neutral-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-camel-light/50 border-2 border-brand-camel p-1 shadow-xs flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xl md:text-2xl font-bold text-brand-dark">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'E'}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-brand-camel text-white p-1 rounded-full shadow-xs" title="Onaylı Üye">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            {/* User Meta */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900">{user.name}</h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Müşteri Hesabı
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">{user.email}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => switchTab('ayarlar')}
              className={`px-4 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ayarlar' 
                  ? 'bg-brand-dark text-white font-bold' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              <Edit3 className="h-4 w-4" />
              <span>Bilgileri Düzenle</span>
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xs text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* KPI QUICK STATS GRID                                */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => switchTab('orders')}
            className="p-5 rounded-sm bg-white border border-neutral-200 hover:border-brand-camel transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Toplam Sipariş</span>
              <Package className="h-5 w-5 text-brand-camel group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{userOrders.length}</p>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>Siparişlerimi Görüntüle</span>
              <ChevronRight className="h-3 w-3 text-brand-camel" />
            </p>
          </div>

          <div 
            onClick={() => switchTab('addresses')}
            className="p-5 rounded-sm bg-white border border-neutral-200 hover:border-brand-camel transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Kayıtlı Adresler</span>
              <MapPin className="h-5 w-5 text-brand-camel group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{user.addresses ? user.addresses.length : 0}</p>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>Adres Defterim</span>
              <ChevronRight className="h-3 w-3 text-brand-camel" />
            </p>
          </div>

          <div 
            onClick={() => switchTab('cards')}
            className="p-5 rounded-sm bg-white border border-neutral-200 hover:border-brand-camel transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Kayıtlı Kartlar</span>
              <CreditCard className="h-5 w-5 text-brand-camel group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{user.savedCards ? user.savedCards.length : 0}</p>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>Saklanan Kartlarım</span>
              <ChevronRight className="h-3 w-3 text-brand-camel" />
            </p>
          </div>

          <div 
            onClick={() => switchTab('ayarlar')}
            className="p-5 rounded-sm bg-white border border-neutral-200 hover:border-brand-camel transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Hesap Durumu</span>
              <ShieldCheck className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">Aktif <span className="text-xs font-normal text-neutral-500">Doğrulanmış</span></p>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>Şifre & Güvenlik</span>
              <ChevronRight className="h-3 w-3 text-brand-camel" />
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SINGLE-PAGE NAVIGATION ACTION TABS                   */}
        {/* ---------------------------------------------------- */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: User },
            { id: 'orders', label: 'Sipariş Geçmişim', icon: Package, badge: userOrders.length },
            { id: 'addresses', label: 'Adreslerim', icon: MapPin, badge: user.addresses?.length },
            { id: 'cards', label: 'Kayıtlı Kartlarım', icon: CreditCard, badge: user.savedCards?.length },
            { id: 'ayarlar', label: 'Hesap Ayarlarım & Düzenle', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id as AccountTabId)}
                className={`px-4 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-brand-dark text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <Icon className="h-4 w-4 text-brand-camel" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white text-brand-dark' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB VIEW 1: OVERVIEW (DASHBOARD SUMMARY)              */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Recent Orders Overview */}
            <div className="bg-white rounded-sm border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand-camel" />
                  <span>Son Siparişleriniz</span>
                </h3>
                <button
                  onClick={() => switchTab('orders')}
                  className="text-xs text-brand-camel font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Tümünü Gör ({userOrders.length})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-500 font-light">Henüz hiç sipariş vermediniz.</p>
                  <Link
                    href="/kategori/hepsi"
                    className="inline-block bg-brand-dark text-white text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-xs hover:bg-brand-camel transition-colors"
                  >
                    Kataloğu İnceleyin & Alışverişe Başlayın
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.slice(0, 2).map((order) => (
                    <div key={order.id} className="p-5 rounded-xs bg-neutral-50 border border-neutral-200 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-neutral-200 pb-3">
                        <div>
                          <span className="text-neutral-400 block uppercase font-bold text-[10px]">Sipariş No</span>
                          <span className="font-mono font-bold text-brand-dark">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block uppercase font-bold text-[10px]">Tarih</span>
                          <span className="text-neutral-700">{formatDate(order.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block uppercase font-bold text-[10px]">Tutar</span>
                          <span className="font-bold text-neutral-900">{formatPrice(order.totalAmount)}</span>
                        </div>
                        <div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.items.map((item, idx) => (
                          <img
                            key={idx}
                            src={item.product.image}
                            alt=""
                            className="w-12 h-12 rounded-xs object-cover border border-neutral-200 bg-white"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Addresses & Settings Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-sm border border-neutral-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-camel" />
                    <span>Varsayılan Teslimat Adresi</span>
                  </h4>
                  <button onClick={() => switchTab('addresses')} className="text-[11px] text-brand-camel font-semibold hover:underline">
                    Yönet
                  </button>
                </div>
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="p-4 rounded-xs bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                    <span className="font-bold text-neutral-900">{user.addresses[0].title}</span>
                    <p className="text-neutral-600 font-light">{user.addresses[0].addressLine}</p>
                    <p className="text-neutral-400 text-[11px]">{user.addresses[0].district} / {user.addresses[0].city}</p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 font-light">Kayıtlı adresiniz bulunmuyor.</p>
                )}
              </div>

              <div className="bg-white rounded-sm border border-neutral-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-brand-camel" />
                    <span>Hesap Ayarları & Bilgiler</span>
                  </h4>
                  <button onClick={() => switchTab('ayarlar')} className="text-[11px] text-brand-camel font-semibold hover:underline">
                    Yönlendir
                  </button>
                </div>
                <div className="text-xs space-y-2 text-neutral-600">
                  <p><strong className="text-neutral-800">Ad Soyad:</strong> {user.name}</p>
                  <p><strong className="text-neutral-800">E-Posta:</strong> {user.email}</p>
                  <p><strong className="text-neutral-800">Telefon:</strong> {user.phone || 'Girilmedi'}</p>
                  <button
                    onClick={() => switchTab('ayarlar')}
                    className="w-full mt-2 bg-neutral-100 hover:bg-brand-camel hover:text-white text-neutral-800 font-bold text-xs py-2 rounded-xs border border-neutral-300 transition-colors cursor-pointer"
                  >
                    Profil ve Şifre Bilgilerini Düzenle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB VIEW 2: ORDERS                                    */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-sm border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs animate-fade-in">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-camel" />
              <span>Sipariş Geçmişim ({userOrders.length})</span>
            </h3>

            {userOrders.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="h-14 w-14 text-neutral-300 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Henüz Siparişiniz Bulunmuyor</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
                  Lüks mobilya koleksiyonumuzdan eviniz için en seçkin parçaları keşfedin ve siparişinizi oluşturun.
                </p>
                <Link
                  href="/kategori/hepsi"
                  className="inline-block bg-brand-dark hover:bg-brand-camel text-white text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded-xs transition-colors shadow-xs"
                >
                  Alışverişe Başlayın
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map((order) => (
                  <div key={order.id} className="p-6 rounded-xs bg-neutral-50 border border-neutral-200 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Sipariş Kodu</span>
                        <p className="font-mono font-bold text-brand-dark text-sm">{order.id}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Tarih</span>
                        <p className="text-xs text-neutral-700">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Toplam Tutar</span>
                        <p className="text-sm font-extrabold text-neutral-900">{formatPrice(order.totalAmount)}</p>
                      </div>
                      <div>
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                      <div className="divide-y divide-neutral-200">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.product?.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000'} alt="" className="w-14 h-14 rounded-xs object-cover border border-neutral-200 bg-white" />
                              <div>
                                <p className="font-bold text-neutral-800">{item.product?.name || 'Ürün'}</p>
                                <span className="text-neutral-500 text-[11px]">{item.quantity} Adet</span>
                              </div>
                            </div>
                            <span className="font-semibold text-brand-dark">
                              {formatPrice(Number((item as any).unitPrice || item.price || item.product?.price || 0) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Enterprise Order Actions (e-Invoice & Wire Receipt) */}
                      <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs bg-neutral-100 hover:bg-[#C5A880] hover:text-white text-neutral-800 font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer border border-neutral-300 shadow-2xs"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>e-Fatura / e-Arşiv</span>
                          </button>

                          {order.paymentMethod === 'BANK_TRANSFER' && (
                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer border border-amber-300 shadow-2xs"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              <span>{order.receiptUrl ? 'Dekont Güncelle' : 'Havale Dekontu Yükle'}</span>
                            </button>
                          )}
                        </div>

                        {order.trackingNumber && (
                          <div className="text-[11px] text-neutral-600 font-medium">
                            <span>Kargo Takip: </span>
                            <span className="font-mono font-bold text-brand-dark">{order.shippingCarrier || 'Kargo'}: {order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB VIEW 3: ADDRESSES                                */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-sm border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-camel" />
                <span>Adres Defterim ({user.addresses ? user.addresses.length : 0})</span>
              </h3>
              <button
                onClick={() => {
                  setEditingAddrId(null);
                  setAddrForm({
                    title: '',
                    fullName: user.name,
                    phone: user.phone,
                    city: 'İstanbul',
                    district: 'Kadıköy',
                    addressLine: '',
                    zipCode: '34000'
                  });
                  setShowAddressModal(true);
                }}
                className="bg-brand-camel hover:bg-brand-camel-dark text-white text-xs font-bold px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Adres Ekle</span>
              </button>
            </div>

            {user.addresses?.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs font-light">
                Kayıtlı adresiniz bulunmamaktadır.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses?.map((addr) => (
                  <div key={addr.id} className="p-5 rounded-xs bg-neutral-50 border border-neutral-200 space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-brand-dark">{addr.title}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAddrId(addr.id);
                            setAddrForm({
                              title: addr.title,
                              fullName: addr.fullName,
                              phone: addr.phone,
                              city: addr.city,
                              district: addr.district,
                              addressLine: addr.addressLine,
                              zipCode: addr.zipCode
                            });
                            setShowAddressModal(true);
                          }}
                          className="p-1.5 rounded-xs text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1.5 rounded-xs text-neutral-500 hover:text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-neutral-800">{addr.fullName}</p>
                    <p className="text-xs text-neutral-600 font-light">{addr.addressLine}</p>
                    <p className="text-[11px] text-neutral-400">{addr.district} / {addr.city}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Address Modal */}
            <AddressModal
              isOpen={showAddressModal}
              onClose={() => {
                setShowAddressModal(false);
                setEditingAddrId(null);
              }}
              initialValues={editingAddrId ? user.addresses?.find((a) => a.id === editingAddrId) : undefined}
              onSaveAddress={(addr) => {
                if (editingAddrId) {
                  updateAddress(editingAddrId, addr);
                } else {
                  addAddress(addr);
                }
                setShowAddressModal(false);
                setEditingAddrId(null);
              }}
            />
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB VIEW 4: SAVED CARDS WITH 3D CARD PREVIEW         */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'cards' && (
          <div className="bg-white rounded-sm border border-neutral-200 p-6 md:p-8 space-y-8 shadow-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand-camel" />
                <span>Kayıtlı Kartlarım ({user.savedCards ? user.savedCards.length : 0})</span>
              </h3>
              <button
                onClick={() => setShowCardModal(true)}
                className="bg-brand-camel hover:bg-brand-camel-dark text-white text-xs font-bold px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Kart Ekle</span>
              </button>
            </div>

            {user.savedCards?.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs font-light">
                Profilinizde kayıtlı kredi kartı bulunmamaktadır.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.savedCards?.map((card) => (
                  <div key={card.id} className="p-5 rounded-xs bg-neutral-50 border border-neutral-200 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-brand-dark">{card.cardTitle}</span>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="p-1 rounded-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-mono font-bold tracking-widest text-neutral-800">{card.cardNumberMasked}</p>
                    <div className="flex justify-between items-center text-[10px] text-neutral-500">
                      <span className="uppercase font-semibold text-neutral-700">{card.cardHolder}</span>
                      <span>{card.expiry}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal for Adding Card with Live 3D Credit Card Preview */}
            {showCardModal && (
              <div className="p-6 md:p-8 rounded-xs bg-neutral-50 border border-neutral-200 space-y-6 animate-fade-in">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2">
                  Yeni Kredi Kartı & Canlı 3D Önizleme
                </h4>

                {/* 3D Animated Card Preview Component */}
                <AnimatedCreditCard
                  cardNumber={newCardNumber}
                  cardHolder={newCardHolder}
                  expiry={newCardExpiry}
                  cvv={newCardCvv}
                  isFlipped={isCardFlipped}
                />

                {/* Form Fields */}
                <form onSubmit={handleCardSubmit} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">Kart Etiketi</label>
                    <input
                      type="text"
                      placeholder="Garanti Bonus / Şahsi Kart"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      className="w-full text-xs border border-neutral-300 bg-white p-2.5 rounded-xs text-neutral-900 focus:ring-1 focus:ring-brand-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">Kart Numarası *</label>
                    <input
                      type="text"
                      required
                      value={newCardNumber}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                        setNewCardNumber(formatted);
                      }}
                      onFocus={() => setIsCardFlipped(false)}
                      placeholder="4543 •••• •••• 1234"
                      maxLength={19}
                      className="w-full text-xs border border-neutral-300 bg-white p-2.5 rounded-xs text-neutral-900 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">Kart Üzerindeki İsim *</label>
                    <input
                      type="text"
                      required
                      value={newCardHolder}
                      onChange={(e) => setNewCardHolder(e.target.value.replace(/[0-9]/g, ''))}
                      onFocus={() => setIsCardFlipped(false)}
                      placeholder="YUSUF DEMİR"
                      className="w-full text-xs border border-neutral-300 bg-white p-2.5 rounded-xs text-neutral-900 uppercase focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">S.K.T. (AA/YY) *</label>
                      <input
                        type="text"
                        required
                        value={newCardExpiry}
                        onChange={(e) => {
                          let digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (digits.length >= 3) {
                            digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                          }
                          setNewCardExpiry(digits);
                        }}
                        onFocus={() => setIsCardFlipped(false)}
                        placeholder="12/28"
                        maxLength={5}
                        className="w-full text-xs border border-neutral-300 bg-white p-2.5 rounded-xs text-neutral-900 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">CVV (Güvenlik) *</label>
                      <input
                        type="text"
                        required
                        value={newCardCvv}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setNewCardCvv(digits);
                        }}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        placeholder="321"
                        maxLength={4}
                        className="w-full text-xs border border-neutral-300 bg-white p-2.5 rounded-xs text-neutral-900 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCardModal(false)}
                      className="text-xs text-neutral-500 hover:text-neutral-900"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-camel hover:bg-brand-camel-dark text-white text-xs font-bold px-6 py-2.5 rounded-xs transition-colors cursor-pointer"
                    >
                      Kartı Profilime Ekle
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB VIEW 5: DEDICATED SETTINGS & EDIT REDIRECTION SUB-VIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'ayarlar' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Navigation Back Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => switchTab('overview')}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark hover:text-brand-camel cursor-pointer bg-white px-4 py-2 rounded-xs border border-neutral-300 shadow-xs transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>← Profil Dashboard Paneline Dön</span>
              </button>

              <div className="text-xs text-neutral-400 font-mono">
                Hesap Kimliği: {user.uid.slice(0, 10)}...
              </div>
            </div>

            {/* Profile Settings Card */}
            <div className="bg-white rounded-sm border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-brand-camel" />
                <span>1. Kişisel Bilgileri Düzenle</span>
              </h3>

              {profileSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-xl">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Ad Soyad (Rakam Yazılamaz)
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value.replace(/[0-9]/g, ''))}
                    className="w-full text-xs border border-neutral-300 p-3 rounded-xs text-neutral-900 focus:ring-1 focus:ring-brand-camel focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1 flex items-center justify-between">
                    <span>E-Posta Adresi (Güvenlik Kilitli)</span>
                    <Lock className="h-3 w-3 text-neutral-400" />
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs border border-neutral-200 bg-neutral-100 text-neutral-500 p-3 rounded-xs cursor-not-allowed font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Telefon Numarası (Alan Kodlu & Tam 10 Hane)
                  </label>
                  <IntlPhoneInput value={profilePhone} onChange={setProfilePhone} />
                </div>

                <button
                  type="submit"
                  className="bg-brand-dark hover:bg-brand-camel text-white text-xs font-bold uppercase tracking-wider py-3.5 px-8 rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  Bilgilerimi Güncelle
                </button>
              </form>
            </div>

            {/* Security & Password Change Card */}
            <div className="bg-white rounded-sm border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-brand-camel" />
                <span>2. Güvenlik & Şifre Değiştirme</span>
              </h3>

              {passSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>{passSuccessMsg}</span>
                </div>
              )}

              {passErrorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>{passErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                    Mevcut Şifreniz
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs border border-neutral-300 p-3 pr-10 rounded-xs text-neutral-900 focus:ring-1 focus:ring-brand-camel focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-700"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Yeni Şifre
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="En az 6 karakter"
                      className="w-full text-xs border border-neutral-300 p-3 rounded-xs text-neutral-900 focus:ring-1 focus:ring-brand-camel focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Yeni Şifre Tekrarı
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Şifreyi onaylayın"
                      className="w-full text-xs border border-neutral-300 p-3 rounded-xs text-neutral-900 focus:ring-1 focus:ring-brand-camel focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-brand-dark hover:bg-brand-camel text-white text-xs font-bold uppercase tracking-wider py-3.5 px-8 rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  Şifreyi Güncelle
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Enterprise Modals */}
        <InvoiceModal
          order={selectedInvoiceOrder}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />

        <ReceiptUploadModal
          order={selectedReceiptOrder}
          isOpen={!!selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
          onSuccess={(updatedOrder) => {
            useOrderStore.setState((state) => ({
              orders: state.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
            }));
          }}
        />

      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-camel" />
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
