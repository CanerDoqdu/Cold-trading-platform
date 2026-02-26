import React from 'react';

export default function SignupLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d131d] to-[#1a1f2e] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Header skeleton */}
        <div className="mb-8 text-center">
          <div className="h-8 w-32 bg-gray-700 rounded-md mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-48 bg-gray-700 rounded-md mx-auto animate-pulse" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-4">
          {/* Name field */}
          <div>
            <div className="h-4 w-12 bg-gray-700 rounded-md mb-2 animate-pulse" />
            <div className="h-10 w-full bg-gray-700 rounded-md animate-pulse" />
          </div>

          {/* Email field */}
          <div>
            <div className="h-4 w-16 bg-gray-700 rounded-md mb-2 animate-pulse" />
            <div className="h-10 w-full bg-gray-700 rounded-md animate-pulse" />
          </div>

          {/* Password field */}
          <div>
            <div className="h-4 w-20 bg-gray-700 rounded-md mb-2 animate-pulse" />
            <div className="h-10 w-full bg-gray-700 rounded-md animate-pulse" />
          </div>

          {/* Confirm Password field */}
          <div>
            <div className="h-4 w-28 bg-gray-700 rounded-md mb-2 animate-pulse" />
            <div className="h-10 w-full bg-gray-700 rounded-md animate-pulse" />
          </div>

          {/* Submit button */}
          <div className="h-10 w-full bg-blue-600/50 rounded-md animate-pulse mt-6" />
        </div>

        {/* Footer skeleton */}
        <div className="mt-6 text-center">
          <div className="h-4 w-40 bg-gray-700 rounded-md mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
