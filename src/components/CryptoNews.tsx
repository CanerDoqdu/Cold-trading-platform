// lib/news.ts
import { unstable_cache } from "next/cache";

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  body: string;
  imageUrl: string;
  publishedOn: number;
  sourceName: string;
  sourceImg: string;
}

const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: 'fallback-news',
    title: 'Crypto news is temporarily unavailable',
    url: '/news',
    body: 'The external provider did not return valid data. Please try again shortly.',
    imageUrl: '/images/WhitemodeLogo.png',
    publishedOn: Math.floor(Date.now() / 1000),
    sourceName: 'COLD',
    sourceImg: '',
  },
];

function normalizeImageUrl(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '/images/WhitemodeLogo.png';
  }

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }

  return '/images/WhitemodeLogo.png';
}

const NEWS_URL =
  "https://min-api.cryptocompare.com/data/v2/news/?feeds=cryptocompare,cointelegraph,coindesk&extraParams=YourSite";
const API_KEY = process.env.CRYPTOCOMPARE;

const getNews = unstable_cache(
  async (): Promise<NewsArticle[]> => {
    try {
      const headers: Record<string, string> = {
        accept: "application/json",
      };

      if (API_KEY) {
        // CryptoCompare currently expects Authorization header with "Apikey" prefix.
        headers.authorization = `Apikey ${API_KEY}`;
        // Keep legacy header for compatibility with older edge caches.
        headers.api_key = API_KEY;
      }

      const response = await fetch(NEWS_URL, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        console.warn(`CryptoCompare API returned status ${response.status}`);
        return FALLBACK_NEWS;
      }

      const data = await response.json();

      if (data?.Type === 100 && Array.isArray(data?.Data)) {
        return data.Data.slice(0, 3).map((news: any) => ({
          id: String(news?.id ?? crypto.randomUUID()),
          title: String(news?.title ?? 'Untitled news'),
          url: String(news?.url ?? '/news'),
          body: String(news?.body ?? ''),
          imageUrl: normalizeImageUrl(news?.imageurl),
          publishedOn: Number(news?.published_on ?? Math.floor(Date.now() / 1000)),
          sourceName: String(news?.source_info?.name ?? 'Unknown'),
          sourceImg: String(news?.source_info?.img ?? ''),
        }));
      } else {
        console.warn("Unexpected CryptoCompare response structure", data);
        return FALLBACK_NEWS;
      }
    } catch (error) {
      console.error("Error fetching news from CryptoCompare:", error);
      return FALLBACK_NEWS;
    }
  },
  ["news"], // Cache key
  { revalidate: 3600, tags: ["news"] }, // Revalidate after 1 hour
);

export const fetchNews = async (): Promise<NewsArticle[]> => {
  return await getNews();
};
