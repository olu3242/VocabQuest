// src/hooks/useXP.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { awardXP } from '@/services/gamification.service';
import { useAuthStore } from '@/store/authStore';
import { useGamificationStore } from '@/store/gamificationStore';
import type { XPActionType } from '@/constants/gamification.constants';

export function useXP() {
  const { user } = useAuthStore();
  const { addXPEvent, triggerLevelUp } = useGamificationStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (action: XPActionType) => awardXP(user!.id, action),
    onSuccess: (result) => {
      addXPEvent(result.xpAwarded.toString(), result.xpAwarded);
      if (result.leveledUp && result.newLevelTitle) {
        triggerLevelUp(result.newLevel, result.newLevelTitle);
      }
      queryClient.invalidateQueries({ queryKey: ['studentGameState', user?.id] });
    },
  });

  return { awardXP: mutation.mutate, isPending: mutation.isPending };
}
