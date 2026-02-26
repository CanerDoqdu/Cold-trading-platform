import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  notificationsBadge: number;

  setTheme: (t: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setNotificationsBadge: (n: number) => void;
  decrementBadge: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'dark',
        sidebarOpen: false,
        notificationsBadge: 0,

        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),
        toggleSidebar: () =>
          set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'ui/toggleSidebar'),
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }, false, 'ui/setSidebarOpen'),
        setNotificationsBadge: (n) =>
          set({ notificationsBadge: n }, false, 'ui/setNotificationsBadge'),
        decrementBadge: () =>
          set(
            (s) => ({ notificationsBadge: Math.max(0, s.notificationsBadge - 1) }),
            false,
            'ui/decrementBadge',
          ),
      }),
      {
        name: 'ui-storage',
        partialize: (s) => ({ theme: s.theme }),
      },
    ),
    { name: 'UIStore' },
  ),
);
