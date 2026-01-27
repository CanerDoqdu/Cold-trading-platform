'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function UnlockAccountPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
          <span className="text-white">Unlock Account</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 relative">
            <Image
              src="/images/support/Group2.svg"
              alt="Unlock Account"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Unlock Account
            </h1>
            <p className="text-gray-400 mt-1">
              Request to unlock your locked account
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1318] rounded-2xl border border-gray-800/50 p-6 md:p-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Lock (if known)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="">Select a reason</option>
                  <option value="too-many-attempts">Too many login attempts</option>
                  <option value="suspicious-activity">Suspicious activity detected</option>
                  <option value="security-concern">Security concern</option>
                  <option value="unknown">I don't know</option>
                </select>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  <strong>Note:</strong> Account unlocking may take up to 24 hours. You will receive an email confirmation once your account is unlocked.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
              >
                Submit Unlock Request
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Request Submitted!</h2>
              <p className="text-gray-400 mb-6">
                We've received your unlock request. Our team will review it and you'll receive an email at <span className="text-white">{email}</span> within 24 hours.
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
