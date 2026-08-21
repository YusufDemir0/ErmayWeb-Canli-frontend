'use client';

import React from 'react';
import { 
  Truck, RefreshCw, TrendingUp, AlertTriangle, 
  DollarSign, ShoppingCart, Clock, CheckCircle2, Box,
  Package, ChevronRight, ArrowUpRight, ShieldCheck, Tag
} from 'lucide-react';
import { AdminTabId } from './AdminTabsNav';
import type { Order } from '../../../stores/useOrderStore';
import type { Product } from '../../../types';
import { formatPrice } from '../../../lib/formatPrice';

interface OverviewTabProps {
  orders: Order[];
  products: Product[];
  categoriesCount: number;
  campaignEnabled: boolean;
  discountCode: string;
  setActiveTab: (tab: AdminTabId) => void;
  onResetDefault: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  orders,
  products,
  categoriesCount,
  campaignEnabled,
  discountCode,
  setActiveTab,
  onResetDefault,
}) => {
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING_PAYMENT');
  const completedOrders = orders.filter((o) => o.orderStatus === 'DELIVERED');
  const preparingOrders = orders.filter((o) => o.orderStatus === 'PREPARING' || o.orderStatus === 'SHIPPED');
  const lowStockProducts = products.filter((p) => (p.stock !== undefined && p.stock <= 3));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ============================================================ */}
      {/* 1. TOP ENTERPRISE KPI METRIC CARDS                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 hover:border-[#C5A880] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Toplam Satış Hacmi
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-neutral-900 block font-mono">
            {formatPrice(totalRevenue)}
          </span>
          <span className="text-xs text-emerald-700 font-semibold block">
            {orders.length} işlemden elde edilen toplam ciro
          </span>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 hover:border-[#C5A880] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Ortalama Sepet Tutarı (AOV)
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-neutral-900 block font-mono">
            {formatPrice(averageOrderValue)}
          </span>
          <span className="text-xs text-neutral-500 block">
            Sipariş başına ortalama harcama
          </span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              İşlem / Ödeme Bekleyenler
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-700 block font-mono">
            {pendingOrders.length} Sipariş
          </span>
          <span className="text-xs text-amber-800 font-medium block">
            Havale dekontu veya onay bekliyor
          </span>
        </div>

        {/* Active Products Count */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 hover:border-[#C5A880] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Aktif Ürün Envanteri
            </span>
            <div className="p-2 bg-[#C5A880]/15 text-[#9A7B54] rounded-full">
              <Box className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-neutral-900 block">
            {products.length} Model
          </span>
          <span className="text-xs text-neutral-500 block">
            {categoriesCount} kategoride yayında
          </span>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. ORDER PIPELINE STATUS SUMMARY BAR                         */}
      {/* ============================================================ */}
      <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#C5A880]" />
            <span>Sevkiyat & Sipariş Durumu Dağılımı</span>
          </h3>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs text-[#C5A880] hover:text-[#9A7B54] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <span>Tüm Siparişleri Aç</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xs p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Ödeme & Dekont Bekleyen</span>
              <span className="text-xl font-extrabold text-amber-900">{pendingOrders.length}</span>
            </div>
            <Clock className="h-6 w-6 text-amber-500" />
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xs p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Hazırlanan & Kargoda</span>
              <span className="text-xl font-extrabold text-blue-900">{preparingOrders.length}</span>
            </div>
            <Truck className="h-6 w-6 text-blue-500" />
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xs p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Teslim Edilen / Tamamlanan</span>
              <span className="text-xl font-extrabold text-emerald-900">{completedOrders.length}</span>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CRITICAL LOW STOCK ALERT SYSTEM                           */}
      {/* ============================================================ */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-sm shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Kritik Stok Uyarısı ({lowStockProducts.length} Ürünün Stoku Azaldı / Tükendi)
                </h4>
                <p className="text-[11px] text-rose-700 font-light">
                  Aşağıdaki ürünlerin stoku 3 adet veya daha az kalmıştır. Lütfen atölye üretimini planlayın veya stoku güncelleyin.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('products')}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase px-4 py-2 rounded-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              Stokları Yönet
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-xs border border-rose-200 flex items-center justify-between shadow-2xs text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.image}
                    alt=""
                    className="w-10 h-10 object-cover rounded-2xs border border-neutral-200"
                  />
                  <div>
                    <p className="font-bold text-neutral-900 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">{formatPrice(item.price)}</p>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                  {item.stock === 0 ? 'Tükendi' : `${item.stock} Kaldı`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. QUICK ACTIONS & PLATFORM HEALTH                           */}
      {/* ============================================================ */}
      <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Hızlı Yönetim & İşlem Kısayolları
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className="bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold tracking-wider uppercase py-3 px-6 rounded-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Truck className="h-4 w-4" />
            <span>Siparişleri & Dekontları İncele</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className="bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold tracking-wider uppercase py-3 px-6 rounded-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Box className="h-4 w-4" />
            <span>+ Yeni Ürün Ekle</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold tracking-wider uppercase py-3 px-6 rounded-xs transition-colors cursor-pointer flex items-center gap-2 border border-neutral-300"
          >
            <Tag className="h-4 w-4 text-[#C5A880]" />
            <span>Kupon & İndirim Yönetimi</span>
          </button>

          <button
            onClick={onResetDefault}
            className="bg-neutral-50 hover:bg-rose-100 hover:text-rose-700 text-neutral-600 text-xs font-semibold tracking-wider uppercase py-3 px-6 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-neutral-200 ml-auto"
            title="Tüm verileri orijinal fabrika ayarlarına döndür"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Varsayılana Sıfırla</span>
          </button>
        </div>
      </div>

    </div>
  );
};
