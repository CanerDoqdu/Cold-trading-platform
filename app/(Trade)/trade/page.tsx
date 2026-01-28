import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade',
  description: 'Trade cryptocurrencies with real-time charts, order books, and advanced trading tools. Buy and sell Bitcoin, Ethereum, and more.',
};

// Varsayılan olarak BTC'ye yönlendir
export default function TradePage() {
  redirect('/trade/btc');
}
