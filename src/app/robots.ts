import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/odeme',
          '/odeme/*',
          '/siparis',
          '/siparis/*',
          '/hesabim',
          '/hesabim/*',
          '/api/*',
        ],
      },
    ],
    sitemap: 'https://ermaymobilya.com/sitemap.xml',
    host: 'https://ermaymobilya.com',
  };
}
