'use client';

import React from 'react';
import Image from 'next/image';

// Animated Line Component - SVG lines with flowing water/snake animation
const AnimatedDataLines = () => {
  return (
    <>
      {/* RIGHT SIDE LINES */}
      <div className="absolute left-[160px] top-[130px] w-[320px] h-[180px] pointer-events-none scale-[0.6]">
        <style jsx global>{`
          @keyframes flowLineRight {
            0% { stroke-dashoffset: 600; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes flowLineLeft {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 600; }
          }
          .flow-line-right-1 {
            stroke-dasharray: 60 540;
            animation: flowLineRight 8s linear infinite;
          }
          .flow-line-right-2 {
            stroke-dasharray: 80 520;
            animation: flowLineRight 10s linear infinite;
          }
          .flow-line-right-3 {
            stroke-dasharray: 40 560;
            animation: flowLineRight 6s linear infinite;
          }
          .flow-line-right-4 {
            stroke-dasharray: 100 500;
            animation: flowLineRight 12s linear infinite;
          }
          .flow-line-right-5 {
            stroke-dasharray: 120 480;
            animation: flowLineRight 14s linear infinite;
          }
          .flow-line-left-1 {
            stroke-dasharray: 60 540;
            animation: flowLineLeft 8s linear infinite;
          }
          .flow-line-left-2 {
            stroke-dasharray: 80 520;
            animation: flowLineLeft 10s linear infinite;
          }
          .flow-line-left-3 {
            stroke-dasharray: 40 560;
            animation: flowLineLeft 6s linear infinite;
          }
          .flow-line-left-4 {
            stroke-dasharray: 100 500;
            animation: flowLineLeft 12s linear infinite;
          }
          .flow-line-left-5 {
            stroke-dasharray: 120 480;
            animation: flowLineLeft 14s linear infinite;
          }
        `}</style>
        
        {/* Line 1 - Top horizontal line going right */}
        <svg 
          className="absolute left-0 top-0" 
          width="350" 
          height="30" 
          viewBox="0 0 350 30" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradR1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 15 L100 15 L150 5 L350 5" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 15 L100 15 L150 5 L350 5" 
            stroke="url(#flowGradR1)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-right-1"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
        
        {/* Line 2 */}
        <svg 
          className="absolute left-0 top-[25px]" 
          width="400" 
          height="60" 
          viewBox="0 0 400 60" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradR2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 5 L80 5 L130 30 L400 30" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 5 L80 5 L130 30 L400 30" 
            stroke="url(#flowGradR2)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-right-2"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
        
        {/* Line 3 */}
        <svg 
          className="absolute left-0 top-[60px]" 
          width="420" 
          height="80" 
          viewBox="0 0 420 80" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradR3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 10 L60 10 L110 45 L200 45 L250 70 L420 70" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 10 L60 10 L110 45 L200 45 L250 70 L420 70" 
            stroke="url(#flowGradR3)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-right-3"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
        
        {/* Line 4 */}
        <svg 
          className="absolute left-0 top-[100px]" 
          width="380" 
          height="100" 
          viewBox="0 0 380 100" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradR4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 5 L40 5 L90 50 L180 50 L220 85 L380 85" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 5 L40 5 L90 50 L180 50 L220 85 L380 85" 
            stroke="url(#flowGradR4)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-right-4"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
        
        {/* Line 5 */}
        <svg 
          className="absolute left-0 top-[150px]" 
          width="350" 
          height="90" 
          viewBox="0 0 350 90" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradR5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 5 L30 5 L70 40 L150 40 L190 75 L350 75" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 5 L30 5 L70 40 L150 40 L190 75 L350 75" 
            stroke="url(#flowGradR5)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-right-5"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
      </div>
      
      {/* LEFT SIDE LINES - Mirrored */}
      <div className="absolute right-[215px] top-[130px] w-[320px] h-[180px] pointer-events-none" style={{ transform: 'scaleX(-1) scale(0.6)' }}>
        {/* Line 1 */}
        <svg 
          className="absolute left-0 top-0" 
          width="350" 
          height="30" 
          viewBox="0 0 350 30" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradL1" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 15 L100 15 L150 5 L350 5" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 15 L100 15 L150 5 L350 5" 
            stroke="url(#flowGradL1)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-left-1"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
        
        {/* Line 2 */}
        <svg 
          className="absolute left-0 top-[25px]" 
          width="400" 
          height="60" 
          viewBox="0 0 400 60" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradL2" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 5 L80 5 L130 30 L400 30" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 5 L80 5 L130 30 L400 30" 
            stroke="url(#flowGradL2)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-left-2"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
        
        {/* Line 3 */}
        <svg 
          className="absolute left-0 top-[60px]" 
          width="420" 
          height="80" 
          viewBox="0 0 420 80" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradL3" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 10 L60 10 L110 45 L200 45 L250 70 L420 70" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 10 L60 10 L110 45 L200 45 L250 70 L420 70" 
            stroke="url(#flowGradL3)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-left-3"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
        
        {/* Line 4 */}
        <svg 
          className="absolute left-0 top-[100px]" 
          width="380" 
          height="100" 
          viewBox="0 0 380 100" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradL4" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 5 L40 5 L90 50 L180 50 L220 85 L380 85" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 5 L40 5 L90 50 L180 50 L220 85 L380 85" 
            stroke="url(#flowGradL4)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-left-4"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
        
        {/* Line 5 */}
        <svg 
          className="absolute left-0 top-[150px]" 
          width="350" 
          height="90" 
          viewBox="0 0 350 90" 
          fill="none"
        >
          <defs>
            <linearGradient id="flowGradL5" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#42E8E0" stopOpacity="0.5" />
              <stop offset="15%" stopColor="#42E8E0" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#42E8E0" stopOpacity="1" />
              <stop offset="85%" stopColor="#42E8E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#42E8E0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M0 5 L30 5 L70 40 L150 40 L190 75 L350 75" 
            stroke="#42E8E0" 
            strokeWidth="1" 
            fill="none"
            opacity="0.2"
          />
          <path 
            d="M0 5 L30 5 L70 40 L150 40 L190 75 L350 75" 
            stroke="url(#flowGradL5)" 
            strokeWidth="2" 
            fill="none"
            className="flow-line-left-5"
            style={{ filter: 'drop-shadow(0 0 8px #42E8E0)' }}
          />
        </svg>
      </div>
    </>
  );
};

// Main Liquidity Illustration Component
const LiquidityIllustration = () => {
  return (
    <div className="relative w-[420px] h-[480px]  ">
      {/* Background circle left */}
      <div className="absolute left-[15px] top-[85px]">
        <Image 
          src="/images/liquidty/background circle left big.svg"
          alt="background"
          width={190}
          height={110}
          className="opacity-100"
        />
      </div>
      
      {/* Background circle right */}
      <div className="absolute right-[90px] bottom-[140px]">
        <Image 
          src="/images/liquidty/background circle right.svg"
          alt="background"
          width={130}
          height={75}
          className="opacity-100"
        />
      </div>
      
      {/* Random squares - left side */}
      <div className="absolute -left-10 top-20 animate-pulse" style={{ animationDuration: '3s' }}>
        <Image 
          src="/images/liquidty/random square bigger.svg"
          alt="decorative square"
          width={45}
          height={27}
        />
      </div>
      <div className="absolute -left-3 top-32 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
        <Image 
          src="/images/liquidty/random square.svg"
          alt="decorative square"
          width={24}
          height={15}
        />
      </div>
      
      {/* Random squares - right side */}
      <div className="absolute right-3 bottom-28 animate-bounce" style={{ animationDuration: '4s' }}>
        <Image 
          src="/images/liquidty/random square bigger.svg"
          alt="decorative square"
          width={45}
          height={27}
        />
      </div>
      <div className="absolute right-12 bottom-22 animate-pulse" style={{ animationDuration: '2s', animationDelay: '1s' }}>
        <Image 
          src="/images/liquidty/random square.svg"
          alt="decorative square"
          width={24}
          height={15}
        />
      </div>
      
      {/* Title */}
      <div className="absolute -top-4 left-0 z-30">
        <h2 className="text-3xl md:text-3xl font-bold text-white mb-2">
          <span className="inline-block border-l-4 border-white pl-4">Liquidity</span>
        </h2>
        <p className="text-sm pl-5">
          <span className="text-[#42E8E0]">More</span>{' '}
          <span className="text-gray-300">funding options</span>
        </p>
        <p className="text-xs text-gray-500 pl-5">means it&apos;s easier to get into the action</p>
      </div>
      
      {/* Magnifying Glass */}
      <div className="absolute left-16 top-[70px] z-20">
        <Image 
          src="/images/liquidty/magnifiying glass.svg"
          alt="magnifying glass"
          width={50}
          height={105}
          className="drop-shadow-2xl"
        />
      </div>
      
      {/* Computer */}
      <div className="absolute left-[50px] top-[65px] z-10">
        <Image 
          src="/images/liquidty/computer.svg"
          alt="computer illustration"
          width={235}
          height={250}
        />
      </div>
      
      {/* Animated Data Flow Lines */}
      <AnimatedDataLines />
    </div>
  );
};

// Security/Investments Illustration Component
const SecurityIllustration = () => {
  return (
    <div className="relative w-[400px] h-[450px]">
      {/* Animated vertical data lines */}
      

      {/* Main Stage - Coin Platform */}
      <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 z-10">
        <Image 
          src="/images/investments/main stage.svg"
          alt="coin platform"
          width={300}
          height={180}
          className="drop-shadow-2xl"
        />
      </div>

      {/* Top Screen */}
      <div className="absolute top-[70px] right-[100px] z-20 animate-pulse" style={{ animationDuration: '3s' }}>
        <Image 
          src="/images/investments/top screen.svg"
          alt="data screen"
          width={120}
          height={80}
          className="drop-shadow-lg"
        />
      </div>

      {/* Screen that man touches */}
      <div className="absolute top-[125px] left-[110px] z-15">
        <Image 
          src="/images/investments/screen that man touches.svg"
          alt="interactive screen"
          width={60}
          height={45}
          className="drop-shadow-lg"
        />
      </div>

      {/* Right bottom screen */}
      <div className="absolute bottom-[200px] left-[180px] z-2 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
        <Image 
          src="/images/investments/right bottom screen.svg"
          alt="data screen"
          width={80}
          height={45}
          className="drop-shadow-lg"
        />
      </div>

      {/* Random Y axis lines */}
      <div className="absolute top-[55px] left-[110px] z-0 opacity-100">
        <Image 
          src="/images/investments/random y axis lines.svg"
          alt="decorative lines"
          width={180}
          height={200}
        />
      </div>
    </div>
  );
};

// Widest Range Illustration Component
const WidestRangeIllustration = () => {
  return (
    <div className="relative w-[600px] h-[500px]">
      {/* Circuit/connection lines animation */}
      <div className="absolute inset-0 pointer-events-none">
        <style jsx>{`
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; filter: drop-shadow(0 0 4px #42E8E0); }
            50% { opacity: 1; filter: drop-shadow(0 0 12px #42E8E0); }
          }
          @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .particle {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #22d3ee;
            border-radius: 50%;
            opacity: 0.4;
          }
          .particle-1 { top: 25%; left: 15%; animation: pulse-glow 2.5s ease-in-out infinite 0s; }
          .particle-2 { top: 35%; left: 75%; animation: pulse-glow 3.2s ease-in-out infinite 0.2s; }
          .particle-3 { top: 65%; left: 25%; animation: pulse-glow 2.8s ease-in-out infinite 0.4s; }
          .particle-4 { top: 45%; left: 85%; animation: pulse-glow 3.5s ease-in-out infinite 0.6s; }
          .particle-5 { top: 75%; left: 45%; animation: pulse-glow 2.3s ease-in-out infinite 0.8s; }
          .particle-6 { top: 30%; left: 55%; animation: pulse-glow 3.0s ease-in-out infinite 1s; }
          .particle-7 { top: 55%; left: 35%; animation: pulse-glow 2.6s ease-in-out infinite 1.2s; }
          .particle-8 { top: 70%; left: 65%; animation: pulse-glow 3.3s ease-in-out infinite 1.4s; }
        `}</style>
      </div>

      {/* Main Bitcoin illustration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <Image 
          src="/images/widest range/OBJECTS.svg"
          alt="Bitcoin with circuit connections"
          width={420}
          height={420}
          className="drop-shadow-2xl"
        />
      </div>

      {/* Floating particles */}
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />
      <div className="particle particle-6" />
      <div className="particle particle-7" />
      <div className="particle particle-8" />
    </div>
  );
};

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-[#1a1f2e] overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-2 lg:px-4 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-24">
          {/* Left Content */}
          <div className="flex-1 max-w-xl pl-2 lg:pl-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Cryptocurrency and Bitcoin{' '}
              <span className="text-emerald-400">Liquidity</span>
            </h1>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-cyan-400 mb-3">
                  High trade volume, <span className="text-white">maximum cryptocurrency liquidity</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Cryptocurrency prices can change quickly. To ensure you can maximize profits, 
                  you need to move in and out of the market quickly. At Cold, our deep liquidity ensures trade
                  execution at the price you want -- with spreads as tight as 1 pip.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">
                  What is <span className="text-white">liquidity?</span>
                </h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Liquidity refers to how easily an asset can be bought or sold at a stable price on a given market. The 
                  quicker you can sell off an asset as close to your asking price as possible, the more liquid an exchange is 
                  considered to be.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Illustration - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 justify-center pt-20 lg:pt-24">
            <LiquidityIllustration />
          </div>
        </div>
      </section>
      
      {/* Security & Investments Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Content */}
          <div className="flex-1 max-w-xl order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Industry-leading security protects
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">
              your investments.
            </h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-lg md:text-xl font-semibold mb-4">
                  <span className="text-yellow-400">Safeguarding your funds, NFTs and privacy</span>{' '}
                  <span className="text-white">is our number one objective</span>
                </h4>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
                  Cold takes a comprehensive approach to protecting your investments in crypto assets and NFTs. 
                  Our team of experts have built in a number of sophisticated measures to prevent the theft of funds, NFTs, or information. 
                  Theft isn&apos;t the only threat of course.
                </p>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4 italic">
                  As a professional exchange we offer financial stability, with full reserves, healthy banking relationships and 
                  the highest standards of legal compliance.
                </p>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                  Kraken&apos;s comprehensive approach to cybersecurity and information security management systems 
                  has earned us the ISO/IEC 27001:2013 and SOC 2, Type 1 certifications. This demonstrates our ability to meet the 
                  highest international security standards, as well as our commitment to keeping your funds and information safe.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Illustration - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 justify-center lg:order-2">
            <SecurityIllustration />
          </div>
        </div>
      </section>

      {/* Widest Range Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Content */}
          <div className="flex-1 max-w-xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
              The Widest Range
            </h2>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-cyan-400 mb-8 border-l-4 border-cyan-400 pl-4">
              of Funding Options in Crypto
            </h3>
            
            <div className="space-y-8">
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Cold is dedicated to providing you with low fees and a variety of digital and fiat funding options 
                to power your cryptocurrency investments. Whether you&apos;re executing a spot trade, setting up a custom 
                order, or scheduling a recurring buy, our fast, flexible funding options make it easier than ever to 
                buy and sell crypto from anywhere in the world.
              </p>
              
              <div>
                <h4 className="text-lg md:text-xl font-semibold mb-4">
                  <span className="text-yellow-400 underline decoration-yellow-400/50">Fund Your Account</span>{' '}
                  <span className="text-white">with Traditional Currencies</span>
                </h4>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
                  Both new and experienced traders will find that our fiat currency funding options make for a 
                  seamless experience that will have you trading in a few simple steps.
                </p>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                  We offer fiat currency funding with US Dollars (USD), Euros (EUR), and Canadian Dollars (CAD), 
                  all with minimal fees. US clients (except in NY, WA & TX) may link their bank accounts to fund 
                  their Cold accounts with USD via Bank Transfer (ACH) with no fee. Depositing funds with CAD 
                  and EUR SEPA is free.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Illustration - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 justify-center">
            <WidestRangeIllustration />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-700/50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Why Choose Cold?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Experience the next generation of cryptocurrency trading with our powerful platform.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-[#232938] to-[#1a1f2e] border border-gray-700/50 rounded-2xl p-8 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast Execution</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Execute trades instantly with our high-performance matching engine designed for speed and reliability.</p>
          </div>
          
          <div className="bg-gradient-to-br from-[#232938] to-[#1a1f2e] border border-gray-700/50 rounded-2xl p-8 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Bank-Grade Security</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Your assets are protected with industry-leading security measures including cold storage and 2FA.</p>
          </div>
          
          <div className="bg-gradient-to-br from-[#232938] to-[#1a1f2e] border border-gray-700/50 rounded-2xl p-8 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Competitive Pricing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Get the best prices with our deep order books and tight spreads, ensuring maximum value for your trades.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
