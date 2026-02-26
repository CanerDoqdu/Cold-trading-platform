"use client"; // Only client-side rendering is used in this file

import { useRef, useEffect } from "react";
import Typed from "typed.js";
import { useTypedStrings } from "@/components/useTypedStrings";

const TypedAnimation = () => {
  const typedElement = useRef<HTMLSpanElement>(null);
  const { strings, isLoading } = useTypedStrings();

  useEffect(() => {
    if (typedElement.current && !isLoading) {
      const typed = new Typed(typedElement.current, {
        strings: strings,
        typeSpeed: 100,
        backSpeed: 50,
        startDelay: 500,
        backDelay: 1000,
        loop: true,
        showCursor: false,
      });

      return () => {
        typed.destroy();
      };
    }
  }, [strings, isLoading]);

  return (
    <span 
      className="text-[64px]" 
      ref={typedElement}
      style={{ 
        minHeight: '1.2em', 
        height: '1.2em',
        lineHeight: '1.2',
        display: 'inline-block',
        verticalAlign: 'top'
      }}
    >&nbsp;</span>
  );
};

export default TypedAnimation;
