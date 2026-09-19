/**
 * Client-Side Device & Security Context Detector
 * Accurately classifies client device (Mobile, Tablet, Laptop, Desktop)
 * and captures screen, OS, and browser metadata for audit and analytics.
 */

export interface ClientDeviceInfo {
  deviceType: 'Mobil (Akıllı Telefon)' | 'Tablet' | 'Dizüstü Bilgisayar (Laptop)' | 'Masaüstü Bilgisayar';
  os: string;
  browser: string;
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  language: string;
  touchSupported: boolean;
  userAgent: string;
}

export function detectClientDevice(): ClientDeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'Masaüstü Bilgisayar',
      os: 'Sunucu',
      browser: 'SSR',
      screenResolution: '1920x1080',
      colorDepth: 24,
      pixelRatio: 1,
      language: 'tr-TR',
      touchSupported: false,
      userAgent: 'Node.js SSR',
    };
  }

  const ua = navigator.userAgent;
  const width = window.innerWidth || window.screen.width || 0;
  const height = window.innerHeight || window.screen.height || 0;
  const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 1. Detect Operating System
  let os = 'Bilinmeyen İşletim Sistemi';
  if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/.test(ua)) os = 'macOS';
  else if (/Windows NT 10.0/.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Linux/.test(ua)) os = 'Linux';

  // 2. Detect Browser
  let browser = 'Bilinmeyen Tarayıcı';
  if (/Edg\//.test(ua)) browser = 'Microsoft Edge';
  else if (/SamsungBrowser/.test(ua)) browser = 'Samsung Internet';
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = 'Google Chrome';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Apple Safari';
  else if (/Firefox\//.test(ua)) browser = 'Mozilla Firefox';
  else if (/Opera|OPR\//.test(ua)) browser = 'Opera';

  // 3. Classify Device Type
  let deviceType: 'Mobil (Akıllı Telefon)' | 'Tablet' | 'Dizüstü Bilgisayar (Laptop)' | 'Masaüstü Bilgisayar' = 'Masaüstü Bilgisayar';

  const isMobileUa = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua);
  const isTabletUa = /Tablet|iPad|PlayBook|Nexus 7|Nexus 10/i.test(ua);

  if (isTabletUa || (touchSupported && width >= 600 && width <= 1024)) {
    deviceType = 'Tablet';
  } else if (isMobileUa || width < 600) {
    deviceType = 'Mobil (Akıllı Telefon)';
  } else if (width <= 1440 && touchSupported) {
    deviceType = 'Dizüstü Bilgisayar (Laptop)';
  } else if (width <= 1536) {
    deviceType = 'Dizüstü Bilgisayar (Laptop)';
  } else {
    deviceType = 'Masaüstü Bilgisayar';
  }

  return {
    deviceType,
    os,
    browser,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth || 24,
    pixelRatio: window.devicePixelRatio || 1,
    language: navigator.language || 'tr-TR',
    touchSupported,
    userAgent: ua,
  };
}
