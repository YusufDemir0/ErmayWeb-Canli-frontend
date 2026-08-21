import type { Product, Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'Tüm Koleksiyon',
    slug: 'all',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Tüm Koleksiyon</text></svg>'
  },
  {
    id: 'living-room',
    name: 'Oturma Odası',
    slug: 'oturma-odasi',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Oturma Odası</text></svg>'
  },
  {
    id: 'bedroom',
    name: 'Yatak Odası',
    slug: 'yatak-odasi',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23475569"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Yatak Odası</text></svg>'
  },
  {
    id: 'dining',
    name: 'Yemek Odası',
    slug: 'yemek-odasi',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Yemek Odası</text></svg>'
  },
  {
    id: 'accessories',
    name: 'Aksesuar',
    slug: 'aksesuar',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="16">Aksesuar</text></svg>'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Milano Köşe Koltuk Takımı',
    category: 'living-room',
    price: 24500,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: 'Yeni',
    description: 'Minimalist hatları ve yüksek konforlu yapısıyla salonunuza İtalyan şıklığı getirin. Leke tutmayan keten dokulu ithal kumaş ve masif fırınlanmış gürgen iskelet yapısına sahiptir.',
    rating: 4.9,
    reviewsCount: 42,
    features: [
      'Leke tutmaz ve kolay temizlenebilir premium şönil kumaş',
      '35 HR yüksek dansiteli oturum süngeri ile ekstra konfor',
      'Fırınlanmış gürgen ağacından dayanıklı ahşap iskelet',
      'Modüler tasarım ile yönü değiştirilebilir köşe modülü'
    ],
    dimensions: 'Genişlik: 280 cm | Derinlik: 190 cm | Yükseklik: 82 cm',
    material: 'Masif Gürgen, İthal Keten Dokulu Kumaş',
    setContents: '3\'lü Ana Modül + 2\'li Uzatma Modülü + 1 Dinlenme Köşesi + 4 Adet Kırlent',
    inStock: true,
    salesCount: 142
  },
  {
    id: 'p2',
    name: 'Verona Ceviz Yemek Odası Takımı',
    category: 'dining',
    price: 12000,
    originalPrice: 14500,
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: '%17 İndirim',
    description: 'Doğal ceviz kaplamanın eşsiz dokusu, modern metal ayaklar ile buluşuyor. 6-8 kişilik genişleme kapasitesi ve mat ipeksi cila korumasıyla yemek odanızın yıldızı olmaya aday.',
    rating: 4.8,
    reviewsCount: 28,
    features: [
      'A kalite doğal cefiz ağacı kaplama üst tabla',
      'Elektrostatik toz boyalı mat siyah metal ayaklar',
      'Isıya ve çizilmeye karşı dayanıklı koruyucu mat cila',
      '6 ile 8 kişilik kullanım için ideal genişlik'
    ],
    dimensions: 'Genişlik: 200 cm | Derinlik: 95 cm | Yükseklik: 75 cm',
    material: 'Doğal Ceviz Kaplama, Çelik Konstrüksiyon',
    setContents: '1 Adet Açılır Yemek Masası (200x95 cm) + 6 Adet Sandalye + 1 Adet Konsol',
    inStock: true,
    salesCount: 98
  },
  {
    id: 'p3',
    name: 'Luna Lüks Yatak Odası Seti',
    category: 'bedroom',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: 'Popüler',
    description: 'Huzurlu bir uyku alanı için tasarlanan Luna Yatak Odası Takımı, bazalı karyola, iki adet komodin ve 6 kapaklı aynalı dolabı içermektedir. Dokunmatik LED aydınlatma detaylarıyla premium konfor sunar.',
    rating: 5.0,
    reviewsCount: 19,
    features: [
      'Kapsamlı set: Karyola (160x200), 2 Komodin, 6 Kapaklı Giyinme Dolabı',
      'Geniş hacimli, amortisörlü çelik kasa bazalı karyola',
      'Dolap içi akıllı sensörlü LED aydınlatmalar',
      'Frenli menteşe ve ray sistemleri ile sessiz kullanım'
    ],
    dimensions: 'Dolap: 260x220x65 cm | Karyola: 175x215x120 cm | Komodin: 60x45x42 cm',
    material: 'Lamine MDF, Döşemelik Keten Başlık, Füme Ayna kapaklar',
    setContents: '1 Adet Bazalı Karyola + 1 Adet 6 Kapaklı Dolap + 2 Adet Komodin + 1 Adet Şifonyer',
    inStock: true,
    salesCount: 65
  },
  {
    id: 'p4',
    name: 'Skandinav TV Ünitesi',
    category: 'living-room',
    price: 4200,
    originalPrice: 4900,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: '%15 İndirim',
    description: 'Sade çizgiler, yüksek işlevsellik. İskandinav meşe dokusu ve mat beyaz kapak geçişleriyle salonunuzda ferah ve düzenli bir görünüm sağlar. Kablo geçiş kanalları mevcuttur.',
    rating: 4.7,
    reviewsCount: 31,
    features: [
      'Doğal meşe rengi ve mat beyaz lake kombinasyonu',
      'Kablo kirliliğini önleyen gizli arka kablo kanalları',
      'Yavaşlatıcılı bas-aç kapak mekanizması',
      'Robot süpürge geçişine uygun yüksek ahşap ayaklar'
    ],
    dimensions: 'Genişlik: 180 cm | Derinlik: 40 cm | Yükseklik: 52 cm',
    material: '1. Sınıf Suntalam, Masif Ahşap Ayaklar',
    inStock: true,
    salesCount: 120
  },
  {
    id: 'p5',
    name: 'Toscana Deri Tekli Koltuk',
    category: 'living-room',
    price: 8900,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: 'Özel Tasarım',
    description: 'Hakiki İtalyan derisinin eskitme dokusu, masif meşe çerçeve ile mükemmel bir denge oluşturuyor. Çalışma odanızda veya salonunuzda okuma köşelerinin vazgeçilmezi.',
    rating: 4.9,
    reviewsCount: 15,
    features: [
      'El işçiliği ile eskitilmiş %100 hakiki dana derisi döşeme',
      'Yüksek dayanımlı ve fırınlanmış masif meşe iskelet',
      'Ergonomik sırt ve oturum eğimiyle benzersiz konfor',
      'Zamanla karakter kazanan doğal deri patinası'
    ],
    dimensions: 'Genişlik: 78 cm | Derinlik: 85 cm | Yükseklik: 90 cm',
    material: 'Hakiki İtalyan Derisi, Masif Meşe',
    inStock: true,
    salesCount: 54
  },
  {
    id: 'p6',
    name: 'Oniks Mermer Orta Sehpa',
    category: 'living-room',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: 'Tükendi',
    description: 'Her biri kendine özgü damar yapısına sahip doğal Oniks mermer tabla, fırçalanmış pirinç ayaklar üzerinde yükseliyor. Evinize organik bir lüks dokunuş getirin.',
    rating: 4.6,
    reviewsCount: 12,
    features: [
      '2 cm kalınlığında cilalanmış doğal Oniks mermer üst tabla',
      'Fırçalanmış titanyum pirinç kaplama paslanmaz çelik ayaklar',
      'Mermer koruyucu özel nano-kaplama (asit lekelerine karşı direnç)',
      'Her masanın damar desenleri benzersiz ve eşsizdir'
    ],
    dimensions: 'Çap: 90 cm | Yükseklik: 42 cm',
    material: 'Doğal Oniks Mermer, Pirinç Kaplama Çelik',
    inStock: false,
    salesCount: 30
  },
  {
    id: 'p7',
    name: 'Minimalist Sarkıt Avize',
    category: 'accessories',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: 'Yeni',
    description: 'Yemek masanızın veya mutfak adanızın üzerinde sıcak ve davetkar bir atmosfer yaratın. Fırçalanmış şampanya altın rengi metal gövde ve üfleme opal cam küre.',
    rating: 4.8,
    reviewsCount: 22,
    features: [
      'Üfleme mat opal cam küre (ışığı homojen ve göz yormadan dağıtır)',
      'Fırçalanmış şampanya sarısı elektrostatik metal detaylar',
      'Yüksekliği ayarlanabilir çelik sarkıt tel ve şeffaf kablo',
      'E27 duy yapısına sahip LED ampul uyumluluğu'
    ],
    dimensions: 'Gövde Çapı: 35 cm | Maksimum Kablo Boyu: 120 cm',
    material: 'Alüminyum, Opal Cam',
    inStock: true,
    salesCount: 88
  },
  {
    id: 'p8',
    name: 'Traverten Taş Vazo',
    category: 'accessories',
    price: 950,
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: 'El Yapımı',
    description: 'Denizli traverten bloklarından oyularak tamamen el işçiliği ile üretilmiştir. Pürüzlü doğal gözenekli yapısı ile wabi-sabi felsefesini ev dekorasyonunuza yansıtır.',
    rating: 4.9,
    reviewsCount: 35,
    features: [
      'Denizli yöresine ait doğal bej traverten taşı',
      'Oyma ve pürüzsüzleştirme işlemleri tamamen el işçiliğidir',
      'Gövdede doğal taş gözenekleri ve ton geçişleri korunmuştur',
      'Kuru ve taze çiçek sunumları için su sızdırmaz iç kaplama'
    ],
    dimensions: 'Çap: 14 cm | Yükseklik: 25 cm',
    material: 'Doğal Gözenekli Traverten Taşı',
    inStock: true,
    salesCount: 180
  },
  {
    id: 'p9',
    name: 'Marsilya Kadife Berjer',
    category: 'living-room',
    price: 5600,
    originalPrice: 6800,
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: '%17 İndirim',
    description: 'İthal kadife kaplamalı, derin oturum alanına sahip döner berjer koltuk. Yumuşak sırt desteği ve şık pirinç çember ayak detayıyla salonunuza estetik bir dokunuş katar.',
    rating: 4.8,
    reviewsCount: 14,
    features: [
      '360 derece dönebilen gizli metal alt mekanizma',
      'Silinebilir, parlak ve yumuşak dokulu ithal kadife kumaş',
      'HR yüksek esneklik dereceli blok dolgu süngeri',
      'Fırçalanmış altın renkli pirinç alt çember şeridi'
    ],
    dimensions: 'Genişlik: 85 cm | Derinlik: 80 cm | Yükseklik: 86 cm',
    material: 'İthal Kadife, Çelik Döner Mekanizma, Pirinç',
    inStock: true,
    salesCount: 75
  },
  {
    id: 'p10',
    name: 'Palermo Meşe Konsol',
    category: 'dining',
    price: 9200,
    originalPrice: 11000,
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: '%16 İndirim',
    description: 'Geniş iç depolama hacmi ve hazeran detaylı kapak tasarımı ile modern-bohem çizgisini yansıtır. Yemek takımlarınız için şık ve işlevsel bir yerleşim sunar.',
    rating: 4.7,
    reviewsCount: 20,
    features: [
      'El yapımı doğal hazeran (hasır örgü) kapak yüzeyleri',
      'Meşe kaplamalı dayanıklı MDF gövde yapısı',
      '4 kapaklı iç bölme ve yüksekliği ayarlanabilir raflar',
      'Yavaş kapanan ithal frenli menteşe donanımları'
    ],
    dimensions: 'Genişlik: 190 cm | Derinlik: 45 cm | Yükseklik: 78 cm',
    material: 'Doğal Meşe Kaplama, Doğal Hasır Hazeran',
    inStock: true,
    salesCount: 42
  },
  {
    id: 'p11',
    name: 'Venedik Ahşap Karyola',
    category: 'bedroom',
    price: 18500,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: 'Tükendi',
    description: 'Doğal ahşap dokusunun ön planda olduğu, yüzer hissi veren gizli ayaklı karyola tasarımı. Keten kaplamalı yumuşak başlığı ve sağlam ahşap latalı taşıyıcı sistemi ile kaliteli uyku sunar.',
    rating: 4.9,
    reviewsCount: 9,
    features: [
      'Masif meşe çerçeve ve doğal dokulu keten başlık modülü',
      'Sağlam çelik profil takviyeli iç omurga yapısı',
      'Ortopedik yatak yerleşimine uygun ahşap latalar',
      'Yüzer hissi veren estetik iç köşe gizli ayaklar'
    ],
    dimensions: 'Genişlik: 172 cm | Uzunluk: 212 cm | Başlık Yükseklik: 110 cm',
    material: 'Masif Meşe, İthal Dokuma Keten Kumaş',
    inStock: false,
    salesCount: 20
  },
  {
    id: 'p12',
    name: 'Prado Ceviz Çalışma Masası',
    category: 'bedroom',
    price: 3800,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: '%15 İndirim',
    description: 'Evden çalışma alanlarınız için kompakt, işlevsel ve asil bir masa. Masif ayaklar ve 2 çekmeceli ceviz gövdesiyle bilgisayar ve not defterleriniz için ideal çalışma alanını oluşturur.',
    rating: 4.7,
    reviewsCount: 25,
    features: [
      'İki adet teleskopik raylı kırtasiye çekmecesi',
      'Klavye ve evrak kullanımına uygun pürüzsüz mat cila tabla',
      'Gizli kablo toparlayıcı masa altı bölmesi',
      'Konikleştirilmiş retro masif gürgen ayaklar'
    ],
    dimensions: 'Genişlik: 120 cm | Derinlik: 60 cm | Yükseklik: 76 cm',
    material: 'Ceviz Ağacı Kaplama, Masif Gürgen Ayaklar',
    inStock: true,
    salesCount: 110
  },
  {
    id: 'p13',
    name: 'Aura Masif Lambader',
    category: 'accessories',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: 'Yeni',
    description: 'Tripod yapıda masif ahşap ayakları ve keten abajur şapkasıyla oturma odanıza loş ve sıcak bir aydınlatma konforu sunar. Ayak aralarında dekoratif raf mevcuttur.',
    rating: 4.6,
    reviewsCount: 18,
    features: [
      'Doğal meşe ağacından üretilmiş üç ayaklı tripod gövde',
      'Özel dokulu kırık beyaz keten kumaş abajur başlığı',
      'Kitap ve dekor sergilemeye uygun masif alt ara raf',
      'Ayak pedallı pratik açma-kapama kablo anahtarı'
    ],
    dimensions: 'Çap: 45 cm | Yükseklik: 160 cm',
    material: 'Masif Meşe, Dokuma Keten Abajur',
    inStock: true,
    salesCount: 95
  },
  {
    id: 'p14',
    name: 'Zen Hasır Sepet Seti',
    category: 'accessories',
    price: 850,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=1200'
    ],
    badge: '%30 İndirim',
    description: '3 farklı boyuttan oluşan doğal jüt hasır sepet seti. Battaniyelerinizi, çocuk oyuncaklarını veya saksılarınızı organize etmek için dekoratif ve pratik bir depolama.',
    rating: 4.8,
    reviewsCount: 52,
    features: [
      'Set içeriği: 1 adet Büyük, 1 adet Orta, 1 adet Küçük boy sepet',
      '%100 doğal el örgüsü jüt ve deniz sazı ipleri',
      'Kolay taşıma için sağlam deri kulplar ile donatılmıştır',
      'Kullanılmadığında iç içe geçebilen pratik yuvalama tasarımı'
    ],
    dimensions: 'Büyük: 38x38 cm | Orta: 32x32 cm | Küçük: 26x26 cm',
    material: 'Doğal Jüt, Deniz Sazı Hasırı, Hakiki Deri Saplar',
    inStock: true,
    salesCount: 210
  }
];
