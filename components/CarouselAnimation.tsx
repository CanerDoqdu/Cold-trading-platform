// app/components/ScrollerAnimation.tsx
"use client";

import { useEffect } from "react";

interface ScrollerAnimationProps {
  coinData?: unknown[];
}

const ScrollerAnimation: React.FC<ScrollerAnimationProps> = () => {
  useEffect(() => {
    const scrollers = document.querySelectorAll<HTMLDivElement>(".scroller");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // İlk yüklemede bir kez animasyonu başlatın
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

            // İçeriği klonlayarak sonsuz bir kaydırma efekti yaratıyoruz.
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
        }, 0); // Render tamamlandıktan sonra çalışması için setTimeout kullanıyoruz.

        // İlk yüklemede bir kez başlat
        scrollers[0].setAttribute("data-initialized", "true");
      }
    }
  }, []);

  return null; // Görsel içerik üretmiyoruz, sadece animasyonu uyguluyoruz.
};

export default ScrollerAnimation;
