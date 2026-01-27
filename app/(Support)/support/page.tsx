'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Self-Service items data
const selfServiceItems = [
  {
    icon: '/images/support/Group.svg',
    title: 'Reset Google Authenticator',
    href: '/support/reset-authenticator'
  },
  {
    icon: '/images/support/Group2.svg',
    title: 'Unlock Account',
    href: '/support/unlock-account'
  },
  {
    icon: '/images/support/Group3.svg',
    title: 'Reset Email Address',
    href: '/support/reset-email'
  },
  {
    icon: '/images/support/Group4.svg',
    title: 'Reset Phone Verification',
    href: '/support/reset-phone'
  },
  {
    icon: '/images/support/Group5.svg',
    title: 'Reset Password',
    href: '/support/reset-password'
  },
  {
    icon: '/images/support/Group6.svg',
    title: 'Verify Account',
    href: '/support/verify-account'
  },
  {
    icon: '/images/support/Group7.svg',
    title: 'Crypto Deposit Not Credited',
    href: '/support/deposit-issue'
  },
  {
    icon: '/images/support/Group8.svg',
    title: 'Appeal P2P Performance Metrics',
    href: '/support/p2p-appeal'
  },
  {
    icon: '/images/support/Group9.svg',
    title: 'Assets Frozen Due to P2P Dispute',
    href: '/support/frozen-assets'
  },
  {
    icon: '/images/support/Group10.svg',
    title: 'Unable to Receive SMS',
    href: '/support/sms-issue'
  },
];

// FAQ items
const faqItems = [
  {
    question: 'How to get verified on Cold',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  },
  {
    question: 'How to deposit crypto on Cold',
    answer: 'To deposit crypto on Cold, navigate to your wallet, select the cryptocurrency you want to deposit, and copy your unique deposit address. Send your crypto from an external wallet to this address. Deposits are typically confirmed within minutes depending on network congestion.'
  },
  {
    question: 'How to withdraw crypto from Cold',
    answer: 'To withdraw crypto, go to your wallet and select "Withdraw". Enter the destination address, amount, and verify the transaction with your 2FA. Withdrawals are processed after security verification and may take up to 24 hours for large amounts.'
  },
  {
    question: 'How to enable Two-Factor Authentication',
    answer: 'Go to Security Settings in your account. Click on "Enable 2FA" and scan the QR code with Google Authenticator or Authy app. Enter the verification code to complete setup. We strongly recommend enabling 2FA for enhanced security.'
  },
  {
    question: 'What are the trading fees on Cold',
    answer: 'Cold offers competitive trading fees starting from 0.1% for makers and 0.15% for takers. VIP users and high-volume traders can enjoy reduced fees. Check our fee schedule page for detailed tier-based pricing.'
  },
];

// Self-Service Card Component
function ServiceCard({ icon, title, href }: { icon: string; title: string; href: string }) {
  return (
    <Link 
      href={href}
      className="group flex flex-col items-center p-6 bg-gradient-to-br from-[#1a1f2e]/50 to-transparent rounded-xl border border-gray-800/30 hover:border-purple-500/30 transition-all duration-300 hover:bg-[#1a1f2e]/80"
    >
      <div className="w-16 h-16 mb-4 relative group-hover:scale-110 transition-transform duration-300">
        <Image
          src={icon}
          alt={title}
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-white text-sm font-medium text-center leading-tight group-hover:text-purple-400 transition-colors">
        {title}
      </h3>
    </Link>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer, isOpen, onClick }: { 
  question: string; 
  answer: string; 
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-gray-800/50">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <h3 className="text-white font-semibold text-base group-hover:text-purple-400 transition-colors">
          {question}
        </h3>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-gray-400 text-sm leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would go here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] pt-24 pb-16">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Help Center
        </h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
          <div className="flex-1 relative">
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles"
              className="w-full pl-12 pr-4 py-3 bg-[#1a1f2e] border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700/50 transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      {/* Self-Service Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        <h2 className="text-2xl font-bold text-white mb-8">Self-Service</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {selfServiceItems.map((item, index) => (
            <ServiceCard key={index} {...item} />
          ))}
        </div>
      </section>

      {/* Getting Started / FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl font-bold text-white mb-8">Getting Started</h2>
        
        <div className="bg-gradient-to-br from-[#1a1f2e]/80 to-[#0f1318] rounded-2xl border border-gray-800/50 p-6 md:p-8">
          {faqItems.map((item, index) => (
            <FAQItem 
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openFAQ === index}
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
            />
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-16">
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl border border-purple-500/20 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Still need help?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Our support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/support/chat"
              className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Live Chat
            </Link>
            <Link 
              href="/support/ticket"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg border border-gray-700/50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Submit Ticket
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
