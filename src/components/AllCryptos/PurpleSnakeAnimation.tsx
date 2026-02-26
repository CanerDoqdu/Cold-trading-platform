'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Map distance along rectangle perimeter with rounded corners (clockwise from top-left)
function pointOnPerimeter(x: number, y: number, w: number, h: number, distance: number, borderRadius: number = 12): Point {
  const r = Math.min(borderRadius, Math.min(w, h) / 2);
  
  // Lengths of each segment
  const topStraight = w - 2 * r;
  const rightStraight = h - 2 * r;
  const bottomStraight = w - 2 * r;
  const leftStraight = h - 2 * r;
  const cornerArc = (Math.PI / 2) * r; // Quarter circle arc length
  
  const perimeter = topStraight + rightStraight + bottomStraight + leftStraight + 4 * cornerArc;
  const d = ((distance % perimeter) + perimeter) % perimeter;
  
  let accumulated = 0;
  
  // Top straight (left to right)
  if (d <= accumulated + topStraight) {
    return { x: x + r + (d - accumulated), y };
  }
  accumulated += topStraight;
  
  // Top-right corner
  if (d <= accumulated + cornerArc) {
    const angle = -Math.PI / 2 + ((d - accumulated) / r);
    return { 
      x: x + w - r + Math.cos(angle) * r, 
      y: y + r + Math.sin(angle) * r 
    };
  }
  accumulated += cornerArc;
  
  // Right straight (top to bottom)
  if (d <= accumulated + rightStraight) {
    return { x: x + w, y: y + r + (d - accumulated) };
  }
  accumulated += rightStraight;
  
  // Bottom-right corner
  if (d <= accumulated + cornerArc) {
    const angle = 0 + ((d - accumulated) / r);
    return { 
      x: x + w - r + Math.cos(angle) * r, 
      y: y + h - r + Math.sin(angle) * r 
    };
  }
  accumulated += cornerArc;
  
  // Bottom straight (right to left)
  if (d <= accumulated + bottomStraight) {
    return { x: x + w - r - (d - accumulated), y: y + h };
  }
  accumulated += bottomStraight;
  
  // Bottom-left corner
  if (d <= accumulated + cornerArc) {
    const angle = Math.PI / 2 + ((d - accumulated) / r);
    return { 
      x: x + r + Math.cos(angle) * r, 
      y: y + h - r + Math.sin(angle) * r 
    };
  }
  accumulated += cornerArc;
  
  // Left straight (bottom to top)
  if (d <= accumulated + leftStraight) {
    return { x, y: y + h - r - (d - accumulated) };
  }
  accumulated += leftStraight;
  
  // Top-left corner
  const angle = Math.PI + ((d - accumulated) / r);
  return { 
    x: x + r + Math.cos(angle) * r, 
    y: y + r + Math.sin(angle) * r 
  };
}

// Calculate perimeter with rounded corners
function getPerimeter(w: number, h: number, borderRadius: number = 12): number {
  const r = Math.min(borderRadius, Math.min(w, h) / 2);
  const topStraight = w - 2 * r;
  const rightStraight = h - 2 * r;
  const bottomStraight = w - 2 * r;
  const leftStraight = h - 2 * r;
  const cornerArc = (Math.PI / 2) * r;
  return topStraight + rightStraight + bottomStraight + leftStraight + 4 * cornerArc;
}

interface PurpleSnakeAnimationProps {
  children: React.ReactNode;
  trendingRef?: React.RefObject<HTMLDivElement>;
  newsRef?: React.RefObject<HTMLDivElement>;
  nftRef?: React.RefObject<HTMLDivElement>;
  dualSnakes?: boolean; // Yin-yang style dual snakes
}

export default function PurpleSnakeAnimation({ children, trendingRef, newsRef, nftRef, dualSnakes = false }: PurpleSnakeAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Determine if we're in multi-section mode (homepage) or single-container mode (markets)
  const isMultiSection = !!(trendingRef && newsRef && nftRef);

  const snakeStateRef = useRef({
    position: 0,
    speed: 150,
    length: 200,
  });

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());
  const isVisibleRef = useRef(true);
  const mountTimeRef = useRef<number>(Date.now());
  
  // Animation state
  const [opacity, setOpacity] = useState(1);
  const [currentSection, setCurrentSection] = useState<'trending' | 'news' | 'nft'>('trending');
  const [animationPhase, setAnimationPhase] = useState<'fadeIn' | 'animate' | 'fadeOut'>('fadeIn');
  const sectionStartTimeRef = useRef<number>(Date.now());
  const phaseStartTimeRef = useRef<number>(Date.now());
  
  const ANIMATION_TIME = 6; // 6 seconds per section
  const FADE_DURATION = 1.0; // 1 second for fade (increased for smoother effect)
  const SECTION_COLOR: Record<'trending' | 'news' | 'nft', string> = {
    trending: '#10b981', // emerald-500
    news: '#34d399',     // emerald-400
    nft: '#059669',      // emerald-600
  };

  // Setup canvas
  useEffect(() => {
    const setup = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setCanvasSize({ w: rect.width, h: rect.height });

      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;

      lastTimeRef.current = Date.now();
      mountTimeRef.current = Date.now();
    };

    const timeout = setTimeout(setup, 50);
    window.addEventListener('resize', setup);

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        lastTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', setup);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Single-container mode: simple continuous animation
  useEffect(() => {
    if (isMultiSection) return;

    const fadeInterval = setInterval(() => {
      const elapsed = (Date.now() - mountTimeRef.current) / 1000;
      setOpacity(Math.min(elapsed / 3, 1));
    }, 16);

    return () => clearInterval(fadeInterval);
  }, [isMultiSection]);

  // Multi-section mode: handle animation phases
  useEffect(() => {
    if (!isMultiSection) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedInPhase = (now - phaseStartTimeRef.current) / 1000;

      if (animationPhase === 'fadeIn') {
        setOpacity(1);
        phaseStartTimeRef.current = Date.now();
        setAnimationPhase('animate');
      } else if (animationPhase === 'animate') {
        setOpacity(1);
        if (elapsedInPhase >= ANIMATION_TIME) {
          phaseStartTimeRef.current = Date.now();
          setAnimationPhase('fadeOut');
        }
      } else if (animationPhase === 'fadeOut') {
        const fadeProgress = Math.min(elapsedInPhase / FADE_DURATION, 1);
        setOpacity(Math.max(1 - fadeProgress, 0));
        if (fadeProgress >= 1) {
          setCurrentSection((prev) => {
            let next: 'trending' | 'news' | 'nft';
            if (prev === 'trending') next = 'news';
            else if (prev === 'news') next = 'nft';
            else next = 'trending';
            return next;
          });
          // Reset path for next section start; snake is invisible here
          snakeStateRef.current.position = 0;
          sectionStartTimeRef.current = Date.now();
          phaseStartTimeRef.current = Date.now();
          setAnimationPhase('fadeIn');
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isMultiSection, animationPhase]);

  // Get active bounds based on section
  const getActiveBounds = (): Bounds => {
    if (!isMultiSection) {
      return { x: 0, y: 0, w: canvasSize.w, h: canvasSize.h };
    }

    let ref;
    if (currentSection === 'trending') ref = trendingRef;
    else if (currentSection === 'news') ref = newsRef;
    else ref = nftRef;

    if (!ref?.current) {
      return { x: 0, y: 0, w: 0, h: 0 };
    }

    const sectionRect = ref.current.getBoundingClientRect();
    // Always use (0,0,width,height) for the section, so the snake traces the outer border
    return {
      x: 0,
      y: 0,
      w: sectionRect.width,
      h: sectionRect.height,
    };
  };

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || canvasSize.w <= 0 || canvasSize.h <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const now = Date.now();
      let deltaTime = (now - lastTimeRef.current) / 1000;

      if (deltaTime > 0.05) {
        lastTimeRef.current = now;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastTimeRef.current = now;

      const activeBounds = getActiveBounds();

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Only draw if we have valid bounds
      if (activeBounds.w <= 0 || activeBounds.h <= 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const borderRadius = 12; // Match the rounded-lg border radius
      const perimeter = getPerimeter(activeBounds.w, activeBounds.h, borderRadius);

      // Update position for animate phase only
      if (isMultiSection && animationPhase === 'animate') {
        snakeStateRef.current.position += snakeStateRef.current.speed * deltaTime;
      } else if (!isMultiSection) {
        // Single container: loop continuously
        snakeStateRef.current.position = (snakeStateRef.current.position + snakeStateRef.current.speed * deltaTime) % perimeter;
      }

      // Function to draw a single snake
      const drawSnake = (positionOffset: number, colorKey: 'trending' | 'news' | 'nft' = currentSection) => {
        const headPos = (snakeStateRef.current.position + positionOffset) % perimeter;
        const snakeLength = dualSnakes ? 150 : snakeStateRef.current.length; // Shorter snakes for dual mode
        const tailPos = isMultiSection 
          ? Math.max(0, headPos - snakeLength)
          : (headPos - snakeLength + perimeter) % perimeter;

        const actualLength = isMultiSection 
          ? headPos - tailPos 
          : snakeLength;
        
        const samples = 60; // More samples for smooth rounded corners
        const fadeLength = 0.12; // Fade first/last 12% of the snake

        // Draw snake segments with varying opacity for soft head/tail
        for (let i = 0; i < samples; i++) {
          const ratio1 = i / samples;
          const ratio2 = (i + 1) / samples;
          
          let currentPos1, currentPos2;
          
          if (isMultiSection) {
            currentPos1 = tailPos + actualLength * ratio1;
            currentPos2 = tailPos + actualLength * ratio2;
            if (currentPos1 > headPos) break;
          } else {
            currentPos1 = (tailPos + actualLength * ratio1) % perimeter;
            currentPos2 = (tailPos + actualLength * ratio2) % perimeter;
          }
          
          const point1 = pointOnPerimeter(activeBounds.x, activeBounds.y, activeBounds.w, activeBounds.h, currentPos1, borderRadius);
          const point2 = pointOnPerimeter(activeBounds.x, activeBounds.y, activeBounds.w, activeBounds.h, isMultiSection ? Math.min(currentPos2, headPos) : currentPos2, borderRadius);

          // Calculate opacity for this segment (fade at head and tail)
          let segmentAlpha = 1;
          if (ratio1 < fadeLength) {
            // Tail fade - ease in
            segmentAlpha = ratio1 / fadeLength;
            segmentAlpha = segmentAlpha * segmentAlpha; // Quadratic easing
          } else if (ratio1 > 1 - fadeLength) {
            // Head fade - ease out
            segmentAlpha = (1 - ratio1) / fadeLength;
            segmentAlpha = segmentAlpha * segmentAlpha; // Quadratic easing
          }

          ctx.beginPath();
          ctx.moveTo(point1.x, point1.y);
          ctx.lineTo(point2.x, point2.y);
          
          ctx.strokeStyle = SECTION_COLOR[colorKey];
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowBlur = 10;
          ctx.shadowColor = SECTION_COLOR[colorKey];
          ctx.globalAlpha = opacity * segmentAlpha * 0.9;
          ctx.stroke();
        }
      };

      // Draw snake(s)
      if (dualSnakes) {
        // Yin-yang style: two snakes 180 degrees apart
        drawSnake(0, 'trending');
        drawSnake(perimeter / 2, 'news'); // Second snake uses different color
      } else {
        drawSnake(0);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasSize, isMultiSection, animationPhase, currentSection, opacity, dualSnakes]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full" 
    >
      <div className="relative z-0">
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5, // Lower than navbar dropdown (z-50)
          }}
        />
        {children}
      </div>
    </div>
  );
}
