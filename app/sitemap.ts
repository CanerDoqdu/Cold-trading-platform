import { MetadataRoute } from 'next';

// Dynamic sitemap generation for SEO
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cold.io';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/markets`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trade`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/nftrankings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic coin pages - fetch top coins
  let coinPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1',
      { next: { revalidate: 86400 } } // Revalidate daily
    );
    
    if (res.ok) {
      const coins = await res.json();
      coinPages = coins.map((coin: { id: string }) => ({
        url: `${baseUrl}/markets/${coin.id}`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch coins for sitemap:', error);
  }

  // Dynamic trade pages
  const tradePages: MetadataRoute.Sitemap = [
    'btc', 'eth', 'bnb', 'xrp', 'ada', 'doge', 'sol', 'dot', 'matic', 'shib'
  ].map(symbol => ({
    url: `${baseUrl}/trade/${symbol}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...coinPages, ...tradePages];
}
