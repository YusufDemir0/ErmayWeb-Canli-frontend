'use client';

import React from 'react';
import { useToastStore, type ToastType } from '../stores/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
  error: <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-[#C5A880] flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
};

const borderStyles: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-50/95 text-emerald-950 shadow-emerald-900/10',
  error: 'border-rose-500/30 bg-rose-50/95 text-rose-950 shadow-rose-900/10',
  info: 'border-[#C5A880]/40 bg-[#FAF8F5]/95 text-neutral-900 shadow-neutral-900/10',
  warning: 'border-amber-500/30 bg-amber-50/95 text-amber-950 shadow-amber-900/10',
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-sm border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-3 ${
            borderStyles[toast.type]
          }`}
          role="alert"
        >
          <div className="pt-0.5">{icons[toast.type]}</div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold leading-tight tracking-tight">
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-[11px] opacity-85 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 -mr-1 -mt-1 rounded hover:bg-black/5 transition-colors cursor-pointer text-neutral-400 hover:text-neutral-700"
            aria-label="Kapat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
