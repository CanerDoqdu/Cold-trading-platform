"use client";

import { createContext, useReducer, ReactNode, useEffect, useCallback } from "react";

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
});

// AuthContextProvider bileşeni
type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  console.log("Authcontext state", state);

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

  // Initial load - check stored user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user from localStorage:", storedUser);
    if (storedUser) {
      // Check if session has expired
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
          // Session expired
          localStorage.removeItem('user');
          localStorage.removeItem('favorites');
          localStorage.removeItem('lastActivity');
          return;
        }
      }
      const user = JSON.parse(storedUser);
      dispatch({ type: "LOGIN", payload: user });
      localStorage.setItem('lastActivity', Date.now().toString());
    }
  }, []);

  // Set up activity listeners and timeout checker
  useEffect(() => {
    if (!state.user) return;

    // Events that indicate user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    // Throttle activity updates (max once per minute)
    let lastUpdate = 0;
    const throttledUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) { // 1 minute throttle
        lastUpdate = now;
        updateLastActivity();
      }
    };

    // Add activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledUpdate, { passive: true });
    });

    // Check session timeout every minute
    const intervalId = setInterval(checkSessionTimeout, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledUpdate);
      });
      clearInterval(intervalId);
    };
  }, [state.user, updateLastActivity, checkSessionTimeout]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
