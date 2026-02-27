'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/* ── Types ────────────────────────────────────────────────── */

interface HoldingPnL {
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocationPercent: number;
}

interface SnapshotPoint {
  date: string;
  totalValue: number;
}

interface PortfolioData {
  holdings: HoldingPnL[];
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  cashBalanceUsd: number;
  netWorth: number;
  dailyChange: number;
  dailyChangePercent: number;
  pricesAsOf: string;
  history?: SnapshotPoint[];
}

/* ── Constants ────────────────────────────────────────────── */

const PIE_COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

const PERIOD_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

/* ── Formatting Helpers ───────────────────────────────────── */

function formatUsd(n: number, compact = false): string {
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  }
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

function pnlColor(n: number): string {
  if (n > 0) return 'text-emerald-400';
  if (n < 0) return 'text-red-400';
  return 'text-gray-400';
}

function pnlBg(n: number): string {
  if (n > 0) return 'bg-emerald-500/10 border-emerald-500/30';
  if (n < 0) return 'bg-red-500/10 border-red-500/30';
  return 'bg-gray-500/10 border-gray-500/30';
}

/* ── Custom Tooltip for Area Chart ────────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-white">{formatUsd(payload[0].value)}</p>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

export default function PortfolioDashboard() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState(30);
  const [sortBy, setSortBy] = useState<'value' | 'pnl' | 'allocation'>('value');

  /* ── Fetch portfolio ────────────────────────────────────── */

  const fetchPortfolio = useCallback(async (period: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/portfolio?history=${period}`);
      const json = await res.json();

      if (!json.ok) {
        if (res.status === 401) {
          setError('LOGIN_REQUIRED');
          return;
        }
        throw new Error(json.error?.message || 'Failed to fetch portfolio');
      }

      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio(chartPeriod);
  }, [fetchPortfolio, chartPeriod]);

  /* ── Sorted holdings ────────────────────────────────────── */

  const sortedHoldings = useMemo(() => {
    if (!data?.holdings) return [];
    const copy = [...data.holdings];
    switch (sortBy) {
      case 'pnl':
        return copy.sort((a, b) => b.unrealizedPnL - a.unrealizedPnL);
      case 'allocation':
        return copy.sort((a, b) => b.allocationPercent - a.allocationPercent);
      default:
        return copy.sort((a, b) => b.totalValue - a.totalValue);
    }
  }, [data?.holdings, sortBy]);

  /* ── Pie chart data ─────────────────────────────────────── */

  const pieData = useMemo(() => {
    if (!data?.holdings || data.holdings.length === 0) return [];
    const top = data.holdings.slice(0, 8);
    const otherValue = data.holdings.slice(8).reduce((s, h) => s + h.totalValue, 0);
    const items = top.map((h) => ({ name: h.symbol, value: h.totalValue }));
    if (otherValue > 0) items.push({ name: 'Other', value: otherValue });
    return items;
  }, [data?.holdings]);

  /* ── Loading State ──────────────────────────────────────── */

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-800 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-800 rounded-xl" />
          <div className="h-96 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ── Error / Login Required ─────────────────────────────── */

  if (error === 'LOGIN_REQUIRED') {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold mb-2">Login Required</h3>
        <p className="text-gray-400 mb-6">Please sign in to view your portfolio</p>
        <Link
          href="/login"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-lg transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => fetchPortfolio(chartPeriod)}
          className="text-emerald-400 hover:text-emerald-300 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">
            Prices as of {new Date(data.pricesAsOf).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => fetchPortfolio(chartPeriod)}
          disabled={loading}
          className="text-sm text-gray-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Worth */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">Net Worth</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{formatUsd(data.netWorth)}</p>
          {data.dailyChange !== 0 && (
            <p className={`text-xs sm:text-sm mt-1 ${pnlColor(data.dailyChange)}`}>
              {data.dailyChange > 0 ? '▲' : '▼'} {formatUsd(Math.abs(data.dailyChange))} ({formatPercent(data.dailyChangePercent)}) today
            </p>
          )}
        </div>

        {/* Holdings Value */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">Holdings Value</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{formatUsd(data.totalValue)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Cost basis: {formatUsd(data.totalCost)}
          </p>
        </div>

        {/* Unrealized P&L */}
        <div className={`border rounded-xl p-4 sm:p-5 ${pnlBg(data.totalUnrealizedPnL)}`}>
          <p className="text-xs sm:text-sm text-gray-400 mb-1">Unrealized P&L</p>
          <p className={`text-xl sm:text-2xl font-bold ${pnlColor(data.totalUnrealizedPnL)}`}>
            {data.totalUnrealizedPnL >= 0 ? '+' : ''}{formatUsd(data.totalUnrealizedPnL)}
          </p>
          <p className={`text-xs sm:text-sm mt-1 ${pnlColor(data.totalUnrealizedPnLPercent)}`}>
            {formatPercent(data.totalUnrealizedPnLPercent)}
          </p>
        </div>

        {/* Cash Balance */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">Cash Balance</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">{formatUsd(data.cashBalanceUsd)}</p>
          <Link href="/trade" className="text-xs text-emerald-500 hover:text-emerald-400 mt-1 inline-block">
            Trade →
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Performance</h2>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setChartPeriod(p.value)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    chartPeriod === p.value
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {data.history && data.history.length > 1 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(d: string) => {
                    const parts = d.split('-');
                    return `${parts[1]}/${parts[2]}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatUsd(v, true)}
                  width={70}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalValue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-4xl mb-2">📈</p>
                <p className="text-sm">Performance data will appear after daily snapshots are recorded</p>
              </div>
            </div>
          )}
        </div>

        {/* Allocation Pie Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Allocation</h2>
          {pieData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => formatUsd(Number(value ?? 0))}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-1 mt-2">
                {pieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-gray-300">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-4xl mb-2">🥧</p>
                <p className="text-sm">Buy some crypto to see your allocation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 border-b border-gray-800 gap-3">
          <h2 className="text-lg font-semibold text-white">
            Holdings ({data.holdings.length})
          </h2>
          <div className="flex gap-2">
            {(['value', 'pnl', 'allocation'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                  sortBy === s
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s === 'pnl' ? 'P&L' : s}
              </button>
            ))}
          </div>
        </div>

        {sortedHoldings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📊</p>
            <h3 className="text-lg font-semibold text-white mb-2">No holdings yet</h3>
            <p className="text-gray-400 mb-6 text-sm">Start trading to build your portfolio</p>
            <Link
              href="/trade"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-lg transition-all text-sm"
            >
              Start Trading
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left py-3 px-4 sm:px-6 text-gray-400 font-medium text-xs uppercase tracking-wider">Asset</th>
                  <th className="text-right py-3 px-4 sm:px-6 text-gray-400 font-medium text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-right py-3 px-4 sm:px-6 text-gray-400 font-medium text-xs uppercase tracking-wider">Avg Buy</th>
                  <th className="text-right py-3 px-4 sm:px-6 text-gray-400 font-medium text-xs uppercase tracking-wider">Price</th>
                  <th className="text-right py-3 px-4 sm:px-6 text-gray-400 font-medium text-xs uppercase tracking-wider">Value</th>
                  <th className="text-right py-3 px-4 sm:px-6 text-gray-400 font-medium text-xs uppercase tracking-wider">P&L</th>
                  <th className="text-right py-3 px-4 sm:px-6 text-gray-400 font-medium text-xs uppercase tracking-wider">Alloc.</th>
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.map((h) => (
                  <tr
                    key={h.coinId}
                    className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-6">
                      <Link
                        href={`/markets/${h.coinId}`}
                        className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm text-white">{h.symbol.toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{h.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right text-sm font-medium text-white">
                      {h.amount.toLocaleString('en-US', { maximumFractionDigits: 8 })}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right text-sm text-gray-400">
                      {formatUsd(h.avgBuyPrice)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right text-sm text-white">
                      {formatUsd(h.currentPrice)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right text-sm font-medium text-white">
                      {formatUsd(h.totalValue)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <p className={`text-sm font-medium ${pnlColor(h.unrealizedPnL)}`}>
                        {h.unrealizedPnL >= 0 ? '+' : ''}{formatUsd(h.unrealizedPnL)}
                      </p>
                      <p className={`text-xs ${pnlColor(h.unrealizedPnLPercent)}`}>
                        {formatPercent(h.unrealizedPnLPercent)}
                      </p>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(h.allocationPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-12 text-right">
                          {h.allocationPercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
