"use client";
import React, { FormEvent, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import EmailIcon from "@public/icons/Email-username.svg";
import PasswordIcon from "@public/icons/password.svg";
import { useLogin } from "@/hooks/UseLogin";
import Link from 'next/link';
import { UseAuthContext } from '@/hooks/UseAuthContext';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useLogin();
  const [mounted, setMounted] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const { dispatch } = UseAuthContext();
  const router = useRouter();

  const handleGoogleResponse = useCallback(async (response: any) => {
    setGoogleLoading(true);
    setGoogleError(null);
    
    try {
      const res = await fetch('/api/user/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google sign in failed');
      }

      // Save to localStorage and update context
      localStorage.setItem('user', JSON.stringify(data));
      dispatch({ type: 'LOGIN', payload: data });
      router.push('/');
    } catch (err: any) {
      setGoogleError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, router]);

  // Initialize Google Sign In
  useEffect(() => {
    setMounted(true);
    
    // Load Google Sign In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          use_fedcm_for_prompt: false, // Disable FedCM
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleResponse]);

  // Render Google button when script loads
  useEffect(() => {
    const renderGoogleButton = () => {
      const googleLoginBtn = document.getElementById('google-signin-btn');
      if ((window as any).google && googleLoginBtn) {
        (window as any).google.accounts.id.renderButton(
          googleLoginBtn,
          { 
            theme: 'outline', 
            size: 'large', 
            width: 320,
            type: 'standard',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'center'
          }
        );
      }
    };

    // Try to render immediately if google is already loaded
    renderGoogleButton();
    
    // Also set up a small delay in case script just loaded
    const timeout = setTimeout(renderGoogleButton, 500);
    
    return () => clearTimeout(timeout);
  }, [mounted]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(email, password);
    // Redirect is handled inside useLogin hook on success
  };

  return (
    <section className="min-h-screen bg-gray-900 flex relative">
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
              <Image src="/images/auth-parts/Background_Simple.png" alt="Background" fill className="object-contain" loading="lazy" />
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
              <Image src="/images/auth-parts/Plant.png" alt="Plant" fill className="object-contain" loading="lazy" />
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
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className={`w-full max-w-[400px] sm:max-w-[420px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Logo - Mobile */}
          <div className="lg:hidden flex items-center justify-center mb-6 sm:mb-10">
            <Image src="/images/Group.svg" width={48} height={48} alt="Cold Logo" priority />
            <span className="text-white text-2xl font-bold ml-2">COLD</span>
          </div>

          {/* Header */}
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Sign in</h1>
            <p className="text-gray-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-800 transition-all text-sm sm:text-base"
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
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-800 transition-all text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="appearance-none w-4 h-4 rounded border border-gray-600 bg-gray-800 checked:bg-emerald-600 checked:border-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 flex-shrink-0 cursor-pointer"
                style={{ minWidth: '16px', maxWidth: '16px', minHeight: '16px', maxHeight: '16px' }}
              />
              <label htmlFor="remember" className="ml-2 text-xs sm:text-sm text-gray-400">Remember me for 30 days</label>
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
              className="w-full py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:text-gray-400 text-black font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
              {/* Google Sign-In Button - Official rendered button */}
              <div 
                id="google-signin-btn" 
                className="w-full flex items-center justify-center min-h-[44px]"
              ></div>
              {googleLoading && (
                <div className="flex items-center justify-center py-2">
                  <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Google Error */}
            {googleError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {googleError}
              </div>
            )}
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
