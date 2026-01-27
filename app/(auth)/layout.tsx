import { ErrorBoundary } from "@/components/ErrorBoundary";
import ScrollPreserver from "@/components/ScrollPreserver";

// Auth layout - minimal, no ChatBot or Cookie consent needed
// Global providers (Auth, Theme) come from root layout automatically!
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollPreserver>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </ScrollPreserver>
  );
}
