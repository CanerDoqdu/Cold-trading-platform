'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '@/public/images/Group.svg';
import { UseAuthContext } from '@/hooks/UseAuthContext';
import { Uselogout } from '@/hooks/UseLogout';
import NotificationDropdown from '@/components/NotificationDropdown';
import ThemeToggle from '@/components/ThemeToggle';

interface ProfileNavProps {
  children: React.ReactNode;
}

// Loading skeleton for profile content
export const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 bg-gray-800 rounded-full" />
      <div className="space-y-2">
        <div className="h-6 w-40 bg-gray-800 rounded" />
        <div className="h-4 w-56 bg-gray-800 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-24 bg-gray-800 rounded-xl" />
      <div className="h-24 bg-gray-800 rounded-xl" />
      <div className="h-24 bg-gray-800 rounded-xl" />
    </div>
    <div className="h-64 bg-gray-800 rounded-xl" />
  </div>
);

const navItems = [
  { href: '/profile', label: 'Overview', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { href: '/profile/portfolio', label: 'Portfolio', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { href: '/profile/explore', label: 'Explore', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )},
  { href: '/profile/account-info', label: 'Account Info', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
];

// Quick links to main site sections
const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Markets' },
  { href: '/trade', label: 'Trade' },
  { href: '/news', label: 'News' },
  { href: '/support', label: 'Support' },
];

export default function ProfileNav({ children }: ProfileNavProps) {
  const pathname = usePathname();
  const { state } = UseAuthContext();
  const { user } = state;
  const { logout } = Uselogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-black min-h-screen">
      {/* Top Navbar */}
      <div className="bg-[#0d131d] h-16 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-full">
          {/* Logo + Quick Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="COLD Logo"
                priority
                style={{ width: "30px", height: "auto" }}
              />
              <span className="text-white text-xl font-semibold pl-2 mt-1">
                COLD
              </span>
            </Link>

            {/* Quick Links to Main Site */}
            <div className="hidden lg:flex items-center gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side - User Avatar/Dropdown */}
          <div className="flex items-center gap-4">
            {!user ? (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href="/signup"
                  className="text-black font-bold bg-emerald-500 hover:bg-emerald-400 hover:border-b-emerald-600
                    border-b-4 rounded-md border-b-emerald-700 px-5 py-1.5 text-xs"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="text-white bg-gray-800 hover:bg-gray-700 hover:border-b-gray-600
                    border-b-4 rounded-md border-b-gray-900 px-5 py-1.5 text-xs font-semibold"
                >
                  Login
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Notification Bell */}
                <NotificationDropdown />
                
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  {/* User Avatar Button */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-all group"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {getInitials(user.name || user.email)}
                    </div>
                    {/* Name */}
                    <span className="text-gray-300 text-sm font-medium max-w-[150px] truncate hidden sm:block">
                      {user.name || user.email}
                    </span>
                    {/* Dropdown Arrow */}
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-white font-medium text-sm truncate">{user.name || 'User'}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/markets"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm">Markets</span>
                      </Link>
                      <Link
                        href="/nftrankings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">NFT Rankings</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-800 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="flex justify-around py-2">
          {/* Home Button */}
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-all text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          {navItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'text-emerald-400' 
                    : 'text-gray-500'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
