// src/types/student.types.ts

import { GradeBand } from '../constants/worlds.constants';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  grade_band?: GradeBand;
  avatar_url?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentGameState {
  student_id: string;
  xp_total: number;
  level: number;
  streak_current: number;
  streak_longest: number;
  last_active_date: string | null;
  badges_earned: number;
  words_mastered: number;
}

export type WordMasteryStatus = 'unseen' | 'learning' | 'practiced' | 'mastered';

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  example_sentence: string;
  grade_band: GradeBand;
  difficulty: 1 | 2 | 3;
  audio_url?: string;
  topic_tags?: string[];
}

export interface StudentWordProgress {
  student_id: string;
  word_id: string;
  status: WordMasteryStatus;
  mastery_score: number;
  attempts: number;
  last_practiced_at: string | null;
}

export interface DailyQuest {
  id: string;
  student_id: string;
  date: string;
  word_ids: string[];
  status: 'pending' | 'in_progress' | 'completed';
  xp_earned: number;
  completed_at: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: 'streak' | 'mastery' | 'world' | 'battle' | 'pronunciation';
  requirement_value: number;
}

export interface StudentBadge {
  badge_id: string;
  badge: Badge;
  earned_at: string;
}
