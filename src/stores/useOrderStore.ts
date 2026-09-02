import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';
import type { UserAddress } from './useAuthStore';
import apiClient from '../services/api';
import { isAxiosError } from 'axios';

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface InvoiceDetails {
  invoiceType: 'INDIVIDUAL' | 'CORPORATE';
  tcKn?: string;
  companyTitle?: string;
  taxNo?: string;
  taxOffice?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: UserAddress;
  invoiceDetails?: InvoiceDetails;
  items: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  taxAmount?: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash_on_delivery' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY' | string;
  paymentStatus: 'paid' | 'pending' | 'PAID' | 'PENDING' | string;
  orderStatus: OrderStatus;
  invoiceNumber?: string;
  receiptUrl?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  cargoCompany?: string;
  createdAt: string;
}

export function getOrderStatusLabel(status?: string): string {
  if (!status) return 'Hazırlanıyor';
  const s = status.toUpperCase();
  if (s === 'PENDING_PAYMENT' || s === 'PENDING' || s === 'ÖDEME BEKLIYOR' || s === 'ÖDEME BEKLİYOR') return 'Ödeme Bekliyor';
  if (s === 'PAYMENT_CONFIRMED' || s === 'ÖDEME ONAYLANDI') return 'Ödeme Onaylandı';
  if (s === 'PREPARING' || s === 'HAZIRLANIYOR') return 'Hazırlanıyor';
  if (s === 'SHIPPED' || s === 'KARGOYA VERILDI' || s === 'KARGOYA VERİLDİ') return 'Kargoya Verildi';
  if (s === 'DELIVERED' || s === 'TESLIM EDILDI' || s === 'TESLİM EDİLDİ') return 'Teslim Edildi';
  if (s === 'CANCELLED' || s === 'İPTAL EDILDI' || s === 'İPTAL EDİLDİ') return 'İptal Edildi';
  if (s === 'REFUNDED' || s === 'İADE EDILDI' || s === 'İADE EDİLDİ') return 'İade Edildi';
  return status;
}

export function getOrderStatusStyle(status?: string): { bg: string; text: string } {
  const s = (status || '').toUpperCase();
  if (s.includes('PENDING')) return { bg: 'bg-amber-100', text: 'text-amber-800' };
  if (s.includes('PREPARING') || s.includes('HAZIRLAN')) return { bg: 'bg-blue-100', text: 'text-blue-800' };
  if (s.includes('SHIPPED') || s.includes('KARGO')) return { bg: 'bg-purple-100', text: 'text-purple-800' };
  if (s.includes('DELIVERED') || s.includes('TESLIM') || s.includes('TESLİM')) return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
  if (s.includes('CANCEL') || s.includes('İPTAL')) return { bg: 'bg-rose-100', text: 'text-rose-800' };
  if (s.includes('REFUND') || s.includes('İADE')) return { bg: 'bg-neutral-200', text: 'text-neutral-800' };
  return { bg: 'bg-neutral-100', text: 'text-neutral-700' };
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  
  // Actions
  fetchOrders: () => Promise<void>;
  createOrderAsync: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<{ success: boolean; order?: Order; message?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, cargoCompany?: string) => Promise<void>;
  getUserOrders: (userId: string) => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,

      fetchOrders: async () => {
        set({ isLoading: true });
        try {
          const res = await apiClient.get('/orders/my-orders');
          if (res.data?.success && Array.isArray(res.data.orders)) {
            set({ orders: res.data.orders });
          }
        } catch (e) {
          console.warn('REST API sipariş çekme uyarısı:', e);
        } finally {
          set({ isLoading: false });
        }
      },

      createOrderAsync: async (orderData) => {
        try {
          const response = await apiClient.post('/orders', {
            items: orderData.items.map((i) => ({
              productId: i.product.id,
              variantId: i.product.variantId || undefined,
              quantity: i.quantity,
              price: i.price,
            })),
            shippingAddress: orderData.shippingAddress,
            invoiceType: orderData.invoiceDetails?.invoiceType || 'INDIVIDUAL',
            tcKn: orderData.invoiceDetails?.tcKn,
            companyTitle: orderData.invoiceDetails?.companyTitle,
            taxNo: orderData.invoiceDetails?.taxNo,
            taxOffice: orderData.invoiceDetails?.taxOffice,
            paymentMethod: typeof orderData.paymentMethod === 'string' ? orderData.paymentMethod.toUpperCase() : 'CREDIT_CARD',
            couponCode: orderData.discountAmount && orderData.discountAmount > 0 ? (orderData as any).couponCode : undefined,
            totalAmount: orderData.totalAmount,
            discountAmount: orderData.discountAmount || 0,
          });

          if (response.data?.success && response.data.order) {
            const createdOrder = response.data.order;
            set((state) => ({
              orders: [createdOrder, ...state.orders]
            }));
            return { success: true, order: createdOrder };
          }
          return { success: false, message: response.data?.message || 'Sipariş oluşturulamadı.' };
        } catch (err: unknown) {
          const errData = isAxiosError(err) ? (err.response?.data as Record<string, string>) : undefined;
          console.error('REST API Sipariş Hatası:', errData || (err instanceof Error ? err.message : err));
          return { success: false, message: errData?.message || 'Sipariş işlenirken bir sunucu hatası oluştu.' };
        }
      },

      updateOrderStatus: async (orderId, status, trackingNumber, cargoCompany) => {
        try {
          const res = await apiClient.patch(`/orders/${orderId}/status`, {
            orderStatus: status,
            trackingNumber,
            shippingCarrier: cargoCompany,
          });

          if (res.data?.success) {
            set((state) => ({
              orders: state.orders.map((o) => (o.id === orderId ? { ...o, orderStatus: status, trackingNumber, cargoCompany, shippingCarrier: cargoCompany } : o))
            }));
          }
        } catch (err: unknown) {
          const errData = isAxiosError(err) ? (err.response?.data as Record<string, string>) : undefined;
          console.error('Sipariş durum güncelleme hatası:', errData || (err instanceof Error ? err.message : err));
        }
      },

      getUserOrders: (userId) => {
        return get().orders.filter((o) => o.userId === userId);
      }
    }),
    {
      name: 'ermay_orders_store',
    }
  )
);
