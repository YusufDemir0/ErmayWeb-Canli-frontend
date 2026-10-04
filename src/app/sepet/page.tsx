import React from 'react';
import type { Metadata } from 'next';
import { CartPage } from '../../components/CartPage';

export const metadata: Metadata = {
  title: 'Talep Sepeti | Ermay Mobilya',
  description: 'Ermay Mobilya sepetinizdeki ürünleri gözden geçirin ve güvenli ödeme yapın.',
};

export default function CartRoute() {
  return <CartPage />;
}
