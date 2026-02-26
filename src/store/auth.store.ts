import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface SessionUser {
  _id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: SessionUser | null;
  /** True while the initial session check is running */
  hydrating: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  tosAccepted: boolean;

  setUser: (user: SessionUser | null) => void;
  setHydrating: (v: boolean) => void;
  setEmailVerified: (v: boolean) => void;
  set2FA: (v: boolean) => void;
  setTosAccepted: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        hydrating: true,
        emailVerified: false,
        twoFactorEnabled: false,
        tosAccepted: false,

        setUser: (user) => set({ user, hydrating: false }, false, 'auth/setUser'),
        setHydrating: (hydrating) => set({ hydrating }, false, 'auth/setHydrating'),
        setEmailVerified: (emailVerified) => set({ emailVerified }, false, 'auth/setEmailVerified'),
        set2FA: (twoFactorEnabled) => set({ twoFactorEnabled }, false, 'auth/set2FA'),
        setTosAccepted: (tosAccepted) => set({ tosAccepted }, false, 'auth/setTosAccepted'),
        logout: () =>
          set(
            { user: null, emailVerified: false, twoFactorEnabled: false, tosAccepted: false },
            false,
            'auth/logout',
          ),
      }),
      {
        name: 'auth-storage',
        partialize: (s) => ({ user: s.user }),
      },
    ),
    { name: 'AuthStore' },
  ),
);
