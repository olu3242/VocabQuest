// src/types/quest.types.ts
export interface QuestWordProgress {
  id:               string;
  quest_id:         string;
  word_id:          string;
  learned:          boolean;
  learned_at?:      string;
  pronounced:       boolean;
  pronounced_at?:   string;
  sentence_built:   boolean;
  sentence_built_at?: string;
}

export interface BossBattle {
  id:              string;
  title:           string;
  grade_band:      string;
  word_ids:        string[];
  xp_reward:       number;
  time_limit_secs: number;
  available_from?: string;
  available_until?:string;
  created_by?:     string;
  created_at:      string;
}
