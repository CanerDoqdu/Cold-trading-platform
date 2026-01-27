'use client';

import { useMemo } from 'react';

interface Order {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookProps {
  currentPrice: number;
  symbol: string;
}

export default function OrderBook({ currentPrice, symbol }: OrderBookProps) {
  // Simüle edilmiş order book verileri
  const { asks, bids } = useMemo(() => {
    const generateOrders = (basePrice: number, isBuy: boolean, count: number): Order[] => {
      const orders: Order[] = [];
      for (let i = 0; i < count; i++) {
        const priceOffset = (Math.random() * 0.002 + 0.0005) * (i + 1);
        const price = isBuy
          ? basePrice * (1 - priceOffset)
          : basePrice * (1 + priceOffset);
        const amount = Math.random() * 2 + 0.1;
        const total = price * amount;
        orders.push({ price, amount, total });
      }
      return orders.sort((a, b) => isBuy ? b.price - a.price : a.price - b.price);
    };

    return {
      asks: generateOrders(currentPrice, false, 8), // Satış emirleri (kırmızı)
      bids: generateOrders(currentPrice, true, 8),  // Alış emirleri (yeşil)
    };
  }, [currentPrice]);

  const maxTotal = Math.max(
    ...asks.map(o => o.total),
    ...bids.map(o => o.total)
  );

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
      </div>

      {/* Headers */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-500 border-b border-gray-800">
        <span className="w-1/3">Price (USDT)</span>
        <span className="w-1/3 text-right">Amount ({symbol})</span>
        <span className="w-1/3 text-right">Total</span>
      </div>

      {/* Asks (Sell orders) - Red */}
      <div className="relative">
        {asks.slice().reverse().map((order, i) => (
          <div key={`ask-${i}`} className="relative flex items-center justify-between px-3 py-1 text-xs">
            <div
              className="absolute inset-y-0 right-0 bg-red-500/10"
              style={{ width: `${(order.total / maxTotal) * 100}%` }}
            />
            <span className="w-1/3 text-red-400 relative z-10">
              {order.price.toFixed(2)}
            </span>
            <span className="w-1/3 text-right text-gray-300 relative z-10">
              {order.amount.toFixed(4)}
            </span>
            <span className="w-1/3 text-right text-gray-500 relative z-10">
              {order.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Current Price */}
      <div className="flex items-center justify-center py-2 bg-gray-900 border-y border-gray-800">
        <span className="text-lg font-bold text-white">
          ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Bids (Buy orders) - Green */}
      <div className="relative">
        {bids.map((order, i) => (
          <div key={`bid-${i}`} className="relative flex items-center justify-between px-3 py-1 text-xs">
            <div
              className="absolute inset-y-0 right-0 bg-emerald-500/10"
              style={{ width: `${(order.total / maxTotal) * 100}%` }}
            />
            <span className="w-1/3 text-emerald-400 relative z-10">
              {order.price.toFixed(2)}
            </span>
            <span className="w-1/3 text-right text-gray-300 relative z-10">
              {order.amount.toFixed(4)}
            </span>
            <span className="w-1/3 text-right text-gray-500 relative z-10">
              {order.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
