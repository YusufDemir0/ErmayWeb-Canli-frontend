import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../services/api';

export interface DiscountCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate?: string;
  enabled: boolean;
  description?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  coupon?: DiscountCoupon;
  discountAmount: number;
}

interface DiscountState {
  coupons: DiscountCoupon[];
  isLoading: boolean;

  // Actions
  fetchCoupons: () => Promise<void>;
  addCoupon: (coupon: Omit<DiscountCoupon, 'id' | 'usedCount'>) => Promise<void>;
  updateCoupon: (id: string, updated: Partial<DiscountCoupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  validateCoupon: (code: string, subtotal: number) => CouponValidationResult;
  recordCouponUsage: (code: string) => void;
}

const DEFAULT_COUPONS: DiscountCoupon[] = [
  {
    id: 'coup-1',
    code: 'ERMAY10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 1000,
    usageLimit: 100,
    usedCount: 5,
    enabled: true,
    description: 'Sepette Ekstra %10 İndirim Fırsatı',
  },
  {
    id: 'coup-2',
    code: 'YENIEV15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 15000,
    usageLimit: 50,
    usedCount: 2,
    enabled: true,
    description: '15.000 TL Üzeri Alışverişlerde %15 İndirim',
  },
];

export const useDiscountStore = create<DiscountState>()(
  persist(
    (set, get) => ({
      coupons: DEFAULT_COUPONS,
      isLoading: false,

      fetchCoupons: async () => {
        set({ isLoading: true });
        try {
          const res = await apiClient.get('/coupons').catch(() => apiClient.get('/cms/coupons')).catch(() => ({ data: { success: false, coupons: [] } }));
          if (res.data?.success && Array.isArray(res.data.coupons)) {
            const normalizedCoupons: DiscountCoupon[] = res.data.coupons.map((c: any) => ({
              id: c.id,
              code: c.code,
              type: c.discountType === 'fixed' ? 'fixed' : 'percentage',
              value: Number(c.discount || c.discountAmount || 0),
              minOrderAmount: Number(c.minAmount || 0),
              maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : undefined,
              usageLimit: c.maxUses || undefined,
              usedCount: c.usedCount || 0,
              expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : undefined,
              enabled: c.isActive !== undefined ? c.isActive : (c.enabled !== undefined ? c.enabled : true),
              description: c.description || undefined,
            }));
            set({ coupons: normalizedCoupons });
          }
        } catch (e) {
          console.warn('Kuponları çekme uyarısı:', e);
        } finally {
          set({ isLoading: false });
        }
      },

      addCoupon: async (couponData) => {
        try {
          const res = await apiClient.post('/coupons', {
            code: couponData.code.toUpperCase().trim(),
            discount: couponData.value,
            discountType: couponData.type,
            minAmount: couponData.minOrderAmount || 0,
            maxUses: couponData.usageLimit || null,
            expiryDate: couponData.expiryDate || null,
            isActive: couponData.enabled,
          });
          if (res.data?.success && res.data.coupon) {
            await get().fetchCoupons();
          } else {
            const newCoupon: DiscountCoupon = {
              ...couponData,
              id: `coup-${Date.now()}`,
              code: couponData.code.toUpperCase().trim(),
              usedCount: 0,
            };
            set({ coupons: [newCoupon, ...get().coupons] });
          }
        } catch (err) {
          console.error('Kupon API kayıt hatası:', err);
          const newCoupon: DiscountCoupon = {
            ...couponData,
            id: `coup-${Date.now()}`,
            code: couponData.code.toUpperCase().trim(),
            usedCount: 0,
          };
          set({ coupons: [newCoupon, ...get().coupons] });
        }
      },

      updateCoupon: async (id, updatedFields) => {
        try {
          await apiClient.put(`/coupons/${id}`, {
            ...(updatedFields.value !== undefined && { discount: updatedFields.value }),
            ...(updatedFields.type !== undefined && { discountType: updatedFields.type }),
            ...(updatedFields.minOrderAmount !== undefined && { minAmount: updatedFields.minOrderAmount }),
            ...(updatedFields.usageLimit !== undefined && { maxUses: updatedFields.usageLimit }),
            ...(updatedFields.expiryDate !== undefined && { expiryDate: updatedFields.expiryDate }),
            ...(updatedFields.enabled !== undefined && { isActive: updatedFields.enabled }),
          });
          await get().fetchCoupons();
        } catch (err) {
          console.error('Kupon API güncelleme hatası:', err);
          const updated = get().coupons.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...updatedFields,
                  code: updatedFields.code ? updatedFields.code.toUpperCase().trim() : c.code,
                }
              : c
          );
          set({ coupons: updated });
        }
      },

      deleteCoupon: async (id) => {
        try {
          await apiClient.delete(`/coupons/${id}`);
          set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) }));
        } catch (err) {
          console.error('Kupon API silme hatası:', err);
          set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) }));
        }
      },

      validateCoupon: (code, subtotal) => {
        const cleanCode = code.toUpperCase().trim();
        const coupon = get().coupons.find(
          (c) => c.code === cleanCode && c.enabled
        );

        if (!coupon) {
          return {
            valid: false,
            message: 'Geçersiz veya süresi dolmuş indirim kodu.',
            discountAmount: 0,
          };
        }

        // Expiry Date Check
        if (coupon.expiryDate) {
          const now = new Date().toISOString().split('T')[0];
          if (coupon.expiryDate < now) {
            return {
              valid: false,
              message: 'Bu indirim kodunun kullanım süresi sona ermiştir.',
              discountAmount: 0,
            };
          }
        }

        // Minimum Order Amount Check
        if (subtotal < coupon.minOrderAmount) {
          return {
            valid: false,
            message: `Bu indirim kodu için minimum sepet tutarı ${coupon.minOrderAmount.toLocaleString(
              'tr-TR'
            )} TL olmalıdır.`,
            discountAmount: 0,
          };
        }

        // Usage Limit Check
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return {
            valid: false,
            message: 'Bu indirim kodunun maksimum kullanım limitine ulaşılmıştır.',
            discountAmount: 0,
          };
        }

        // Calculate Discount Amount with Min/Max Caps
        let calculatedDiscount = 0;
        if (coupon.type === 'percentage') {
          calculatedDiscount = (subtotal * coupon.value) / 100;
          if (
            coupon.maxDiscountAmount &&
            calculatedDiscount > coupon.maxDiscountAmount
          ) {
            calculatedDiscount = coupon.maxDiscountAmount;
          }
        } else {
          calculatedDiscount = Math.min(coupon.value, subtotal);
        }

        return {
          valid: true,
          message: `${coupon.code} indirimi başarıyla uygulandı!`,
          coupon,
          discountAmount: Math.round(calculatedDiscount),
        };
      },

      recordCouponUsage: (code) => {
        const cleanCode = code.toUpperCase().trim();
        const updated = get().coupons.map((c) =>
          c.code === cleanCode ? { ...c, usedCount: c.usedCount + 1 } : c
        );
        set({ coupons: updated });
      },
    }),
    {
      name: 'ermay_discount_coupons_store',
    }
  )
);
