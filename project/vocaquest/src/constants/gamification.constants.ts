// src/constants/gamification.constants.ts

export const XP_VALUES = {
  LEARN_WORD: 10,
  PRONUNCIATION_ATTEMPT: 5,
  PRONUNCIATION_CORRECT: 15,
  SENTENCE_BUILDER: 20,
  SAY_IT_BETTER: 25,
  READ_ALOUD: 30,
  DAILY_QUEST_COMPLETE: 50,
  STREAK_BONUS_7_DAY: 100,
  BOSS_BATTLE_WIN: 150,
} as const;

export type XPActionType = keyof typeof XP_VALUES;

export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000] as const;

export const LEVEL_TITLES = [
  'Word Explorer',
  'Sentence Builder',
  'Clarity Speaker',
  'Vocabulary Ninja',
  'Expression Master',
  'Academic Communicator',
  'Fluent Leader',
  'Elite Orator',
] as const;

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

export const PRONUNCIATION_PASS_THRESHOLD = 0.75;
export const SENTENCE_PASS_THRESHOLD = 0.65;

export const DAILY_QUEST_WORD_COUNT = 3;

export const BOSS_BATTLE_QUESTION_COUNT = 10;
export const BOSS_BATTLE_TIME_LIMIT_SECONDS = 300; // 5 minutes
