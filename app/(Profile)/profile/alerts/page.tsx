'use client';

import React, { useState } from 'react';
import ProfileNav from '../ProfileNav';
import { usePriceAlerts, useNotifications } from '@/hooks/useNotifications';
import { UseAuthContext } from '@/hooks/UseAuthContext';

export default function AlertsPage() {
  const { state } = UseAuthContext();
  const { user } = state;
  const { alerts, loading: alertsLoading, deleteAlert } = usePriceAlerts();
  const { notifications, loading: notificationsLoading, markAsRead, deleteNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications'>('alerts');

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <ProfileNav>
        <div className="text-center py-12">
          <p className="text-gray-400">Please login to manage your alerts.</p>
        </div>
      </ProfileNav>
    );
  }

  return (
    <ProfileNav>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts & Notifications</h1>
          <p className="text-gray-400 mt-1">Manage your price alerts and view notifications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'alerts'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Price Alerts ({alerts.filter(a => a.isActive).length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'notifications'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Notifications ({notifications.filter(n => !n.isRead).length} new)
          </button>
        </div>

        {/* Price Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-1/3" />
                        <div className="h-3 bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">No price alerts yet</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Set price alerts on any coin page to get notified when prices reach your target
                </p>
                <a
                  href="/markets"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
                  Browse Markets
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`bg-gray-900/50 border rounded-xl p-4 transition-all ${
                      alert.isTriggered
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : alert.isActive
                        ? 'border-gray-800 hover:border-gray-700'
                        : 'border-gray-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {alert.coinImage && (
                          <img src={alert.coinImage} alt={alert.coinName} className="w-10 h-10 rounded-full" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium">{alert.coinName}</h3>
                            <span className="text-gray-500 text-sm">{alert.coinSymbol}</span>
                            {alert.isTriggered && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                Triggered
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-0.5">
                            Alert when price goes{' '}
                            <span className={alert.condition === 'above' ? 'text-emerald-400' : 'text-red-400'}>
                              {alert.condition}
                            </span>{' '}
                            <span className="text-white font-medium">{formatPrice(alert.targetPrice)}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created {formatDate(alert.createdAt)} • Price at creation: {formatPrice(alert.priceAtCreation)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAlert(alert._id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                        title="Delete alert"
                      >
                        <svg className="w-5 h-5 text-gray-500 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.filter(n => !n.isRead).length > 0 && (
              <button
                onClick={() => markAsRead()}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Mark all as read
              </button>
            )}

            {notificationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-1/3" />
                        <div className="h-3 bg-gray-700 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                <p className="text-gray-500 text-sm">
                  You'll see price alert triggers and other updates here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`bg-gray-900/50 border rounded-xl p-4 transition-all ${
                      !notification.isRead
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                          title="Delete"
                        >
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProfileNav>
  );
}
