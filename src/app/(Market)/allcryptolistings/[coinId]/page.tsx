import Navbar from '@/components/AllCryptos/Navbar';
import CoinDetailPageAdvanced from '@/components/AllCryptos/CoinDetailPageAdvanced';

export default async function CoinPage({ params }: { params: Promise<{ coinId: string }> }) {
  const { coinId } = await params;
  
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <CoinDetailPageAdvanced coinId={coinId} />
    </div>
  );
}
