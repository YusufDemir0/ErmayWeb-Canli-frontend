'use client';

import React from 'react';
import { CreditCard, Check, ShieldCheck } from 'lucide-react';

interface InstallmentMatrixProps {
  totalAmount: number;
  selectedInstallment: number;
  onSelectInstallment: (installment: number) => void;
}

export const InstallmentMatrix: React.FC<InstallmentMatrixProps> = ({
  totalAmount,
  selectedInstallment,
  onSelectInstallment,
}) => {
  const options = [
    { count: 1, label: 'Tek Çekim (Peşin)', monthly: totalAmount, total: totalAmount },
    { count: 3, label: '3 Taksit', monthly: totalAmount / 3, total: totalAmount },
    { count: 6, label: '6 Taksit', monthly: totalAmount / 6, total: totalAmount },
    { count: 9, label: '9 Taksit (BDDK Mobilya Özel)', monthly: totalAmount / 9, total: totalAmount },
    { count: 12, label: '12 Taksit (BDDK Üst Limit)', monthly: totalAmount / 12, total: totalAmount },
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount).replace('TRY', 'TL');
  };

  return (
    <div className="bg-white p-5 rounded-sm border border-neutral-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#C5A880]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            BDDK Uyumlu Mobilya Taksit Seçenekleri (%0 Vade Farkı)
          </h4>
        </div>
        <span className="text-[10px] font-mono font-semibold bg-[#FBF9F5] text-[#9A7B54] border border-[#C5A880]/30 px-2 py-0.5 rounded-full">
          BDDK Max 12 Taksit
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {options.map((opt) => {
          const isSelected = selectedInstallment === opt.count;
          return (
            <div
              key={opt.count}
              onClick={() => onSelectInstallment(opt.count)}
              className={`p-3.5 rounded-xs border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#C5A880] bg-[#FBF9F5] ring-1 ring-[#C5A880]'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-neutral-800">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#C5A880]" />}
              </div>
              <p className="text-sm font-extrabold text-[#7A6140]">
                {formatPrice(opt.monthly)} <span className="text-[10px] font-normal text-neutral-500">/ ay</span>
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                Toplam: {formatPrice(opt.total)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstallmentMatrix;
