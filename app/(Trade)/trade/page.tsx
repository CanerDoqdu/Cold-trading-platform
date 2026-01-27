import { redirect } from 'next/navigation';

// Varsayılan olarak BTC'ye yönlendir
export default function TradePage() {
  redirect('/trade/btc');
}
