# ErmayWeb - Proje Mimarisi ve Güncel Yapı Dokümantasyonu

**ErmayWeb**, lüks ve modern mobilya/dekorasyon e-ticaret platformudur. React 19, TypeScript, Vite ve Tailwind CSS (v4) teknolojileriyle tasarlanmış olup yüksek performanslı SPA (Single Page Application) yapısına sahiptir.

---

## 📁 Dosya ve Dizin Yapısı

```
ErmayWeb/
├── public/                 # Statik varlıklar (favicon, ikonlar vb.)
├── src/
│   ├── assets/             # Görseller ve medya dosyaları
│   ├── components/         # Modüler UI bileşenleri
│   │   ├── AnnouncementBar.tsx # Üst kargo/duyuru bandı
│   │   ├── Navbar.tsx          # Gezinti çubuğu, arama ve sepet/favori sayaçları
│   │   ├── Hero.tsx            # Ana sayfa slayt gösterisi ve CTA alanı
│   │   ├── CategoryList.tsx    # Hızlı kategori filtreleme yuvarlak slider'ı
│   │   ├── ProductCard.tsx     # Ürün kartı bileşeni (rozet, fiyat, favori, hızlı bakış)
│   │   ├── ProductQuickView.tsx# Hızlı ürün inceleme modalı
│   │   ├── CartDrawer.tsx      # Sağdan açılan hızlı sepet çekmecesi
│   │   ├── FavoritesDrawer.tsx # Sağdan açılan favoriler çekmecesi
│   │   ├── CategoryPage.tsx    # Kategori detay ve filtreleme sayfası (grid/liste modu)
│   │   ├── SalePage.tsx        # İndirimler ve Kampanyalar özel sayfası
│   │   ├── CartPage.tsx        # Detaylı tam sayfa alışveriş sepeti ve sipariş adımları
│   │   ├── FavoritesPage.tsx   # Tam sayfa favorilerim ekranı
│   │   └── Footer.tsx          # Alt bilgi, bülten aboneliği, ödeme yöntemleri ve iletişim
│   ├── data/
│   │   └── mockData.ts     # Kategori ve Ürün mock verileri (14+ detaylı ürün ve kategoriler)
│   ├── types/
│   │   └── index.ts        # TypeScript tip tanımlamaları (Product, Category, CartItem vb.)
│   ├── App.tsx             # Ana uygulama bileşeni, SPA yönlendirme ve global durum yönetimi
│   ├── index.css           # Tasarım sistemi, Tailwind theme tanımları ve custom animasyonlar
│   └── main.tsx            # React uygulama giriş noktası
├── eslint.config.js        # ESLint yapılandırması
├── index.html              # HTML şablonu
├── package.json            # Bağımlılıklar ve npm komutları
├── tsconfig.json           # TypeScript ana konfigürasyonu
├── tsconfig.app.json       # Uygulama TypeScript ayarları
├── tsconfig.node.json      # Node ortamı TypeScript ayarları
└── vite.config.ts          # Vite geliştirme ve derleme konfigürasyonu
```

---

## 🛠️ Teknolojik Altyapı ve Bağımlılıklar

- **React (v19.2)**: Bileşen tabanlı kullanıcı arayüzü ve modern hooks yapısı.
- **TypeScript (v6.0)**: Tip güvenliği, gelişmiş IDE desteği ve veri modelleri.
- **Vite (v8.1)**: Hızlı HMR (Hot Module Replacement) ve optimize edilmiş derleme süreci.
- **Tailwind CSS (v4.3)**: `@theme` direktifi ile özelleştirilmiş camel, terracotta, taupe renk paletleri ve modern tasarım sistemi.
- **Lucide React (v1.25)**: Modern ve minimalist ikon seti.

---

## 🔄 Yönlendirme ve Durum Yönetimi (State Management)

### 1. SPA Yönlendirme (Client-Side Routing)
Uygulama, `window.history.pushState` ve `popstate` dinleyicileriyle çalışan hafif ve bağımsız bir SPA router yapısı kullanır (`App.tsx`):
- `/` veya `/index.html`: **Ana Sayfa** (Hero Slideshow, Kategori Slider'ı, Seçkin Ürünler Grid'i).
- `/kategori/:slug`: **Kategori Koleksiyon Sayfası** (Sol filtreleme paneli, ızgara/liste görünümü, sıralama).
- `/indirimler`: **İndirimler & Kampanyalar Sayfası** (Fırsat ürünleri, geri sayım banner'ı).
- `/sepet`: **Tam Sayfa Alışveriş Sepeti** (Kupon girişi, kargo hesaplayıcı, sipariş özeti).
- `/favoriler`: **Tam Sayfa Favorilerim** (İstek listesindeki ürünleri yönetme ve sepete aktarma).

### 2. Global State (App.tsx)
- `cartItems`: Alışveriş sepetindeki ürünler ve adetleri.
- `favorites`: Favorilere eklenen ürünler listesi.
- `searchQuery` & `searchCategory`: Arama çubuğundaki kelime ve seçili kategori kapsamı.
- `isCartOpen` & `isFavoritesOpen`: Sağdan kayan çekmece (drawer) görünürlük durumları.
- `selectedProduct`: Hızlı inceleme (Quick View) modalında görüntülenen ürün.

---

## 🎨 Tasarım Sistemi ve Temalama (`index.css`)

Özel renk paleti markanın premium ve doğal mobilya konseptini yansıtır:
- **Brand Camel**: `#C5A880` / `#B4966E` (Ana marka rengi)
- **Terracotta**: `#C87A53` (Vurgu rengi)
- **Taupe**: `#8D7B68` (Doğal toprak tonları)
- **Brand Dark**: `#171717` (Derin kiremit/siyah metinler ve arka planlar)
- **Tipografi**: Inter font ailesi.
- **Mikro Etkileşimler**: Smooth scrollbar, fade-in animasyonları, görsel hover zoom efektleri.

---

## 🧩 Temel Bileşenler ve İşlevleri

1. **`Navbar.tsx`**: Dinamik arama çubuğu, kategori seçici dropdown'ı, favori ve sepet sayaç rozetleri, mobil menü desteği.
2. **`Hero.tsx`**: Görsel slaytlar, dinamik CTA bağlantıları.
3. **`CategoryList.tsx`**: Ana sayfadaki dairesel kategori ikonları; tıklamada sayfayı kataloğa kaydırıp filtre uygular.
4. **`ProductCard.tsx`**: Rozetler (İndirim, Yeni, Popüler), favori ekleme/çıkarma, sepete ekleme ve hızlı bakış tetikleyicisi.
5. **`ProductQuickView.tsx`**: Ürün görselleri arasında geçiş, miktar seçimi, detaylı malzeme ve boyut bilgileri.
6. **`CategoryPage.tsx`**: Fiyat aralığı, stok durumu, malzeme filtresi ve grid/list anahtarlama.
7. **`SalePage.tsx`**: İndirim oranları (%15, %17, %30 vb.) ve kampanyalı ürün filtresi.
8. **`CartPage.tsx` & `CartDrawer.tsx`**: Sepetteki ürün adetlerini artırma/azaltma, silme, ücretsiz kargo ilerleme çubuğu.
9. **`FavoritesPage.tsx` & `FavoritesDrawer.tsx`**: Beğenilen ürünleri hızlıca inceleme ve sepete ekleme.
10. **`Footer.tsx`**: Güvenli ödeme ikonları, e-bülten kaydı, hızlı bağlantılar ve iletişim.

---

## 🚀 Çalıştırma ve Geliştirme Komutları

- `npm run dev`: Yerel geliştirme sunucusunu başlatır (`http://localhost:5173`).
- `npm run build`: TypeScript kontrolü yapar ve prodüksiyon çıktısını `dist/` klasörüne derler.
- `npm run lint`: ESLint kod kalitesi kontrolünü çalıştırır.
- `npm run preview`: Prodüksiyon derlemesini yerelde önizler.
