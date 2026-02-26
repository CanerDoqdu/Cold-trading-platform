import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your COLD profile, portfolio, favorites, and account settings. Track your crypto investments and trading history.',
};

// Route-specific layout - just wrapper styling
// Global providers come from root layout automatically!
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="bg-black min-h-screen">
      {children}
    </main>
  );
}
