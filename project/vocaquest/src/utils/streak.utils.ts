// src/utils/streak.utils.ts

import { STREAK_MILESTONES } from '../constants/gamification.constants';

export function isStreakActive(lastActiveDateISO: string | null): boolean {
  if (!lastActiveDateISO) return false;
  const lastActive = new Date(lastActiveDateISO);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const lastActiveDay = lastActive.toDateString();
  return lastActiveDay === today.toDateString() || lastActiveDay === yesterday.toDateString();
}

export function getNextStreakMilestone(streak: number): number | null {
  return STREAK_MILESTONES.find(m => m > streak) ?? null;
}

export function getStreakFlameLevel(streak: number): 'cold' | 'warm' | 'hot' | 'blazing' {
  if (streak === 0) return 'cold';
  if (streak < 7) return 'warm';
  if (streak < 14) return 'hot';
  return 'blazing';
}
