'use client';

import { useEffect, ReactNode } from 'react';
import { useCMSStore } from '../stores/useCMSStore';

/**
 * Global App & Store Initializer (Pure lightweight state synchronizer)
 * Fetches and synchronizes authentic backend CMS data upon application load.
 */
export default function AppInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    const store = useCMSStore.getState();
    store.fetchCmsBlocks();
    store.fetchProductsAndCategories();
    store.fetchStores();
  }, []);

  return <>{children}</>;
}
