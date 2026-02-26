// components/ClaimYourSpotSection.tsx
"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import Link from "next/link";
import Image from "next/image";

// Memoized Avatar component to prevent re-renders
const Avatar = memo(({ 
  src, 
  alt, 
  size, 
  className 
}: { 
  src: string; 
  alt: string; 
  size: number; 
  className?: string;
}) => (
  <Image 
    src={src} 
    alt={alt} 
    width={size}
    height={size}
    className={className || "w-full h-full object-cover"}
    loading="lazy"
    quality={60}
    sizes={`${size}px`}
  />
));
Avatar.displayName = 'Avatar';

// Loading skeleton for the section
const EngagementSkeleton = () => (
  <div className="py-24 px-6 bg-gradient-to-b from-slate-50 dark:from-black via-slate-100 dark:via-gray-950 to-white dark:to-black overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="lg:flex lg:items-center lg:gap-16">
        {/* Left Side Skeleton */}
        <div className="flex-1 lg:pr-8 animate-pulse">
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-800 rounded mb-4" />
          <div className="h-12 w-3/4 bg-gray-300 dark:bg-gray-800 rounded mb-2" />
          <div className="h-12 w-2/3 bg-gray-300 dark:bg-gray-800 rounded mb-6" />
          <div className="space-y-2 mb-8">
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-800 rounded" />
            <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-800 rounded" />
            <div className="h-4 w-4/5 bg-gray-300 dark:bg-gray-800 rounded" />
          </div>
          <div className="h-14 w-48 bg-gray-300 dark:bg-gray-800 rounded-xl mb-12" />
          <div className="flex gap-8 pt-8 border-t border-gray-200 dark:border-gray-800/50">
            <div className="space-y-2">
              <div className="h-8 w-16 bg-gray-300 dark:bg-gray-800 rounded" />
              <div className="h-3 w-20 bg-gray-300 dark:bg-gray-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-gray-300 dark:bg-gray-800 rounded" />
              <div className="h-3 w-24 bg-gray-300 dark:bg-gray-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-12 bg-gray-300 dark:bg-gray-800 rounded" />
              <div className="h-3 w-16 bg-gray-300 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
        
        {/* Right Side - Circle Skeleton */}
        <div className="flex-1 mt-16 lg:mt-0 flex items-center justify-center">
          <div className="relative w-[380px] h-[380px] lg:w-[520px] lg:h-[520px]">
            <div className="absolute inset-0 border border-gray-300 dark:border-gray-700/30 rounded-full bg-gray-200/20 dark:bg-gray-900/20 animate-pulse" />
            <div className="absolute inset-[26%] border border-gray-300 dark:border-gray-700/40 rounded-full bg-gray-200/30 dark:bg-gray-900/30 animate-pulse" />
            <div className="absolute inset-[43%] bg-gray-300 dark:bg-gray-800 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ClaimYourSpotSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Real profile images
  const outerAvatars = [
    "/images/avatars/pexels-olly-3777952.jpg",
    "/images/avatars/pexels-emir94x-3796217.jpg",
    "/images/avatars/pexels-kelly-3812011.jpg",
    "/images/avatars/pexels-phamthe-31607534.jpg",
    "/images/avatars/pexels-anna-nekrashevich-6801642.jpg",
    "/images/avatars/pexels-pranavdigwal-32976.jpg",
    "/images/avatars/pexels-olenkabohovyk-3646160.jpg",
    "/images/avatars/pexels-pixabay-532220.jpg",
  ];

  const innerAvatars = [
    "/images/avatars/pexels-linkedin-2182970.jpg",
    "/images/avatars/pexels-alipazani-2811087.jpg",
    "/images/avatars/pexels-stefanstefancik-91227.jpg",
    "/images/avatars/pexels-gabby-k-5876695.jpg",
    "/images/avatars/pexels-mastercowley-1300402.jpg",
  ];

  const centerAvatars = [
    "/images/avatars/pexels-hannah-nelson-390257-1065084.jpg",
    "/images/avatars/pexels-moose-photos-170195-1587009.jpg",
    "/images/avatars/pexels-nappy-936090.jpg",
    "/images/avatars/pexels-snapwire-286309.jpg",
  ];

  // Intersection Observer - start animations only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Preload images when section comes into view
          const allImages = [...outerAvatars, ...innerAvatars, ...centerAvatars];
          let loadedCount = 0;
          allImages.forEach((src) => {
            const img = new window.Image();
            img.onload = () => {
              loadedCount++;
              if (loadedCount === allImages.length) {
                setImagesLoaded(true);
              }
            };
            img.src = src;
          });
          // Fallback - show content after 500ms even if images aren't loaded
          setTimeout(() => setImagesLoaded(true), 500);
        }
      },
      { 
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0.1 
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Show skeleton until visible and images start loading
  if (!isVisible) {
    return (
      <section ref={sectionRef}>
        <EngagementSkeleton />
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="py-24 px-6 bg-gradient-to-b from-slate-50 dark:from-black via-slate-100 dark:via-gray-950 to-white dark:to-black overflow-hidden"
    >
      <style jsx>{`
        @keyframes orbitOuter {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitInner {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes counterRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes counterRotateReverse {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .orbit-outer {
          animation: orbitOuter 50s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .orbit-inner {
          animation: orbitInner 35s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .counter-rotate {
          animation: counterRotate 50s linear infinite;
          will-change: transform;
        }
        .counter-rotate-reverse {
          animation: counterRotateReverse 35s linear infinite;
          will-change: transform;
        }
        .paused {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        <div className="lg:flex lg:items-center lg:gap-16">
          {/* Left Side - Content */}
          <div className="flex-1 lg:pr-8">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-4 block">
              Join The Movement
            </span>
            <h3 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Be Part of the
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                Future of Finance
              </span>
            </h3>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
              Join millions of traders, investors, and enthusiasts who are 
              building wealth together. Get access to exclusive insights, 
              real-time market data, and a community that has your back.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link 
                href="/signup"
                className="group relative bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-bold py-4 px-10 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Join Now — It&apos;s Free
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
            
            {/* Social Proof Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800/50">
              <div className="group">
                <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-400 transition-colors">2M+</p>
                <p className="text-gray-500 text-sm mt-1">Active Traders</p>
              </div>
              <div className="group">
                <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-400 transition-colors">$5B+</p>
                <p className="text-gray-500 text-sm mt-1">Trading Volume</p>
              </div>
              <div className="group">
                <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-400 transition-colors">150+</p>
                <p className="text-gray-500 text-sm mt-1">Countries</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Community Circle Visualization - Hidden on small screens */}
          <div className="hidden md:flex flex-1 mt-16 lg:mt-0 items-center justify-center relative">
            <div className={`relative w-[380px] h-[380px] lg:w-[520px] lg:h-[520px] transition-opacity duration-500 ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl" />
              
              {/* Outer Ring Border */}
              <div className="absolute inset-0 border border-gray-700/30 rounded-full" />
              
              {/* Outer Ring - Rotating Container */}
              <div className={`absolute inset-0 orbit-outer ${!imagesLoaded ? 'paused' : ''}`}>
                {outerAvatars.map((src, i) => {
                  const angle = (i * 360) / outerAvatars.length - 90;
                  const radius = 220;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                      }}
                    >
                      <div className={`w-14 h-14 lg:w-[72px] lg:h-[72px] -translate-x-1/2 -translate-y-1/2 counter-rotate ${!imagesLoaded ? 'paused' : ''} rounded-full overflow-hidden border-2 border-white/80 shadow-xl shadow-black/50 bg-gray-900`}>
                        <Avatar 
                          src={src} 
                          alt={`Community member ${i + 1}`} 
                          size={72}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Middle Ring Border */}
              <div className="absolute inset-[26%] border border-gray-700/40 rounded-full" />
              
              {/* Middle Ring - Rotating Container (opposite direction) */}
              <div className={`absolute inset-0 orbit-inner ${!imagesLoaded ? 'paused' : ''}`}>
                {innerAvatars.map((src, i) => {
                  const angle = (i * 360) / innerAvatars.length - 90 + 36;
                  const radius = 130;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                      }}
                    >
                      <div className={`w-12 h-12 lg:w-16 lg:h-16 -translate-x-1/2 -translate-y-1/2 counter-rotate-reverse ${!imagesLoaded ? 'paused' : ''} rounded-full overflow-hidden border-2 border-white/80 shadow-xl shadow-black/50 bg-gray-900`}>
                        <Avatar 
                          src={src} 
                          alt={`Community member ${i + 9}`} 
                          size={64}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Inner Ring Border */}
              <div className="absolute inset-[40%] border border-emerald-500/30 rounded-full" />
              
              {/* Center - Main CTA */}
              <div className="absolute inset-[43%] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-full border border-emerald-500/50 shadow-2xl shadow-emerald-500/20 flex flex-col items-center justify-center">
                <div className="text-center p-3">
                  <div className="flex -space-x-2 justify-center mb-2">
                    {centerAvatars.map((src, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden border-2 border-white/80 bg-gray-800 shadow-md"
                      >
                        <Avatar 
                          src={src} 
                          alt="" 
                          size={32}
                        />
                      </div>
                    ))}
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gray-800 border-2 border-white/80 flex items-center justify-center text-[9px] lg:text-[10px] text-gray-400 font-medium shadow-md">
                      +2M
                    </div>
                  </div>
                  <p className="text-white font-semibold text-xs lg:text-sm">Join Them</p>
                </div>
              </div>
              
              {/* Subtle pings - only when loaded */}
              {imagesLoaded && (
                <>
                  <div className="absolute top-8 right-8 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
                  <div className="absolute bottom-12 left-6 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }} />
                </>
              )}
            </div>
            
            {/* Skeleton overlay while loading */}
            {!imagesLoaded && (
              <div className="absolute w-[380px] h-[380px] lg:w-[520px] lg:h-[520px]">
                <div className="absolute inset-0 border border-gray-700/30 rounded-full bg-gray-900/20 animate-pulse" />
                <div className="absolute inset-[26%] border border-gray-700/40 rounded-full bg-gray-900/30 animate-pulse" />
                <div className="absolute inset-[43%] bg-gray-800 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="mt-20 pt-12 border-t border-gray-800/50">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-60">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Trusted By</p>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              <span className="font-semibold">Secure</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              <span className="font-semibold">Protected</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
              <span className="font-semibold">Transparent</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              <span className="font-semibold">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClaimYourSpotSection;
