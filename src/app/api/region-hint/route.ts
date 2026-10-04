import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TURKEY_PROVINCES } from '../../../data/turkeyProvinces';

export const dynamic = 'force-dynamic';

/**
 * Ziyaretçinin ilini/bölgesini, önündeki CDN veya ters proxy'nin eklediği konum başlıklarından okur.
 * Üçüncü taraf IP servisine istek atılmaz ve IP saklanmaz (KVKK). Başlık yoksa { region: null } döner;
 * istemci bu durumda en çok mağazası olan bölgeyi açar.
 *
 * Desteklenen başlıklar (ISO 3166-2 alt bölüm kodu, Türkiye'de plaka numarası: "34" / "TR-34"):
 * - Cloudflare "Add visitor location headers": cf-ipcountry + cf-region-code
 * - Vercel: x-vercel-ip-country + x-vercel-ip-country-region
 * - nginx GeoIP2 vb. için özel: x-geo-country + x-geo-region-code
 */
export function GET(request: NextRequest) {
  const h = request.headers;
  const country = (h.get('cf-ipcountry') || h.get('x-vercel-ip-country') || h.get('x-geo-country') || '').toUpperCase();
  const rawRegion = h.get('cf-region-code') || h.get('x-vercel-ip-country-region') || h.get('x-geo-region-code') || '';

  if (country && country !== 'TR') {
    return NextResponse.json({ region: null, city: null }, { headers: { 'Cache-Control': 'private, no-store' } });
  }

  const plate = parseInt(rawRegion.replace(/^TR-?/i, ''), 10);
  const province = Number.isInteger(plate) ? TURKEY_PROVINCES.find((p) => p.plate === plate) : undefined;

  return NextResponse.json(
    { region: province?.region ?? null, city: province?.name ?? null },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
