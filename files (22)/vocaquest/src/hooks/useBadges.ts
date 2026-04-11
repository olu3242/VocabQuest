// src/hooks/useBadges.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { fetchStudentBadges } from '@/services/gamification.service';

export function useBadges() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['badges', user?.id],
    queryFn: () => fetchStudentBadges(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
}
