import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get help with your COLD account. Find solutions for login issues, deposits, withdrawals, security settings, and more.',
};

// Route-specific layout - Support pages with Navbar and Footer
// Global providers come from root layout automatically!
export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0d14]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
