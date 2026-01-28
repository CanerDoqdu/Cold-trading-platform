"use client";

import React from "react";
import Image from "next/image";
import earn from "@/public/images/earn.svg";

const WhyCold = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950 text-gray-900 dark:text-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-500 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Our Advantages
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">
              Cold?
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-xl mx-auto">
            Experience the future of cryptocurrency with our cutting-edge platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Simplicity Card - Animated Hands */}
          <div className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-none">
            <div className="mb-6 flex justify-center">
              <div className="relative p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors duration-300 w-[160px] h-[160px]">
                {/* Background */}
                <Image
                  src="/images/simplicity-parts/Background_Simple.png"
                  alt=""
                  width={120}
                  height={140}
                  style={{ width: '140px', height: '140px' }}
                  className="absolute inset-2 object-contain opacity-80"
                />
                {/* Documents */}
                <Image
                  src="/images/simplicity-parts/Documents.png"
                  alt=""
                  width={80}
                  height={31}
                  style={{ width: '80px', height: 'auto' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain z-10"
                />
                {/* Left Hand - moves right */}
                <Image
                  src="/images/simplicity-parts/Hand_1.png"
                  alt=""
                  width={60}
                  height={100}
                  style={{ width: '60px', height: '100px' }}
                  className="absolute bottom-14 left-2 object-contain z-20 animate-[handLeft_2s_ease-in-out_infinite]"
                />
                {/* Right Hand - moves left */}
                <Image
                  src="/images/simplicity-parts/Hand_2.png"
                  alt=""
                  width={60}
                  height={100}
                  style={{ width: '60px', height: '100px' }}
                  className="absolute bottom-0 right-2 object-contain z-20 animate-[handRight_2s_ease-in-out_infinite]"
                />
                {/* Bubbles */}
                <Image
                  src="/images/simplicity-parts/Bubble_1.png"
                  alt=""
                  width={20}
                  height={20}
                  unoptimized
                  style={{ width: '20px', height: '20px' }}
                  className="absolute top-6 right-4 object-contain animate-[float_3s_ease-in-out_infinite]"
                />
                <Image
                  src="/images/simplicity-parts/Bubble_2.png"
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                  style={{ width: '16px', height: '16px' }}
                  className="absolute top-10 left-6 object-contain animate-[float_2.5s_ease-in-out_infinite_0.5s]"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
              Simplicity
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cold makes it easy to buy, sell, and trade crypto. No complexity, just results.
            </p>
          </div>
          
          {/* Earn Card - Floating Coins */}
          <div className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-none">
            <div className="mb-6 flex justify-center">
              <div className="relative p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                <Image
                  src={earn}
                  alt="Earn"
                  quality={75}
                  width={120}
                  height={120}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                {/* Floating coin overlays */}
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 animate-coin-float-1 shadow-lg shadow-emerald-500/30" />
                <div className="absolute top-6 left-1 w-3 h-3 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 animate-coin-float-2 shadow-lg shadow-emerald-500/30" />
                <div className="absolute bottom-4 right-0 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 animate-coin-float-3 shadow-lg shadow-emerald-500/30" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
              Earn
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              The ultimate destination for earning money. Stake, farm, and grow your portfolio.
            </p>
          </div>
          
          {/* Secure Card - Fingerprint Scan Animation */}
          <div className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-none">
            <div className="mb-6 flex justify-center">
              <div className="relative p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors duration-300 w-[160px] h-[160px] overflow-hidden">
                {/* Background */}
                <Image
                  src="/images/secure-parts/Background_Simple.png"
                  alt=""
                  width={140}
                  height={140}
                  unoptimized
                  style={{ width: '140px', height: '140px' }}
                  className="absolute inset-2 object-contain opacity-80"
                />
                {/* Hand with finger */}
                <Image
                  src="/images/secure-parts/Hand.png"
                  alt=""
                  width={100}
                  height={100}
                  unoptimized
                  style={{ width: '100px', height: '100px' }}
                  className="absolute bottom-0 left-1/2 -translate-x-[25%] object-contain z-30"
                />
                {/* Fingerprint */}
                <Image
                  src="/images/secure-parts/Fingerprint.png"
                  alt=""
                  width={50}
                  height={50}
                  unoptimized
                  style={{ width: '50px', height: '50px' }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 object-contain z-20"
                />
                {/* Scan ring around fingerprint */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-emerald-400/60 animate-[scanRing_2s_ease-in-out_infinite] z-30" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-emerald-400/30 animate-[scanRing_2s_ease-in-out_infinite_0.5s] z-30" />
                {/* Scan line - using transform for composited animation */}
                <div className="absolute left-4 right-4 top-[20%] h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[scanVertical_2s_ease-in-out_infinite] z-20 rounded-full shadow-lg shadow-emerald-400/50" />
                {/* Icons floating */}
                <Image
                  src="/images/secure-parts/Icon_1.png"
                  alt=""
                  width={20}
                  height={20}
                  unoptimized
                  style={{ width: '20px', height: '20px' }}
                  className="absolute top-4 right-2 object-contain animate-[float_2.5s_ease-in-out_infinite]"
                />
                <Image
                  src="/images/secure-parts/Icon_2.png"
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                  style={{ width: '18px', height: '18px' }}
                  className="absolute top-12 left-2 object-contain animate-[float_3s_ease-in-out_infinite_0.3s]"
                />
                <Image
                  src="/images/secure-parts/Icon_3.png"
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                  style={{ width: '16px', height: '16px' }}
                  className="absolute bottom-12 right-4 object-contain animate-[float_2.8s_ease-in-out_infinite_0.6s]"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
              Secure
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Bank-grade security with multi-layer protection. Your assets are always safe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyCold;
