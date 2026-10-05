/**
 * Kurumsal (Hakkımızda) sayfasının içerik modeli. Sayfadaki her metin buradan gelir ve Admin > Kurumsal sayfa'dan
 * düzenlenir (CMS anahtarı: corporate_config). Kayıtlı blok eksik alan içerebilir; `resolveCorporateConfig`
 * varsayılanlarla birleştirir ve eski şemayı (vision/mission/quality alanları) yeni kart listesine çevirir.
 */

export interface CorporateCard {
  title: string;
  text: string;
}

export interface CorporateConfig {
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImage: string;
  storyTitle: string;
  /** Paragraflar boş satırla ayrılır */
  storyContent?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  /** Boş bırakılırsa rozet gösterilmez */
  experienceYears: string;
  experienceSubtitle: string;
  storyImage: string;
  /** Hikâyenin altındaki kısa güvence maddeleri */
  highlights?: string[];
  /** Değer kartları (vizyon, standart, müşteri memnuniyeti…) */
  cards?: CorporateCard[];
  kvkkBadge?: string;
  kvkkTitle?: string;
  /** KVKK bölümleri: başlık + metin */
  kvkkSections?: { heading: string; text: string }[];
  kvkkEmail?: string;
  // Eski şema (cards alanına çevrilir)
  visionTitle?: string;
  visionText?: string;
  missionTitle?: string;
  missionText?: string;
  qualityTitle?: string;
  qualityText?: string;
}

export const DEFAULT_CORPORATE_CONFIG: CorporateConfig = {
  heroBadge: 'Hakkımızda',
  heroTitle: "Modoko'da üretiyor,",
  heroHighlight: 'ofisinize kadar getiriyoruz.',
  heroSubtitle:
    'Ermay Mobilya, ofis mobilyalarını kendi atölyesinde standart seriler halinde üretir ve aracısız satar. Şirketler de bireysel alıcılar da aynı fabrika fiyatından alır.',
  heroImage: '',
  storyTitle: 'Nasıl üretiyoruz',
  storyContent:
    "Makam takımları, toplantı ve çalışma masaları, bankolar ve ofis koltuklarını standart seriler halinde üretip mağaza ve aracı komisyonu olmadan doğrudan satıyoruz.\n\nÜrünlerimizde 1. sınıf E1 melamin paneller, 2 mm PVC kenar bandı ve elektrostatik boyalı DKP çelik ayaklar kullanıyoruz.",
  experienceYears: '',
  experienceSubtitle: '',
  storyImage: '/default-furniture.webp',
  highlights: [
    'E1 melamin ve çelik profil imalatı',
    '2 yıl imalat garantisi',
    'İstanbul içinde kendi aracımızla teslimat ve montaj',
    'Fabrikadan aracısız satış',
  ],
  cards: [
    {
      title: 'Neyi hedefliyoruz',
      text: 'Ofis kurmak isteyen herkesin, şirket ya da bireysel, dayanıklı mobilyaya fabrika fiyatıyla ve tek muhatapla ulaşması.',
    },
    {
      title: 'Üretim standardımız',
      text: '1. sınıf E1 melamin, 2 mm darbe koruyucu PVC kenar bandı ve elektrostatik boyalı çelik konstrüksiyon.',
    },
    {
      title: 'Müşteri memnuniyeti',
      text: 'Uzaktan satışlarda 14 gün yasal cayma hakkı, 2 yıl imalat garantisi ve kendi ekibimizle teslimat.',
    },
  ],
  kvkkBadge: '6698 sayılı Kanun kapsamında',
  kvkkTitle: 'Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni',
  kvkkEmail: 'info@ermaymobilya.com',
  kvkkSections: [
    {
      heading: 'Veri sorumlusu',
      text: 'Ermay Mobilya San. ve Tic. Ltd. Şti. olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca müşterilerimizin ve web sitemizi ziyaret eden kullanıcılarımızın kişisel verilerinin gizliliğine ve güvenliğine önem veriyoruz.',
    },
    {
      heading: 'İşlenen kişisel veriler',
      text: 'Sitemiz üzerinden sipariş talebi oluşturduğunuzda yalnızca talebinizin teyidi, teslimatın planlanması ve mağaza randevunuzun koordinasyonu için gereken asgari veriler (ad-soyad, telefon, il/ilçe ve varsa notunuz) işlenir. Sitemizde üyelik, kredi kartı veya banka kartı bilgisi toplanmaz.',
    },
    {
      heading: 'İşleme amacı ve hukuki sebep',
      text: 'Kişisel verileriniz KVKK 5. maddedeki "bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması" ve "veri sorumlusunun meşru menfaati" hukuki sebeplerine dayanarak; talep ettiğiniz ürünlerin imalatı, sevki ve müşteri hizmetleri için işlenir.',
    },
    {
      heading: 'Kişisel verilerin aktarımı',
      text: 'Kişisel verileriniz üçüncü kişilere satılmaz. Yalnızca siparişinizin sevkiyatı ve montajı için zorunlu iş ortaklarımızla ve kanunen yetkili kamu kurumlarıyla paylaşılır.',
    },
    {
      heading: 'Haklarınız',
      text: 'KVKK 11. madde uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, amaca uygun kullanılıp kullanılmadığını sorgulama, düzeltilmesini veya silinmesini isteme haklarına sahipsiniz.',
    },
  ],
};

/** Kayıtlı içeriği varsayılanlarla birleştirir; eski vision/mission/quality alanlarını kart listesine çevirir. */
export function resolveCorporateConfig(stored?: Partial<CorporateConfig> | null): CorporateConfig {
  const merged: CorporateConfig = { ...DEFAULT_CORPORATE_CONFIG, ...(stored || {}) };
  if (!stored?.cards) {
    const legacy: CorporateCard[] = [
      [stored?.visionTitle, stored?.visionText],
      [stored?.missionTitle, stored?.missionText],
      [stored?.qualityTitle, stored?.qualityText],
    ]
      .filter(([t, x]) => t && x)
      .map(([t, x]) => ({ title: String(t), text: String(x) }));
    if (legacy.length) merged.cards = legacy;
  }
  if (!merged.storyContent) {
    merged.storyContent = [stored?.storyParagraph1, stored?.storyParagraph2].filter(Boolean).join('\n\n');
  }
  return merged;
}
