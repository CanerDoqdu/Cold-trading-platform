"use client";

import { createContext, useReducer, ReactNode, useEffect, useCallback, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
};
type State = { user: User | null };

type Action = { type: "LOGIN"; payload: User } | { type: "LOGOUT" };

type ContextType = {
  state: State;
  dispatch: React.Dispatch<Action>;
  isLoading: boolean;
};

// Session timeout duration (30 minutes in milliseconds)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Varsayılan state
const initialState: State = { user: null };

// Reducer fonksiyonu
const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthContext = createContext<ContextType>({
  state: initialState,
  dispatch: () => null,
  isLoading: true,
});

// AuthContextProvider bileşeni
type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Debug log only in development and only when state actually changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Authcontext state", state);
    }
  }, [state.user?.email]); // Only log when user email changes

  // Logout function
  const performLogout = useCallback(async () => {
    try {
      await fetch('/api/user/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    localStorage.removeItem('lastActivity');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    if (state.user) {
      localStorage.setItem('lastActivity', Date.now().toString());
    }
  }, [state.user]);

  // Check session timeout
  const checkSessionTimeout = useCallback(() => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity && state.user) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        console.log('Session expired due to inactivity');
        performLogout();
      }
    }
  }, [state.user, performLogout]);

  // Initial load - check server session first, then fall back to localStorage
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        // First, check server-side session (cookie-based)
        const response = await fetch('/api/user/session');
        const data = await response.json();
        
        if (data.user) {
          // Server session is valid - update state and localStorage
          dispatch({ type: "LOGIN", payload: data.user });
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem('lastActivity', Date.now().toString());
          console.log("Session restored from server:", data.user.email);
        } else {
          // No valid server session - clear localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('favorites');
          localStorage.removeItem('lastActivity');
          dispatch({ type: "LOGOUT" });
          console.log("No valid server session");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        // Network error - try localStorage as fallback
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const lastActivity = localStorage.getItem('lastActivity');
          if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity > SESSION_TIMEOUT) {
              // Session expired
              localStorage.removeItem('user');
              localStorage.removeItem('favorites');
              localStorage.removeItem('lastActivity');
            } else {
              const user = JSON.parse(storedUser);
              dispatch({ type: "LOGIN", payload: user });
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Set up activity listeners and timeout checker
  useEffect(() => {
    if (!state.user) return;

    // Events that indicate user activity - only essential ones
    const activityEvents = ['mousedown', 'keydown'];
    
    // Throttle activity updates (max once per 5 minutes to reduce re-renders)
    let lastUpdate = 0;
    const throttledUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 300000) { // 5 minute throttle
        lastUpdate = now;
        updateLastActivity();
      }
    };

    // Add activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledUpdate, { passive: true });
    });

    // Check session timeout every 5 minutes (not every minute)
    const intervalId = setInterval(checkSessionTimeout, 300000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledUpdate);
      });
      clearInterval(intervalId);
    };
  }, [state.user?.email, updateLastActivity, checkSessionTimeout]); // Use email instead of whole user object

  return (
    <AuthContext.Provider value={{ state, dispatch, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
