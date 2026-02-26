"use client";

import { useEffect } from "react";

const useScrollPosition = (slug: string) => {
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(`scrollPosition-${slug}`);
    
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
    }

    const handleScroll = () => {
      sessionStorage.setItem(`scrollPosition-${slug}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [slug]);
};

export default useScrollPosition;
