import React from 'react';
import type { Metadata } from 'next';
import { SalePage } from '../../components/SalePage';
import { productService } from '../../services/productService';

export const revalidate = 60; // ISR: build anında boş veriyle statik üretilmesin

export const metadata: Metadata = {
  title: 'İndirimli Ürünler | Ermay Mobilya',
  description: 'Doğrudan üreticiden standart seri ofis mobilyalarında fabrika satış indirimleri: makam takımları, toplantı masaları, ofis koltukları ve daha fazlası.',
};

export default async function SaleRoute() {
  // Varsayılan 24 ürün limiti indirimli ürünlerin bir kısmını SSR HTML'inden düşürüyordu
  const products = await productService.getProducts({ limit: 60 });

  return <SalePage initialProducts={products} />;
}
