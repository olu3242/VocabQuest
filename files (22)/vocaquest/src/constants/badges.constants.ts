// src/constants/badges.constants.ts

export const ALL_BADGES = [
  { id: 'streak-3',    emoji: '🔥', name: '3-Day Streak',    desc: 'Complete quests 3 days in a row',  category: 'streak',  req: 3,   stat: 'streak_current'  },
  { id: 'streak-7',    emoji: '⚡', name: 'Week Warrior',     desc: 'Complete quests 7 days in a row',  category: 'streak',  req: 7,   stat: 'streak_current'  },
  { id: 'streak-14',   emoji: '💥', name: 'Fortnight Fire',   desc: 'Complete quests 14 days in a row', category: 'streak',  req: 14,  stat: 'streak_current'  },
  { id: 'streak-30',   emoji: '🌟', name: 'Monthly Master',   desc: '30-day streak champion',           category: 'streak',  req: 30,  stat: 'streak_current'  },
  { id: 'mastery-1',   emoji: '📖', name: 'First Word',       desc: 'Master your first word',           category: 'mastery', req: 1,   stat: 'words_mastered'  },
  { id: 'mastery-10',  emoji: '📚', name: 'Word Collector',   desc: 'Master 10 words',                  category: 'mastery', req: 10,  stat: 'words_mastered'  },
  { id: 'mastery-25',  emoji: '🎓', name: 'Word Scholar',     desc: 'Master 25 words',                  category: 'mastery', req: 25,  stat: 'words_mastered'  },
  { id: 'mastery-100', emoji: '🏛️', name: 'Word Champion',   desc: 'Master 100 words',                 category: 'mastery', req: 100, stat: 'words_mastered'  },
  { id: 'battle-1',    emoji: '⚔️', name: 'First Blood',     desc: 'Win your first Boss Battle',       category: 'battle',  req: 1,   stat: 'battles_won'     },
  { id: 'battle-5',    emoji: '🗡️', name: 'Battle Hardened', desc: 'Win 5 Boss Battles',               category: 'battle',  req: 5,   stat: 'battles_won'     },
  { id: 'speak-10',    emoji: '🎙️', name: 'Voice Activated', desc: 'Pass 10 pronunciation challenges', category: 'speak',   req: 10,  stat: 'pronunciations'  },
  { id: 'speak-50',    emoji: '📣', name: 'Clear Speaker',    desc: 'Pass 50 pronunciation challenges', category: 'speak',   req: 50,  stat: 'pronunciations'  },
] as const;

export type BadgeId = typeof ALL_BADGES[number]['id'];
