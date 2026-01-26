'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface CryptoRowProps {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function CryptoRow({ id, symbol, name, image, price, change24h, volume24h, marketCap, isFavorite = false, onToggleFavorite }: CryptoRowProps) {
  const router = useRouter();

  const formatPrice = (value: number | null) => {
    if (!value) return '$0.00';
    if (value >= 1) {
      return '$' + value.toFixed(2);
    }
    return '$' + value.toFixed(8);
  };

  const formatVolume = (value: number | null) => {
    if (!value) return '$0';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    return '$' + (value / 1e3).toFixed(2) + 'K';
  };

  const formatMarketCap = (value: number | null) => {
    if (!value) return '$0';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    return '$' + (value / 1e3).toFixed(2) + 'K';
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the star
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/markets/${id}`);
  };

  return (
    <div 
      onClick={handleRowClick}
      className="flex items-center justify-between py-4 border-b border-gray-900/50 hover:bg-gray-950/30 transition px-1 cursor-pointer"
    >
      {/* Name Column with Fixed Star Position */}
      <div className="flex items-center flex-1">
        {/* Coin Icon - Fixed Width */}
        <div className="flex-shrink-0 w-6 mr-3">
          <Image
            src={image}
            alt={symbol}
            width={24}
            height={24}
            className="rounded-full"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="12" fill="%23666"%3E%3C/circle%3E%3C/svg%3E';
            }}
          />
        </div>
        
        {/* Coin Text Block - Flexible Width with Max Width */}
        <div className="flex flex-col min-w-0 flex-1 max-w-[120px]">
          <div className="text-sm font-medium text-white">{symbol.toUpperCase()}</div>
          <div 
            className="text-xs text-gray-500 truncate whitespace-nowrap overflow-hidden"
            title={name}
          >
            {name}
          </div>
        </div>
        
        {/* Star Icon - Fixed Width Column */}
        <div className="flex-shrink-0 w-6 flex items-center justify-center ml-3">
          <button
            onClick={() => onToggleFavorite?.(id)}
            className="p-1 hover:bg-gray-800 rounded transition"
          >
            {isFavorite ? (
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarIcon className="w-4 h-4 text-gray-500 hover:text-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* Price Column */}
      <div className="flex-1 text-right">
        <div className="text-sm font-medium text-white">{formatPrice(price)}</div>
      </div>

      {/* 24h Change Column */}
      <div className="flex-1 text-right">
        <div className={`text-sm font-medium ${change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change24h >= 0 ? '+' : ''}{change24h?.toFixed(2) || '0'}%
        </div>
      </div>

      {/* 24h Volume Column */}
      <div className="flex-1 text-right">
        <div className="text-sm text-gray-400">{formatVolume(volume24h)}</div>
      </div>

      {/* Market Cap Column */}
      <div className="flex-1 text-right">
        <div className="text-sm text-gray-400">{formatMarketCap(marketCap)}</div>
      </div>
    </div>
  );
}
