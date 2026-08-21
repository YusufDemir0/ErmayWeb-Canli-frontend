'use client';

import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, ExternalLink, ShieldCheck, 
  Truck, Building, AlertCircle, Eye, Printer, ArrowUpRight 
} from 'lucide-react';
import type { Order, OrderStatus } from '../../../stores/useOrderStore';
import { InvoiceModal } from '../../../components/InvoiceModal';

interface OrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    cargoCompany?: string
  ) => void;
  onShowSuccess: (msg: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onShowSuccess,
}) => {
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace('TRY', 'TL');
  };

  const handleApproveWirePayment = (order: Order) => {
    onUpdateOrderStatus(order.id, 'PREPARING' as OrderStatus);
    onShowSuccess(`Sipariş #${order.orderNumber || order.id} havale ödemesi onaylandı ve Hazırlanıyor aşamasına alındı.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 md:p-8 rounded-sm border border-neutral-200 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Kurumsal Sipariş Yönetimi & Sevkiyat
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Havale dekontlarını doğrulayın, faturaları görüntüleyin ve kargo kodlarını atayın.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-neutral-100 px-3 py-1.5 rounded-full font-mono font-bold text-neutral-700">
              Toplam: {orders.length} Sipariş
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-2">
              <Truck className="h-10 w-10 text-neutral-300 mx-auto" />
              <p className="text-xs">Henüz sipariş kaydı bulunmamaktadır.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="border border-neutral-200 rounded-sm p-6 space-y-5 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-extrabold font-mono text-neutral-900">
                        #{order.orderNumber || order.id}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        ({order.createdAt})
                      </span>
                      {order.invoiceDetails?.invoiceType === 'CORPORATE' ? (
                        <span className="text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>Kurumsal e-Fatura</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded-full">
                          Bireysel e-Arşiv
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-neutral-700 font-semibold">
                      Müşteri: {order.customerName} ({order.customerEmail} - {order.customerPhone})
                    </p>
                    {order.invoiceDetails?.companyTitle && (
                      <p className="text-[11px] text-neutral-500 font-mono">
                        Ünvan: {order.invoiceDetails.companyTitle} (VKN: {order.invoiceDetails.taxNo} - {order.invoiceDetails.taxOffice})
                      </p>
                    )}
                  </div>

                  {/* Actions & Status Control */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold uppercase px-3 py-2 rounded-xs border border-neutral-300 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Printer className="h-3.5 w-3.5 text-[#C5A880]" />
                      <span>Fatura Yazdır</span>
                    </button>

                    {order.receiptUrl && (
                      <button
                        onClick={() => setPreviewReceiptUrl(order.receiptUrl!)}
                        className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold uppercase px-3 py-2 rounded-xs border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Dekontu İncele</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold uppercase text-neutral-500">
                        Durum:
                      </label>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => {
                          onUpdateOrderStatus(order.id, e.target.value as OrderStatus);
                          onShowSuccess(`Sipariş #${order.orderNumber || order.id} durumu güncellendi: ${e.target.value}`);
                        }}
                        className="text-xs font-bold bg-white border border-neutral-300 p-2 rounded-xs focus:ring-1 focus:ring-[#C5A880] cursor-pointer"
                      >
                        <option value="PENDING">Ödeme Bekliyor (PENDING)</option>
                        <option value="PREPARING">Hazırlanıyor (PREPARING)</option>
                        <option value="SHIPPED">Kargoya Verildi (SHIPPED)</option>
                        <option value="DELIVERED">Teslim Edildi (DELIVERED)</option>
                        <option value="CANCELLED">İptal Edildi (CANCELLED)</option>
                        <option value="REFUNDED">İade Edildi (REFUNDED)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Wire Payment Approval Notification Banner */}
                {(order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'bank_transfer') && 
                 order.orderStatus === 'PENDING_PAYMENT' && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-amber-900">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <strong className="block">Banka Havalesi / EFT Bekleniyor</strong>
                        <span className="text-[11px] text-amber-800">
                          {order.receiptUrl ? 'Müşteri dekont yükledi. Lütfen dekontu inceleyip onaylayın.' : 'Müşteri henüz dekont yüklemedi.'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApproveWirePayment(order)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs px-4 py-2 rounded-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Ödemeyi Onayla & Hazırla</span>
                    </button>
                  </div>
                )}

                {/* Cargo Tracking Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xs border border-neutral-200">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Kargo / Lojistik Firması
                    </label>
                    <input
                      type="text"
                      defaultValue={order.cargoCompany || order.shippingCarrier || 'Yurtiçi Kargo'}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== (order.cargoCompany || order.shippingCarrier)) {
                          onUpdateOrderStatus(
                            order.id,
                            order.orderStatus,
                            order.trackingNumber,
                            val
                          );
                          onShowSuccess(`Kargo firması güncellendi: ${val}`);
                        }
                      }}
                      placeholder="Yurtiçi Kargo / Borusan Lojistik / Horoz Lojistik"
                      className="w-full text-xs border border-neutral-300 p-2 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Kargo Takip No / İrsaliye Seri No
                    </label>
                    <input
                      type="text"
                      defaultValue={order.trackingNumber || ''}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== (order.trackingNumber || '')) {
                          onUpdateOrderStatus(
                            order.id,
                            order.orderStatus,
                            val,
                            order.cargoCompany || order.shippingCarrier
                          );
                          onShowSuccess(`Kargo takip no güncellendi: ${val}`);
                        }
                      }}
                      placeholder="YK-84910245"
                      className="w-full text-xs border border-neutral-300 p-2 rounded-xs font-mono"
                    />
                  </div>
                </div>

                {/* Order Items List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    <span>Sipariş Edilen Ürünler ({order.items.length} Kalem)</span>
                    <span>Toplam: <strong className="text-neutral-900 text-xs">{formatPrice(order.totalAmount)}</strong></span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.items.map((item, idx) => {
                      const itemUnitPrice = Number((item as any).unitPrice || item.price || item.product?.price || 0);
                      const itemTotalPrice = itemUnitPrice * item.quantity;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white p-3 rounded-xs border border-neutral-200"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product?.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000'}
                              alt=""
                              className="h-10 w-10 object-cover rounded-xs border border-neutral-200"
                            />
                            <div className="text-xs">
                              <p className="font-semibold text-neutral-800">{item.product?.name || 'Ürün'}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">
                                {item.quantity} Adet × {formatPrice(itemUnitPrice)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-neutral-950 font-mono">
                            {formatPrice(itemTotalPrice)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Receipt Image/Document Preview Lightbox */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-2xl w-full p-4 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h4 className="text-xs font-bold uppercase text-neutral-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#C5A880]" />
                <span>Müşteri Havale / EFT Dekontu</span>
              </h4>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="text-neutral-500 hover:text-neutral-900 text-xs font-bold uppercase p-1 cursor-pointer"
              >
                Kapat (ESC)
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-neutral-100 p-2 rounded-xs">
              <img
                src={previewReceiptUrl}
                alt="Havale Dekontu"
                className="max-h-[65vh] object-contain rounded-xs shadow-xs"
              />
            </div>

            <div className="text-right">
              <a
                href={previewReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#C5A880] font-bold hover:underline"
              >
                <span>Yeni Sekmede Tam Boyut Aç</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
