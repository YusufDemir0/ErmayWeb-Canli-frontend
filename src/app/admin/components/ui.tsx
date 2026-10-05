'use client';

import React from 'react';

/**
 * Admin ekranlarının ortak parçaları: aynı kart, aynı alan düzeni, aynı hata ve sayaç dili.
 * Yeni ekranlar bunları kullanır; böylece her formda etiket, ipucu ve hata aynı yerde durur.
 */

export const adminInput = (invalid = false) =>
  `w-full h-10 text-sm px-3 border ${invalid ? 'border-signal' : 'border-line-strong'} rounded-xs bg-white focus:outline-none focus:ring-2 focus:ring-wood/30 focus:border-wood disabled:bg-paper`;

export const AdminCard: React.FC<{
  title: string;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon: Icon, actions, children }) => (
  <section className="bg-white border border-line rounded-xs">
    <header className="px-5 py-4 border-b border-line flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-wood-dark shrink-0" />}
          {title}
        </h2>
        {description && <p className="text-sm text-neutral-600 mt-0.5">{description}</p>}
      </div>
      {actions}
    </header>
    <div className="p-5 space-y-4">{children}</div>
  </section>
);

export const AdminField: React.FC<{
  id: string;
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string | null;
  count?: [number, number];
  children: React.ReactNode;
}> = ({ id, label, required, hint, error, count, children }) => (
  <div>
    <div className="flex items-center justify-between gap-2 mb-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-signal"> *</span>}
      </label>
      {count && (
        <span className={`text-xs tabular-nums-all ${count[0] > count[1] * 0.9 ? 'text-signal' : 'text-neutral-500'}`}>
          {count[0]}/{count[1]}
        </span>
      )}
    </div>
    {children}
    {error ? (
      <p id={`${id}-error`} className="mt-1 text-xs text-signal" role="alert">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>
    )}
  </div>
);

export const SaveBar: React.FC<{
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
  disabled?: boolean;
  error?: string | null;
  label?: string;
}> = ({ dirty, saving, onSave, onReset, disabled, error, label = 'Kaydet' }) => (
  <div className="sticky bottom-0 z-20 -mx-4 sm:mx-0 bg-white/95 backdrop-blur border-t sm:border border-line sm:rounded-xs px-4 py-3 flex flex-wrap items-center justify-between gap-3">
    <span className={`text-sm ${error ? 'text-signal' : dirty ? 'text-ink font-medium' : 'text-neutral-500'}`} aria-live="polite">
      {error || (dirty ? 'Kaydedilmemiş değişiklik var' : 'Tüm değişiklikler kayıtlı')}
    </span>
    <div className="flex gap-2">
      {onReset && (
        <button type="button" onClick={onReset} disabled={!dirty || saving} className="h-10 px-4 text-sm border border-line-strong rounded-xs hover:bg-paper disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
          Vazgeç
        </button>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving || disabled}
        className="h-10 px-5 text-sm font-semibold bg-brand hover:bg-brand-dark text-ink rounded-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >
        {saving ? 'Kaydediliyor…' : label}
      </button>
    </div>
  </div>
);
