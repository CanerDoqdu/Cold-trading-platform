'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

// Map distance along rounded rectangle perimeter (clockwise from top-left)
// r = corner radius
function pointOnRoundedPerimeter(w: number, h: number, distance: number, r: number): Point {
  // Clamp radius to half the smaller dimension
  const radius = Math.min(r, w / 2, h / 2);
  
  // Calculate segment lengths
  const cornerArc = (Math.PI / 2) * radius; // Quarter circle arc length
  const topEdge = w - 2 * radius;
  const rightEdge = h - 2 * radius;
  const bottomEdge = w - 2 * radius;
  const leftEdge = h - 2 * radius;
  
  const totalPerimeter = topEdge + rightEdge + bottomEdge + leftEdge + 4 * cornerArc;
  let d = ((distance % totalPerimeter) + totalPerimeter) % totalPerimeter;
  
  // Top edge (left to right)
  if (d <= topEdge) {
    return { x: radius + d, y: 0 };
  }
  d -= topEdge;
  
  // Top-right corner arc
  if (d <= cornerArc) {
    const angle = -Math.PI / 2 + (d / radius);
    return {
      x: w - radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius,
    };
  }
  d -= cornerArc;
  
  // Right edge (top to bottom)
  if (d <= rightEdge) {
    return { x: w, y: radius + d };
  }
  d -= rightEdge;
  
  // Bottom-right corner arc
  if (d <= cornerArc) {
    const angle = 0 + (d / radius);
    return {
      x: w - radius + Math.cos(angle) * radius,
      y: h - radius + Math.sin(angle) * radius,
    };
  }
  d -= cornerArc;
  
  // Bottom edge (right to left)
  if (d <= bottomEdge) {
    return { x: w - radius - d, y: h };
  }
  d -= bottomEdge;
  
  // Bottom-left corner arc
  if (d <= cornerArc) {
    const angle = Math.PI / 2 + (d / radius);
    return {
      x: radius + Math.cos(angle) * radius,
      y: h - radius + Math.sin(angle) * radius,
    };
  }
  d -= cornerArc;
  
  // Left edge (bottom to top)
  if (d <= leftEdge) {
    return { x: 0, y: h - radius - d };
  }
  d -= leftEdge;
  
  // Top-left corner arc
  const angle = Math.PI + (d / radius);
  return {
    x: radius + Math.cos(angle) * radius,
    y: radius + Math.sin(angle) * radius,
  };
}

type Section = 'trending' | 'news' | 'nft';

interface HeroSnakeAnimationProps {
  trendingRef: React.RefObject<HTMLDivElement>;
  newsRef: React.RefObject<HTMLDivElement>;
  nftRef: React.RefObject<HTMLDivElement>;
}

const SECTION_ORDER: Section[] = ['trending', 'news', 'nft'];

const SECTION_COLORS: Record<Section, string> = {
  trending: '#10b981', // emerald-500
  news: '#34d399',     // emerald-400 (brighter)
  nft: '#059669',      // emerald-600 (darker)
};

// Duration settings
const FADE_IN_DURATION = 1.5;   // seconds to fade in (slower)
const TRAVEL_DURATION = 8.0;   // seconds to travel along border (slower)
const FADE_OUT_DURATION = 1.5; // seconds to fade out (slower)
const PAUSE_BETWEEN = 0.1;     // minimal pause before next section
const TRAVEL_DISTANCE_RATIO = 0.75; // Travel 75% of perimeter (top + right + bottom, stop before going up)
const CORNER_RADIUS = 20; // Match the rounded-[20px] border radius

export default function HeroSnakeAnimation({
  trendingRef,
  newsRef,
  nftRef,
}: HeroSnakeAnimationProps) {
  const [currentSection, setCurrentSection] = useState<Section>('trending');
  const [phase, setPhase] = useState<'fadeIn' | 'travel' | 'fadeOut' | 'pause'>('fadeIn');
  const [opacity, setOpacity] = useState(0);
  const [snakePosition, setSnakePosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const phaseStartRef = useRef<number>(Date.now());
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Wait for refs to be ready before starting animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (trendingRef.current && newsRef.current && nftRef.current) {
        phaseStartRef.current = Date.now();
        lastTimeRef.current = Date.now();
        setIsReady(true);
      }
    }, 500); // Wait 500ms for layout to settle
    
    return () => clearTimeout(timer);
  }, [trendingRef, newsRef, nftRef]);

  const getRefForSection = useCallback((section: Section) => {
    if (section === 'trending') return trendingRef;
    if (section === 'news') return newsRef;
    return nftRef;
  }, [trendingRef, newsRef, nftRef]);

  // Animation loop
  useEffect(() => {
    if (!isReady) return;
    
    const animate = () => {
      const now = Date.now();
      const elapsedInPhase = (now - phaseStartRef.current) / 1000;
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Get speed for movement
      const ref = getRefForSection(currentSection);
      let speed = 0;
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const perimeter = 2 * (rect.width + rect.height);
        const maxDistance = perimeter * TRAVEL_DISTANCE_RATIO;
        speed = maxDistance / TRAVEL_DURATION;
      }

      if (phase === 'fadeIn') {
        const progress = Math.min(elapsedInPhase / FADE_IN_DURATION, 1);
        setOpacity(progress);
        // Move while fading in
        setSnakePosition((prev) => prev + speed * deltaTime);
        if (progress >= 1) {
          phaseStartRef.current = Date.now();
          setPhase('travel');
        }
      } else if (phase === 'travel') {
        setOpacity(1);
        // Move snake along perimeter - no limit, keep moving
        setSnakePosition((prev) => prev + speed * deltaTime);
        
        // Check if we've traveled enough to start fading out
        if (elapsedInPhase >= TRAVEL_DURATION) {
          phaseStartRef.current = Date.now();
          setPhase('fadeOut');
        }
      } else if (phase === 'fadeOut') {
        const progress = Math.min(elapsedInPhase / FADE_OUT_DURATION, 1);
        setOpacity(1 - progress);
        // Keep moving while fading out
        setSnakePosition((prev) => prev + speed * deltaTime);
        if (progress >= 1) {
          phaseStartRef.current = Date.now();
          setPhase('pause');
        }
      } else if (phase === 'pause') {
        setOpacity(0);
        if (elapsedInPhase >= PAUSE_BETWEEN) {
          // Move to next section
          const currentIndex = SECTION_ORDER.indexOf(currentSection);
          const nextIndex = (currentIndex + 1) % SECTION_ORDER.length;
          setCurrentSection(SECTION_ORDER[nextIndex]);
          setSnakePosition(0);
          phaseStartRef.current = Date.now();
          setPhase('fadeIn');
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, currentSection, getRefForSection, isReady]);

  // Don't render on mobile or if not ready
  if (isMobile || !isReady) return null;

  return (
    <>
      <SnakeCanvas
        targetRef={trendingRef}
        isActive={currentSection === 'trending'}
        opacity={currentSection === 'trending' ? opacity : 0}
        position={currentSection === 'trending' ? snakePosition : 0}
        color={SECTION_COLORS.trending}
      />
      <SnakeCanvas
        targetRef={newsRef}
        isActive={currentSection === 'news'}
        opacity={currentSection === 'news' ? opacity : 0}
        position={currentSection === 'news' ? snakePosition : 0}
        color={SECTION_COLORS.news}
      />
      <SnakeCanvas
        targetRef={nftRef}
        isActive={currentSection === 'nft'}
        opacity={currentSection === 'nft' ? opacity : 0}
        position={currentSection === 'nft' ? snakePosition : 0}
        color={SECTION_COLORS.nft}
      />
    </>
  );
}

interface SnakeCanvasProps {
  targetRef: React.RefObject<HTMLDivElement>;
  isActive: boolean;
  opacity: number;
  position: number;
  color: string;
}

function SnakeCanvas({ targetRef, isActive, opacity, position, color }: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0, top: 0, left: 0 });

  // Update bounds - use transform for smooth scroll
  useEffect(() => {
    let rafId: number | null = null;
    
    const updatePosition = () => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();
      
      setBounds({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
    };

    const onScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    // Initial update
    updatePosition();
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [targetRef]);

  // Draw snake
  useEffect(() => {
    if (!canvasRef.current || bounds.width <= 0 || bounds.height <= 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with padding for glow
    const padding = 20;
    canvas.width = bounds.width + padding * 2;
    canvas.height = bounds.height + padding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (opacity <= 0) return;

    const w = bounds.width;
    const h = bounds.height;
    const snakeLength = 150;

    const headPos = position;
    const tailPos = Math.max(0, headPos - snakeLength);
    const actualLength = headPos - tailPos;

    const samples = 50; // More samples for smoother curves
    const fadeLength = 0.15; // Fade first/last 15% of the snake

    // Draw snake segments with varying opacity for soft head/tail
    for (let i = 0; i < samples; i++) {
      const ratio1 = i / samples;
      const ratio2 = (i + 1) / samples;
      
      const currentPos1 = tailPos + actualLength * ratio1;
      const currentPos2 = tailPos + actualLength * ratio2;
      
      // Don't draw beyond head position
      if (currentPos1 > headPos) break;
      
      const point1 = pointOnRoundedPerimeter(w, h, currentPos1, CORNER_RADIUS);
      const point2 = pointOnRoundedPerimeter(w, h, Math.min(currentPos2, headPos), CORNER_RADIUS);

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
      ctx.moveTo(point1.x + padding, point1.y + padding);
      ctx.lineTo(point2.x + padding, point2.y + padding);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.globalAlpha = opacity * segmentAlpha * 0.9;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }, [bounds, opacity, position, color]);

  if (bounds.width <= 0 || bounds.height <= 0) return null;

  const padding = 20;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: bounds.top - padding,
        left: bounds.left - padding,
        width: bounds.width + padding * 2,
        height: bounds.height + padding * 2,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  );
}
