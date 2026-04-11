// src/hooks/useStudentGameState.ts

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { fetchStudentGameStateMock } from '../services/gamification.service';
import { getXPProgress } from '../utils/xp.utils';
import { getStreakFlameLevel, isStreakActive } from '../utils/streak.utils';

export function useStudentGameState() {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['studentGameState', user?.id],
    queryFn: () => fetchStudentGameStateMock(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const xpProgress = query.data ? getXPProgress(query.data.xp_total) : null;
  const streakLevel = query.data ? getStreakFlameLevel(query.data.streak_current) : 'cold';
  const streakActive = query.data ? isStreakActive(query.data.last_active_date) : false;

  return {
    ...query,
    gameState: query.data,
    xpProgress,
    streakLevel,
    streakActive,
  };
}
