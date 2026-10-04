'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Building2,
  RefreshCw,
  Box,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Store,
  Layers,
} from 'lucide-react';
import { AdminTabId } from './AdminTabsNav';
import type { Product } from '../../../types';
import { formatPrice } from '../../../lib/formatPrice';
import { requestService, AdminOrderRequest } from '../../../services/requestService';
import apiClient from '../../../services/api';
import { toast } from '../../../stores/useToastStore';

interface OverviewTabProps {
  orders?: unknown[];
  products: Product[];
  categoriesCount: number;
  campaignEnabled: boolean;
  discountCode: string;
  setActiveTab: (tab: AdminTabId) => void;
  onResetDefault: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  products,
  categoriesCount,
  setActiveTab,
  onResetDefault,
}) => {
  const [requests, setRequests] = useState<AdminOrderRequest[]>([]);
  const [totalRequests, setTotalRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingErp, setIsSyncingErp] = useState<boolean>(false);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const res = await requestService.getAdminRequests({ page: 1, limit: 50 });
        if (res?.success) {
          setRequests(res.requests || []);
          const total = res.pagination?.total ?? (res as any)?.total ?? res.requests?.length ?? 0;
          setTotalRequests(total);
        }
      } catch (err) {
        console.error('Gösterge paneli talepleri yüklenemedi:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardMetrics();
  }, []);

  const handleManualSyncNow = async () => {
    setIsSyncingErp(true);
    try {
      const res = await apiClient.post('/integration/sync-now');
      if (res.data?.success) {
        toast.success(
          'Katalog Senkronize Edildi',
          `${res.data.report?.matchedProducts || 0} ürün ERP ile doğrulandı, ${res.data.report?.pricesUpdated || 0} fiyat güncellendi.`
        );
      }
    } catch (err: unknown) {
      console.error('Manuel senkronizasyon hatası:', err);
      toast.error('Hata', 'Katalog senkronizasyonu tetiklenemedi.');
    } finally {
      setIsSyncingErp(false);
    }
  };

  const newRequestsCount = requests.filter((r) => r.status === 'NEW').length;
  const whatsappRequestsCount = requests.filter((r) => r.preference === 'WHATSAPP').length;
  const storeVisitRequestsCount = requests.filter((r) => r.preference === 'STORE_VISIT').length;
  const totalDemandVolume = requests.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
  const publishedProducts = products.filter((p) => p.isPublished);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. TOP ENTERPRISE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Demand Volume */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 hover:border-wood transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Toplam Talep Hacmi
            </span>
            <div className="p-2 bg-amber-50 text-wood-dark rounded-full">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-neutral-900 block font-mono">
            {formatPrice(totalDemandVolume)}
          </span>
          <span className="text-xs text-neutral-500 font-medium block">
            {totalRequests} sipariş talebi toplam portföyü
          </span>
        </div>

        {/* New / Action Required Requests */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Yeni Bekleyen Talepler
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-blue-700 block font-mono">
            {newRequestsCount} Talep
          </span>
          <span className="text-xs text-blue-800 font-medium block">
            İletişim ve teklif bekliyor
          </span>
        </div>

        {/* WhatsApp Channel Leads */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 hover:border-emerald-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              WhatsApp Müşteri Kanalı
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-700 block font-mono">
            {whatsappRequestsCount} Müşteri
          </span>
          <span className="text-xs text-emerald-800 font-medium block">
            Doğrudan temsilci sohbeti tercih edenler
          </span>
        </div>

        {/* Showroom Visit Appointments */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 hover:border-wood transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Showroom Randevuları
            </span>
            <div className="p-2 bg-wood/15 text-[#9A7B54] rounded-full">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-neutral-900 block font-mono">
            {storeVisitRequestsCount} Ziyaret
          </span>
          <span className="text-xs text-neutral-500 block">
            Modoko mağazasında inceleme talebi
          </span>
        </div>
      </div>

      {/* 2. CATALOG & ERP STATUS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog Sync Health Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-paper border border-line-strong text-[#7A6140] rounded-xs">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  ERP & Web Kataloğu Durumu
                </h3>
                <p className="text-[11px] text-neutral-500 font-light">
                  Her 15 dakikada bir arka planda otomatik fiyat ve stok senkronizasyonu yapılır.
                </p>
              </div>
            </div>

            <button
              onClick={handleManualSyncNow}
              disabled={isSyncingErp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-wood hover:bg-wood-dark text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingErp ? 'animate-spin' : ''}`} />
              <span>{isSyncingErp ? 'Senkronize Ediliyor...' : 'Şimdi Senkronize Et'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-neutral-50 rounded-xs border border-neutral-200/70">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block tracking-wider">
                Yayındaki Modeller
              </span>
              <span className="text-xl font-extrabold text-neutral-900 block mt-1">
                {publishedProducts.length} Ürün
              </span>
              <span className="text-[11px] text-neutral-400">
                Görsel, fiyat ve ERP ID tam
              </span>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xs border border-neutral-200/70">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block tracking-wider">
                Toplam Katalog
              </span>
              <span className="text-xl font-extrabold text-neutral-900 block mt-1">
                {products.length} Model
              </span>
              <span className="text-[11px] text-neutral-400">
                {categoriesCount} kategoride tanımlı
              </span>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xs border border-neutral-200/70">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block tracking-wider">
                ERP Koruma Garantisi
              </span>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm mt-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Outbox Aktif</span>
              </div>
              <span className="text-[11px] text-neutral-400">
                SKIP LOCKED & Çift Kayıt Önleme
              </span>
            </div>
          </div>
        </div>

        {/* Quick Operational Navigation */}
        <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
              <Store className="h-4 w-4 text-wood" />
              <span>Hızlı İşlem Kısayolları</span>
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className="w-full text-left p-3 rounded-xs border border-neutral-200 hover:border-wood hover:bg-paper transition-colors flex items-center justify-between text-xs font-semibold text-neutral-800 cursor-pointer"
              >
                <span>Tüm Sipariş Taleplerini İncele</span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>

              <button
                onClick={() => setActiveTab('erpSync')}
                className="w-full text-left p-3 rounded-xs border border-neutral-200 hover:border-wood hover:bg-paper transition-colors flex items-center justify-between text-xs font-semibold text-neutral-800 cursor-pointer"
              >
                <span>CRM / ERP Eşleştirme & Stok</span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className="w-full text-left p-3 rounded-xs border border-neutral-200 hover:border-wood hover:bg-paper transition-colors flex items-center justify-between text-xs font-semibold text-neutral-800 cursor-pointer"
              >
                <span>Web Kataloğunu Düzenle</span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>

              <button
                onClick={() => setActiveTab('stores')}
                className="w-full text-left p-3 rounded-xs border border-neutral-200 hover:border-wood hover:bg-paper transition-colors flex items-center justify-between text-xs font-semibold text-neutral-800 cursor-pointer"
              >
                <span>Modoko Showroom & İletişim Bilgileri</span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
            <span>ErmayWeb v2026</span>
            <button
              onClick={onResetDefault}
              className="text-neutral-400 hover:text-rose-600 underline cursor-pointer"
            >
              Varsayılana Sıfırla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
