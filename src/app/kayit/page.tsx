'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, KeyRound, Mail, UserPlus, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import IntlPhoneInput from '../../components/IntlPhoneInput';

import { registerSchema } from '../../lib/validations';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/hesabim';

  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+90 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Zod Şema Doğrulaması (Ad/Soyad harf zorunluluğu, telefon ve e-posta kontrolü)
    const validationResult = registerSchema.safeParse({
      name,
      email,
      phone,
      password,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Lütfen bilgilerinizi kontrol ediniz.';
      setErrorMsg(firstError);
      return;
    }

    setLoading(true);

    try {
      const res = await register(name, email, password, phone);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        router.push(redirectPath);
      }
    } catch (err: unknown) {
      setErrorMsg('Kayıt oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-neutral-200 shadow-md rounded-sm p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-brand-camel/10 text-brand-camel rounded-full mb-2">
          <UserPlus className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-wide uppercase text-neutral-900">
          Yeni Hesap Oluştur
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Ermay Mobilya üyesi olarak siparişlerinizi yönetin.
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
              6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyum süreci kapsamında bireysel üyelik kayıtları geçici olarak durdurulmuştur.
            </p>
            <p className="text-xs text-amber-900 font-semibold pt-1">
              Tüm mobilya modellerimizi üyelik zorunluluğu olmaksızın <strong>Misafir Alışverişi</strong> ile doğrudan sipariş edebilirsiniz.
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

      {/* Kayıt Formu - KVKK Kapsamında Geçici Olarak Gizlenmiştir */}
      <div className="hidden">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
              Ad Soyad
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-xs"
            />
          </div>
          <button type="submit" disabled className="w-full bg-neutral-400 text-white text-xs py-3.5 rounded-xs">
            Kayıt Ol
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] bg-neutral-50 flex items-center justify-center p-4 py-12">
      <Suspense fallback={<div className="text-xs text-neutral-400">Yükleniyor...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
