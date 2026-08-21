'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Check, Search, Compass, Loader2 } from 'lucide-react';
import apiClient from '../services/api';

interface LocationAddress {
  city: string;
  district: string;
  addressLine: string;
  lat: number;
  lng: number;
}

interface AddressMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelectAddress: (address: LocationAddress) => void;
}

const TURKEY_LOCATIONS = [
  { city: 'İstanbul', district: 'Ümraniye', name: 'Modoko Mobilyacılar Sitesi', lat: 41.0122, lng: 29.1411, addressLine: 'Modoko Mobilyacılar Sitesi No: 42, Ümraniye / İstanbul' },
  { city: 'İstanbul', district: 'Kadıköy', name: 'Bağdat Caddesi', lat: 40.9723, lng: 29.0528, addressLine: 'Bağdat Caddesi No: 184, Kadıköy / İstanbul' },
  { city: 'Kocaeli', district: 'İzmit', name: 'İzmit Merkez Showroom', lat: 40.7654, lng: 29.9408, addressLine: 'Kadıköy Bağdat Cd. No: 141, 41050 İzmit / Kocaeli' },
  { city: 'Sakarya', district: 'Serdivan', name: 'Serdivan AVM Bölgesi', lat: 40.7712, lng: 30.3645, addressLine: 'İstiklal Cd. No: 88, Serdivan / Sakarya' },
  { city: 'Ankara', district: 'Çankaya', name: 'Tunalı Hilmi Cd.', lat: 39.9085, lng: 32.8611, addressLine: 'Tunalı Hilmi Cd. No: 52, Çankaya / Ankara' },
  { city: 'İzmir', district: 'Alsancak', name: 'Atatürk Caddesi', lat: 38.4352, lng: 27.1384, addressLine: 'Atatürk Cd. Kordon No: 90, Alsancak / İzmir' },
];

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({
  initialLat = 40.7654,
  initialLng = 29.9408,
  onSelectAddress,
}) => {
  const [selectedLoc, setSelectedLoc] = useState<LocationAddress>({
    city: 'Kocaeli',
    district: 'İzmit',
    addressLine: 'Kadıköy Bağdat Cd. No: 141, 41050 İzmit / Kocaeli',
    lat: initialLat,
    lng: initialLng,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [customAddress, setCustomAddress] = useState(selectedLoc.addressLine);
  const [isApplied, setIsApplied] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Dynamic Browser HTML5 GPS Geolocation Location Picker via Backend Proxy
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Reverse geocoding via Backend Proxy API
          const res = await apiClient.get('/geo/reverse', { params: { lat, lng } });
          const data = res.data?.data || {};
          const addr = data.address || {};
          const city = addr.province || addr.city || addr.state || 'İstanbul';
          const district = addr.town || addr.suburb || addr.district || 'Merkez';
          const addressLine = data.display_name || `${district}, ${city}`;

          const updated = { city, district, addressLine, lat, lng };
          setSelectedLoc(updated);
          setCustomAddress(addressLine);
          onSelectAddress(updated);
          setIsApplied(true);
          setTimeout(() => setIsApplied(false), 2000);
        } catch (e) {
          const updated = { city: 'Teslimat Şehri', district: 'Teslimat İlçesi', addressLine: `Enlem: ${lat.toFixed(4)}, Boylam: ${lng.toFixed(4)}`, lat, lng };
          setSelectedLoc(updated);
          onSelectAddress(updated);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        alert('Konum izni alınamadı. Lütfen listeden bir konum seçiniz.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (loc: typeof TURKEY_LOCATIONS[0]) => {
    const updated = {
      city: loc.city,
      district: loc.district,
      addressLine: loc.addressLine,
      lat: loc.lat,
      lng: loc.lng,
    };
    setSelectedLoc(updated);
    setCustomAddress(loc.addressLine);
    setIsApplied(true);
    onSelectAddress(updated);
    setTimeout(() => setIsApplied(false), 2000);
  };

  const handleConfirmLocation = () => {
    const updated = {
      ...selectedLoc,
      addressLine: customAddress || selectedLoc.addressLine,
    };
    onSelectAddress(updated);
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2000);
  };

  const filteredLocations = TURKEY_LOCATIONS.filter(
    (l) =>
      l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-camel" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            Dinamik Konum & Harita Seçici
          </h4>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="text-xs text-brand-camel font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          {isLocating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Konum Alınıyor...</span>
            </>
          ) : (
            <>
              <Compass className="h-3.5 w-3.5" />
              <span>GPS İle Konumumu Bul</span>
            </>
          )}
        </button>
      </div>

      {/* Dynamic Interactive Map Embed Container */}
      <div className="relative w-full h-56 bg-neutral-900 rounded-xs overflow-hidden border border-neutral-300 group">
        <iframe
          title="OpenStreetMap Dynamic Location Picker"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLoc.lng - 0.01}%2C${selectedLoc.lat - 0.01}%2C${selectedLoc.lng + 0.01}%2C${selectedLoc.lat + 0.01}&layer=mapnik&marker=${selectedLoc.lat}%2C${selectedLoc.lng}`}
        />

        <div className="absolute top-3 left-3 bg-neutral-900/90 text-white text-[10px] font-mono px-2.5 py-1 rounded-xs backdrop-blur-sm shadow-md">
          Lat: {selectedLoc.lat.toFixed(4)}, Lng: {selectedLoc.lng.toFixed(4)}
        </div>

        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xs border border-neutral-200 shadow-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <Navigation className="h-4 w-4 text-brand-camel flex-shrink-0" />
            <span className="font-bold text-neutral-800 truncate">
              {selectedLoc.district} / {selectedLoc.city}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="bg-brand-dark hover:bg-brand-camel text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            {isApplied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span>Seçildi!</span>
              </>
            ) : (
              <span>Bu Konumu Seç</span>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
          Hızlı Şehir / İlçe Konum Seçimi
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Şehir veya ilçe ara (Örn: İzmit, Modoko, Kadıköy...)"
            className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {filteredLocations.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(loc)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedLoc.lat === loc.lat && selectedLoc.lng === loc.lng
                  ? 'bg-brand-camel text-white border-brand-camel shadow-sm'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
            >
              <MapPin className="h-3 w-3" />
              <span>
                {loc.city} - {loc.district}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
          Harita Açık Adres Detayı
        </label>
        <textarea
          rows={2}
          value={customAddress}
          onChange={(e) => setCustomAddress(e.target.value)}
          placeholder="Açık adresinizi buraya yazın veya düzenleyin..."
          className="w-full text-xs border border-neutral-300 p-2.5 rounded-xs focus:ring-1 focus:ring-brand-camel focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};
