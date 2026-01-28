import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/footer";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn Crypto',
  description: 'Learn about cryptocurrency trading, blockchain technology, DeFi, NFTs, and investment strategies with our educational guides.',
};

// Route-specific layout - Learn pages with Navbar and Footer
// Global providers come from root layout automatically!
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
