// src/store/uiStore.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen:    boolean;
  toasts:         { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  setSidebar:     (open: boolean) => void;
  addToast:       (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast:    (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toasts:      [],
  setSidebar:  (open) => set({ sidebarOpen: open }),
  addToast:    (message, type = 'info') =>
    set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }] })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
