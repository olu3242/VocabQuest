// src/services/word.service.ts
import { supabase } from './supabase';
import { GradeBand } from '@/constants/worlds.constants';
import { evaluateAllActiveHandshakesForStudent } from './handshake.service';

export async function fetchWordsByGradeBand(gradeBand: GradeBand) {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('grade_band', gradeBand)
    .eq('is_active', true)
    .order('difficulty', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchWordById(wordId: string) {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('id', wordId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchStudentWordProgress(studentId: string) {
  const { data, error } = await supabase
    .from('student_word_progress')
    .select('*, word:words(*)')
    .eq('student_id', studentId);
  if (error) throw error;
  return data;
}

export async function updateWordMastery(
  studentId: string,
  wordId: string,
  masteryScore: number
) {
  const status =
    masteryScore >= 0.9 ? 'mastered' :
    masteryScore >= 0.65 ? 'practiced' :
    masteryScore > 0 ? 'learning' : 'unseen';

  const { error } = await supabase
    .from('student_word_progress')
    .upsert({
      student_id:       studentId,
      word_id:          wordId,
      status,
      mastery_score:    masteryScore,
      last_practiced_at: new Date().toISOString(),
    }, { onConflict: 'student_id,word_id' });

  if (error) throw error;

  void evaluateAllActiveHandshakesForStudent(studentId).catch(() => undefined);
}

export async function generateWords(
  gradeLevel: number,
  difficulty: 'easy' | 'medium' | 'hard',
  count = 20
) {
  const { data, error } = await supabase.functions.invoke('generate-words', {
    body: {
      grade_level: gradeLevel,
      difficulty,
      count,
    },
  });

  if (error) throw error;
  return data as { success: boolean; count: number; words: unknown[] };
}
