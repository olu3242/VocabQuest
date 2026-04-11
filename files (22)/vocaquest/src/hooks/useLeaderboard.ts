// src/hooks/useLeaderboard.ts
import { useQuery } from '@tanstack/react-query';
import { fetchClassLeaderboard } from '@/services/gamification.service';

export function useLeaderboard(classroomId?: string) {
  return useQuery({
    queryKey: ['leaderboard', classroomId],
    queryFn: () => fetchClassLeaderboard(classroomId!),
    enabled: !!classroomId,
    staleTime: 1000 * 60 * 5,
  });
}
