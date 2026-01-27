export const metadata = {
  title: 'Profile - COLD',
  description: 'Manage your COLD profile and account settings',
}

// Route-specific layout - just wrapper styling
// Global providers come from root layout automatically!
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-black min-h-screen">
      {children}
    </div>
  );
}
