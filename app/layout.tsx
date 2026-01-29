import "./globals.css";
import titillium_Web from "./fonts";
import { AuthContextProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ClientProviders from "@/components/ClientProviders";
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'COLD - Crypto Trading Platform',
    template: '%s | COLD',
  },
  description: 'Trade cryptocurrencies, track markets, manage your portfolio, and stay updated with real-time crypto news on COLD.',
  keywords: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'trading', 'portfolio', 'NFT', 'DeFi', 'blockchain'],
  authors: [{ name: 'COLD Team' }],
  creator: 'COLD',
  publisher: 'COLD',
  metadataBase: new URL('https://crypto-henna-beta.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crypto-henna-beta.vercel.app',
    siteName: 'COLD',
    title: 'COLD - Crypto Trading Platform',
    description: 'Trade cryptocurrencies, track markets, and manage your portfolio.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'COLD - Crypto Trading Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COLD - Crypto Trading Platform',
    description: 'Trade cryptocurrencies, track markets, and manage your portfolio.',
    images: ['/images/og-image.png'],
    creator: '@coldcrypto',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// This is the ROOT layout - applies to ALL pages automatically
// No need to add providers to each route group!
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${titillium_Web.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party domains for faster loading */}
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="preconnect" href="https://api.opensea.io" />
        <link rel="preconnect" href="https://oauth.reddit.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://api.opensea.io" />
        <link rel="dns-prefetch" href="https://oauth.reddit.com" />
        
        {/* Prevent theme flash - runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* Global Providers - automatically available everywhere */}
        <AuthContextProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <main id="main-content">
                {children}
              </main>
            </ErrorBoundary>
            
            {/* Global Components - lazy loaded on client */}
            <ClientProviders />
          </ThemeProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
