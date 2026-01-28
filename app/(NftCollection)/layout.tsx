import Navbar from "../components/Navbar";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NFT Collections',
  description: 'Explore top NFT collections with real-time floor prices, trading volume, and market data from leading NFT marketplaces.',
};

// Route-specific layout - NFT pages use main Navbar
// Global providers come from root layout automatically!
export default function NftCollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-white dark:bg-black min-h-screen">
      <Navbar />
      {children}
    </main>
  );
}
