'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OdemeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/talep');
  }, [router]);

  return (
    <div className="w-full min-h-[50vh] flex items-center justify-center">
      <p className="text-xs text-neutral-400">Sipariş talebi sayfasına yönlendiriliyorsunuz...</p>
    </div>
  );
}
