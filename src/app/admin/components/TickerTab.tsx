'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface TickerTabProps {
  tickerItems: string[];
  onAddTickerItem: (item: string) => void;
  onRemoveTickerItem: (index: number) => void;
  onShowSuccess: (msg: string) => void;
}

export const TickerTab: React.FC<TickerTabProps> = ({
  tickerItems,
  onAddTickerItem,
  onRemoveTickerItem,
  onShowSuccess,
}) => {
  const [newTickerText, setNewTickerText] = useState('');

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTickerText.trim()) {
      onAddTickerItem(newTickerText.trim());
      setNewTickerText('');
      onShowSuccess('Duyuru bandına yeni metin eklendi!');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 mb-6">
          Upper Navbar Duyuru Bandı Metinleri
        </h3>

        <form onSubmit={handleAddTicker} className="flex gap-3 mb-8">
          <input
            type="text"
            required
            placeholder="Örn: • NAKİT ÖDEMELERDE %10 EKSTRA İNDİRİM"
            value={newTickerText}
            onChange={(e) => setNewTickerText(e.target.value)}
            className="flex-1 text-xs border border-neutral-300 p-3 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
          />
          <button
            type="submit"
            className="bg-brand-dark hover:bg-brand-camel text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-xs transition-colors cursor-pointer"
          >
            Metin Ekle
          </button>
        </form>

        <div className="space-y-2">
          {tickerItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-3 rounded-xs text-xs font-semibold text-neutral-800"
            >
              <span>{item}</span>
              <button
                onClick={() => {
                  onRemoveTickerItem(idx);
                  onShowSuccess('Duyuru metni silindi.');
                }}
                className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
