import Navbar from "../components/AuthNavbar";

// Route-specific layout - NFT pages use AuthNavbar
// Global providers come from root layout automatically!
export default function NftCollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}
