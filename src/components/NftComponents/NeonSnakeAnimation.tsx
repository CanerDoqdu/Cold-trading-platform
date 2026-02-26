'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

// Map distance along rectangle perimeter (clockwise from top-left)
function pointOnPerimeter(x: number, y: number, w: number, h: number, distance: number): Point {
  const perimeter = 2 * (w + h);
  const d = ((distance % perimeter) + perimeter) % perimeter;

  if (d <= w) return { x: x + d, y };
  if (d <= w + h) return { x: x + w, y: y + (d - w) };
  if (d <= 2 * w + h) return { x: x + w - (d - w - h), y: y + h };
  return { x, y: y + h - (d - 2 * w - h) };
}

interface NeonSnakeAnimationProps {
  children: React.ReactNode;
}

export default function NeonSnakeAnimation({ children }: NeonSnakeAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bounds, setBounds] = useState({ w: 1000, h: 1000 });

  const snakeStateRef = useRef({
    position: 0,
    speed: 150,
    length: 200, // Extended snake line
  });

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());
  const isVisibleRef = useRef(true);
  const mountTimeRef = useRef<number>(Date.now());
  const [opacity, setOpacity] = useState(0);

  // Setup canvas and container sizing
  useEffect(() => {
    const setup = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setBounds({ w: rect.width, h: rect.height });

      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;

      mountTimeRef.current = Date.now();
      lastTimeRef.current = Date.now();
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

    // Fade-in effect over 3 seconds
    const fadeInterval = setInterval(() => {
      const elapsed = (Date.now() - mountTimeRef.current) / 1000;
      const newOpacity = Math.min(elapsed / 3, 1);
      setOpacity(newOpacity);
      if (newOpacity >= 1) {
        clearInterval(fadeInterval);
      }
    }, 16);

    return () => {
      clearInterval(fadeInterval);
      clearTimeout(timeout);
      window.removeEventListener('resize', setup);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (bounds.w <= 0 || bounds.h <= 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const perimeter = 2 * (bounds.w + bounds.h);

    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const now = Date.now();
      let deltaTime = (now - lastTimeRef.current) / 1000;

      // Clamp delta - ignore massive jumps from tab switch
      if (deltaTime > 0.05) {
        lastTimeRef.current = now;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastTimeRef.current = now;

      // Update position
      const speed = snakeStateRef.current.speed;
      snakeStateRef.current.position = (snakeStateRef.current.position + speed * deltaTime) % perimeter;

      // Clear canvas (prevents trails)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw snake from tail to head
      const headPos = snakeStateRef.current.position;
      const tailPos = (headPos - snakeStateRef.current.length + perimeter) % perimeter;

      // Draw snake with gradient for smooth head/tail - OPTIMIZED
      const samples = 50; // Balanced for performance
      const fadeLength = 8; // Number of segments to fade at head and tail

      // Pre-calculate all points first (more efficient)
      const points: { x: number; y: number; opacity: number }[] = [];
      for (let i = 0; i <= samples; i++) {
        const ratio = i / samples;
        const currentPos = (tailPos + snakeStateRef.current.length * ratio) % perimeter;
        const point = pointOnPerimeter(0, 0, bounds.w, bounds.h, currentPos);
        
        let segmentOpacity = 1;
        if (i < fadeLength) {
          segmentOpacity = i / fadeLength;
        } else if (i > samples - fadeLength) {
          segmentOpacity = (samples - i) / fadeLength;
        }
        
        points.push({ ...point, opacity: segmentOpacity });
      }

      // Draw in batches by opacity level (fewer state changes)
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff66';

      // Draw main body (full opacity) as single path
      ctx.beginPath();
      let started = false;
      for (let i = fadeLength; i <= samples - fadeLength; i++) {
        if (!started) {
          ctx.moveTo(points[i].x, points[i].y);
          started = true;
        } else {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }
      ctx.globalAlpha = opacity;
      ctx.stroke();

      // Draw fade sections with reduced detail
      for (let i = 0; i < fadeLength; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.globalAlpha = opacity * points[i].opacity;
        ctx.stroke();
      }

      for (let i = samples - fadeLength; i < samples; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.globalAlpha = opacity * points[i].opacity;
        ctx.stroke();
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
  }, [bounds, opacity]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full" 
      style={{ position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
      <div className="relative z-0">{children}</div>
    </div>
  );
}
