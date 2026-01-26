"use client";
import React, { FormEvent, useState, useEffect } from "react";
import Image from "next/image";
import EmailIcon from "@/public/icons/Email-username.svg";
import PasswordIcon from "@/public/icons/password.svg";
import { useLogin } from "@/hooks/UseLogin";
import Link from 'next/link';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useLogin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(email, password);
    // Redirect is handled inside useLogin hook on success
  };

  return (
    <section className="min-h-screen bg-gray-900 flex relative">
      {/* Logo - Top Left - Link to Homepage */}
      <Link 
        href="/" 
        className={`absolute top-6 left-12 z-50 flex items-center gap-2 group transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        <Image 
          src="/images/Group.svg" 
          width={36} 
          height={36} 
          alt="Cold Logo" 
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-white text-xl font-bold group-hover:text-emerald-400 transition-colors">
          COLD
        </span>
      </Link>

      {/* Left Side - Illustration Area */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 items-center justify-center overflow-hidden">
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-[120px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-12">
          
          {/* Character Scene */}
          <div className="relative h-[420px] mb-8 flex items-end justify-center">
            
            {/* Background Simple - Behind Character */}
            <div 
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[460px] h-[400px] z-0 transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            >
              <Image src="/images/auth-parts/Background_Simple.png" alt="Background" fill className="object-contain" />
            </div>

            {/* Padlock - On top of Background */}
            <div 
              className={`absolute top-4 left-1/2 -translate-x-1/2 w-16 h-20 z-10 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}
              style={{ animation: mounted ? 'float 3s ease-in-out infinite' : 'none' }}
            >
              <Image src="/images/auth-parts/Padlock.png" alt="Padlock" fill className="object-contain drop-shadow-2xl" />
            </div>

            {/* Plant Left */}
            <div 
              className={`absolute bottom-0 left-0 w-28 h-40 z-20 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ animation: mounted ? 'sway 4s ease-in-out infinite' : 'none' }}
            >
              <Image src="/images/auth-parts/Plant.png" alt="Plant" fill className="object-contain" />
            </div>

            {/* Character */}
            <div 
              className={`relative w-[280px] h-[380px] z-20 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            >
              <Image src="/images/auth-parts/Character.png" alt="Character" fill className="object-contain object-bottom" />
            </div>

            {/* Floating Money Top Left */}
            <div 
              className={`absolute top-20 left-4 w-28 h-32 z-30 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
              style={{ animation: mounted ? 'floatRotate 4s ease-in-out infinite' : 'none' }}
            >
              <Image src="/images/auth-parts/Money.png" alt="Money" fill className="object-contain drop-shadow-xl" />
            </div>

            {/* Floating Money Left Lower */}
            <div 
              className={`absolute top-44 -left-4 w-24 h-28 z-30 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}
              style={{ animation: mounted ? 'floatRotate 5s ease-in-out infinite 0.7s' : 'none' }}
            >
              <Image src="/images/auth-parts/Money.png" alt="Money" fill className="object-contain drop-shadow-lg opacity-70" />
            </div>

            {/* Password */}
            <div 
              className={`absolute bottom-28 right-4 w-10 h-10 z-30 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
              style={{ animation: mounted ? 'float 3.5s ease-in-out infinite 0.4s' : 'none' }}
            >
              <Image src="/images/auth-parts/Password.png" alt="Password" fill className="object-contain drop-shadow-lg" />
            </div>

            {/* Shadow */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/30 rounded-[100%] blur-md z-10 transition-opacity duration-1000 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          {/* Text Content */}
          <div className={`transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-3xl font-bold text-white mb-4">
              Your Crypto Journey <span className="text-emerald-400">Starts Here</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Track, analyze, and manage your cryptocurrency portfolio with real-time insights
            </p>
          </div>

          {/* Stats */}
          <div className={`flex justify-center gap-12 mt-10 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-sm text-gray-500">Coins Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">$2B+</p>
              <p className="text-sm text-gray-500">Assets Managed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="hidden lg:block absolute left-1/2 xl:left-[55%] top-0 h-full w-px">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-gray-700/30 to-transparent" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-6 py-12">
        <div className={`w-full max-w-[420px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Logo - Mobile */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Image src="/images/Group.svg" width={40} height={40} alt="Cold Logo" priority />
            <span className="text-white text-xl font-bold ml-2">COLD</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">Sign in</h1>
            <p className="text-gray-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Image src={EmailIcon} alt="Email" width={18} height={18} className="opacity-50" />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-800 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300">Forgot?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Image src={PasswordIcon} alt="Password" width={18} height={18} className="opacity-50" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-800 transition-all"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-400">Remember me for 30 days</label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-500">or</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3">
              <button type="button" className="w-full flex items-center justify-center gap-3 py-3.5 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg text-white font-medium transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7## C1.2369655,17.3349879 L5.27698177,14.2678769 Z"/>
                </svg>
                Continue with Google
              </button>
              <button type="button" className="w-full flex items-center justify-center gap-3 py-3.5 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg text-white font-medium transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>
          </form>

          {/* Sign Up */}
          <p className="mt-8 text-center text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign up</Link>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatRotate {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `}</style>
    </section>
  );
};

export default Login;
