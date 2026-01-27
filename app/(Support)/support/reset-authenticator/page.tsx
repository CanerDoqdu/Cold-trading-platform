'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ResetAuthenticatorPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Handle verification
      console.log('Verification submitted');
    }
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
          <span className="text-white">Reset Google Authenticator</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 relative">
            <Image
              src="/images/support/Group.svg"
              alt="Reset Authenticator"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Reset Google Authenticator
            </h1>
            <p className="text-gray-400 mt-1">
              Lost access to your authenticator app? We can help.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-700'}`}>1</div>
            <span className="hidden sm:inline">Verify Identity</span>
          </div>
          <div className="flex-1 h-px bg-gray-700" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-700'}`}>2</div>
            <span className="hidden sm:inline">Confirmation</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1318] rounded-2xl border border-gray-800/50 p-6 md:p-8">
          {step === 1 ? (
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
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  <strong>Important:</strong> For security, you may need to complete additional verification steps including ID verification.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
              >
                Send Verification Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">
                  We sent a verification code to <span className="text-white">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
              >
                Verify & Reset
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Still having trouble?{' '}
            <Link href="/support/chat" className="text-emerald-400 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
