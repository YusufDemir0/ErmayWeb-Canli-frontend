import React from 'react';
import type { Metadata } from 'next';
import { FavoritesPage } from '../../components/FavoritesPage';

export const metadata: Metadata = {
  title: 'Favorilerim | Ermay Mobilya',
  description: 'Favorilerinize eklediğiniz Ermay Mobilya tasarımlarını inceleyin.',
};

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
