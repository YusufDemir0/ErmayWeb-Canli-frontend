'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import type { Order } from '../stores/useOrderStore';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = order.invoiceNumber || `ERM${new Date().getFullYear()}${order.id.replace(/[^0-9]/g, '').slice(0, 6) || '100452'}`;
  const invoiceDate = new Date().toLocaleDateString('tr-TR');
  const invoiceTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const totalAmount = Number(order.totalAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const rawSubtotal = totalAmount / 1.20;
  const taxAmount = Number(order.taxAmount || (totalAmount - rawSubtotal));
  const subtotal = Number((totalAmount - taxAmount).toFixed(2));

  const formatTL = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace('TRY', 'TL');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl border border-neutral-200 overflow-hidden print:border-none print:shadow-none print:max-w-full">
        
        {/* Modal Controls Bar (Hidden during Print) */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#C5A880]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Resmi e-Arşiv / e-Fatura Görüntüleyici (GİB Standart)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase px-4 py-2 rounded-xs transition-all cursor-pointer shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1.5 rounded-xs transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Document */}
        <div className="p-8 md:p-12 text-neutral-800 text-xs font-sans space-y-8 bg-white" id="printable-invoice">
          
          {/* Header & Seller Information */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border-b-2 border-neutral-800 pb-6 items-start">
            {/* Logo & Seller Info */}
            <div className="md:col-span-7 space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-neutral-950">
                ERMAY MOBİLYA
              </h1>
              <p className="font-semibold text-neutral-800 text-[11px]">
                ERMAY MOBİLYA SANAYİ VE TİCARET ANONİM ŞİRKETİ
              </p>
              <div className="text-[10px] text-neutral-600 space-y-0.5 font-light leading-relaxed">
                <p>Modoko Mobilyacılar Sitesi 1. Cadde No: 42, 34775 Ümraniye / İstanbul</p>
                <p>Vergi Dairesi: Ümraniye V.D. | Vergi No: 3810492817 | Ticaret Sicil No: 489210-5</p>
                <p>Mersis No: 0381049281700018 | Tel: +90 (216) 555 42 42 | E-Posta: fatura@ermaymobilya.com</p>
              </div>
            </div>

            {/* Invoice Badge & Serial Info */}
            <div className="md:col-span-5 bg-neutral-50 p-4 rounded-xs border border-neutral-200 space-y-2 text-right">
              <div className="inline-block bg-neutral-900 text-[#C5A880] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-2xs mb-1">
                {order.invoiceDetails?.invoiceType === 'CORPORATE' ? 'e-FATURA' : 'e-ARŞİV FATURA'}
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <p><strong className="font-sans text-[10px] text-neutral-500 uppercase">Fatura No:</strong> <span className="font-bold text-neutral-900">{invoiceNumber}</span></p>
                <p><strong className="font-sans text-[10px] text-neutral-500 uppercase">Sipariş No:</strong> {order.orderNumber || order.id}</p>
                <p><strong className="font-sans text-[10px] text-neutral-500 uppercase">Tarih / Saat:</strong> {invoiceDate} {invoiceTime}</p>
                <p><strong className="font-sans text-[10px] text-neutral-500 uppercase">Ödeme Türü:</strong> {order.paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı / Virtual POS' : order.paymentMethod === 'BANK_TRANSFER' ? 'Banka Havalesi / EFT' : 'Kapıda Ödeme'}</p>
              </div>
            </div>
          </div>

          {/* Buyer (Customer) & Delivery Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-neutral-200 pb-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                SAYIN (ALICI BİLGİLERİ)
              </span>
              <p className="font-bold text-sm text-neutral-900 uppercase">
                {order.invoiceDetails?.companyTitle || order.customerName || order.shippingAddress?.fullName}
              </p>
              {order.invoiceDetails?.invoiceType === 'CORPORATE' ? (
                <div className="text-[11px] text-neutral-600 space-y-0.5 font-mono">
                  <p><strong>Vergi No (VKN):</strong> {order.invoiceDetails.taxNo || '-'}</p>
                  <p><strong>Vergi Dairesi:</strong> {order.invoiceDetails.taxOffice || '-'}</p>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-600 font-mono">
                  <strong>T.C. Kimlik No:</strong> {order.invoiceDetails?.tcKn || '11111111111'}
                </p>
              )}
              <p className="text-[11px] text-neutral-600">
                <strong>E-Posta:</strong> {order.customerEmail || '-'} | <strong>Tel:</strong> {order.customerPhone || order.shippingAddress?.phone}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                TESLİMAT VE SEVKİYAT ADRESİ
              </span>
              <p className="font-semibold text-neutral-900">
                {order.shippingAddress?.title || 'Teslimat Adresi'}
              </p>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                {order.shippingAddress?.addressLine}
              </p>
              <p className="text-[11px] text-neutral-600 font-semibold">
                {order.shippingAddress?.district} / {order.shippingAddress?.city} - {order.shippingAddress?.zipCode}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 text-neutral-700 font-bold uppercase text-[10px] border-b border-neutral-300">
                  <th className="py-2.5 px-3">Sıra</th>
                  <th className="py-2.5 px-3">Mal / Hizmet Açıklaması</th>
                  <th className="py-2.5 px-3 text-center">Miktar</th>
                  <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                  <th className="py-2.5 px-3 text-center">KDV (%)</th>
                  <th className="py-2.5 px-3 text-right">KDV Tutarı</th>
                  <th className="py-2.5 px-3 text-right">Toplam Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, idx) => {
                  const unitPrice = Number((item as any).unitPrice || item.price || (item.product ? item.product.price : 0));
                  const itemTotal = unitPrice * item.quantity;
                  const itemTax = (itemTotal / 1.20) * 0.20;
                  const itemMatrah = itemTotal - itemTax;

                  return (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-3 font-mono text-neutral-500">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900">{item.product?.name || 'Lüks Mobilya Parçası'}</div>
                        <div className="text-[10px] text-neutral-500 font-light">{item.product?.dimensions} - {item.product?.material}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{item.quantity} Adet</td>
                      <td className="py-3 px-3 text-right font-mono">{formatTL(unitPrice)}</td>
                      <td className="py-3 px-3 text-center font-bold text-neutral-600">%20</td>
                      <td className="py-3 px-3 text-right font-mono">{formatTL(itemTax)}</td>
                      <td className="py-3 px-3 text-right font-bold font-mono text-neutral-950">{formatTL(itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Bottom Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 border-t-2 border-neutral-800 items-start">
            
            {/* Legal Text & Verification Barcode */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs text-[10px] text-neutral-500 space-y-1">
                <p className="font-semibold text-neutral-700">YASAL BİLGİLENDİRME & e-ARŞİV HÜKMÜ:</p>
                <p>Bu belge 509 Sıra No'lu Vergi Usul Kanunu Genel Tebliği uyarınca elektronik ortamda düzenlenmiş olup, Gelir İdaresi Başkanlığı (GİB) portalı üzerinden doğrulanabilir.</p>
                <p className="italic">İrsaliye yerine geçer. Teslim anında kaşe/imza zorunludur.</p>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-neutral-500">
                <div className="p-2 border border-neutral-300 rounded-xs bg-white">
                  <QrCode className="h-12 w-12 text-neutral-800" />
                </div>
                <div>
                  <p className="font-mono font-bold text-neutral-800">KAREKOD İLE DOĞRULAMA</p>
                  <p className="text-[9px]">GİB e-Belge Doğrulama Kodu: {invoiceNumber}</p>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="md:col-span-5 bg-neutral-50 p-4 rounded-xs border border-neutral-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-neutral-600">
                <span className="font-sans text-[11px]">Mal/Hizmet Toplamı (Matrah):</span>
                <span>{formatTL(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="font-sans text-[11px]">Toplam İndirim / Kupon:</span>
                  <span>-{formatTL(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600 border-b border-neutral-200 pb-2">
                <span className="font-sans text-[11px]">Hesaplanan KDV (%20):</span>
                <span>{formatTL(taxAmount)}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-neutral-950 pt-1">
                <span className="font-sans text-xs uppercase">Ödenecek Tutar:</span>
                <span className="text-base text-brand-dark">{formatTL(totalAmount)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
