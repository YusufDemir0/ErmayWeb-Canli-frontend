'use client';

import React from 'react';
import Link from 'next/link';
import { Home, LogOut, ShoppingBag, Sliders, ShieldCheck } from 'lucide-react';

export type AdminModuleMode = 'ecommerce' | 'cms';

interface AdminHeaderProps {
  activeModule: AdminModuleMode;
  setActiveModule: (mode: AdminModuleMode) => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeModule,
  setActiveModule,
  onLogout,
}) => {
  return (
    <div className="bg-white text-neutral-900 p-6 md:p-8 rounded-sm shadow-xs mb-6 flex flex-col lg:flex-row items-center justify-between gap-6 border border-neutral-200">
      
      {/* Brand & Title */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-sm bg-[#C5A880] text-white flex items-center justify-center font-bold text-xl shadow-xs tracking-wider">
          E
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Yönetim Paneli
            </h1>
            <span className="text-[10px] bg-[#C5A880]/15 text-[#9A7B54] border border-[#C5A880]/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
              v2.0
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">
            E-Ticaret siparişleri, katalog ve site içeriklerini kolayca yönetin.
          </p>
        </div>
      </div>

      {/* Dual Panel Switcher (E-Commerce vs CMS) */}
      <div className="flex items-center bg-neutral-100 p-1.5 rounded-sm border border-neutral-200">
        <button
          onClick={() => setActiveModule('ecommerce')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeModule === 'ecommerce'
              ? 'bg-[#C5A880] text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>E-Ticaret Mağazası</span>
        </button>

        <button
          onClick={() => setActiveModule('cms')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeModule === 'cms'
              ? 'bg-[#C5A880] text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Site İçeriği (CMS)</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xs transition-colors border border-neutral-200"
        >
          <Home className="h-4 w-4 text-[#C5A880]" />
          <span>Mağazaya Git</span>
        </Link>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xs transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>

    </div>
  );
};
