import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../services/api';
import { isAxiosError } from 'axios';

export interface UserAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
  zipCode: string;
}

export interface SavedCard {
  id: string;
  cardTitle: string;
  cardHolder: string;
  cardNumberMasked: string;
  expiry: string;
  cardType?: 'visa' | 'mastercard' | 'troy' | 'generic';
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  createdAt: string;
  addresses: UserAddress[];
  savedCards?: SavedCard[];
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  // Authentication Actions
  checkAuthSession: () => Promise<void>;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;

  // Profile Update
  updateProfileInfo: (name: string, phone: string) => Promise<{ success: boolean; message: string }>;

  // Database Address Book Actions
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<UserAddress, 'id'>) => Promise<boolean>;
  updateAddress: (id: string, address: Partial<UserAddress>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;

  // Database Saved Cards Actions
  fetchCards: () => Promise<void>;
  addCard: (card: Omit<SavedCard, 'id'> & { cardNumber?: string }) => Promise<boolean>;
  updateCard: (id: string, card: Partial<SavedCard>) => void;
  deleteCard: (id: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAuthLoading: true,

      checkAuthSession: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          set({ user: null, isAuthenticated: false, isAuthLoading: false });
          return;
        }

        try {
          const res = await apiClient.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data?.success && res.data.user) {
            const apiUser = res.data.user;
            const profile: UserProfile = {
              uid: apiUser.id,
              name: apiUser.name,
              email: apiUser.email,
              phone: apiUser.phone || '',
              role: apiUser.role,
              createdAt: new Date(apiUser.createdAt || Date.now()).toLocaleDateString('tr-TR'),
              addresses: apiUser.addresses || [],
              savedCards: apiUser.cards || [],
            };
            set({ user: profile, isAuthenticated: true, isAuthLoading: false });
          } else {
            localStorage.removeItem('auth_token');
            set({ user: null, isAuthenticated: false, isAuthLoading: false });
          }
        } catch {
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false, isAuthLoading: false });
        }
      },

      login: async (email, pass) => {
        if (!email || !pass) {
          return { success: false, message: 'Lütfen e-posta ve şifrenizi giriniz.' };
        }

        try {
          const res = await apiClient.post('/auth/login', {
            email: email.trim().toLowerCase(),
            password: pass.trim(),
          });

          if (res.data?.success && res.data.token) {
            localStorage.setItem('auth_token', res.data.token);
            const apiUser = res.data.user;

            const profile: UserProfile = {
              uid: apiUser.id,
              name: apiUser.name,
              email: apiUser.email,
              phone: apiUser.phone || '',
              role: apiUser.role,
              createdAt: new Date().toLocaleDateString('tr-TR'),
              addresses: apiUser.addresses || [],
              savedCards: apiUser.cards || [],
            };

            set({ user: profile, isAuthenticated: true, isAuthLoading: false });
            return { success: true, message: 'Giriş başarılı.' };
          }
          return { success: false, message: res.data?.message || 'Giriş yapılamadı.' };
        } catch (apiErr: unknown) {
          const msg = isAxiosError(apiErr) ? (apiErr.response?.data as Record<string, string>)?.message : undefined;
          return { success: false, message: msg || 'Giriş işlemi sırasında bir hata oluştu.' };
        }
      },

      register: async (name, email, pass, phone) => {
        if (!name || !email || !pass) {
          return { success: false, message: 'Lütfen tüm zorunlu alanları doldurun.' };
        }
        if (pass.length < 6) {
          return { success: false, message: 'Şifreniz en az 6 karakter olmalıdır.' };
        }

        try {
          const res = await apiClient.post('/auth/register', {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: pass.trim(),
            phone: phone?.trim(),
          });

          if (res.data?.success && res.data.token) {
            localStorage.setItem('auth_token', res.data.token);
            const apiUser = res.data.user;

            const profile: UserProfile = {
              uid: apiUser.id,
              name: apiUser.name,
              email: apiUser.email,
              phone: apiUser.phone || '',
              role: apiUser.role,
              createdAt: new Date().toLocaleDateString('tr-TR'),
              addresses: [],
              savedCards: [],
            };

            set({ user: profile, isAuthenticated: true, isAuthLoading: false });
            return { success: true, message: 'Hesabınız başarıyla oluşturuldu.' };
          }
          return { success: false, message: res.data?.message || 'Kayıt başarısız.' };
        } catch (apiErr: unknown) {
          const msg = isAxiosError(apiErr) ? (apiErr.response?.data as Record<string, string>)?.message : undefined;
          return { success: false, message: msg || 'Kayıt işlemi sırasında bir hata oluştu.' };
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch {
          // Ignore network errors on logout
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_jwt_token');
        set({ user: null, isAuthenticated: false, isAuthLoading: false });
      },

      updateProfileInfo: async (name, phone) => {
        const currentUser = get().user;
        if (!currentUser) return { success: false, message: 'Kullanıcı bulunamadı.' };

        const updated = { ...currentUser, name, phone };
        set({ user: updated });
        return { success: true, message: 'Profiliniz başarıyla güncellendi.' };
      },

      // Database Address Book Sync
      fetchAddresses: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) return;
          const res = await apiClient.get('/auth/addresses', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.success && Array.isArray(res.data.addresses)) {
            const currentUser = get().user;
            if (currentUser) {
              set({ user: { ...currentUser, addresses: res.data.addresses } });
            }
          }
        } catch (err) {
          console.error('Adresler yüklenemedi:', err);
        }
      },

      addAddress: async (addressData) => {
        try {
          const token = localStorage.getItem('auth_token');
          const res = await apiClient.post('/auth/addresses', addressData, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });

          if (res.data?.success && res.data.address) {
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  addresses: [res.data.address, ...currentUser.addresses],
                },
              });
            }
            return true;
          }
        } catch (err) {
          console.error('Adres DB kaydetme hatası:', err);
        }

        // Fallback optimistic
        const newAddress: UserAddress = {
          ...addressData,
          id: `addr-${Date.now()}`,
        };
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              addresses: [newAddress, ...currentUser.addresses],
            },
          });
        }
        return true;
      },

      updateAddress: async (id, addressData) => {
        try {
          const token = localStorage.getItem('auth_token');
          await apiClient.put(`/auth/addresses/${id}`, addressData, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
        } catch (err) {
          console.error('Adres DB güncelleme hatası:', err);
        }

        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              addresses: currentUser.addresses.map((a) => (a.id === id ? { ...a, ...addressData } : a)),
            },
          });
        }
        return true;
      },

      deleteAddress: async (id) => {
        try {
          const token = localStorage.getItem('auth_token');
          await apiClient.delete(`/auth/addresses/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
        } catch (err) {
          console.error('Adres DB silme hatası:', err);
        }

        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              addresses: currentUser.addresses.filter((a) => a.id !== id),
            },
          });
        }
        return true;
      },

      // Database Saved Cards Sync
      fetchCards: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) return;
          const res = await apiClient.get('/auth/cards', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.success && Array.isArray(res.data.cards)) {
            const currentUser = get().user;
            if (currentUser) {
              set({ user: { ...currentUser, savedCards: res.data.cards } });
            }
          }
        } catch (err) {
          console.error('Kartlar yüklenemedi:', err);
        }
      },

      addCard: async (cardData) => {
        try {
          const token = localStorage.getItem('auth_token');
          const res = await apiClient.post('/auth/cards', cardData, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });

          if (res.data?.success && res.data.card) {
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  savedCards: [res.data.card, ...(currentUser.savedCards || [])],
                },
              });
            }
            return true;
          }
        } catch (err) {
          console.error('Kart DB kaydetme hatası:', err);
        }

        // Fallback optimistic
        const newCard: SavedCard = {
          id: `card-${Date.now()}`,
          cardTitle: cardData.cardTitle || 'Kayıtlı Kartım',
          cardHolder: cardData.cardHolder,
          cardNumberMasked: cardData.cardNumberMasked || '•••• •••• •••• ••••',
          expiry: cardData.expiry,
          cardType: cardData.cardType || 'generic',
        };
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              savedCards: [newCard, ...(currentUser.savedCards || [])],
            },
          });
        }
        return true;
      },

      updateCard: (id, cardData) => {
        const currentUser = get().user;
        if (currentUser && currentUser.savedCards) {
          set({
            user: {
              ...currentUser,
              savedCards: currentUser.savedCards.map((c) => (c.id === id ? { ...c, ...cardData } : c)),
            },
          });
        }
      },

      deleteCard: async (id) => {
        try {
          const token = localStorage.getItem('auth_token');
          await apiClient.delete(`/auth/cards/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
        } catch (err) {
          console.error('Kart DB silme hatası:', err);
        }

        const currentUser = get().user;
        if (currentUser && currentUser.savedCards) {
          set({
            user: {
              ...currentUser,
              savedCards: currentUser.savedCards.filter((c) => c.id !== id),
            },
          });
        }
        return true;
      },
    }),
    {
      name: 'ermay_auth_store',
    }
  )
);
