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
const COINDESK_RSS_URL = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
const API_KEY = process.env.CRYPTOCOMPARE;

async function fetchRssNews(limit = 3): Promise<NewsArticle[]> {
  try {
    const response = await fetch(COINDESK_RSS_URL, {
      method: 'GET',
      headers: { accept: 'application/xml,text/xml' },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

    return items.slice(0, limit).map((item, index) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? item.match(/<title>(.*?)<\/title>/)?.[1]
        ?? 'Untitled news';
      const url = item.match(/<link>(.*?)<\/link>/)?.[1] ?? '/news';
      const body = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? item.match(/<description>(.*?)<\/description>/)?.[1]
        ?? '';
      const image = item.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ?? '/images/WhitemodeLogo.png';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

      return {
        id: `rss-${index}-${url}`,
        title: String(title).trim(),
        url: String(url).trim(),
        body: String(body).replace(/<[^>]+>/g, '').trim(),
        imageUrl: normalizeImageUrl(image),
        publishedOn: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
        sourceName: 'CoinDesk',
        sourceImg: '',
      };
    });
  } catch {
    return [];
  }
}

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
        console.warn(`CryptoCompare API returned status ${response.status}, trying RSS fallback`);
        const rssArticles = await fetchRssNews(3);
        return rssArticles.length > 0 ? rssArticles : FALLBACK_NEWS;
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
        const rssArticles = await fetchRssNews(3);
        return rssArticles.length > 0 ? rssArticles : FALLBACK_NEWS;
      }
    } catch (error) {
      console.error("Error fetching news from CryptoCompare:", error);
      const rssArticles = await fetchRssNews(3);
      return rssArticles.length > 0 ? rssArticles : FALLBACK_NEWS;
    }
  },
  ["news"], // Cache key
  { revalidate: 3600, tags: ["news"] }, // Revalidate after 1 hour
);

export const fetchNews = async (): Promise<NewsArticle[]> => {
  return await getNews();
};
