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

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
            E-Posta Adresi
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@ermaymobilya.com"
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
            />
            <User className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-400" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
            Şifre
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
            />
            <KeyRound className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Giriş Yapılıyor...</span>
            </>
          ) : (
            <span>Giriş Yap</span>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span className="text-neutral-500">Hesabınız yok mu?</span>
        <Link href={`/kayit?redirect=${encodeURIComponent(redirectPath)}`} className="text-brand-camel font-bold hover:underline">
          Yeni Hesap Oluştur
        </Link>
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
