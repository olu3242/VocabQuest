// src/hooks/useDailyQuest.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { fetchTodaysQuestMock, completeQuest } from '../services/quest.service';
import { getMockWordById } from '../data/mockWords';
import { GradeBand } from '../constants/worlds.constants';

export function useDailyQuest() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const gradeBand = (user?.grade_band ?? '35') as GradeBand;

  const questQuery = useQuery({
    queryKey: ['dailyQuest', user?.id],
    queryFn: () => fetchTodaysQuestMock(user!.id, gradeBand),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 60, // 1 hour — quest doesn't change mid-session
  });

  const words = (questQuery.data?.word_ids ?? [])
    .map(id => getMockWordById(id))
    .filter(Boolean);

  const completeQuestMutation = useMutation({
    mutationFn: ({ questId, xpEarned }: { questId: string; xpEarned: number }) =>
      completeQuest(questId, xpEarned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyQuest', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['studentGameState', user?.id] });
    },
  });

  return {
    quest: questQuery.data,
    words,
    isLoading: questQuery.isLoading,
    isError: questQuery.isError,
    completeQuest: completeQuestMutation.mutate,
    isCompleting: completeQuestMutation.isPending,
  };
}
