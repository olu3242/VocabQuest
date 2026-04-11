import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export type AdaptiveDifficulty = 'easy' | 'medium' | 'hard';

export type AdaptiveWord = {
  word_id: string;
  word: string;
  correct_count: number;
  incorrect_count: number;
};

type PerformanceRow = {
  word_id: string;
  correct_count: number;
  incorrect_count: number;
  words?: { word?: string } | Array<{ word?: string }> | null;
};

function resolveWordLabel(row: PerformanceRow): string {
  const relation = row.words;
  if (Array.isArray(relation)) {
    return String(relation[0]?.word ?? row.word_id);
  }
  return String(relation?.word ?? row.word_id);
}

function computeDifficulty(accuracy: number): AdaptiveDifficulty {
  if (accuracy > 80) return 'hard';
  if (accuracy < 50) return 'easy';
  return 'medium';
}

function toAdaptiveWords(rows: PerformanceRow[]): AdaptiveWord[] {
  return rows.map((row) => ({
    word_id: row.word_id,
    word: resolveWordLabel(row),
    correct_count: Number(row.correct_count ?? 0),
    incorrect_count: Number(row.incorrect_count ?? 0),
  }));
}

export function useAdaptiveLearning(userId?: string) {
  const [rows, setRows] = useState<PerformanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!userId) {
      setRows([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('user_word_performance')
        .select('word_id, correct_count, incorrect_count, words(word)')
        .eq('user_id', userId);

      if (queryError) throw queryError;
      setRows((data ?? []) as PerformanceRow[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load adaptive stats.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const attemptedCount = rows.length;
  const totalCorrect = rows.reduce((sum, row) => sum + Number(row.correct_count ?? 0), 0);
  const totalIncorrect = rows.reduce((sum, row) => sum + Number(row.incorrect_count ?? 0), 0);
  const totalAttempts = totalCorrect + totalIncorrect;

  const accuracy = useMemo(() => {
    if (totalAttempts === 0) return 0;
    return Math.round((totalCorrect / totalAttempts) * 100);
  }, [totalCorrect, totalAttempts]);

  const adaptiveRows = useMemo(() => toAdaptiveWords(rows), [rows]);

  const weakWords = useMemo(() => {
    return adaptiveRows
      .filter((row) => row.incorrect_count > row.correct_count)
      .sort((a, b) => b.incorrect_count - a.incorrect_count);
  }, [adaptiveRows]);

  const strongWords = useMemo(() => {
    return adaptiveRows
      .filter((row) => row.correct_count >= 3)
      .sort((a, b) => b.correct_count - a.correct_count);
  }, [adaptiveRows]);

  const attemptedWordIds = useMemo(() => adaptiveRows.map((row) => row.word_id), [adaptiveRows]);

  const difficulty = useMemo(() => computeDifficulty(accuracy), [accuracy]);

  const recordAnswer = useCallback((wordId: string, isCorrect: boolean, wordLabel?: string) => {
    if (!wordId) return;

    setRows((prev) => {
      const index = prev.findIndex((row) => row.word_id === wordId);

      if (index < 0) {
        const nextRow: PerformanceRow = {
          word_id: wordId,
          correct_count: isCorrect ? 1 : 0,
          incorrect_count: isCorrect ? 0 : 1,
          words: wordLabel ? { word: wordLabel } : { word: wordId },
        };
        return [...prev, nextRow];
      }

      const next = [...prev];
      const current = next[index];
      next[index] = {
        ...current,
        correct_count: Number(current.correct_count ?? 0) + (isCorrect ? 1 : 0),
        incorrect_count: Number(current.incorrect_count ?? 0) + (isCorrect ? 0 : 1),
      };
      return next;
    });
  }, []);

  return {
    accuracy,
    difficulty,
    weakWords,
    strongWords,
    attemptedWordIds,
    attemptedCount,
    isLoading,
    error,
    refresh,
    recordAnswer,
  };
}