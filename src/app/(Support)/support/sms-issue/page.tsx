'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function SmsIssuePage() {
  const [step, setStep] = useState(1);
  const [issueType, setIssueType] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSelectIssue = (type: string) => {
    setIssueType(type);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
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
          <span className="text-white">SMS Issues</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 relative">
            <Image
              src="/images/support/Group10.svg"
              alt="SMS Issues"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              SMS/Phone Code Issues
            </h1>
            <p className="text-gray-400 mt-1">
              Having trouble receiving SMS verification codes?
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1318] rounded-2xl border border-gray-800/50 p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">What's the issue?</h2>
              
              <div className="grid gap-4">
                {[
                  { id: 'not-receiving', label: 'Not receiving SMS codes', icon: '📭', desc: 'No messages arriving at all' },
                  { id: 'delayed', label: 'SMS codes are delayed', icon: '⏰', desc: 'Messages arrive too late' },
                  { id: 'wrong-number', label: 'Wrong phone number', icon: '📱', desc: 'Need to update my number' },
                  { id: 'blocked', label: 'SMS blocked by carrier', icon: '🚫', desc: 'Carrier is blocking our messages' },
                ].map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => handleSelectIssue(issue.id)}
                    className="flex items-center gap-4 p-4 bg-black/30 border border-gray-700 rounded-lg hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left"
                  >
                    <span className="text-3xl">{issue.icon}</span>
                    <div className="flex-1">
                      <span className="text-white font-medium block">{issue.label}</span>
                      <span className="text-gray-500 text-sm">{issue.desc}</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                {issueType === 'not-receiving' && 'Troubleshoot SMS Issues'}
                {issueType === 'delayed' && 'Report Delayed SMS'}
                {issueType === 'wrong-number' && 'Update Phone Number'}
                {issueType === 'blocked' && 'Carrier Block Solution'}
              </h2>

              {issueType === 'not-receiving' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <p className="text-blue-400 text-sm font-medium mb-2">Try these steps first:</p>
                  <ul className="text-blue-300/80 text-sm space-y-2 list-disc list-inside">
                    <li>Check if your phone has signal</li>
                    <li>Make sure your inbox isn't full</li>
                    <li>Check spam/blocked messages folder</li>
                    <li>Wait 2-3 minutes and try again</li>
                  </ul>
                </div>
              )}

              {issueType === 'blocked' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <p className="text-amber-400 text-sm font-medium mb-2">Carrier block detected?</p>
                  <p className="text-amber-300/80 text-sm">
                    Some carriers block short codes. Contact your carrier and ask them to whitelist messages from crypto exchanges, or switch to email/app-based 2FA.
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

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

              {issueType === 'wrong-number' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
              >
                {issueType === 'wrong-number' ? 'Request Phone Change' : 'Submit Issue Report'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Report Submitted!</h2>
              <p className="text-gray-400 mb-6">
                We've received your SMS issue report. Our team will investigate and contact you via email within 24 hours with a solution.
              </p>
              <div className="flex flex-col gap-4">
                <Link
                  href="/support/reset-phone"
                  className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  Change Phone Number Instead
                </Link>
                <Link
                  href="/support"
                  className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Back to Help Center
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
