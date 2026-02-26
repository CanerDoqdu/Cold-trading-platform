import type { Metadata } from 'next';
import { BinanceWSProvider } from '@/context/BinanceWSContext';

export const metadata: Metadata = {
  title: 'Trade | Crypto Exchange',
  description: 'Advanced trading with real-time charts and order execution',
};

// Route-specific layout — Binance WebSocket for real-time prices
// Global providers come from root layout automatically!
export default function TradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BinanceWSProvider>
      {children}
    </BinanceWSProvider>
  );
}
