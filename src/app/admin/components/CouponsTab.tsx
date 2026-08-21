'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useDiscountStore, type DiscountCoupon } from '../../../stores/useDiscountStore';

interface CouponsTabProps {
  onShowSuccess: (msg: string) => void;
}

export const CouponsTab: React.FC<CouponsTabProps> = ({ onShowSuccess }) => {
  const coupons = useDiscountStore((state) => state.coupons);
  const fetchCoupons = useDiscountStore((state) => state.fetchCoupons);
  const addCoupon = useDiscountStore((state) => state.addCoupon);
  const updateCoupon = useDiscountStore((state) => state.updateCoupon);
  const deleteCoupon = useDiscountStore((state) => state.deleteCoupon);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;

    addCoupon({
      code,
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      expiryDate: expiryDate || undefined,
      enabled: true,
      description: description || undefined,
    });

    onShowSuccess(`Yeni indirim kuponu (${code.toUpperCase()}) başarıyla oluşturuldu!`);
    setCode('');
    setValue('');
    setMinOrderAmount('');
    setMaxDiscountAmount('');
    setUsageLimit('');
    setExpiryDate('');
    setDescription('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace('TRY', 'TL');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Create Coupon Form */}
      <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 mb-6">
          <Tag className="h-5 w-5 text-brand-camel" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Yeni İndirim Kodu / Kupon Oluştur
          </h3>
        </div>

        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Kupon Kodu (Örn: ERMAY20)
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="YAZ2026"
                className="w-full text-xs font-mono uppercase font-bold border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                İndirim Tipi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none bg-white font-semibold"
              >
                <option value="percentage">Yüzde İndirim (%)</option>
                <option value="fixed">Sabit Tutar İndirimi (TL)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                İndirim Değeri ({type === 'percentage' ? '%' : 'TL'})
              </label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder={type === 'percentage' ? '15' : '500'}
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Minimum Sepet Tutarı (TL)
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="Örn: 5000"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Maksimum İndirim Limiti (TL - Opsiyonel)
              </label>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="Örn: 3000 (Tavan tutar)"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Kullanım Limiti (Kişi Sayısı)
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
                placeholder="Örn: 100"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Son Kullanma Tarihi
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                Kupon Açıklaması / Notu
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: 5.000 TL Üzeri Siparişlerde Ekstra %15 İndirim"
                className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-brand-camel hover:bg-brand-camel-dark text-white text-xs font-semibold uppercase tracking-wider py-3 px-8 rounded-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Kuponu Kaydet</span>
          </button>
        </form>
      </div>

      {/* Coupons List Table */}
      <div className="bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Aktif & Pasif Kupon Kodları ({coupons.length})
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-400 font-bold uppercase text-[10px] border-b border-neutral-200">
              <tr>
                <th className="p-3">Kupon Kodu</th>
                <th className="p-3">İndirim Tipi & Oranı</th>
                <th className="p-3">Min Sepet Tutarı</th>
                <th className="p-3">Max İndirim Limiti</th>
                <th className="p-3">Kullanım / Limit</th>
                <th className="p-3">Son Kullanma</th>
                <th className="p-3">Durum</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/50">
                  <td className="p-3 font-mono font-bold text-sm text-neutral-900">
                    <span className="bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-xs">
                      {c.code}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-brand-dark">
                    {c.type === 'percentage' ? `%${c.value} İndirim` : `${formatPrice(c.value)} İndirim`}
                  </td>
                  <td className="p-3">{c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : 'Yok'}</td>
                  <td className="p-3">
                    {c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'Sınırsız'}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-neutral-800">{c.usedCount}</span> /{' '}
                    {c.usageLimit ? c.usageLimit : '∞'}
                  </td>
                  <td className="p-3 text-neutral-500 font-mono">
                    {c.expiryDate || 'Süresiz'}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => updateCoupon(c.id, { enabled: !c.enabled })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-xs cursor-pointer ${
                        c.enabled
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {c.enabled ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-rose-600" />
                          <span>Pasif</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        deleteCoupon(c.id);
                        onShowSuccess(`Kupon (${c.code}) silindi.`);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
