// src/hooks/useStreak.ts
import { useStudentGameState } from './useStudentGameState';
import { getNextStreakMilestone } from '@/utils/streak.utils';

export function useStreak() {
  const { gameState, streakLevel, streakActive } = useStudentGameState();
  const streak = gameState?.streak_current ?? 0;
  const nextMilestone = getNextStreakMilestone(streak);

  return {
    streak,
    streakLongest: gameState?.streak_longest ?? 0,
    streakLevel,
    streakActive,
    nextMilestone,
    daysToMilestone: nextMilestone ? nextMilestone - streak : null,
  };
}
