import { z } from 'zod';

/**
 * T.C. Kimlik Numarası Doğrulama Algoritması
 */
export function isValidTCKN(tckn: string): boolean {
  if (!/^[1-9]\d{10}$/.test(tckn)) return false;

  const digits = tckn.split('').map(Number);
  
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  
  const digit10 = ((sumOdd * 7 - sumEven) % 10 + 10) % 10;
  if (digit10 !== digits[9]) return false;
  
  const sumFirst10 = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  const digit11 = sumFirst10 % 10;
  
  return digit11 === digits[10];
}

/**
 * Temel Karakter ve Tip Doğrulama Kuralları
 */

// Ad / Soyad: Sadece Türkçe/Latin harfleri ve boşluk. SAYI VE ÖZEL SEMBOL KESİNLİKLE GİRİLEMEZ.
export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Ad Soyad en az 2 karakter olmalıdır.')
  .max(50, 'Ad Soyad en fazla 50 karakter olabilir.')
  .regex(
    /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
    'Ad Soyad alanında rakam veya özel karakter kullanılamaz. Sadece harf giriniz.'
  );

// E-Posta: Standart geçerli e-posta adresi
export const emailSchema = z
  .string()
  .trim()
  .email('Lütfen geçerli bir e-posta adresi giriniz.')
  .toLowerCase();

// Telefon: Türkiye GSM Numarası veya Uluslararası format
export const phoneSchema = z
  .string()
  .trim()
  .refine((val) => {
    const digitsOnly = val.replace(/\D/g, '');
    // Standard validation: at least 8 digits, up to 15 digits (E.164 standard)
    if (digitsOnly.length < 8 || digitsOnly.length > 15) return false;
    // If it is a 10-digit Turkish number, allow 5XX or standard format
    return true;
  }, {
    message: 'Lütfen geçerli bir telefon numarası giriniz (en az 8, en fazla 15 hane).',
  });

// Şifre: En az 6 karakter
export const passwordSchema = z
  .string()
  .min(6, 'Şifre en az 6 karakter olmalıdır.');

// T.C. Kimlik No Şeması (Opsiyonel / Bireysel Fatura)
export const tcKnSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || val === '' || isValidTCKN(val), {
    message: 'Geçersiz T.C. Kimlik Numarası. Lütfen 11 haneli TCKN bilginizi kontrol ediniz.',
  });

// Vergi Kimlik No Şeması (10 Haneli)
export const taxNoSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, 'Vergi Kimlik No tam 10 haneli rakamlardan oluşmalıdır.');

// Vergi Dairesi Şeması (Sadece Harf)
export const taxOfficeSchema = z
  .string()
  .trim()
  .min(2, 'Vergi Dairesi adı en az 2 karakter olmalıdır.')
  .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Vergi Dairesi alanında sayı girilemez.');

/**
 * Form Özel Şemaları
 */

// Kayıt Formu Şeması
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

// Adres Ekleme / Düzenleme Şeması
export const addressSchema = z.object({
  title: z.string().min(2, 'Adres başlığı en az 2 karakter olmalıdır.'),
  fullName: nameSchema,
  phone: phoneSchema,
  city: z.string().min(2, 'İl seçimi zorunludur.'),
  district: z.string().min(2, 'İlçe seçimi zorunludur.'),
  addressLine: z.string().min(10, 'Adres detayı en az 10 karakter olmalıdır.'),
  zipCode: z.string().regex(/^\d{5}$/, 'Posta kodu 5 haneli rakam olmalıdır.'),
});

// Fatura ve Teslimat Seçenekli Checkout Adres Şeması
export const checkoutInvoiceAddressSchema = z.discriminatedUnion('invoiceType', [
  // Bireysel Fatura
  z.object({
    invoiceType: z.literal('INDIVIDUAL'),
    fullName: nameSchema,
    tcKn: tcKnSchema,
    addressLine: z.string().min(10, 'Adres detayı en az 10 karakter olmalıdır.'),
    city: z.string().min(2, 'Lütfen il seçiniz.'),
    district: z.string().min(2, 'Lütfen ilçe seçiniz.'),
  }),
  // Kurumsal Fatura
  z.object({
    invoiceType: z.literal('CORPORATE'),
    companyTitle: z.string().min(3, 'Şirket resmi unvanı en az 3 karakter olmalıdır.'),
    taxNo: taxNoSchema,
    taxOffice: taxOfficeSchema,
    addressLine: z.string().min(10, 'Adres detayı en az 10 karakter olmalıdır.'),
    city: z.string().min(2, 'Lütfen il seçiniz.'),
    district: z.string().min(2, 'Lütfen ilçe seçiniz.'),
  }),
]);

// Kredi Kartı Giriş Şeması
export const creditCardSchema = z.object({
  cardHolder: nameSchema,
  cardNumber: z
    .string()
    .transform((val) => val.replace(/\s+/g, ''))
    .refine((val) => /^\d{16}$/.test(val), {
      message: 'Kart numarası tam 16 haneli rakam olmalıdır.',
    }),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Son kullanma tarihi AA/YY formatında olmalıdır (Örn: 08/28).'),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'CVV kodu 3 veya 4 haneli rakam olmalıdır.'),
});

// İletişim Formu Şeması
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(2, 'Konu başlığı en az 2 karakter olmalıdır.').optional().default('Genel İletişim'),
  message: z.string().min(10, 'Mesajınız en az 10 karakter olmalıdır.'),
});
