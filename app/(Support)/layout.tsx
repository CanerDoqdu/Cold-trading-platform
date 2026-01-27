import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/footer";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | COLD',
};

// Route-specific layout - Support pages with Navbar and Footer
// Global providers come from root layout automatically!
export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
