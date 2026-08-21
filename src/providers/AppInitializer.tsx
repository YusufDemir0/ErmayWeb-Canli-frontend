'use client';

import { useEffect, ReactNode } from 'react';
import { useCMSStore } from '../stores/useCMSStore';
import { useOrderStore } from '../stores/useOrderStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useDiscountStore } from '../stores/useDiscountStore';

/**
 * Global App & Store Initializer (Pure lightweight state synchronizer)
 * Fetches and synchronizes authentic backend data upon application load.
 */
export default function AppInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().checkAuthSession();
    useCMSStore.getState().fetchCmsBlocks();
    useCMSStore.getState().fetchProductsAndCategories();
    useCMSStore.getState().fetchStores();
    useOrderStore.getState().fetchOrders();
    useDiscountStore.getState().fetchCoupons();
  }, []);

  return <>{children}</>;
}
