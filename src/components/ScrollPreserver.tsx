"use client";

import { useEffect } from "react";

export default function ScrollPreserver({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Restore scroll position after hydration
    const savedScroll = sessionStorage.getItem("scrollPos");
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
        sessionStorage.removeItem("scrollPos");
      }, 0);
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem("scrollPos", window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <>{children}</>;
}
