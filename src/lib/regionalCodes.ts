/**
 * Regional Logistics & Plate Codes for Turkey
 * Maps Turkish cities to logistical regions, plate codes, and craftsman delivery commitments.
 */

export interface RegionalLogisticsInfo {
  plateCode: string;
  regionCode: string;
  regionName: string;
  deliveryTime: string;
  assemblyBadge: string;
  esnafCommitment: string;
}

const CITY_REGION_MAP: Record<string, { plate: string; region: string; regionName: string }> = {
  'İstanbul': { plate: '34', region: 'MAR', regionName: 'Marmara' },
  'Ankara': { plate: '06', region: 'ICA', regionName: 'İç Anadolu' },
  'İzmir': { plate: '35', region: 'EGE', regionName: 'Ege' },
  'Kocaeli': { plate: '41', region: 'MAR', regionName: 'Marmara' },
  'Sakarya': { plate: '54', region: 'MAR', regionName: 'Marmara' },
  'Bursa': { plate: '16', region: 'MAR', regionName: 'Marmara' },
  'Tekirdağ': { plate: '59', region: 'MAR', regionName: 'Marmara' },
  'Edirne': { plate: '22', region: 'MAR', regionName: 'Marmara' },
  'Balıkesir': { plate: '10', region: 'MAR', regionName: 'Marmara' },
  'Yalova': { plate: '77', region: 'MAR', regionName: 'Marmara' },
  'Antalya': { plate: '07', region: 'AKD', regionName: 'Akdeniz' },
  'Adana': { plate: '01', region: 'AKD', regionName: 'Akdeniz' },
  'Mersin': { plate: '33', region: 'AKD', regionName: 'Akdeniz' },
  'Konya': { plate: '42', region: 'ICA', regionName: 'İç Anadolu' },
  'Kayseri': { plate: '38', region: 'ICA', regionName: 'İç Anadolu' },
  'Eskişehir': { plate: '26', region: 'ICA', regionName: 'İç Anadolu' },
  'Samsun': { plate: '55', region: 'KRD', regionName: 'Karadeniz' },
  'Trabzon': { plate: '61', region: 'KRD', regionName: 'Karadeniz' },
  'Gaziantep': { plate: '27', region: 'GDO', regionName: 'Güneydoğu Anadolu' },
  'Diyarbakır': { plate: '21', region: 'GDO', regionName: 'Güneydoğu Anadolu' },
  'Şanlıurfa': { plate: '63', region: 'GDO', regionName: 'Güneydoğu Anadolu' },
  'Erzurum': { plate: '25', region: 'DOG', regionName: 'Doğu Anadolu' },
  'Malatya': { plate: '44', region: 'DOG', regionName: 'Doğu Anadolu' },
  'Denizli': { plate: '20', region: 'EGE', regionName: 'Ege' },
  'Manisa': { plate: '45', region: 'EGE', regionName: 'Ege' },
  'Muğla': { plate: '48', region: 'EGE', regionName: 'Ege' },
  'Aydın': { plate: '09', region: 'EGE', regionName: 'Ege' },
};

export function getRegionalLogistics(city?: string): RegionalLogisticsInfo {
  if (!city) {
    return {
      plateCode: '34',
      regionCode: '34-MAR',
      regionName: 'Marmara',
      deliveryTime: '1-3 İş Günü',
      assemblyBadge: 'Kendi Aracımızla Ücretsiz Teslimat & Montaj',
      esnafCommitment: 'Modoko atölyemizden kendi araçlarımızla adrese teslim ve profesyonel usta montajı.',
    };
  }

  const cleanCity = city.trim();
  const found = CITY_REGION_MAP[cleanCity];

  if (found) {
    const isMarmaraLocal = ['İstanbul', 'Kocaeli', 'Sakarya', 'Bursa', 'Yalova'].includes(cleanCity);
    return {
      plateCode: found.plate,
      regionCode: `${found.plate}-${found.region}`,
      regionName: found.regionName,
      deliveryTime: isMarmaraLocal ? '1-3 İş Günü' : '3-5 İş Günü',
      assemblyBadge: isMarmaraLocal
        ? 'Kendi Aracımızla Ücretsiz Teslimat & Montaj'
        : 'Özel Mobilya Nakliyesi & Güvenli Sandık Teslimi',
      esnafCommitment: isMarmaraLocal
        ? 'Atölyemizden kendi araçlarımız ve ustalarımızla kapınıza teslim, sıfır hasar güvencesi.'
        : 'Özel korumalı ahşap sandık paketlemesiyle Türkiye geneli sigortalı mobilya sevkiyatı.',
    };
  }

  // Fallback
  return {
    plateCode: 'TR',
    regionCode: 'TR-ANADOLU',
    regionName: 'Türkiye Geneli',
    deliveryTime: '3-6 İş Günü',
    assemblyBadge: 'Sigortalı Mobilya Sevk & Sandıklı Paket',
    esnafCommitment: 'Tüm Türkiye illerine doğrudan atölye çıkışlı sağlam mobilya lojistiği.',
  };
}
