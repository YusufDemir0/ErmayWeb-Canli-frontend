'use client';

import React, { useState } from 'react';
import { X, Upload, CheckCircle2, FileText, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadProductImage } from '../lib/uploadHelper';
import apiClient from '../services/api';
import type { Order } from '../stores/useOrderStore';

interface ReceiptUploadModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen || !order) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setIsUploading(true);
      setErrorMessage('');

      try {
        const url = await uploadProductImage(file, true);
        setFileUrl(url);
      } catch (err) {
        setErrorMessage('Dekont dosyası yüklenemedi. Lütfen tekrar deneyiniz.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      setErrorMessage('Lütfen önce bir dekont dosyası yükleyin.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await apiClient.post(`/orders/${order.id}/receipt`, {
        receiptUrl: fileUrl,
      });

      if (res.data?.success && res.data.order) {
        onSuccess(res.data.order);
        onClose();
      } else {
        setErrorMessage(res.data?.message || 'Dekont kaydedilemedi.');
      }
    } catch (err: unknown) {
      setErrorMessage('Dekont kaydedilirken sunucu hatası oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl border border-neutral-200 overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-[#C5A880]" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Havale / EFT Dekont Yükleme
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                Sipariş #{order.orderNumber || order.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-xs transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmitReceipt} className="p-6 space-y-5 text-xs text-neutral-700">
          
          {/* Bank Account Info Box */}
          <div className="bg-[#FBF9F5] p-4 rounded-xs border border-[#EAE3D2] space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#C5A880] tracking-wider block">
              Ermay Mobilya Resmi Banka Hesap Bilgisi
            </span>
            <div className="space-y-1 font-mono text-[11px] text-neutral-800">
              <p><strong>Banka:</strong> Garanti BBVA — Ticari Şube</p>
              <p><strong>Alıcı Ünvanı:</strong> ERMAY MOBİLYA SAN. VE TİC. A.Ş.</p>
              <p><strong>IBAN:</strong> TR42 0006 2000 0001 2345 6789 01</p>
              <p className="text-[10px] text-neutral-500 font-sans mt-1">
                * Lütfen havale açıklama kısmına <strong>{order.orderNumber || order.id}</strong> yazmayı unutmayınız.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xs flex items-center gap-2 animate-fade-in text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload Box */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
              Dekont Belgesi (PDF, JPG veya PNG) *
            </label>

            <div className="border-2 border-dashed border-neutral-300 hover:border-[#C5A880] p-6 rounded-xs text-center space-y-2 bg-neutral-50 transition-colors">
              <input
                type="file"
                id="receipt-file-input"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="receipt-file-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {isUploading ? (
                  <Loader2 className="h-8 w-8 text-[#C5A880] animate-spin" />
                ) : fileUrl ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                ) : (
                  <Upload className="h-8 w-8 text-neutral-400 hover:text-[#C5A880] transition-colors" />
                )}

                <span className="text-xs font-semibold text-neutral-800">
                  {isUploading
                    ? 'Dekont Yükleniyor...'
                    : fileName
                    ? fileName
                    : 'Dekont dosyasını seçmek için tıklayın'}
                </span>
                <span className="text-[10px] text-neutral-400 font-light">
                  Maksimum dosya boyutu: 10MB
                </span>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xs border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isUploading || isSubmitting || !fileUrl}
              className="px-6 py-2.5 rounded-xs bg-[#C5A880] hover:bg-[#B4966E] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Dekontu Gönder'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
