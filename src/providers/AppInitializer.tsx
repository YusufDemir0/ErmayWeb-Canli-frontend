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
    const init = async () => {
      await useAuthStore.getState().checkAuthSession();
      if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
        useOrderStore.getState().fetchOrders();
      }
    };
    init();
    // Only fetch minimal CMS layout blocks (header/ticker/contact/popup) globally.
    // Heavy product, category, coupon and store collections are fetched on-demand per page.
    useCMSStore.getState().fetchCmsBlocks();
  }, []);

  return <>{children}</>;
}
