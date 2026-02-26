'use client';

import { useEffect, useRef, memo, useState } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use Intersection Observer for lazy loading
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(currentContainer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const widgetContainer = widgetRef.current;
    if (!widgetContainer) return;

    // Remove previous script if exists
    if (scriptRef.current && scriptRef.current.parentNode) {
      scriptRef.current.parentNode.removeChild(scriptRef.current);
      scriptRef.current = null;
    }

    // Clear widget container
    widgetContainer.innerHTML = '';

    // Delay script loading to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!widgetRef.current) return;
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: `BINANCE:${symbol.toUpperCase()}USDT`,
        interval: '15',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        gridColor: 'rgba(30, 30, 30, 1)',
        allow_symbol_change: true,
        calendar: false,
        support_host: 'https://www.tradingview.com',
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        hide_volume: false,
        withdateranges: true,
        details: true,
        hotlist: false,
        studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
      });

      script.onload = () => setIsLoading(false);
      script.onerror = () => setIsLoading(false);
      
      widgetRef.current.appendChild(script);
      scriptRef.current = script;
      
      // Hide loading after a short delay even if onload doesn't fire
      setTimeout(() => setIsLoading(false), 2000);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [symbol, isVisible]);

  return (
    <div className="tradingview-widget-container h-full w-full relative" ref={containerRef}>
      {/* Loading overlay - positioned absolutely so it doesn't interfere with widget */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      )}
      {/* Widget container - always in DOM, managed by TradingView */}
      <div 
        ref={widgetRef}
        className="tradingview-widget-container__widget h-full w-full"
        suppressHydrationWarning
      />
    </div>
  );
}

export default memo(TradingViewWidget);
