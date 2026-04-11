// src/services/gamification.service.ts

import { supabase } from './supabase';
import { StudentGameState } from '../types/student.types';
import { XP_VALUES, XPActionType } from '../constants/gamification.constants';
import { getLevelFromXP, getLevelTitle } from '../utils/xp.utils';

// ─── Fetch student game state ─────────────────────────────────────────────────

export async function fetchStudentGameState(studentId: string): Promise<StudentGameState> {
  const { data, error } = await supabase
    .from('student_gamification')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (error) throw new Error(`Failed to fetch game state: ${error.message}`);
  return data as StudentGameState;
}

// ─── Award XP ─────────────────────────────────────────────────────────────────

export interface AwardXPResult {
  xpAwarded: number;
  newXPTotal: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  newLevelTitle?: string;
}

export async function awardXP(
  studentId: string,
  action: XPActionType,
  metadata?: Record<string, unknown>
): Promise<AwardXPResult> {
  const xpAmount = XP_VALUES[action];

  // Get current state first
  const currentState = await fetchStudentGameState(studentId);
  const previousLevel = getLevelFromXP(currentState.xp_total);

  // Insert XP event — DB trigger handles the rest
  const { error } = await supabase.from('xp_events').insert({
    student_id: studentId,
    action_type: action,
    xp_amount: xpAmount,
    metadata: metadata ?? {},
  });

  if (error) throw new Error(`Failed to award XP: ${error.message}`);

  // Fetch updated state
  const updatedState = await fetchStudentGameState(studentId);
  const newLevel = getLevelFromXP(updatedState.xp_total);
  const leveledUp = newLevel > previousLevel;

  return {
    xpAwarded: xpAmount,
    newXPTotal: updatedState.xp_total,
    previousLevel,
    newLevel,
    leveledUp,
    newLevelTitle: leveledUp ? getLevelTitle(newLevel) : undefined,
  };
}

// ─── Fetch badges ─────────────────────────────────────────────────────────────

export async function fetchStudentBadges(studentId: string) {
  const { data, error } = await supabase
    .from('student_badges')
    .select('*, badge:badges(*)')
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch badges: ${error.message}`);
  return data;
}

// ─── Fetch leaderboard ────────────────────────────────────────────────────────

export async function fetchClassLeaderboard(classroomId: string, limit = 10) {
  const { data, error } = await supabase
    .from('leaderboard_snapshots')
    .select('*, profile:profiles(full_name, avatar_url)')
    .eq('classroom_id', classroomId)
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  return data;
}

// ─── Mock fallback (Phase 1–4) ────────────────────────────────────────────────

export async function fetchStudentGameStateMock(studentId: string): Promise<StudentGameState> {
  await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
  return {
    student_id: studentId,
    xp_total: 1240,
    level: 4,
    streak_current: 7,
    streak_longest: 14,
    last_active_date: new Date().toISOString(),
    badges_earned: 5,
    words_mastered: 22,
  };
}
