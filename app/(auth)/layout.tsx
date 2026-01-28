import { ErrorBoundary } from "@/components/ErrorBoundary";
import ScrollPreserver from "@/components/ScrollPreserver";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in or create an account to access COLD crypto trading platform. Secure authentication for your cryptocurrency portfolio.',
};

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
        <main>
          {children}
        </main>
      </ErrorBoundary>
    </ScrollPreserver>
  );
}
