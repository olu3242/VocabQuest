// src/hooks/useClassroom.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';

export function useClassrooms() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['classrooms', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && user?.role === 'teacher',
  });
}
