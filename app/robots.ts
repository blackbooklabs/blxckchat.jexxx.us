import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/static/'],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot'],
        allow: '/',
      },
    ],
    sitemap: ['https://blxckchat.jexxx.us/sitemap.xml', 'https://blxckchat.jexxx.us/llms.txt'],
    host: 'https://blxckchat.jexxx.us',
  };
}
