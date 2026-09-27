'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, KeyRound, AlertCircle, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/hesabim';

  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        router.push(redirectPath);
      }
    } catch (err: unknown) {
      setErrorMsg('Giriş yapılırken beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-neutral-200 shadow-md rounded-sm p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-brand-camel/10 text-brand-camel rounded-full mb-2">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-wide uppercase text-neutral-900">
          Kullanıcı Girişi
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Siparişlerinizi takip etmek ve güvenli alışveriş yapmak için giriş yapın.
        </p>
      </div>

      {/* KVKK Bilgilendirme ve Misafir Alışverişi Uyarısı */}
      <div className="bg-amber-50 border border-amber-300 rounded-sm p-5 space-y-4 text-left">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              KVKK & Veri Güvenliği Bilgilendirmesi
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed font-normal">
              6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyum süreci ve veri minimizasyonu ilkemiz doğrultusunda, bireysel üye giriş ve kayıt ekranları geçici olarak erişime kapatılmıştır.
            </p>
            <p className="text-xs text-amber-900 font-semibold pt-1">
              Siparişlerinizi üyelik zorunluluğu olmadan, doğrudan <strong>Misafir Alışverişi</strong> ile güvenle tamamlayabilirsiniz.
            </p>
          </div>
        </div>

        <Link
          href="/sepet"
          className="w-full bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xs transition-colors flex items-center justify-center gap-2 text-center shadow-xs"
        >
          <span>Sepete & Alışverişe Dön</span>
        </Link>
      </div>

      {/* Kullanıcı Giriş Formu - KVKK Uyarınca Geçici Olarak Gizlenmiştir */}
      <div className="hidden">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              E-Posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-xs border border-neutral-300 rounded-xs"
            />
          </div>
          <button type="submit" disabled className="w-full bg-neutral-400 text-white text-xs py-3.5 rounded-xs">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] bg-neutral-50 flex items-center justify-center p-4 py-12">
      <Suspense fallback={<div className="text-xs text-neutral-400">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
