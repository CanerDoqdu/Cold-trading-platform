"use client";
import React, { FormEvent, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import EmailIcon from "@/public/icons/Email-username.svg";
import PasswordIcon from "@/public/icons/password.svg";
import { useSignup } from "@/hooks/UseSignup";
import Link from 'next/link';
import { UseAuthContext } from '@/hooks/UseAuthContext';
import { useRouter } from 'next/navigation';

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { signup, error, isLoading } = useSignup();
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
        throw new Error(data.error || 'Google sign up failed');
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

  const handleGoogleClick = () => {
    if ((window as any).google) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render the button in a popup-like way
          const googleLoginBtn = document.getElementById('google-signup-btn');
          if (googleLoginBtn) {
            (window as any).google.accounts.id.renderButton(
              googleLoginBtn,
              { theme: 'outline', size: 'large', width: '100%', type: 'standard' }
            );
            googleLoginBtn.querySelector('div')?.click();
          }
        }
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (!name.trim()) {
      setPasswordError("Please enter your name");
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    await signup(name, email, password);
  };

  return (
    <section className="min-h-screen bg-gray-100 flex relative">
      {/* Logo - Top Left - Link to Homepage */}
      <Link 
        href="/" 
        className={`absolute top-6 left-12 z-50 flex items-center gap-2 group transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        <Image 
          src="/images/groupblack.svg" 
          width={36} 
          height={36} 
          alt="Cold Logo" 
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-gray-900 text-xl font-bold group-hover:text-emerald-600 transition-colors">
          COLD
        </span>
      </Link>

      {/* Left Side - Illustration Area */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-gray-50 via-white to-gray-100 items-center justify-center overflow-hidden">
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full" style={{ 
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)',
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
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/20 rounded-[100%] blur-md z-10 transition-opacity duration-1000 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          {/* Text Content */}
          <div className={`transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start Your <span className="text-emerald-600">Crypto Journey</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Join thousands of users tracking and managing their crypto portfolios
            </p>
          </div>

          {/* Stats */}
          <div className={`flex justify-center gap-12 mt-10 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">10K+</p>
              <p className="text-sm text-gray-400">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">500+</p>
              <p className="text-sm text-gray-400">Coins Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">$2B+</p>
              <p className="text-sm text-gray-400">Assets Managed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="hidden lg:block absolute left-1/2 xl:left-[55%] top-0 h-full w-px">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-gray-300/50 to-transparent" />
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-6 py-12 bg-white">
        <div className={`w-full max-w-[420px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Logo - Mobile */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Image src="/images/groupblack.svg" width={40} height={40} alt="Cold Logo" priority />
            <span className="text-gray-900 text-xl font-bold ml-2">COLD</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Create account</h1>
            <p className="text-gray-500">
              Get started with your free account today.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Image src={EmailIcon} alt="Email" width={18} height={18} className="opacity-40" />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Image src={PasswordIcon} alt="Password" width={18} height={18} className="opacity-40" />
                </span>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Image src={PasswordIcon} alt="Password" width={18} height={18} className="opacity-40" />
                </span>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white transition-all"
                  required
                />
              </div>
              {password !== confirmPassword && confirmPassword && (
                <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-0.5 rounded border-gray-300 bg-gray-50 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-500">
                I agree to the <a href="#" className="text-emerald-600 hover:text-emerald-700">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</a>
              </label>
            </div>

            {/* Error */}
            {(error || passwordError) && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {passwordError || error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : 'Create account'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">or</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3">
              {/* Hidden container for Google button fallback */}
              <div id="google-signup-btn" className="hidden"></div>
              <button 
                type="button" 
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all disabled:opacity-50"
              >
                {googleLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                    <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                    <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                    <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                  </svg>
                )}
                Continue with Google
              </button>
            </div>

            {/* Google Error */}
            {googleError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {googleError}
              </div>
            )}
          </form>

          {/* Sign In */}
          <p className="mt-8 text-center text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Sign in</Link>
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

export default Signup;
