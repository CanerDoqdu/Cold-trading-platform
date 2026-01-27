'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function DepositIssuePage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    transactionId: '',
    amount: '',
    currency: '',
    network: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
            Help Center
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white">Deposit Issue</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 relative">
            <Image
              src="/images/support/Group7.svg"
              alt="Deposit Issue"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Deposit Not Credited
            </h1>
            <p className="text-gray-400 mt-1">
              Report a missing deposit
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <p className="text-blue-400 font-medium mb-1">Before submitting:</p>
              <ul className="text-blue-300/80 space-y-1 list-disc list-inside">
                <li>Check if the transaction has enough confirmations</li>
                <li>Verify you sent to the correct address and network</li>
                <li>Wait at least 1 hour for network congestion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1318] rounded-2xl border border-gray-800/50 p-6 md:p-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction ID / Hash
                  </label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    placeholder="0x..."
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="">Select currency</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDT">Tether (USDT)</option>
                    <option value="USDC">USD Coin (USDC)</option>
                    <option value="SOL">Solana (SOL)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Network Used
                  </label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({...formData, network: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="">Select network</option>
                    <option value="ERC20">Ethereum (ERC20)</option>
                    <option value="TRC20">Tron (TRC20)</option>
                    <option value="BEP20">BNB Smart Chain (BEP20)</option>
                    <option value="SOL">Solana</option>
                    <option value="BTC">Bitcoin</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Any additional information about the deposit..."
                    rows={4}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
              >
                Submit Deposit Issue
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Issue Reported!</h2>
              <p className="text-gray-400 mb-2">
                Ticket #DPT-{Date.now().toString().slice(-6)}
              </p>
              <p className="text-gray-400 mb-6">
                Our team will investigate and credit your account within 24-72 hours if the transaction is valid.
              </p>
              <Link
                href="/support"
                className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Help Center
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
