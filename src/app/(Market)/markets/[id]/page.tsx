import CoinDetailPageSimple from '@/components/AllCryptos/CoinDetailPageSimple';
import Navbar from '@/components/AllCryptos/Navbar';

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <CoinDetailPageSimple coinId={id} />
    </div>
  );
}
