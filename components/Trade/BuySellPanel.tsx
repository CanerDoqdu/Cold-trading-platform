'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';

interface BuySellPanelProps {
  symbol: string;
  name: string;
  currentPrice: number;
  coinId: string;
}

export default function BuySellPanel({ symbol, name, currentPrice, coinId }: BuySellPanelProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { addHolding } = usePortfolio();

  // Spread simülasyonu
  const buyPrice = currentPrice * 1.001; // +0.1%
  const sellPrice = currentPrice * 0.999; // -0.1%
  const spread = ((buyPrice - sellPrice) / currentPrice * 100).toFixed(3);

  const effectivePrice = activeTab === 'buy' ? buyPrice : sellPrice;
  const total = amount ? (parseFloat(amount) * (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : effectivePrice)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setMessage(null);

    try {
      if (activeTab === 'buy') {
        // Portfolio'ya ekle
        const result = await addHolding({
          coinId,
          symbol: symbol.toUpperCase(),
          name,
          amount: parseFloat(amount),
          buyPrice: orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : buyPrice,
        });

        if (result.success) {
          setMessage({ type: 'success', text: `Successfully bought ${amount} ${symbol.toUpperCase()}` });
          setAmount('');
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to execute order' });
        }
      } else {
        // Sell simülasyonu (sadece mesaj göster)
        setMessage({ type: 'success', text: `Sell order for ${amount} ${symbol.toUpperCase()} would be executed at $${effectivePrice.toFixed(2)}` });
        setAmount('');
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to execute order' });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [0.001, 0.01, 0.1, 1];

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

        {/* Price Display */}
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">
              {activeTab === 'buy' ? 'Buy' : 'Sell'} Price
            </span>
            <span className="text-gray-500">Spread: {spread}%</span>
          </div>
          <div className={`text-xl font-bold ${activeTab === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
            ${effectivePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* Limit Price Input */}
          {orderType === 'limit' && (
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Limit Price (USD)</label>
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

          {/* Amount Input */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Amount ({symbol.toUpperCase()})</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Quick Amounts */}
          <div className="flex gap-2 mb-3">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(qa.toString())}
                className="flex-1 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                {qa}
              </button>
            ))}
          </div>

          {/* Total */}
          <div className="bg-gray-900 rounded-lg p-3 mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Total</span>
              <span className="text-gray-500">USD</span>
            </div>
            <div className="text-lg font-semibold text-white">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`text-xs p-2 rounded mb-3 ${
              message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !amount}
            className={`w-full py-3 rounded-lg font-bold transition-all mt-auto ${
              activeTab === 'buy'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black disabled:bg-emerald-900 disabled:text-emerald-700'
                : 'bg-red-500 hover:bg-red-400 text-white disabled:bg-red-900 disabled:text-red-700'
            }`}
          >
            {loading ? 'Processing...' : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${symbol.toUpperCase()}`}
          </button>
        </form>
      </div>
    </div>
  );
}
