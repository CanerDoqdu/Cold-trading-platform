import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/footer";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News | COLD',
};

// Route-specific layout - News pages with Navbar and Footer
// Global providers come from root layout automatically!
export default function NewsLayout({
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
