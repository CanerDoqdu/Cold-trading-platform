import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  body: string;
  imageUrl: string;
  publishedOn: number;
  sourceName: string;
  sourceImg: string;
  categories?: string;
}

const NEWS_URL =
  "https://min-api.cryptocompare.com/data/v2/news/?feeds=cryptocompare,cointelegraph,coindesk&extraParams=YourSite";

async function getNews(): Promise<NewsArticle[]> {
  const API_KEY = process.env.CRYPTOCOMPARE;
  
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (API_KEY) {
    headers["api_key"] = API_KEY;
  }

  const response = await fetch(NEWS_URL, {
    method: "GET",
    headers,
    next: { revalidate: 3600 } // Revalidate every 1 hour
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data && data.Data && Array.isArray(data.Data)) {
    return data.Data.map((news: any) => ({
      id: news.id,
      title: news.title,
      url: news.url,
      body: news.body,
      imageUrl: news.imageurl,
      publishedOn: news.published_on,
      sourceName: news.source_info?.name || 'Unknown',
      sourceImg: news.source_info?.img || '',
      categories: news.categories || '',
    }));
  } else {
    throw new Error("Invalid data format");
  }
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }
}

// Compact News Card - Small image, focused on text
function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link 
      href={article.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex gap-4 p-4 bg-gradient-to-r from-[#1a1f2e] to-[#0f1318] rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
    >
      {/* Small Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="80px"
          loading="lazy"
          className="object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-cyan-400 text-xs font-medium">{article.sourceName}</span>
            <span className="text-gray-600 text-xs">•</span>
            <span className="text-gray-500 text-xs">{formatTimeAgo(article.publishedOn)}</span>
          </div>
          <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

// Text-only news item for sidebar
function TextNewsItem({ article, index }: { article: NewsArticle; index: number }) {
  return (
    <Link 
      href={article.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex items-start gap-3 py-3 border-b border-gray-800/50 last:border-0"
    >
      <span className="text-xl font-bold text-gray-700 group-hover:text-emerald-400 transition-colors flex-shrink-0 w-7">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-gray-500 text-xs">{article.sourceName}</span>
          <span className="text-gray-600 text-xs">•</span>
          <span className="text-gray-500 text-xs">{formatTimeAgo(article.publishedOn)}</span>
        </div>
      </div>
    </Link>
  );
}

// Loading skeleton
function NewsCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-gradient-to-r from-[#1a1f2e] to-[#0f1318] rounded-xl border border-gray-800/50 animate-pulse">
      <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-gray-700 rounded w-24 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-full mb-1" />
        <div className="h-4 bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

async function NewsContent() {
  const articles = await getNews();
  
  const leftColumnArticles = articles.slice(0, 12);
  const rightColumnArticles = articles.slice(12, 22);
  const bottomArticles = articles.slice(22);

  return (
    <>
      {/* Main Two Column Layout */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - News Cards */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Latest <span className="text-cyan-400">News</span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent ml-6" />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {leftColumnArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
          
          {/* Right Column - Trending */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  <span className="text-yellow-400">🔥</span> Trending
                </h2>
              </div>
              
              <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1318] rounded-2xl border border-gray-800/50 p-5 mb-6">
                <div className="space-y-1">
                  {rightColumnArticles.map((article, index) => (
                    <TextNewsItem key={article.id} article={article} index={index} />
                  ))}
                </div>
              </div>
              
              {/* Newsletter Box */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/20 p-6">
                <h3 className="text-lg font-bold text-white mb-2">Stay Informed</h3>
                <p className="text-gray-400 text-sm mb-4">Get the latest crypto news delivered to your inbox.</p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More News Section */}
      {bottomArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              More <span className="text-emerald-400">Stories</span>
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent ml-6" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bottomArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] pt-24 pb-16">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Crypto <span className="text-emerald-400">News</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Stay updated with the latest cryptocurrency news, market analysis, and blockchain insights.
            </p>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
              All News
            </button>
            <button className="px-4 py-2 bg-gray-800/50 text-gray-400 text-sm font-medium rounded-full border border-gray-700/50 hover:border-gray-600 hover:text-white transition-colors">
              Bitcoin
            </button>
            <button className="px-4 py-2 bg-gray-800/50 text-gray-400 text-sm font-medium rounded-full border border-gray-700/50 hover:border-gray-600 hover:text-white transition-colors">
              Ethereum
            </button>
            <button className="px-4 py-2 bg-gray-800/50 text-gray-400 text-sm font-medium rounded-full border border-gray-700/50 hover:border-gray-600 hover:text-white transition-colors">
              DeFi
            </button>
          </div>
        </div>
      </section>

      {/* News Content with Suspense */}
      <Suspense fallback={
        <section className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-6 bg-gray-800 rounded w-32 mb-6" />
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(8)].map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-6 bg-gray-800 rounded w-24 mb-6" />
              <div className="bg-[#1a1f2e] rounded-2xl p-5 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="py-3 border-b border-gray-800/50 last:border-0">
                    <div className="h-4 bg-gray-700 rounded w-full mb-1" />
                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      }>
        <NewsContent />
      </Suspense>
    </div>
  );
}
