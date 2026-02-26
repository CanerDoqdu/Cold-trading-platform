import Navbar from '@/components/AllCryptos/Navbar';
import TrendingCard from '@/components/AllCryptos/TrendingCard';
import Tabs from '@/components/AllCryptos/Tabs';
import CryptoTable from '@/components/AllCryptos/CryptoTable';

export default function AllCryptolistingsPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 pt-20">
            <h1 className="text-4xl font-medium text-white mb-2">All Cryptocurrencies</h1>
            <p className="text-gray-400">View a full list of active cryptocurrencies</p>
          </div>

          {/* Trending Card */}
          <div className="mb-8">
            <TrendingCard />
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <Tabs />
          </div>

          <div>
            <CryptoTable />
          </div>
        </div>
      </div>
    </div>
  );
}
