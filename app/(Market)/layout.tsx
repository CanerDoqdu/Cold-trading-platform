import { WebSocketProvider } from "@/components/WebSocketContext";

export const metadata = {
  title: 'Markets - COLD',
  description: 'Cryptocurrency markets and prices',
}

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
