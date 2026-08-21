import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, CartItem } from '../types';
import { useUIStore } from './useUIStore';

interface CartState {
  cartItems: CartItem[];

  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  // Computed values
  getTotalCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.cartItems.findIndex(
            (item) => item.product.id === product.id
          );
          if (existingItemIndex > -1) {
            const updatedItems = [...state.cartItems];
            updatedItems[existingItemIndex].quantity += quantity;
            return { cartItems: updatedItems };
          }
          return { cartItems: [...state.cartItems, { product, quantity }] };
        });

        // Trigger interactive cart drawer feedback
        useUIStore.getState().openCart();
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.product.id !== productId),
        }));
      },

      clearCart: () => set({ cartItems: [] }),

      getTotalCount: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().cartItems.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'ermay_cart_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
