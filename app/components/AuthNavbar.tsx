"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UseAuthContext } from "@/hooks/UseAuthContext";
import { Uselogout } from "@/hooks/UseLogout";
import logo from "@/public/images/Group.svg";
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { state } = UseAuthContext();
  const { user } = state;
  const { logout } = Uselogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const isNftRankingsPage = pathname.startsWith('/nftrankings/') && pathname.split('/').length === 3;

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
    <div className="relative">
      <div className={`h-16 ${isNftRankingsPage ? "bg-transparent" : "bg-[#0d131d]"} transition-all absolute top-0 left-0 right-0 z-20`}>
        <div className="flex justify-between items-center w-4/5 max-w-[1036px] h-full mx-auto">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center">
              <Image
                src={logo}
                alt="Picture of the logo"
                priority
                style={{ width: "30px", height: "auto" }}
              />
              <span className="text-textPrimary text-center text-xl font-semibold pl-2 mt-1">
                COLD
              </span>
            </div>
          </Link>
          
          {/* Auth Section */}
          {!user ? (
            <div className="flex gap-4">
              <Link
                href="/signup"
                className="text-black font-bold bg-emerald-500 hover:bg-emerald-400 hover:border-b-emerald-600
                  border-b-4 rounded-md border-b-emerald-700 px-6 py-1.5 text-xs"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="text-white bg-gray-800 hover:bg-gray-700 hover:border-b-gray-600
                  border-b-4 rounded-md border-b-gray-900 px-6 py-1.5 text-xs font-semibold"
              >
                Login
              </Link>
            </div>
          ) : (
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
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm">Profile</span>
                    </Link>
                    <Link
                      href="/profile/account-info"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">Settings</span>
                    </Link>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
