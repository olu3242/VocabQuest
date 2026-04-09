// src/store/gamificationStore.ts

import { create } from 'zustand';
import { StudentGameState } from '../types/student.types';

interface XPEvent {
  id: string;
  action: string;
  amount: number;
  timestamp: number;
}

interface GamificationState {
  gameState: StudentGameState | null;
  pendingXPEvents: XPEvent[];
  showLevelUpModal: boolean;
  levelUpData: { newLevel: number; title: string } | null;

  setGameState: (state: StudentGameState) => void;
  addXPEvent: (action: string, amount: number) => void;
  clearXPEvents: () => void;
  triggerLevelUp: (newLevel: number, title: string) => void;
  dismissLevelUp: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  gameState: null,
  pendingXPEvents: [],
  showLevelUpModal: false,
  levelUpData: null,

  setGameState: (gameState) => set({ gameState }),

  addXPEvent: (action, amount) =>
    set((state) => ({
      pendingXPEvents: [
        ...state.pendingXPEvents,
        { id: crypto.randomUUID(), action, amount, timestamp: Date.now() },
      ],
    })),

  clearXPEvents: () => set({ pendingXPEvents: [] }),

  triggerLevelUp: (newLevel, title) =>
    set({ showLevelUpModal: true, levelUpData: { newLevel, title } }),

  dismissLevelUp: () =>
    set({ showLevelUpModal: false, levelUpData: null }),
}));
