"use client";

import { useEffect } from "react";

const ScrollPositionHandler = ({ slug }: { slug: string }) => {
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(`scrollPosition-${slug}`);

    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
    }

    const handleScroll = () => {
      // Convert the scrollY value to string before storing it
      sessionStorage.setItem(`scrollPosition-${slug}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [slug]);

  return null; 
};

export default ScrollPositionHandler;
