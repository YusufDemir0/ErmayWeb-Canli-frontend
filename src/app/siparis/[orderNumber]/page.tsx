'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, Printer, Phone, Mail, MapPin, Building2, 
  MessageSquare, Loader2, AlertCircle, ShoppingBag, ArrowLeft, Clock
} from 'lucide-react';
import apiClient from '../../../services/api';
import type { Order, OrderItem } from '../../../stores/useOrderStore';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!orderNumber) return;

    async function fetchOrder() {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/orders/track/${orderNumber}`);
        if (res.data?.success && res.data.order) {
          setOrder(res.data.order);
        } else {
          setErrorMsg(res.data?.message || 'Sipariş bulunamadı.');
        }
      } catch (err: unknown) {
        console.error('Order tracking fetch error:', err);
        const errObj = err as { response?: { data?: { message?: string } } };
        setErrorMsg(errObj.response?.data?.message || 'Sipariş bilgileri alınamadı.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || '';
    if (s.includes('CONFIRMED') || s.includes('PAID') || s.includes('ONAY')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Ödeme Onaylandı
        </span>
      );
    }
    if (s.includes('PREPARING') || s.includes('HAZIRLAN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          Üretimde / Hazırlanıyor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
        Ödeme & Onay Bekliyor
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 p-4">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C5A880] mx-auto" />
          <p className="text-xs text-neutral-500 font-medium">Sipariş Bilgileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 p-4 py-16">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-sm shadow-sm p-8 text-center space-y-4">
          <div className="inline-flex p-3 bg-rose-100 text-rose-700 rounded-full">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-base font-bold uppercase tracking-wider text-neutral-900">
            Sipariş Bulunamadı
          </h1>
          <p className="text-xs text-neutral-500">
            {errorMsg || `"${orderNumber}" numaralı bir sipariş kaydı sistemde bulunamadı.`}
          </p>
          <Link
            href="/"
            className="w-full bg-neutral-900 hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xs transition-colors inline-block shadow-xs"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const whatsappUrl = `https://wa.me/905324194151?text=${encodeURIComponent(
    `Merhaba Ermay Mobilya, ${order.orderNumber} nolu siparişim hakkında bilgi almak istiyorum.`
  )}`;

  return (
    <div className="w-full bg-[#FBF9F5] min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in print:p-0">
        
        {/* Back Link */}
        <div className="print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        {/* Proforma Slip Card */}
        <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div>
              <span className="font-serif font-black text-2xl tracking-tight text-neutral-900">
                ERMAY MOBİLYA
              </span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                Modoko Atölye Sipariş & Satış Raporu
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-sm font-mono font-black text-neutral-900 block">
                {order.orderNumber}
              </span>
              {getStatusBadge(order.orderStatus)}
            </div>
          </div>

          {/* Customer & Address info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-neutral-50 p-4 rounded-xs border border-neutral-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Müşteri & Fatura Bilgileri
              </span>
              <p className="font-bold text-neutral-900">{order.customerName}</p>
              <p className="text-neutral-600">{order.customerPhone} {order.customerPhone2 ? ` / ${order.customerPhone2}` : ''}</p>
              <p className="text-neutral-600">{order.customerEmail || '-'}</p>
              {order.companyTitle && (
                <p className="font-semibold text-neutral-800 pt-1">
                  {order.companyTitle} (VKN: {order.taxNo} - {order.taxOffice})
                </p>
              )}
            </div>

            <div className="bg-neutral-50 p-4 rounded-xs border border-neutral-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Teslimat Adresi & Notlar
              </span>
              <p className="font-bold text-neutral-900">
                {order.shippingDistrict} / {order.shippingCity}
              </p>
              <p className="text-neutral-600 leading-relaxed">
                {order.shippingAddressLine}
              </p>
              {order.orderNote && (
                <p className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded-xs border border-amber-200 mt-1">
                  <strong>Not:</strong> {order.orderNote}
                </p>
              )}
            </div>
          </div>

          {/* Ordered Products with Photos */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
              Sipariş Edilen Mobilyalar ({items.length} Kalem)
            </span>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xs overflow-hidden">
              {items.map((item: OrderItem) => {
                const img = item.product?.image || (Array.isArray(item.product?.images) ? item.product.images[0] : '');
                return (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-3.5">
                      {img ? (
                        <img
                          src={img}
                          alt={item.product?.name || 'Ürün'}
                          className="w-16 h-16 object-cover rounded-xs border border-neutral-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-neutral-100 rounded-xs flex items-center justify-center text-neutral-400 text-[10px] font-bold">
                          Görsel
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-neutral-900 text-xs">
                          {item.product?.name || 'Mobilya'}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Miktar: <strong className="text-neutral-800">{item.quantity} adet</strong>
                        </p>
                        {item.product?.erpItemCode && (
                          <span className="text-[9px] font-mono text-neutral-400">
                            ERP Kod: {item.product.erpItemCode}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-neutral-900 text-xs">
                        {formatPrice(Number(item.totalPrice))}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">KDV Dahil</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Ara Toplam:</span>
              <span className="font-mono">{formatPrice(Number(order.totalAmount) / 1.20)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>KDV (%20):</span>
              <span className="font-mono">{formatPrice(Number(order.totalAmount) - (Number(order.totalAmount) / 1.20))}</span>
            </div>
            <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-200">
              <span>Genel Toplam:</span>
              <span className="text-[#7A6140] font-mono">{formatPrice(Number(order.totalAmount))}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 print:hidden">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp İle İletişime Geç (0532 419 41 51)</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 py-3.5 px-5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>PDF Yazdır</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
