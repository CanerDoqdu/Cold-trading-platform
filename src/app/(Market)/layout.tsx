import { WebSocketProvider } from "@/components/WebSocketContext";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cryptocurrency Markets',
  description: 'View real-time cryptocurrency prices, market cap, and trading volume for Bitcoin, Ethereum, and thousands of altcoins.',
};

// Route-specific layout - WebSocket is only needed for Markets pages
// Global providers come from root layout automatically!
export default function MarketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
}
