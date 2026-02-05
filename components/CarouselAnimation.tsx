// app/components/ScrollerAnimation.tsx
"use client";

import { useEffect, useCallback } from "react";

interface ScrollerAnimationProps {
  coinData?: unknown[];
}

const ScrollerAnimation: React.FC<ScrollerAnimationProps> = () => {
  const setupTouchScroll = useCallback(() => {
    const scrollers = document.querySelectorAll<HTMLDivElement>(".scroller");
    
    scrollers.forEach((scroller) => {
      const scrollerInner = scroller.querySelector<HTMLUListElement>(".scroller__inner");
      if (!scrollerInner) return;
      
      let isDown = false;
      let startX: number;
      let scrollLeft: number;
      let animationPaused = false;
      
      // Touch events for mobile swipe
      scroller.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
        scrollerInner.style.animationPlayState = 'paused';
        animationPaused = true;
      }, { passive: true });
      
      scroller.addEventListener('touchend', () => {
        isDown = false;
        // Resume animation after 2 seconds
        setTimeout(() => {
          if (!isDown) {
            scrollerInner.style.animationPlayState = 'running';
            animationPaused = false;
          }
        }, 2000);
      }, { passive: true });
      
      scroller.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - scroller.offsetLeft;
        const walk = (x - startX) * 2;
        scroller.scrollLeft = scrollLeft - walk;
      }, { passive: true });
      
      // Mouse events for desktop drag
      scroller.addEventListener('mousedown', (e) => {
        isDown = true;
        scroller.style.cursor = 'grabbing';
        startX = e.pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
        scrollerInner.style.animationPlayState = 'paused';
      });
      
      scroller.addEventListener('mouseleave', () => {
        isDown = false;
        scroller.style.cursor = 'grab';
      });
      
      scroller.addEventListener('mouseup', () => {
        isDown = false;
        scroller.style.cursor = 'grab';
        setTimeout(() => {
          if (!isDown) {
            scrollerInner.style.animationPlayState = 'running';
          }
        }, 2000);
      });
      
      scroller.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroller.offsetLeft;
        const walk = (x - startX) * 2;
        scroller.scrollLeft = scrollLeft - walk;
      });
      
      // Set initial cursor style
      scroller.style.cursor = 'grab';
    });
  }, []);

  useEffect(() => {
    const scrollers = document.querySelectorAll<HTMLDivElement>(".scroller");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (
        scrollers.length > 0 &&
        !scrollers[0].hasAttribute("data-initialized")
      ) {
        setTimeout(() => {
          scrollers.forEach((scroller) => {
            scroller.setAttribute("data-animated", "true");

            const scrollerInner =
              scroller.querySelector<HTMLUListElement>(".scroller__inner");
            const scrollerContent = Array.from(scrollerInner?.children || []);

            scrollerContent.forEach((item) => {
              const duplicatedItem = item.cloneNode(true) as HTMLElement;
              duplicatedItem.setAttribute("aria-hidden", "true");
              // Make all focusable elements inside the clone not focusable
              const focusableElements = duplicatedItem.querySelectorAll('a, button, input, [tabindex]');
              focusableElements.forEach((el) => {
                el.setAttribute('tabindex', '-1');
              });
              // Also handle if the item itself is a link
              if (duplicatedItem.tagName === 'A' || duplicatedItem.tagName === 'LI') {
                const links = duplicatedItem.querySelectorAll('a');
                links.forEach((link) => {
                  link.setAttribute('tabindex', '-1');
                });
              }
              scrollerInner?.appendChild(duplicatedItem);
            });
          });
          
          // Setup touch scroll after cloning
          setupTouchScroll();
        }, 0);

        scrollers[0].setAttribute("data-initialized", "true");
      }
    }
  }, [setupTouchScroll]);

  return null;
};

export default ScrollerAnimation;
