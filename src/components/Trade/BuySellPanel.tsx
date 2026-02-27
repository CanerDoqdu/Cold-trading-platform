'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { UseAuthContext } from '@/hooks/UseAuthContext';

/* ── Types ────────────────────────────────────────────────── */

interface BuySellPanelProps {
  symbol: string;
  name: string;
  currentPrice: number;
  coinId: string;
}

interface OrderResponse {
  version: string;
  ok: boolean;
  data?: {
    order: {
      id: string;
      symbol: string;
      side: string;
      type: string;
      amount: number;
      executionPrice: number;
      totalUsd: number;
      slippageBps: number;
      status: string;
      filledAt: string;
      createdAt: string;
    };
    balance: {
      paperBalanceMinor: string;
      paperBalanceUsd: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

type InputMode = 'crypto' | 'usd';
type Step = 'form' | 'preview';

/* ── Helpers ──────────────────────────────────────────────── */

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCrypto(value: number): string {
  if (value === 0) return '0';
  if (value >= 1) return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
  return value.toLocaleString('en-US', { maximumFractionDigits: 8 });
}

/* ── Price countdown hook ─────────────────────────────────── */

const PRICE_VALIDITY_SECONDS = 5;

function usePriceCountdown(currentPrice: number) {
  const [snapshotPrice, setSnapshotPrice] = useState(currentPrice);
  const [secondsLeft, setSecondsLeft] = useState(PRICE_VALIDITY_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshPrice = useCallback(() => {
    setSnapshotPrice(currentPrice);
    setSecondsLeft(PRICE_VALIDITY_SECONDS);
  }, [currentPrice]);

  // Refresh snapshot when live price updates
  useEffect(() => {
    setSnapshotPrice(currentPrice);
    setSecondsLeft(PRICE_VALIDITY_SECONDS);
  }, [currentPrice]);

  // Countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Auto-refresh when expired
          setSnapshotPrice(currentPrice);
          return PRICE_VALIDITY_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentPrice]);

  return { snapshotPrice, secondsLeft, refreshPrice };
}

/* ── Component ────────────────────────────────────────────── */

export default function BuySellPanel({ symbol, name, currentPrice, coinId }: BuySellPanelProps) {
  const { state } = UseAuthContext();
  const { user } = state;

  /* Form state */
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [inputMode, setInputMode] = useState<InputMode>('crypto');
  const [rawInput, setRawInput] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [step, setStep] = useState<Step>('form');

  /* API / balance state */
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0); // USD (float)
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* 5s price countdown */
  const { snapshotPrice, secondsLeft, refreshPrice } = usePriceCountdown(currentPrice);

  /* ── Derived values ─────────────────────────────────────── */
  const buyPrice = snapshotPrice * 1.001; // +0.1% spread
  const sellPrice = snapshotPrice * 0.999; // -0.1%
  const spread = (((buyPrice - sellPrice) / snapshotPrice) * 100).toFixed(3);
  const effectivePrice = activeTab === 'buy' ? buyPrice : sellPrice;

  const cryptoAmount =
    inputMode === 'crypto'
      ? parseFloat(rawInput) || 0
      : (parseFloat(rawInput) || 0) / effectivePrice;

  const usdTotal =
    inputMode === 'usd'
      ? parseFloat(rawInput) || 0
      : (parseFloat(rawInput) || 0) *
        (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : effectivePrice);

  /* ── Fetch user balance + email status ──────────────────── */
  useEffect(() => {
    if (!user) {
      setBalanceLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setBalanceLoading(true);
        const res = await fetch('/api/user/session');
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.user && !cancelled) {
          const minor = parseInt(data.user.paperBalanceMinor ?? '1000000', 10);
          setBalance(minor / 100);
          setEmailVerified(data.user.emailVerified ?? false);
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  /* Reset on tab/coin change */
  useEffect(() => {
    setRawInput('');
    setLimitPrice('');
    setMessage(null);
    setStep('form');
  }, [activeTab, symbol]);

  /* ── Quick amounts ──────────────────────────────────────── */
  const quickPercentages = [25, 50, 75, 100];

  function handleQuickAmount(pct: number) {
    if (activeTab === 'buy') {
      const usdAmount = (balance * pct) / 100;
      if (inputMode === 'usd') {
        setRawInput(usdAmount.toFixed(2));
      } else {
        const crypto = usdAmount / effectivePrice;
        setRawInput(crypto > 0 ? crypto.toPrecision(6) : '');
      }
    }
  }

  /* ── Preview step ───────────────────────────────────────── */
  function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!rawInput || cryptoAmount <= 0) return;

    // Email verification gate
    if (emailVerified === false) {
      setMessage({ type: 'error', text: 'Verify your email to trade' });
      return;
    }

    // Balance check (buy only)
    if (activeTab === 'buy' && usdTotal > balance) {
      setMessage({ type: 'error', text: `Insufficient balance: $${formatUsd(balance)} available` });
      return;
    }

    setMessage(null);
    refreshPrice();
    setStep('preview');
  }

  /* ── Submit order ───────────────────────────────────────── */
  async function handleConfirm() {
    setLoading(true);
    setMessage(null);

    const idempotencyKey = generateUUID();
    const execPrice =
      orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : effectivePrice;

    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          coinId,
          coinName: name,
          side: activeTab,
          amount: cryptoAmount,
          clientPrice: execPrice,
          type: orderType,
          limitPrice: orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : undefined,
          idempotencyKey,
        }),
      });

      const data: OrderResponse = await res.json();

      if (data.ok && data.data) {
        setBalance(parseFloat(data.data.balance.paperBalanceUsd));
        setMessage({
          type: 'success',
          text: `${activeTab === 'buy' ? 'Bought' : 'Sold'} ${formatCrypto(data.data.order.amount)} ${symbol.toUpperCase()} at $${formatUsd(data.data.order.executionPrice)}`,
        });
        setRawInput('');
        setStep('form');
      } else {
        setMessage({
          type: 'error',
          text: data.error?.message || 'Order failed. Please try again.',
        });
        setStep('form');
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setStep('form');
    } finally {
      setLoading(false);
    }
  }

  /* ── Not logged in ──────────────────────────────────────── */
  if (!user) {
    return (
      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden h-full flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 text-sm text-center mb-4">
          Log in to start paper trading
        </p>
        <a
          href="/login"
          className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition text-sm"
        >
          Log In
        </a>
      </div>
    );
  }

  /* ── Email verification gate ────────────────────────────── */
  if (emailVerified === false) {
    return (
      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden h-full flex flex-col">
        <div className="flex border-b border-gray-800">
          <div className="flex-1 py-3 text-sm font-semibold text-center text-gray-400">Trade</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-yellow-400 font-medium text-sm">Verify your email to trade</p>
          <p className="text-gray-500 text-xs">Check your inbox for the verification link</p>
        </div>
      </div>
    );
  }

  /* ── Preview screen ─────────────────────────────────────── */
  if (step === 'preview') {
    const execPrice =
      orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : effectivePrice;

    return (
      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden h-full flex flex-col">
        <div className="flex border-b border-gray-800">
          <div
            className={`flex-1 py-3 text-sm font-semibold text-center ${
              activeTab === 'buy'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            Confirm {activeTab === 'buy' ? 'Buy' : 'Sell'}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-4">
          {/* Price countdown */}
          <div className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
            <span className="text-xs text-gray-400">Price valid for</span>
            <span
              className={`text-sm font-mono font-bold ${
                secondsLeft <= 2 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {secondsLeft}s
            </span>
          </div>

          {/* Order summary */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Asset</span>
              <span className="text-white font-medium">{symbol.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Amount</span>
              <span className="text-white font-medium">{formatCrypto(cryptoAmount)} {symbol.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price</span>
              <span className="text-white font-medium">${formatUsd(execPrice)}</span>
            </div>
            <div className="border-t border-gray-800 pt-3 flex justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-bold text-base">${formatUsd(usdTotal)}</span>
            </div>
            <SlippageWarning secondsLeft={secondsLeft} />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-xs p-2 rounded ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              type="button"
              onClick={() => setStep('form')}
              disabled={loading}
              className="flex-1 py-3 rounded-lg font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'buy'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black disabled:bg-emerald-900 disabled:text-emerald-700'
                  : 'bg-red-500 hover:bg-red-400 text-white disabled:bg-red-900 disabled:text-red-700'
              }`}
            >
              {loading ? 'Executing...' : `Confirm ${activeTab === 'buy' ? 'Buy' : 'Sell'}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form screen ────────────────────────────────────────── */
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'buy'
              ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'sell'
              ? 'bg-red-500/20 text-red-400 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Balance */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-400">Available Balance</span>
          {balanceLoading ? (
            <span className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
          ) : (
            <span className="text-sm font-medium text-white">${formatUsd(balance)}</span>
          )}
        </div>

        {/* Order Type */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 text-xs rounded-lg transition-colors ${
              orderType === 'market'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 text-xs rounded-lg transition-colors ${
              orderType === 'limit'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Limit
          </button>
        </div>

        {/* Price Display with countdown */}
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">
              {activeTab === 'buy' ? 'Buy' : 'Sell'} Price
            </span>
            <span className="text-gray-400">Spread: {spread}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`text-xl font-bold ${
                activeTab === 'buy' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              ${formatUsd(effectivePrice)}
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded ${
                secondsLeft <= 2
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {secondsLeft}s
            </span>
          </div>
        </div>

        <form onSubmit={handlePreview} className="flex-1 flex flex-col">
          {/* Limit Price Input */}
          {orderType === 'limit' && (
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">Limit Price (USD)</label>
              <input
                type="number"
                step="any"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder={effectivePrice.toFixed(2)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Amount Input with toggle */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-400">
                Amount ({inputMode === 'crypto' ? symbol.toUpperCase() : 'USD'})
              </label>
              <button
                type="button"
                onClick={() => {
                  setInputMode((prev) => (prev === 'crypto' ? 'usd' : 'crypto'));
                  setRawInput('');
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition"
              >
                Switch to {inputMode === 'crypto' ? 'USD' : symbol.toUpperCase()}
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 pr-16"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                {inputMode === 'crypto' ? symbol.toUpperCase() : 'USD'}
              </span>
            </div>
          </div>

          {/* Quick amount buttons (percentage of balance) */}
          <div className="flex gap-2 mb-3">
            {quickPercentages.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickAmount(pct)}
                className="flex-1 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Equivalent display */}
          {rawInput && parseFloat(rawInput) > 0 && (
            <div className="text-xs text-gray-500 mb-3">
              {inputMode === 'crypto'
                ? `≈ $${formatUsd(usdTotal)}`
                : `≈ ${formatCrypto(cryptoAmount)} ${symbol.toUpperCase()}`}
            </div>
          )}

          {/* Total */}
          <div className="bg-gray-900 rounded-lg p-3 mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Total</span>
              <span className="text-gray-400">USD</span>
            </div>
            <div className="text-lg font-semibold text-white">${formatUsd(usdTotal)}</div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-xs p-2 rounded mb-3 ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit — goes to preview */}
          <button
            type="submit"
            disabled={loading || !rawInput || cryptoAmount <= 0}
            className={`w-full py-3 rounded-lg font-bold transition-all mt-auto ${
              activeTab === 'buy'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black disabled:bg-emerald-900 disabled:text-emerald-700'
                : 'bg-red-500 hover:bg-red-400 text-white disabled:bg-red-900 disabled:text-red-700'
            }`}
          >
            Preview {activeTab === 'buy' ? 'Buy' : 'Sell'} {symbol.toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Slippage warning indicator ───────────────────────────── */

function SlippageWarning({ secondsLeft }: { secondsLeft: number }) {
  if (secondsLeft > 3) return null;
  return (
    <div className="text-xs text-yellow-400/80 flex items-center gap-1">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      Price refreshing soon — execution price may differ slightly
    </div>
  );
}
