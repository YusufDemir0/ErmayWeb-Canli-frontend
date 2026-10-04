'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Building2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Search,
  SlidersHorizontal,
  History,
  FileText,
  User,
  Phone,
  MapPin,
  Package,
} from 'lucide-react';
import {
  requestService,
  AdminOrderRequest,
  RequestStatusType,
  ErpSyncStatusType,
} from '../../../services/requestService';
import { isAxiosError } from 'axios';
import { toast } from '../../../stores/useToastStore';
import { Pagination } from '../../../components/Pagination';

interface OrdersTabProps {
  onShowSuccess?: (msg: string) => void;
}

const STATUS_LABELS: Record<RequestStatusType, { label: string; bg: string; text: string; border: string }> = {
  NEW: { label: 'Yeni Talep', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  CONTACTED: { label: 'İletişime Geçildi', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  STORE_VISIT_SCHEDULED: { label: 'Showroom Randevusu', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  AWAITING_PAYMENT: { label: 'Ödeme Bekleniyor', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  PAID_OFFLINE: { label: 'Ödeme Teyit Edildi', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  COMPLETED: { label: 'Tamamlandı', bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
  CANCELLED: { label: 'İptal Edildi', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  SPAM: { label: 'Geçersiz / Spam', bg: 'bg-neutral-100', text: 'text-neutral-500', border: 'border-neutral-200' },
  EXPIRED: { label: 'Zaman Aşımı', bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200' },
};

const ERP_STATUS_LABELS: Record<ErpSyncStatusType, { label: string; bg: string }> = {
  PENDING: { label: 'ERP Kuyruğunda', bg: 'bg-amber-100 text-amber-800' },
  IN_PROGRESS: { label: 'ERP İşleniyor', bg: 'bg-blue-100 text-blue-800' },
  SYNCED: { label: 'ERP Satış Oluştu', bg: 'bg-emerald-100 text-emerald-800' },
  FAILED: { label: 'ERP Hatası', bg: 'bg-rose-100 text-rose-800' },
};

const ALLOWED_TRANSITIONS: Record<RequestStatusType, RequestStatusType[]> = {
  NEW: ['CONTACTED', 'CANCELLED', 'SPAM', 'EXPIRED'],
  CONTACTED: ['STORE_VISIT_SCHEDULED', 'AWAITING_PAYMENT', 'CANCELLED', 'EXPIRED'],
  STORE_VISIT_SCHEDULED: ['AWAITING_PAYMENT', 'COMPLETED', 'CANCELLED'],
  AWAITING_PAYMENT: ['PAID_OFFLINE', 'CANCELLED'],
  PAID_OFFLINE: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  SPAM: [],
  EXPIRED: [],
};

export const OrdersTab: React.FC<OrdersTabProps> = ({ onShowSuccess }) => {
  const [requests, setRequests] = useState<AdminOrderRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [preferenceFilter, setPreferenceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  // Status Update Modal/Prompt State
  const [selectedRequest, setSelectedRequest] = useState<AdminOrderRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<AdminOrderRequest['status']>('CONTACTED');
  const [staffNote, setStaffNote] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isRetryingErp, setIsRetryingErp] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace('TRY', 'TL');
  };

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await requestService.getAdminRequests({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        preference: preferenceFilter !== 'ALL' ? preferenceFilter : undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        limit: pageSize,
      });

      if (res?.success) {
        setRequests(res.requests || []);
        setTotalPages(res.pagination?.totalPages ?? (res as any)?.totalPages ?? 1);
        setTotalCount(res.pagination?.total ?? (res as any)?.total ?? res.requests?.length ?? 0);
      }
    } catch (err: unknown) {
      console.error('Talepler yüklenemedi:', err);
      toast.error('Hata', 'Sipariş talepleri yüklenirken bir problem oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, preferenceFilter, searchQuery, currentPage, pageSize]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await requestService.updateRequestStatus(
        selectedRequest.id,
        targetStatus,
        staffNote.trim() || undefined
      );

      const noteOnly = targetStatus === selectedRequest.status;
      toast.success(
        noteOnly ? 'Not Kaydedildi' : 'Durum Güncellendi',
        noteOnly ? `${updated.code} talebine personel notu eklendi.` : `${updated.code} talebinin durumu güncellendi.`
      );
      if (onShowSuccess) onShowSuccess(`${updated.code} güncellendi.`);

      // Update in local state (yeni not listede hemen görünsün)
      const newNote = staffNote.trim();
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, ...updated, ...(newNote ? { staffNote: newNote } : {}) } : r))
      );
      setSelectedRequest(null);
      setStaffNote('');
    } catch (err: unknown) {
      console.error('Durum güncellenemedi:', err);
      const serverMsg = isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined;
      toast.error('Hata', serverMsg || 'Durum güncellenirken bir sorun oluştu.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRetryErp = async (id: string, code: string) => {
    setIsRetryingErp(id);
    try {
      await requestService.retryErpSync(id);
      toast.success('Kuyruğa Alındı', `${code} ERP aktarımı için yeniden kuyruğa alındı.`);
      fetchRequests();
    } catch (err: unknown) {
      console.error('ERP tekrar denenemedi:', err);
      toast.error('Hata', 'ERP senkronizasyonu kuyruğa alınamadı.');
    } finally {
      setIsRetryingErp(null);
    }
  };

  const getWhatsAppUrl = (req: AdminOrderRequest) => {
    const cleanPhone = req.customerPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Merhaba ${req.customerName}, Ermay Mobilya Modoko Showroom'undan iletişime geçiyorum. ${req.code} kodlu sipariş talebinizi inceledik. Size ürünlerimiz ve detaylar hakkında yardımcı olmak isteriz.`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Card */}
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B4966E] bg-[#FBF9F5] px-2.5 py-1 rounded-xs border border-[#E5DEC9]">
                Müşteri Talep Motoru
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight text-neutral-900 mt-1">
              Sipariş Talepleri Yönetimi
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Müşterilerin sepetlerinden oluşturulan WhatsApp ve Mağaza randevu taleplerini yönetin, ERP durumunu takip edin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRequests()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:border-[#C5A880] text-xs font-semibold rounded-xs transition-colors cursor-pointer text-neutral-700 bg-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#C5A880]' : ''}`} />
              <span>Yenile</span>
            </button>
            <span className="text-xs bg-[#FBF9F5] border border-[#E5DEC9] px-3.5 py-2 rounded-xs font-mono font-bold text-[#7A6140]">
              Toplam: {totalCount} Talep
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6 bg-neutral-50 p-4 rounded-xs border border-neutral-200/70">
          {/* Search */}
          <div className="sm:col-span-1 lg:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Kod, müşteri adı veya telefon ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-hidden focus:border-[#C5A880]"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="NEW">Yeni Talepler</option>
              <option value="CONTACTED">İletişime Geçildi</option>
              <option value="STORE_VISIT_SCHEDULED">Showroom Randevusu</option>
              <option value="AWAITING_PAYMENT">Ödeme Bekleniyor</option>
              <option value="PAID_OFFLINE">Ödeme Teyit Edildi</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal Edildi</option>
              <option value="SPAM">Geçersiz / Spam</option>
              <option value="EXPIRED">Zaman Aşımı</option>
            </select>
          </div>

          {/* Preference Filter */}
          <div>
            <select
              value={preferenceFilter}
              onChange={(e) => {
                setPreferenceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-hidden focus:border-[#C5A880]"
            >
              <option value="ALL">Tüm Tercihler</option>
              <option value="WHATSAPP">WhatsApp İletişimi</option>
              <option value="STORE_VISIT">Showroom Ziyareti</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {isLoading && requests.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#C5A880]" />
              <p className="text-xs">Talepler getiriliyor...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 space-y-2 border border-dashed border-neutral-200 rounded-xs">
              <Package className="h-10 w-10 text-neutral-300 mx-auto" />
              <p className="text-xs font-semibold text-neutral-600">Aranan kriterlere uygun talep bulunamadı.</p>
              <p className="text-[11px] text-neutral-400 font-light">Filtreleri sıfırlayarak tüm talepleri görüntüleyebilirsiniz.</p>
            </div>
          ) : (
            requests.map((req) => {
              const statusCfg = STATUS_LABELS[req.status] || STATUS_LABELS.NEW;
              const erpCfg = ERP_STATUS_LABELS[req.erpStatus] || ERP_STATUS_LABELS.PENDING;
              const isExpanded = expandedId === req.id;

              return (
                <div
                  key={req.id}
                  className="bg-white border border-neutral-200 hover:border-[#C5A880]/60 rounded-xs transition-[border-color,box-shadow] duration-200 shadow-2xs overflow-hidden"
                >
                  {/* Card Header Bar */}
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-50/50 border-b border-neutral-100">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-extrabold text-sm text-neutral-900 bg-white px-2.5 py-1 border border-neutral-200 rounded-xs">
                        {req.code}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>

                      {/* Preference Badge */}
                      {req.preference === 'WHATSAPP' ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>Showroom Ziyareti</span>
                        </span>
                      )}

                      {/* ERP Status Badge */}
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${erpCfg.bg}`}>
                          {erpCfg.label}
                          {req.erpSaleCode && ` (${req.erpSaleCode})`}
                        </span>
                        {req.erpStatus === 'FAILED' && (req.erpLastError || req.erpErrorMessage) && (
                          <span
                            className="text-[9px] text-rose-600 font-mono mt-0.5 max-w-[200px] truncate"
                            title={req.erpLastError || req.erpErrorMessage || ''}
                          >
                            {req.erpLastError || req.erpErrorMessage}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-neutral-400 font-mono">
                        {new Date(req.createdAt).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* WhatsApp CTA button */}
                      <a
                        href={getWhatsAppUrl(req)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xs transition-colors shadow-2xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 fill-current" />
                        <span>WhatsApp&apos;ta Aç</span>
                      </a>

                      {/* Update Status button */}
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          const nextAllowed = ALLOWED_TRANSITIONS[req.status]?.[0] || req.status;
                          setTargetStatus(nextAllowed);
                          setStaffNote(req.staffNote || '');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold rounded-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>Durum Değiştir</span>
                      </button>

                      {/* Retry ERP if failed */}
                      {req.erpStatus === 'FAILED' && (
                        <button
                          onClick={() => handleRetryErp(req.id, req.code)}
                          disabled={isRetryingErp === req.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xs transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`h-3 w-3 ${isRetryingErp === req.id ? 'animate-spin' : ''}`} />
                          <span>ERP Tekrar Dene</span>
                        </button>
                      )}

                      {/* Public Receipt Link */}
                      <a
                        href={`/talep/${req.publicToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600 text-xs font-medium rounded-xs transition-colors"
                        title="Müşteri Dijital Fişi"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Fiş</span>
                      </a>

                      {/* Toggle Expand Items */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        className="p-1.5 hover:bg-neutral-100 rounded-xs text-neutral-500 cursor-pointer"
                        title="Kalemleri ve Detayları Aç/Kapat"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Customer and Summary Quick Strip */}
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        Müşteri
                      </span>
                      <div className="font-semibold text-neutral-800 flex items-center gap-1.5 mt-0.5">
                        <User className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{req.customerName}</span>
                      </div>
                      <div className="font-mono text-neutral-600 flex items-center gap-1.5 mt-1">
                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{req.customerPhone}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        Bölge / Mağaza
                      </span>
                      <div className="font-semibold text-neutral-800 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{req.city} {req.district ? `/ ${req.district}` : ''}</span>
                      </div>
                      {req.preferredStore && (
                        <div className="text-[11px] text-[#B4966E] font-medium flex items-center gap-1.5 mt-1">
                          <Building2 className="h-3 w-3" />
                          <span>{req.preferredStore.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        Talep Tutarı ({req.items?.length || 0} Kalem)
                      </span>
                      <div className="text-base font-extrabold text-[#C87A53] mt-0.5">
                        {formatPrice(req.totalAmount)}
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        Liste Fiyatı Snapshot
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        Personel Notu
                      </span>
                      <p className="text-[11px] text-neutral-600 italic mt-0.5 line-clamp-2">
                        {req.staffNote ? `"${req.staffNote}"` : 'Henüz not girilmemiş.'}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Items & History Drawer */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 bg-[#FBF9F5] p-5 space-y-5 animate-fade-in">
                      {/* Items Table */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#C5A880]" />
                          <span>Talep Edilen Ürün Kalemleri</span>
                        </h4>
                        <div className="bg-white border border-neutral-200 rounded-xs overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-3">Ürün</th>
                                <th className="p-3">Renk / Varyant</th>
                                <th className="p-3 text-center">Adet</th>
                                <th className="p-3 text-right">Birim Fiyat</th>
                                <th className="p-3 text-right">Toplam</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {req.items?.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-50/50">
                                  <td className="p-3 font-medium text-neutral-900">
                                    {item.productName}
                                  </td>
                                  <td className="p-3 text-neutral-600">
                                    {item.colorLabel || 'Standart'}
                                  </td>
                                  <td className="p-3 text-center font-mono font-bold">
                                    {item.quantity}
                                  </td>
                                  <td className="p-3 text-right font-mono text-neutral-600">
                                    {formatPrice(item.unitPrice)}
                                  </td>
                                  <td className="p-3 text-right font-mono font-bold text-neutral-900">
                                    {formatPrice(item.lineTotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Events and Audit Log */}
                      {req.events && req.events.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 flex items-center gap-2">
                            <History className="h-4 w-4 text-[#C5A880]" />
                            <span>İşlem & Durum Geçmişi</span>
                          </h4>
                          <div className="bg-white border border-neutral-200 rounded-xs p-3 space-y-2">
                            {req.events.map((evt) => (
                              <div key={evt.id} className="text-xs flex items-start gap-2 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0">
                                <span className="text-[10px] font-mono text-neutral-400 whitespace-nowrap pt-0.5">
                                  {new Date(evt.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="font-semibold text-neutral-800">{evt.eventType}:</span>
                                <span className="text-neutral-600">{evt.note || '-'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-center">
            <Pagination
              totalItems={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              itemLabel="talep"
            />
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xs border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-900">
                  Talep Durumunu Güncelle
                </h4>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  {selectedRequest.code} - {selectedRequest.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5">
                  Yeni Durum
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as RequestStatusType)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-hidden focus:border-[#C5A880]"
                >
                  {/* Mevcut durum: durumu değiştirmeden yalnızca personel notu eklemek için */}
                  <option value={selectedRequest.status}>
                    {STATUS_LABELS[selectedRequest.status]?.label || selectedRequest.status} (durum aynı kalsın, yalnızca not ekle)
                  </option>
                  {(ALLOWED_TRANSITIONS[selectedRequest.status] || []).map((st) => (
                    <option key={st} value={st}>
                      {STATUS_LABELS[st]?.label || st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5">
                  Personel Notu / Açıklama
                </label>
                <textarea
                  rows={3}
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  placeholder="Müşteriyle görüşüldü, Modoko showroom randevusu teyit edildi..."
                  className="w-full p-3 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xs hover:bg-neutral-50 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdatingStatus && <RefreshCw className="h-3 w-3 animate-spin" />}
                  <span>Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
