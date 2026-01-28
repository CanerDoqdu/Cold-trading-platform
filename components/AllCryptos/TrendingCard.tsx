'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cachedFetch } from '@/lib/apiCache';
import { useOptionalWebSocket } from '@/components/WebSocketContext';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface TrendingCardProps {
  initialData?: Crypto[];
}

export default function TrendingCard({ initialData }: TrendingCardProps) {
  const [cryptos, setCryptos] = useState<Crypto[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData || initialData.length === 0);
  const wsContext = useOptionalWebSocket();
  const prices = wsContext?.prices || {};

  useEffect(() => {
    // If we have initial data from SSR, don't fetch again
    if (initialData && initialData.length > 0) {
      return;
    }

    const fetchTrendingCryptos = async () => {
      try {
        const data = await cachedFetch(
          '/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=3&sparkline=false',
          {},
          180000 // 3 min cache
        );
        
        setCryptos(data);
      } catch (error) {
        console.error('Failed to fetch trending cryptos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCryptos();
  }, [initialData]);

  if (loading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (cryptos.length === 0) {
    return (
      <div className="text-gray-500 text-xs text-center py-2">Unable to load trending data</div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {cryptos.map((crypto) => (
        <Link key={crypto.id} href={`/markets/${crypto.id}`}>
          <div className="flex items-center justify-between bg-slate-100 dark:bg-gray-900 border border-gray-200/50 dark:border-transparent rounded-lg px-3 py-2 hover:bg-slate-200 dark:hover:bg-gray-800 transition cursor-pointer">
            {/* Left Group: Logo + Symbol + Name */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Image
                src={crypto.image}
                alt={crypto.name}
                width={28}
                height={28}
                className="rounded-full flex-shrink-0"
              />
              <div className="flex flex-col gap-0">
                <div className="text-gray-900 dark:text-white font-semibold text-xs">{crypto.symbol.toUpperCase()}</div>
                <div className="text-gray-500 dark:text-gray-400 text-[10px] truncate">{crypto.name}</div>
              </div>
            </div>

            {/* Right Group: Price + Change */}
            <div className="flex items-center gap-2 text-right whitespace-nowrap ml-2">
              <div className="text-gray-900 dark:text-white font-bold text-xs">
                ${(() => {
                  const wsPrice = prices[crypto.symbol.toUpperCase()];
                  if (wsPrice) {
                    return parseFloat(wsPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  }
                  return crypto.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A';
                })()}
              </div>
              <div className={`font-semibold text-xs ${crypto.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                {crypto.price_change_percentage_24h?.toFixed(2) || '0'}%
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
