import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade | Crypto Exchange',
  description: 'Advanced trading with real-time charts and order execution',
};

// Route-specific layout - no special wrapper needed
// Global providers come from root layout automatically!
export default function TradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
