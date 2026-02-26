"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Restore scroll position from sessionStorage
    const scrollPos = sessionStorage.getItem(`scroll-${pathname}`);
    if (scrollPos) {
      window.scrollY = parseInt(scrollPos, 10);
      window.scrollTo(0, parseInt(scrollPos, 10));
      sessionStorage.removeItem(`scroll-${pathname}`);
    }
  }, [pathname]);

  useEffect(() => {
    // Save scroll position before navigation
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);
}
