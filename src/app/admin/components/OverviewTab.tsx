'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { AdminTabId } from './AdminShell';
import type { Product } from '../../../types';
import { formatPrice } from '../../../lib/formatPrice';
import { requestService, AdminOrderRequest } from '../../../services/requestService';
import apiClient from '../../../services/api';
import { toast } from '../../../stores/useToastStore';
import { RowsSkeleton } from '../../../components/Skeleton';

interface OverviewTabProps {
  orders?: unknown[];
  products: Product[];
  categoriesCount: number;
  campaignEnabled: boolean;
  discountCode: string;
  setActiveTab: (tab: AdminTabId) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  products,
  categoriesCount,
  setActiveTab,
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
          'Katalog güncellendi',
          `${res.data.report?.matchedProducts || 0} ürün ERP ile doğrulandı, ${res.data.report?.pricesUpdated || 0} fiyat güncellendi.`
        );
      }
    } catch (err: unknown) {
      console.error('Manuel senkronizasyon hatası:', err);
      toast.error('Güncellenemedi', 'ERP bağlantısı kurulamadı. Biraz sonra tekrar deneyin.');
    } finally {
      setIsSyncingErp(false);
    }
  };

  const newRequests = requests.filter((r) => r.status === 'NEW');
  const erpFailed = requests.filter((r) => r.erpStatus === 'FAILED');
  const whatsappRequestsCount = requests.filter((r) => r.preference === 'WHATSAPP').length;
  const storeVisitRequestsCount = requests.filter((r) => r.preference === 'STORE_VISIT').length;
  const totalDemandVolume = requests.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
  const publishedCount = products.filter((p) => p.isPublished).length;
  const draftCount = products.length - publishedCount;

  const stat = (label: string, value: React.ReactNode, hint: string, onClick?: () => void) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="bg-white p-5 rounded-xs border border-line text-left space-y-1 enabled:hover:border-ink enabled:cursor-pointer transition-colors"
    >
      <span className="text-sm text-neutral-600 block">{label}</span>
      <span className="text-2xl font-semibold text-ink block font-mono tabular-nums-all">{value}</span>
      <span className="text-xs text-neutral-500 block">{hint}</span>
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Önce yapılacak işler */}
      <section className="bg-white rounded-xs border border-line">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-wood" />
            <h2 className="text-base font-semibold text-ink">Dönüş bekleyen talepler</h2>
            <span className="min-w-6 h-5 px-1.5 rounded-full bg-brand text-ink text-xs font-semibold flex items-center justify-center">
              {isLoading ? '…' : newRequests.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className="text-sm text-wood hover:text-ink inline-flex items-center gap-1 cursor-pointer"
          >
            Tüm talepler <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {isLoading ? (
          <RowsSkeleton rows={3} label="Talepler yükleniyor" />
        ) : newRequests.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-ok" /> Dönüş bekleyen yeni talep yok.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {newRequests.slice(0, 6).map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[8rem_1fr_auto_auto] items-center gap-x-4 gap-y-1 px-5 py-3 text-left hover:bg-paper cursor-pointer"
                >
                  <span className="font-mono text-sm text-ink">{r.code}</span>
                  <span className="text-sm text-neutral-700 truncate">
                    {r.customerName} · {r.city}
                    {r.preference === 'STORE_VISIT' ? ' · mağaza ziyareti' : ' · WhatsApp'}
                  </span>
                  <span className="font-mono text-sm text-ink tabular-nums-all">{formatPrice(r.totalAmount)}</span>
                  <span className="text-xs text-neutral-500">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {erpFailed.length > 0 && (
          <div className="px-5 py-3 border-t border-line bg-signal/5 text-sm text-ink flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-signal shrink-0" />
            <span>{erpFailed.length} talep ERP&apos;ye aktarılamadı. Sipariş talepleri ekranından yeniden gönderebilirsiniz.</span>
          </div>
        )}
      </section>

      {/* Özet sayılar (son 50 talep) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stat('Talep tutarı', formatPrice(totalDemandVolume), `${totalRequests} talep`, () => setActiveTab('orders'))}
        {stat('WhatsApp tercih eden', whatsappRequestsCount, 'temsilci dönüşü bekleyenler dahil')}
        {stat('Mağaza ziyareti', storeVisitRequestsCount, 'showroom randevusu isteyen')}
        {stat('Yayındaki ürün', publishedCount, `${draftCount} taslak ürün yayında değil`, () => setActiveTab('products'))}
      </div>

      {/* Katalog eşitleme */}
      <section className="bg-white rounded-xs border border-line p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-wood mt-0.5" />
          <div>
            <h2 className="text-base font-semibold text-ink">ERP ile fiyat ve stok</h2>
            <p className="text-sm text-neutral-600">
              Fiyat ve stok her 15 dakikada bir ERP&apos;den otomatik güncellenir. Beklemek istemiyorsanız şimdi güncelleyin.
              Katalogda {products.length} ürün, {categoriesCount} kategori var.
            </p>
          </div>
        </div>
        <button
          onClick={handleManualSyncNow}
          disabled={isSyncingErp}
          className="inline-flex items-center justify-center gap-2 px-4 h-11 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold rounded-xs transition-colors cursor-pointer disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncingErp ? 'animate-spin' : ''}`} />
          <span>{isSyncingErp ? 'Güncelleniyor…' : 'Şimdi güncelle'}</span>
        </button>
      </section>
    </div>
  );
};

export default OverviewTab;
