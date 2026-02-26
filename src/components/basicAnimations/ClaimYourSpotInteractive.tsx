// components/ClaimYourSpotInteractive.tsx
"use client"; // This indicates that this component runs on the client side.

import React from "react";
import useHover from "@/components/basicAnimations/useHover"; // Import the custom hook

const ClaimYourSpotInteractive = () => {
  const { isHovered, bind } = useHover(); // Destructure the returned object

  return (
    <div className="relative inline-block">
      <button
        {...bind}
        className={`relative z-10 p-4 bg-blue-600 text-white font-semibold rounded-lg focus:outline-none transition-transform duration-300 ${isHovered ? '-translate-y-6' : 'translate-y-0'}`}
      >
        <span className="transition-transform duration-300 transform">
          Click Me
        </span>
      </button>
      <span
        className={`absolute left-0 right-0 transition-transform duration-300 transform ${isHovered ? 'translate-y-0' : 'translate-y-6'}`}
        style={{ top: '100%' }}
      >
        Join Us
      </span>
    </div>
  );
};

export default ClaimYourSpotInteractive;
