"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Here you could send to error tracking service (Sentry, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Beautiful default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-4 relative overflow-hidden">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          <div className="relative z-10 max-w-lg w-full">
            {/* Glowing Card */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 via-orange-500/30 to-yellow-500/30 rounded-3xl blur-xl opacity-70" />
              
              {/* Card content */}
              <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 md:p-10 shadow-2xl">
                {/* Animated Error Icon */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-orange-500/20 animate-ping" style={{ animationDelay: '0.2s' }} />
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
                      <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Error Code Badge */}
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                    ERROR_BOUNDARY_CAUGHT
                  </span>
                </div>

                {/* Text Content */}
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Oops! Something broke
                </h1>
                <p className="text-gray-400 text-center mb-8 leading-relaxed">
                  Don&apos;t worry, it&apos;s not you — it&apos;s us. Our team has been notified and we&apos;re working on a fix.
                </p>

                {/* Error details (dev only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-6 bg-black/50 rounded-xl p-4 border border-gray-800">
                    <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Developer Details
                    </summary>
                    <pre className="mt-3 text-xs text-red-400 font-mono overflow-auto max-h-32 p-2 bg-gray-900/50 rounded-lg">
                      {this.state.error.message}
                      {this.state.error.stack && `\n\n${this.state.error.stack}`}
                    </pre>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reload Page
                    </span>
                  </button>
                  <Link
                    href="/"
                    className="flex-1 bg-gray-800/80 hover:bg-gray-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 text-center border border-gray-700/50 hover:border-gray-600 hover:scale-[1.02]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Go Home
                    </span>
                  </Link>
                </div>

                {/* Try Again Link */}
                <button
                  onClick={this.handleReset}
                  className="mt-6 w-full text-sm text-gray-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 group"
                >
                  <svg className="w-4 h-4 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Try rendering again
                </button>
              </div>
            </div>

            {/* Help text */}
            <p className="text-center text-gray-600 text-xs mt-6">
              If this keeps happening, please{' '}
              <Link href="/support" className="text-emerald-500 hover:text-emerald-400 underline">
                contact support
              </Link>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
