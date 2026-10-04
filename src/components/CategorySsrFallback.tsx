import React from 'react';
import type { Product } from '../types';

/**
 * Kategori sayfası istemcide (useSearchParams) render edildiği için sunucu HTML'i yalnızca bu fallback'i içerir.
 * Arama motorları ve JS'siz istemciler boş "Yükleniyor..." yerine başlığı ve ürün bağlantılarını görsün diye
 * aynı içeriğin erişilebilir bir özeti burada sunucuda render edilir.
 */
export default function CategorySsrFallback({ title, products }: { title: string; products: Product[] }) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center text-xs text-neutral-500">
      <h1 className="sr-only">{title} | Ermay Mobilya</h1>
      <span aria-hidden="true">Yükleniyor...</span>
      {products.length > 0 && (
        <nav className="sr-only" aria-label={`${title} ürünleri`}>
          <ul>
            {products.map((p) => (
              <li key={p.id}>
                <a href={`/urun/${p.slug || p.id}`}>{p.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
