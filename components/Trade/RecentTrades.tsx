'use client';

import { useState, useEffect } from 'react';

interface Trade {
  id: number;
  price: number;
  amount: number;
  time: string;
  isBuy: boolean;
}

interface RecentTradesProps {
  currentPrice: number;
  symbol: string;
}

export default function RecentTrades({ currentPrice, symbol }: RecentTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  // Simüle edilmiş trade'ler oluştur
  useEffect(() => {
    const generateTrades = () => {
      const newTrades: Trade[] = [];
      const now = new Date();

      for (let i = 0; i < 15; i++) {
        const priceVariation = (Math.random() - 0.5) * 0.002;
        const price = currentPrice * (1 + priceVariation);
        const amount = Math.random() * 0.5 + 0.01;
        const time = new Date(now.getTime() - i * 1000 * (Math.random() * 10 + 5));

        newTrades.push({
          id: i,
          price,
          amount,
          time: time.toLocaleTimeString('en-US', { hour12: false }),
          isBuy: Math.random() > 0.5,
        });
      }

      setTrades(newTrades);
    };

    generateTrades();

    // Her 3 saniyede yeni trade ekle
    const interval = setInterval(() => {
      setTrades((prev) => {
        const priceVariation = (Math.random() - 0.5) * 0.002;
        const newTrade: Trade = {
          id: Date.now(),
          price: currentPrice * (1 + priceVariation),
          amount: Math.random() * 0.5 + 0.01,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          isBuy: Math.random() > 0.5,
        };
        return [newTrade, ...prev.slice(0, 14)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
      </div>

      {/* Headers */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-500 border-b border-gray-800">
        <span className="w-1/3">Price (USDT)</span>
        <span className="w-1/3 text-right">Amount ({symbol})</span>
        <span className="w-1/3 text-right">Time</span>
      </div>

      {/* Trades */}
      <div className="max-h-[300px] overflow-y-auto">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between px-3 py-1 text-xs hover:bg-gray-800/30 transition-colors"
          >
            <span className={`w-1/3 ${trade.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
              {trade.price.toFixed(2)}
            </span>
            <span className="w-1/3 text-right text-gray-300">
              {trade.amount.toFixed(4)}
            </span>
            <span className="w-1/3 text-right text-gray-500">
              {trade.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
