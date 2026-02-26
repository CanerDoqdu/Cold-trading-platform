"use client";

import { useEffect, useCallback } from "react";

export default function NftScroller() {
  const setupTouchScroll = useCallback(() => {
    const scrollers = document.querySelectorAll<HTMLDivElement>(".nft-scroller");
    
    scrollers.forEach((scroller) => {
      const track = scroller.querySelector<HTMLDivElement>(".nft-track");
      if (!track) return;
      
      let isDown = false;
      let startX: number;
      let scrollLeft: number;
      
      // Touch events for mobile swipe
      scroller.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
        track.style.animationPlayState = 'paused';
      }, { passive: true });
      
      scroller.addEventListener('touchend', () => {
        isDown = false;
        setTimeout(() => {
          if (!isDown) {
            track.style.animationPlayState = 'running';
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
        track.style.animationPlayState = 'paused';
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
            track.style.animationPlayState = 'running';
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
      
      scroller.style.cursor = 'grab';
    });
  }, []);

  useEffect(() => {
    const scrollers = document.querySelectorAll<HTMLDivElement>(".nft-scroller");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scrollers.forEach((scroller) => {
        if (!scroller.hasAttribute("data-animated")) {
          scroller.setAttribute("data-animated", "true");
          
          const scrollerInner = scroller.querySelector<HTMLDivElement>(".nft-scroller__inner");
          if (scrollerInner) {
            const scrollerContent = Array.from(scrollerInner.children);
            
            // Clone each item
            scrollerContent.forEach((item) => {
              const duplicatedItem = item.cloneNode(true) as HTMLElement;
              duplicatedItem.setAttribute("aria-hidden", "true");
              // Make all focusable elements inside the clone not focusable
              const focusableElements = duplicatedItem.querySelectorAll('a, button, input, [tabindex]');
              focusableElements.forEach((el) => {
                el.setAttribute('tabindex', '-1');
              });
              scrollerInner.appendChild(duplicatedItem);
            });
          }
        }
      });
      
      setupTouchScroll();
    }
  }, [setupTouchScroll]);

  return null;
}
