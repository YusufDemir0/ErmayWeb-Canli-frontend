import React from 'react';
import type { Metadata } from 'next';
import { SalePage } from '../../components/SalePage';
import { productService } from '../../services/productService';

export const metadata: Metadata = {
  title: 'İndirimli Ürünler & Kampanyalar | Ermay Mobilya',
  description: 'Seçkin İtalyan ve İskandinav mobilya tasarımlarında %30’a varan net indirim fırsatları.',
};

export default async function SaleRoute() {
  const products = await productService.getProducts();

  return <SalePage initialProducts={products} />;
}
