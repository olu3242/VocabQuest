import { supabase } from '../lib/supabase';
import { isPremium } from './subscriptionService';
import type { AdaptiveDifficulty } from '../hooks/useAdaptiveLearning';
import { evaluateAllActiveHandshakesForStudent } from './handshake.service';

export interface QuizWord {
  id: string;
  word: string;
  definition: string;
  pack_id: string | null;
  vocab_packs: {
    is_premium: boolean;
    name: string;
  } | null;
}

function normalizeWordRow(row: QuizWord & { vocab_packs: QuizWord['vocab_packs'] | QuizWord['vocab_packs'][] }) {
  const normalizedPack = Array.isArray(row.vocab_packs) ? row.vocab_packs[0] ?? null : row.vocab_packs;
  return {
    ...row,
    vocab_packs: normalizedPack,
  };
}

function difficultyToValue(difficulty?: AdaptiveDifficulty): 1 | 2 | 3 | null {
  if (!difficulty) return null;
  if (difficulty === 'easy') return 1;
  if (difficulty === 'hard') return 3;
  return 2;
}

export async function getRandomWord(options?: { difficulty?: AdaptiveDifficulty; excludeWordIds?: string[] }) {
  const difficultyValue = difficultyToValue(options?.difficulty);

  let query = supabase
    .from('words')
    .select('id, word, definition, pack_id, vocab_packs(is_premium, name)')
    .limit(100);

  if (difficultyValue !== null) {
    query = query.eq('difficulty', difficultyValue);
  }

  if (options?.excludeWordIds && options.excludeWordIds.length > 0) {
    const escapedIds = options.excludeWordIds.map((id) => `'${id}'`).join(',');
    query = query.not('id', 'in', `(${escapedIds})`);
  }

  let { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if ((!data || data.length === 0) && difficultyValue !== null) {
    const fallback = await supabase
      .from('words')
      .select('id, word, definition, pack_id, vocab_packs(is_premium, name)')
      .limit(100);

    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * data.length);
  const raw = data[randomIndex] as QuizWord & {
    vocab_packs: QuizWord['vocab_packs'] | QuizWord['vocab_packs'][];
  };
  return normalizeWordRow(raw);
}

export async function getWordById(wordId: string) {
  const { data, error } = await supabase
    .from('words')
    .select('id, word, definition, pack_id, vocab_packs(is_premium, name)')
    .eq('id', wordId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return normalizeWordRow(data as QuizWord & {
    vocab_packs: QuizWord['vocab_packs'] | QuizWord['vocab_packs'][];
  });
}

export async function getQuizOptions(correctWordId: string, correctDefinition: string) {
  const { data, error } = await supabase
    .from('words')
    .select('id, definition')
    .neq('id', correctWordId)
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  const wrongDefinitions = (data ?? []).map((item) => item.definition).slice(0, 3);
  const allOptions = [correctDefinition, ...wrongDefinitions].sort(() => Math.random() - 0.5);
  return allOptions;
}

export async function submitAnswer(userId: string, wordId: string, isCorrect: boolean) {
  const premiumUser = await isPremium(userId);
  const xpMultiplier = premiumUser ? 1.5 : 1;
  const xpGained = isCorrect ? Math.round(10 * xpMultiplier) : 0;

  const { error: attemptError } = await supabase.from('quiz_attempts').insert({
    user_id: userId,
    word_id: wordId,
    correct: isCorrect,
  });

  if (attemptError) {
    throw new Error(attemptError.message);
  }

  const { data: state, error: stateError } = await supabase
    .from('student_gamification')
    .select('xp_total, streak_current, streak_longest, last_active_date')
    .eq('student_id', userId)
    .maybeSingle();

  if (stateError) {
    throw new Error(stateError.message);
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const currentStreak = state?.streak_current ?? 0;
  const lastActive = state?.last_active_date;
  const nextStreak =
    lastActive === today
      ? currentStreak
      : lastActive === yesterdayStr
        ? currentStreak + 1
        : 1;

  const nextXP = (state?.xp_total ?? 0) + xpGained;
  const nextLevel = Math.floor(nextXP / 100);
  const nextStreakLongest = Math.max(state?.streak_longest ?? 0, nextStreak);

  const { error: progressError } = await supabase
    .from('student_gamification')
    .upsert(
      {
        student_id: userId,
        xp_total: nextXP,
        level: nextLevel,
        streak_current: nextStreak,
        streak_longest: nextStreakLongest,
        last_active_date: today,
      },
      { onConflict: 'student_id' }
    );

  if (progressError) {
    throw new Error(progressError.message);
  }

  try {
    const { data: performanceRow } = await supabase
      .from('user_word_performance')
      .select('correct_count, incorrect_count')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .maybeSingle();

    const nextCorrect = Number(performanceRow?.correct_count ?? 0) + (isCorrect ? 1 : 0);
    const nextIncorrect = Number(performanceRow?.incorrect_count ?? 0) + (isCorrect ? 0 : 1);

    await supabase
      .from('user_word_performance')
      .upsert(
        {
          user_id: userId,
          word_id: wordId,
          correct_count: nextCorrect,
          incorrect_count: nextIncorrect,
        },
        { onConflict: 'user_id,word_id' }
      );
  } catch (performanceError) {
    console.error('user_word_performance update failed', performanceError);
  }

  if (xpGained > 0) {
    await supabase.from('xp_events').insert({
      student_id: userId,
      action_type: 'QUIZ_CORRECT',
      xp_amount: xpGained,
      metadata: { premiumMultiplier: premiumUser ? 1.5 : 1 },
    });
  }

  void evaluateAllActiveHandshakesForStudent(userId).catch(() => undefined);

  return {
    correct: isCorrect,
    xpGained,
    streak: nextStreak,
    level: nextLevel,
    isPremiumUser: premiumUser,
  };
}

export async function fetchLeaderboard() {
  const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: 20 });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}