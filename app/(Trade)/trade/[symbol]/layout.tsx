import type { Metadata } from 'next';

type Props = {
  params: Promise<{ symbol: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  
  return {
    title: `Trade ${upperSymbol} | COLD Crypto Exchange`,
    description: `Trade ${upperSymbol} cryptocurrency with real-time charts, order book, and secure trading on COLD. Buy and sell ${upperSymbol} instantly with advanced trading features.`,
    openGraph: {
      title: `Trade ${upperSymbol} | COLD`,
      description: `Trade ${upperSymbol} cryptocurrency with real-time charts and advanced trading tools.`,
    },
  };
}

export default function TradeSymbolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
