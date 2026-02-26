'use client';

import { useState, useEffect, useCallback } from 'react';

const RECENT_VIEWS_KEY = 'crypto_recent_views';
const MAX_RECENT_VIEWS = 10;

export interface RecentView {
  id: string;
  name: string;
  symbol: string;
  image: string;
  timestamp: number;
}

export function useRecentViews() {
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);

  // Load recent views from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_VIEWS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out views older than 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const filtered = parsed.filter((view: RecentView) => view.timestamp > sevenDaysAgo);
        setRecentViews(filtered);
      }
    } catch (error) {
      console.error('Error loading recent views:', error);
    }
  }, []);

  // Add a coin to recent views
  const addRecentView = useCallback((coin: Omit<RecentView, 'timestamp'>) => {
    setRecentViews(prev => {
      // Remove if already exists
      const filtered = prev.filter(v => v.id !== coin.id);
      
      // Add to beginning with current timestamp
      const newView: RecentView = {
        ...coin,
        timestamp: Date.now()
      };
      
      const updated = [newView, ...filtered].slice(0, MAX_RECENT_VIEWS);
      
      // Save to localStorage
      try {
        localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recent views:', error);
      }
      
      return updated;
    });
  }, []);

  // Clear all recent views
  const clearRecentViews = useCallback(() => {
    setRecentViews([]);
    try {
      localStorage.removeItem(RECENT_VIEWS_KEY);
    } catch (error) {
      console.error('Error clearing recent views:', error);
    }
  }, []);

  return {
    recentViews,
    addRecentView,
    clearRecentViews,
    recentViewsCount: recentViews.length
  };
}
