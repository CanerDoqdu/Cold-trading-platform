'use client';

import dynamic from 'next/dynamic';

// Lazy load non-critical components on client side only
const ChatBot = dynamic(() => import('@/components/LiveChat/ChatBot'), {
  ssr: false,
});
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), {
  ssr: false,
});

export default function ClientProviders() {
  return (
    <>
      <ChatBot />
      <CookieConsent />
    </>
  );
}
