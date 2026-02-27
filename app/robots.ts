import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: ['/api/', '/_next/', '/static/'],
    },
    sitemap: 'https://blxckchat.jexxx.us/sitemap.xml',
    host: 'https://blxckchat.jexxx.us',
  };
}
