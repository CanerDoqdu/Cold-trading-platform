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

// Using CoinDesk News API - public endpoint, no authentication required
const COINDESK_NEWS_URL = "https://api.coindesk.com/v1/news";

const getNews = unstable_cache(
  async (): Promise<NewsArticle[]> => {
    try {
      const response = await fetch(COINDESK_NEWS_URL, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`CoinDesk API returned status ${response.status}`);
        return FALLBACK_NEWS;
      }

      const data = await response.json();

      // CoinDesk response structure: { data: [ { title, description, url, image: { source }, published_at, source } ] }
      if (data && Array.isArray(data)) {
        return data.slice(0, 3).map((article: any) => ({
          id: String(article?.id ?? article?.url ?? crypto.randomUUID()),
          title: String(article?.title ?? 'Untitled news'),
          url: String(article?.url ?? '/news'),
          body: String(article?.description ?? article?.body ?? ''),
          imageUrl: normalizeImageUrl(article?.image?.source || article?.imageUrl),
          publishedOn: article?.published_at ? Math.floor(new Date(article.published_at).getTime() / 1000) : Math.floor(Date.now() / 1000),
          sourceName: String(article?.source ?? 'CoinDesk'),
          sourceImg: '',
        }));
      } else {
        console.warn("Unexpected CoinDesk response structure", data);
        return FALLBACK_NEWS;
      }
    } catch (error) {
      console.error("Error fetching news from CoinDesk:", error);
      return FALLBACK_NEWS;
    }
  },
  ["news"], // Cache key
  { revalidate: 3600, tags: ["news"] }, // Revalidate after 1 hour
);

export const fetchNews = async (): Promise<NewsArticle[]> => {
  return await getNews();
};
