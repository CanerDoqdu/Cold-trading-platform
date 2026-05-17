import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crypto-henna-beta.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API routes
          '/profile/',       // User profile pages (private)
          '/_next/',         // Next.js internal routes
          '/admin/',         // Admin pages if any
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/profile/'],
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
        disallow: ['/api/', '/profile/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
