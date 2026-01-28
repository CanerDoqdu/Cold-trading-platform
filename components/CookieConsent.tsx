'use client';

import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean; // Always true, can't be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Session-based approach like Binance:
    // - sessionStorage tracks if we asked in THIS browser session
    // - localStorage stores the actual preferences
    const askedThisSession = sessionStorage.getItem('cookie-consent-asked');
    const savedConsent = localStorage.getItem('cookie-consent');
    
    if (askedThisSession) {
      // Already asked this session, just load preferences if they exist
      if (savedConsent) {
        try {
          setPreferences(JSON.parse(savedConsent));
        } catch (e) {
          // Invalid data, will ask again
        }
      }
      return;
    }
    
    // New session - show banner after delay
    const timer = setTimeout(() => setShowBanner(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    sessionStorage.setItem('cookie-consent-asked', 'true');
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Here you would typically initialize/disable analytics based on preferences
    if (prefs.analytics) {
      // Initialize Google Analytics, etc.
      console.log('Analytics cookies enabled');
    }
    if (prefs.marketing) {
      // Initialize marketing pixels
      console.log('Marketing cookies enabled');
    }
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectAdditional = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop for settings modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100]"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* Main Banner */}
      <div className={`fixed bottom-0 left-0 right-0 z-[101] transition-transform duration-500 ${showSettings ? 'translate-y-full' : 'translate-y-0'} animate-cookie-slide`}>
        <div className="bg-gray-900 border-t border-gray-800 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Text */}
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="text-2xl" aria-hidden="true">🍪</div>
                  <div>
                    <p className="text-white font-semibold text-sm sm:text-base" role="heading" aria-level={2}>We value your privacy</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                      We use <span className="text-emerald-400 font-medium">&quot;Strictly Necessary&quot;</span> cookies to keep our site reliable and secure. 
                      We&apos;d like to set additional cookies to understand site usage, make improvements, remember your settings, and assist in our marketing efforts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
                >
                  Manage Cookies
                </button>
                <button
                  onClick={rejectAdditional}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Reject Additional
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors"
                >
                  Accept All Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[102] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Cookie Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-gray-400 text-sm">
                When you visit our website, we may store cookies on your browser. Here you can customize your cookie preferences.
              </p>

              {/* Necessary Cookies */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true" />
                      Strictly Necessary
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Essential for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    Always On
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Functional Cookies</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Remember your preferences like theme, language, and display settings.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                    aria-label={preferences.functional ? 'Disable functional cookies' : 'Enable functional cookies'}
                    aria-pressed={preferences.functional}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.functional ? 'bg-emerald-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.functional ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Analytics Cookies</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    aria-label={preferences.analytics ? 'Disable analytics cookies' : 'Enable analytics cookies'}
                    aria-pressed={preferences.analytics}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.analytics ? 'bg-emerald-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Marketing Cookies</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Used to deliver relevant ads and track ad campaign performance.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    aria-label={preferences.marketing ? 'Disable marketing cookies' : 'Enable marketing cookies'}
                    aria-pressed={preferences.marketing}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.marketing ? 'bg-emerald-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between gap-3">
              <button
                onClick={rejectAdditional}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Reject All
              </button>
              <div className="flex gap-2">
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={saveCustom}
                  className="px-4 py-2 text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook to check cookie preferences anywhere in the app
export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      try {
        setPreferences(JSON.parse(consent));
      } catch (e) {
        setPreferences(null);
      }
    }
  }, []);

  return preferences;
}
