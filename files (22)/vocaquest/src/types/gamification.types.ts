// src/types/gamification.types.ts
export interface XPEvent {
  id:          string;
  student_id:  string;
  action_type: string;
  xp_amount:   number;
  metadata:    Record<string, unknown>;
  created_at:  string;
}

export interface Badge {
  id:                string;
  name:              string;
  description:       string;
  icon_url?:         string;
  category:          'streak' | 'mastery' | 'world' | 'battle' | 'pronunciation';
  requirement_value: number;
}

export interface LeaderboardEntry {
  student_id:   string;
  classroom_id: string;
  week_start:   string;
  xp_this_week: number;
  rank:         number;
  streak:       number;
  profile?: { full_name: string; avatar_url?: string };
}
