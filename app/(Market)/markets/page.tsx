import Navbar from '@/components/AllCryptos/Navbar';
import TrendingCard from '@/components/AllCryptos/TrendingCard';
import Tabs from '@/components/AllCryptos/Tabs';
import CryptoTable from '@/components/AllCryptos/CryptoTable';
import PurpleSnakeAnimation from '@/components/AllCryptos/PurpleSnakeAnimation';

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

          {/* Trending Card with Dual Snake Animation (Yin-Yang) */}
          <div className="mb-8 relative">
            <p className="text-sm font-semibold text-white mb-3 absolute -top-8 left-0">Trending</p>
            <PurpleSnakeAnimation dualSnakes>
              <div className="bg-black rounded-lg p-6 border border-gray-800">
                <TrendingCard />
              </div>
            </PurpleSnakeAnimation>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <Tabs />
          </div>

          {/* Crypto Table - Has single snake animation */}
          <div>
            <CryptoTable />
          </div>
        </div>
      </div>
    </div>
  );
}
