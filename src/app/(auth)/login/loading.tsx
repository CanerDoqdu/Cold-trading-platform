import React from 'react';

export default function LoginLoading() {
  return (
    <section className="min-h-screen bg-gray-900 flex relative overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 items-center justify-center overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-[120px] animate-pulse" />
        <div className="relative z-10 w-full max-w-xl px-12 animate-pulse">
          <div className="h-[420px] mb-8 flex items-end justify-center">
            <div className="w-[280px] h-[380px] rounded-[3rem] bg-gray-800/80" />
          </div>
          <div className="space-y-4 text-center">
            <div className="h-10 w-80 bg-gray-800 rounded-xl mx-auto" />
            <div className="h-5 w-96 bg-gray-800 rounded-xl mx-auto" />
          </div>
          <div className="flex justify-center gap-12 mt-10">
            <div className="space-y-2">
              <div className="h-8 w-16 bg-gray-800 rounded mx-auto" />
              <div className="h-4 w-20 bg-gray-800 rounded mx-auto" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-gray-800 rounded mx-auto" />
              <div className="h-4 w-20 bg-gray-800 rounded mx-auto" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-gray-800 rounded mx-auto" />
              <div className="h-4 w-20 bg-gray-800 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[400px] sm:max-w-[420px] animate-pulse">
          <div className="lg:hidden flex items-center justify-center mb-6 sm:mb-10">
            <div className="w-12 h-12 bg-gray-800 rounded-xl" />
            <div className="h-8 w-24 bg-gray-800 rounded ml-2" />
          </div>

          <div className="mb-6 sm:mb-10 space-y-3">
            <div className="h-10 w-40 bg-gray-800 rounded-xl" />
            <div className="h-5 w-64 bg-gray-800 rounded-xl" />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-800 rounded" />
              <div className="h-12 w-full bg-gray-800/70 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-800 rounded" />
              <div className="h-12 w-full bg-gray-800/70 rounded-lg" />
            </div>
            <div className="h-4 w-44 bg-gray-800 rounded" />
            <div className="h-12 w-full bg-emerald-500/35 rounded-lg mt-2" />
            <div className="h-12 w-full bg-gray-800 rounded-lg" />
            <div className="h-4 w-40 bg-gray-800 rounded mx-auto" />
          </div>

          <div className="mt-8 text-center">
            <div className="h-4 w-56 bg-gray-800 rounded mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
