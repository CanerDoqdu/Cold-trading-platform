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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure the data structure is valid
    if (data && data.Data && Array.isArray(data.Data)) {
      return data.Data.slice(0, 3).map((news: any) => ({
        id: news.id,
        title: news.title,
        url: news.url,
        body: news.body,
        imageUrl: news.imageurl,
        publishedOn: news.published_on,
        sourceName: news.source_info.name,
        sourceImg: news.source_info.img,
      }));
    } else {
      throw new Error("Invalid data format");
    }
  },
  ["news"], // Cache key
  { revalidate: 3600, tags: ["news"] }, // Revalidate after 1 hour
);

export const fetchNews = async (): Promise<NewsArticle[]> => {
  return await getNews();
};
