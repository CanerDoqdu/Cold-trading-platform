'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SummaryData {
  totalValue: number;
  netWorth: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdingsCount: number;
}

/**
 * Compact portfolio summary widget for the profile overview page.
 * Shows net worth, today's change, and a CTA to view full portfolio.
 */
export default function PortfolioSummaryWidget() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/portfolio');
        const json = await res.json();
        if (json.ok && json.data) {
          setData({
            totalValue: json.data.totalValue,
            netWorth: json.data.netWorth,
            totalUnrealizedPnL: json.data.totalUnrealizedPnL,
            totalUnrealizedPnLPercent: json.data.totalUnrealizedPnLPercent,
            dailyChange: json.data.dailyChange,
            dailyChangePercent: json.data.dailyChangePercent,
            holdingsCount: json.data.holdings?.length ?? 0,
          });
        }
      } catch {
        // Silently fail — widget is non-critical
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-24 mb-3" />
        <div className="h-7 bg-gray-800 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-20" />
      </div>
    );
  }

  if (!data) {
    return (
      <Link
        href="/profile/portfolio"
        className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors"
      >
        <p className="text-sm text-gray-400 mb-1">Portfolio</p>
        <p className="text-lg font-semibold text-white">Get Started</p>
        <p className="text-xs text-emerald-500 mt-1">Start trading →</p>
      </Link>
    );
  }

  const pnlColor = data.totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400';
  const dailyColor = data.dailyChange >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <Link
      href="/profile/portfolio"
      className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors group"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 mb-1">Net Worth</p>
          <p className="text-xl font-bold text-white">
            {data.netWorth.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <span className="text-xs text-gray-500 group-hover:text-emerald-400 transition-colors">
          View →
        </span>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span className={`text-xs font-medium ${pnlColor}`}>
          P&L: {data.totalUnrealizedPnL >= 0 ? '+' : ''}
          {data.totalUnrealizedPnL.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
          })}
          {' '}({data.totalUnrealizedPnLPercent >= 0 ? '+' : ''}{data.totalUnrealizedPnLPercent.toFixed(2)}%)
        </span>
        {data.dailyChange !== 0 && (
          <span className={`text-xs ${dailyColor}`}>
            Today: {data.dailyChange >= 0 ? '+' : ''}
            {data.dailyChange.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
            })}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {data.holdingsCount} asset{data.holdingsCount !== 1 ? 's' : ''} held
      </p>
    </Link>
  );
}
