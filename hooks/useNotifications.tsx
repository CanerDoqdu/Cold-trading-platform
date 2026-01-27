'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  _id: string;
  type: 'price_alert' | 'system' | 'news' | 'portfolio';
  title: string;
  message: string;
  coinId?: string;
  coinSymbol?: string;
  targetPrice?: number;
  currentPrice?: number;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface PriceAlert {
  _id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImage?: string;
  targetPrice: number;
  condition: 'above' | 'below';
  priceAtCreation: number;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=20');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId?: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          notificationId 
            ? { notificationId } 
            : { markAllRead: true }
        ),
      });

      if (res.ok) {
        if (notificationId) {
          setNotifications(prev => 
            prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const wasUnread = notifications.find(n => n._id === notificationId && !n.isRead);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
}

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/price-alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching price alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlert = async (alertData: {
    coinId: string;
    coinSymbol: string;
    coinName: string;
    coinImage?: string;
    targetPrice: number;
    condition: 'above' | 'below';
    currentPrice: number;
  }) => {
    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });

      const data = await res.json();
      
      if (res.ok) {
        setAlerts(prev => [data.alert, ...prev]);
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      return { success: false, error: 'Failed to create alert' };
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/price-alerts?id=${alertId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAlerts(prev => prev.filter(a => a._id !== alertId));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error deleting alert:', error);
      return { success: false };
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    createAlert,
    deleteAlert,
    refetch: fetchAlerts
  };
}
