// src/services/quest.service.ts

import { supabase } from './supabase';
import { DailyQuest } from '../types/student.types';
import { getMockWordsByGradeBand } from '../data/mockWords';
import { GradeBand } from '../constants/worlds.constants';
import { DAILY_QUEST_WORD_COUNT } from '../constants/gamification.constants';
import { evaluateAllActiveHandshakesForStudent } from './handshake.service';

// ─── Fetch today's quest ──────────────────────────────────────────────────────

export async function fetchTodaysQuest(studentId: string): Promise<DailyQuest | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_quests')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', today)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch quest: ${error.message}`);
  return data as DailyQuest | null;
}

// ─── Complete a quest step ────────────────────────────────────────────────────

export async function markQuestWordStep(
  questId: string,
  wordId: string,
  step: 'learned' | 'pronounced' | 'sentence_built'
): Promise<void> {
  const { error } = await supabase
    .from('quest_word_progress')
    .upsert({
      quest_id: questId,
      word_id: wordId,
      [step]: true,
      [`${step}_at`]: new Date().toISOString(),
    }, { onConflict: 'quest_id,word_id' });

  if (error) throw new Error(`Failed to mark quest step: ${error.message}`);
}

// ─── Complete full quest ──────────────────────────────────────────────────────

export async function completeQuest(questId: string, xpEarned: number): Promise<void> {
  const { data: questData, error: fetchError } = await supabase
    .from('daily_quests')
    .select('student_id')
    .eq('id', questId)
    .single();

  if (fetchError) throw new Error(`Failed to fetch quest before completion: ${fetchError.message}`);

  const { error } = await supabase
    .from('daily_quests')
    .update({
      status: 'completed',
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    })
    .eq('id', questId);

  if (error) throw new Error(`Failed to complete quest: ${error.message}`);

  if (questData?.student_id) {
    void evaluateAllActiveHandshakesForStudent(questData.student_id).catch(() => undefined);
  }
}

// ─── Mock quest (Phase 1–4) ───────────────────────────────────────────────────

export async function fetchTodaysQuestMock(
  studentId: string,
  gradeBand: GradeBand = '35'
): Promise<DailyQuest> {
  await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

  const words = getMockWordsByGradeBand(gradeBand);
  const selected = words.slice(0, DAILY_QUEST_WORD_COUNT);

  return {
    id: `mock-quest-${studentId}-${Date.now()}`,
    student_id: studentId,
    date: new Date().toISOString().split('T')[0],
    word_ids: selected.map(w => w.id),
    status: 'pending',
    xp_earned: 0,
    completed_at: null,
  };
}
