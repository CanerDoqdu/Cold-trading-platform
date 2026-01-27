"use client";

import { useState } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import Link from "next/link";

export default function PortfolioPage() {
  const { holdings, summary, loading, error, addHolding, removeHolding } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: "",
    buyPrice: "",
    buyDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Search for coins
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/coingecko/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.coins?.slice(0, 10) || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Select a coin from search results
  const handleSelectCoin = (coin: any) => {
    setSelectedCoin(coin);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Submit new holding
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !formData.amount || !formData.buyPrice) return;

    setSubmitting(true);
    const result = await addHolding({
      coinId: selectedCoin.id,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      amount: parseFloat(formData.amount),
      buyPrice: parseFloat(formData.buyPrice),
      buyDate: formData.buyDate,
      notes: formData.notes,
    });

    if (result.success) {
      setShowAddModal(false);
      setSelectedCoin(null);
      setFormData({
        amount: "",
        buyPrice: "",
        buyDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    setSubmitting(false);
  };

  // Handle delete
  const handleDelete = async (holdingId: string) => {
    if (confirm("Are you sure you want to remove this holding?")) {
      await removeHolding(holdingId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-48"></div>
            <div className="h-32 bg-gray-800 rounded"></div>
            <div className="h-64 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <Link href="/login" className="text-emerald-400 hover:underline mt-2 inline-block">
              Please login to view your portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2 rounded-lg transition-all"
          >
            + Add Asset
          </button>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-white">
              ${summary.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Cost</p>
            <p className="text-2xl font-bold text-white">
              ${summary.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Profit/Loss</p>
            <p className={`text-2xl font-bold ${summary.totalProfitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {summary.totalProfitLoss >= 0 ? "+" : ""}
              ${summary.totalProfitLoss.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Return %</p>
            <p className={`text-2xl font-bold ${summary.totalProfitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {summary.totalProfitLossPercent >= 0 ? "+" : ""}
              {summary.totalProfitLossPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Holdings Table */}
        {holdings.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No holdings yet</h3>
            <p className="text-gray-400 mb-6">Start building your portfolio by adding your first asset</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg transition-all"
            >
              + Add Your First Asset
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Asset</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Amount</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Buy Price</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Current Price</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Value</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">P/L</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding._id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <Link href={`/markets/${holding.coinId}`} className="flex items-center gap-3 hover:text-emerald-400 transition-colors">
                        <div>
                          <p className="font-semibold">{holding.symbol}</p>
                          <p className="text-sm text-gray-400">{holding.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-right font-medium">
                      {holding.amount.toLocaleString("en-US", { maximumFractionDigits: 8 })}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400">
                      ${holding.buyPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      ${holding.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className="py-4 px-6 text-right font-medium">
                      ${holding.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className={`font-medium ${holding.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {holding.profitLoss >= 0 ? "+" : ""}
                        ${holding.profitLoss.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-sm ${holding.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {holding.profitLossPercent >= 0 ? "+" : ""}
                        {holding.profitLossPercent.toFixed(2)}%
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(holding._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remove holding"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Asset Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add Asset</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCoin(null);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Coin Search */}
                {!selectedCoin ? (
                  <div className="relative">
                    <label className="block text-sm text-gray-400 mb-1">Search Coin</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search Bitcoin, Ethereum..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                    />
                    {searching && (
                      <div className="absolute right-3 top-9">
                        <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                        {searchResults.map((coin) => (
                          <button
                            key={coin.id}
                            type="button"
                            onClick={() => handleSelectCoin(coin)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left"
                          >
                            <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                            <div>
                              <p className="font-medium">{coin.name}</p>
                              <p className="text-sm text-gray-400">{coin.symbol.toUpperCase()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={selectedCoin.thumb} alt={selectedCoin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium">{selectedCoin.name}</p>
                        <p className="text-sm text-gray-400">{selectedCoin.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCoin(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Buy Price */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Buy Price (USD)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Buy Date */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Buy Date</label>
                  <input
                    type="date"
                    value={formData.buyDate}
                    onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g., Bought on Binance"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!selectedCoin || !formData.amount || !formData.buyPrice || submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-all"
                >
                  {submitting ? "Adding..." : "Add to Portfolio"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
