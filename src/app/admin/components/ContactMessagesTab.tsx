'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, RefreshCw, CheckCircle2, RotateCcw, Inbox } from 'lucide-react';
import apiClient from '../../../services/api';
import { toast } from '../../../stores/useToastStore';
import { Pagination } from '../../../components/Pagination';

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  createdAt: string;
  handledAt: string | null;
}

type StatusFilter = 'open' | 'handled' | 'all';

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'open', label: 'Bekleyenler' },
  { id: 'handled', label: 'İlgilenilenler' },
  { id: 'all', label: 'Tümü' },
];

interface ContactMessagesTabProps {
  onOpenCountChange?: (count: number) => void;
}

export const ContactMessagesTab: React.FC<ContactMessagesTabProps> = ({ onOpenCountChange }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState<StatusFilter>('open');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/contact', { params: { status, page, limit: pageSize } });
      if (res.data?.success) {
        setMessages(res.data.messages || []);
        setTotal(res.data.total || 0);
        onOpenCountChange?.(res.data.openCount || 0);
      }
    } catch {
      toast.error('Hata Oluştu', 'İletişim mesajları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [status, page, pageSize, onOpenCountChange]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const toggleHandled = async (msg: ContactMessage) => {
    setUpdatingId(msg.id);
    try {
      await apiClient.patch(`/contact/${msg.id}/handled`, { handled: !msg.handledAt });
      toast.success('İşlem Başarılı', msg.handledAt ? 'Mesaj tekrar açıldı.' : 'Mesaj ilgilenildi olarak işaretlendi.');
      await loadMessages();
    } catch {
      toast.error('Hata Oluştu', 'Mesaj güncellenemedi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const whatsappLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '')}`;

  return (
    <div className="bg-white border border-neutral-200 rounded-sm shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-neutral-100">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 flex items-center gap-2">
          <Inbox className="h-4 w-4 text-[#C5A880]" />
          İletişim Formu Mesajları ({total})
        </h2>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setStatus(f.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xs border cursor-pointer ${
                status === f.id
                  ? 'bg-[#C5A880] text-white border-[#C5A880]'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={loadMessages}
            className="p-2 text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-xs cursor-pointer"
            aria-label="Yenile"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {messages.length === 0 && !isLoading ? (
        <div className="p-10 text-center text-xs text-neutral-500">Bu filtrede mesaj bulunmuyor.</div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {messages.map((msg) => (
            <li key={msg.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-neutral-900">{msg.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#7A6140] font-semibold mt-0.5">{msg.subject}</div>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {new Date(msg.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>

              <p className="text-xs text-neutral-700 whitespace-pre-line break-words">{msg.message}</p>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                  <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 hover:text-neutral-900">
                    <Phone className="h-3.5 w-3.5" /> {msg.phone}
                  </a>
                  <a href={whatsappLink(msg.phone)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                    WhatsApp
                  </a>
                  {msg.email && (
                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-neutral-900">
                      <Mail className="h-3.5 w-3.5" /> {msg.email}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => toggleHandled(msg)}
                  disabled={updatingId === msg.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xs border cursor-pointer disabled:opacity-60 ${
                    msg.handledAt
                      ? 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {msg.handledAt ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {msg.handledAt ? 'Tekrar Aç' : 'İlgilenildi'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="p-4 border-t border-neutral-100">
        <Pagination
          totalItems={total}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemLabel="mesaj"
        />
      </div>
    </div>
  );
};
