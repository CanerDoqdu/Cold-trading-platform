import Navbar from "../components/Navbar";
import Footer from "../components/footer";

// Route-specific layout - only contains components unique to this route group
// Global providers (Auth, Theme, ChatBot, CookieConsent) come from root layout automatically!
export default function HomePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
