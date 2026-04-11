import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type BreakdownRow = {
  label: string;
  count: number;
};

type GenerationMetrics = {
  total_inserted: number;
  skipped_duplicates: number;
  prefiltered_duplicates: number;
  invalid_entries: number;
  failed_batches: number;
};

type AutomationRun = {
  run_at: string;
  total_inserted: number;
  failed_batches: number;
};

export function useAdminStats() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalWords, setTotalWords] = useState(0);
  const [totalSentences, setTotalSentences] = useState(0);
  const [difficultyBreakdown, setDifficultyBreakdown] = useState<BreakdownRow[]>([]);
  const [gradeBreakdown, setGradeBreakdown] = useState<BreakdownRow[]>([]);
  const [lastGeneration, setLastGeneration] = useState<GenerationMetrics | null>(null);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [lastAutoRun, setLastAutoRun] = useState<AutomationRun | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [wordsCountRes, sentencesCountRes, difficultyRes, gradeLevelRes, autoSettingRes, autoRunRes] = await Promise.all([
        supabase.from('words').select('id', { count: 'exact', head: true }),
        supabase.from('sentences').select('id', { count: 'exact', head: true }),
        supabase.from('words').select('difficulty'),
        supabase.from('words').select('grade_level'),
        supabase.from('auto_generation_settings').select('enable_auto_generation').eq('id', 1).maybeSingle(),
        supabase
          .from('auto_generation_runs')
          .select('run_at, total_inserted, failed_batches')
          .order('run_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (wordsCountRes.error) throw wordsCountRes.error;
      if (sentencesCountRes.error) throw sentencesCountRes.error;
      if (difficultyRes.error) throw difficultyRes.error;

      setTotalWords(wordsCountRes.count ?? 0);
      setTotalSentences(sentencesCountRes.count ?? 0);
      setAutomationEnabled(autoSettingRes.data?.enable_auto_generation ?? true);
      setLastAutoRun((autoRunRes.data as AutomationRun | null) ?? null);

      const difficultyMap = new Map<string, number>();
      for (const row of difficultyRes.data ?? []) {
        const key = String((row as { difficulty?: unknown }).difficulty ?? 'unknown');
        difficultyMap.set(key, (difficultyMap.get(key) ?? 0) + 1);
      }
      setDifficultyBreakdown(
        Array.from(difficultyMap.entries()).map(([label, count]) => ({ label, count }))
      );

      if (!gradeLevelRes.error) {
        const gradeMap = new Map<string, number>();
        for (const row of gradeLevelRes.data ?? []) {
          const key = String((row as { grade_level?: unknown }).grade_level ?? 'unknown');
          gradeMap.set(key, (gradeMap.get(key) ?? 0) + 1);
        }
        setGradeBreakdown(Array.from(gradeMap.entries()).map(([label, count]) => ({ label, count })));
      } else {
        const gradeBandRes = await supabase.from('words').select('grade_band');
        if (gradeBandRes.error) throw gradeBandRes.error;

        const gradeBandMap = new Map<string, number>();
        for (const row of gradeBandRes.data ?? []) {
          const key = String((row as { grade_band?: unknown }).grade_band ?? 'unknown');
          gradeBandMap.set(key, (gradeBandMap.get(key) ?? 0) + 1);
        }
        setGradeBreakdown(
          Array.from(gradeBandMap.entries()).map(([label, count]) => ({ label, count }))
        );
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load admin stats.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateWords = useCallback(async () => {
    const { data, error: invokeError } = await supabase.functions.invoke('generate-words', {
      body: { count: 200 },
    });

    if (invokeError) {
      throw invokeError;
    }

    const metrics = {
      total_inserted: Number((data as Record<string, unknown>)?.total_inserted ?? 0),
      skipped_duplicates: Number((data as Record<string, unknown>)?.skipped_duplicates ?? 0),
      prefiltered_duplicates: Number((data as Record<string, unknown>)?.prefiltered_duplicates ?? 0),
      invalid_entries: Number((data as Record<string, unknown>)?.invalid_entries ?? 0),
      failed_batches: Number((data as Record<string, unknown>)?.failed_batches ?? 0),
    };

    setLastGeneration(metrics);
    await loadStats();
    return metrics;
  }, [loadStats]);

  const setAutomation = useCallback(async (enabled: boolean) => {
    const { error: updateError } = await supabase
      .from('auto_generation_settings')
      .update({ enable_auto_generation: enabled, updated_at: new Date().toISOString() })
      .eq('id', 1);

    if (updateError) {
      throw updateError;
    }

    setAutomationEnabled(enabled);
    await loadStats();
  }, [loadStats]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return {
    isLoading,
    error,
    totalWords,
    totalSentences,
    difficultyBreakdown,
    gradeBreakdown,
    lastGeneration,
    automationEnabled,
    lastAutoRun,
    loadStats,
    generateWords,
    setAutomation,
  };
}