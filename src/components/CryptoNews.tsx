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
    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (API_KEY) {
      headers["api_key"] = API_KEY;
    }

    const options = {
      method: "GET",
      headers,
    };

    const response = await fetch(NEWS_URL, options);
    if (!response.ok) {
      return FALLBACK_NEWS;
    }

    const data = await response.json();

    // Ensure the data structure is valid
    if (data && data.Data && Array.isArray(data.Data)) {
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
      return FALLBACK_NEWS;
    }
  },
  ["news"], // Cache key
  { revalidate: 3600, tags: ["news"] }, // Revalidate after 1 hour
);

export const fetchNews = async (): Promise<NewsArticle[]> => {
  return await getNews();
};
