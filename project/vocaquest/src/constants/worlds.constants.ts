// src/constants/worlds.constants.ts

export type GradeBand = 'k2' | '35' | '68' | '912';

export const GRADE_BANDS: Record<GradeBand, {
  label: string;
  worldName: string;
  grades: string;
  color: string;
  emoji: string;
  minWordLength: number;
  minSentenceWords: number;
}> = {
  k2: {
    label: 'Word Garden',
    worldName: 'Word Garden',
    grades: 'K–2',
    color: '#10B981',
    emoji: '🌱',
    minWordLength: 1,
    minSentenceWords: 5,
  },
  '35': {
    label: 'Sentence City',
    worldName: 'Sentence City',
    grades: '3–5',
    color: '#3B82F6',
    emoji: '🏙️',
    minWordLength: 1,
    minSentenceWords: 8,
  },
  '68': {
    label: 'Expression Academy',
    worldName: 'Expression Academy',
    grades: '6–8',
    color: '#8B5CF6',
    emoji: '🎭',
    minWordLength: 1,
    minSentenceWords: 8,
  },
  '912': {
    label: 'Fluency Arena',
    worldName: 'Fluency Arena',
    grades: '9–12',
    color: '#EF4444',
    emoji: '🏟️',
    minWordLength: 1,
    minSentenceWords: 10,
  },
};
