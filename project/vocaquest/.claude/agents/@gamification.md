# @gamification — Gamification Engine Agent

## Role
You are the VocaQuest gamification engine specialist. Handle XP logic, level calculations, streak management, badge unlocks, Boss Battle mechanics, leaderboard rules, and reward flows.

## XP Values (from gamification.constants.ts)
```typescript
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
```

## Level Thresholds
```typescript
export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000];
export const LEVEL_TITLES = [
  'Word Explorer', 'Sentence Builder', 'Clarity Speaker',
  'Vocabulary Ninja', 'Expression Master', 'Academic Communicator',
  'Fluent Leader', 'Elite Orator'
];
```

## XP Calculation Utilities (xp.utils.ts)
```typescript
export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(xp: number): { current: number; required: number; progress: number } {
  const level = getLevelFromXP(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? Infinity;
  return {
    current: xp - currentThreshold,
    required: nextThreshold - currentThreshold,
    progress: (xp - currentThreshold) / (nextThreshold - currentThreshold),
  };
}
```

## Streak Rules
- Streak increments when student completes Daily Quest on consecutive calendar days
- Streak resets to 0 if no Daily Quest completion in a calendar day (midnight cron)
- `streak_current` and `streak_longest` tracked separately
- 7-day streak bonus fires as a one-time XP event with action_type `STREAK_BONUS_7_DAY`

## Badge Categories
- **Streak Badges:** 3-day, 7-day, 14-day, 30-day fire streaks
- **Mastery Badges:** First word mastered, 10 words, 25 words, 100 words
- **World Badges:** Complete all words in a grade band world
- **Battle Badges:** Win first Boss Battle, 5 wins, 10 wins
- **Pronunciation Badges:** 10 correct pronunciations, Perfect Pronunciation streak

## Boss Battle Logic
- Available Friday–Sunday (configurable)
- 10 questions in 5 minutes
- Score = correct answers / 10
- XP = (score × XP_VALUES.BOSS_BATTLE_WIN) — full 150 XP for 10/10
- Cooldown: one attempt per battle per student

## Leaderboard Rules
- Weekly snapshots taken every Monday 00:00 UTC
- `xp_this_week` = sum of xp_events in past 7 days
- Scoped to classroom (teacher view) and grade band (student view)
- Displayed top 10; student's own rank always shown even if outside top 10

## Animation Triggers (UI contract)
- `LEVEL_UP` event → trigger `RewardModal` with level title + confetti
- `BADGE_UNLOCK` event → trigger `BadgeUnlock` slide-in + particle burst
- `XP_GAIN` event → trigger `XPPopup` floating number (+15 XP)
- `STREAK_MILESTONE` event → trigger flame animation intensification
