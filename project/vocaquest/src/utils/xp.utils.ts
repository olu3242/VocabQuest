// src/utils/xp.utils.ts

import { LEVEL_THRESHOLDS, LEVEL_TITLES, MAX_LEVEL } from '../constants/gamification.constants';

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

export function getXPProgress(xp: number): {
  level: number;
  title: string;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  isMaxLevel: boolean;
} {
  const level = getLevelFromXP(xp);
  const isMaxLevel = level >= MAX_LEVEL;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const currentLevelXP = xp - currentThreshold;
  const nextLevelXP = nextThreshold - currentThreshold;
  const progressPercent = isMaxLevel ? 100 : Math.min((currentLevelXP / nextLevelXP) * 100, 100);

  return {
    level,
    title: getLevelTitle(level),
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    isMaxLevel,
  };
}

export function xpToNextLevel(xp: number): number {
  const level = getLevelFromXP(xp);
  if (level >= MAX_LEVEL) return 0;
  return (LEVEL_THRESHOLDS[level] ?? 0) - xp;
}
