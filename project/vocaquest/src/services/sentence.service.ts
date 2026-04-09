// src/services/sentence.service.ts
// Sentence scoring via Supabase Edge Function → Claude API
// v1: mock scoring | v2: real Claude API via Edge Function

import { supabase } from './supabase';
import { GradeBand } from '../constants/worlds.constants';
import { XP_VALUES } from '../constants/gamification.constants';

export interface SentenceScoreResult {
  vocabularyStrength: number;   // 0.0 – 1.0
  clarity: number;              // 0.0 – 1.0
  gradeAppropriateness: number; // 0.0 – 1.0
  overallScore: number;         // average of above
  passed: boolean;              // overallScore >= 0.65
  feedback: string;
  xpEarned: number;
}

export interface SayItBetterResult {
  vocabularyStrength: number;
  tonalMaturity: number;
  clarity: number;
  overallScore: number;
  feedback: string;
  alternatives: string[];
  xpEarned: number;
}

// ─── Real scoring via Edge Function ──────────────────────────────────────────

export async function scoreSentence(
  sentence: string,
  targetWord: string,
  gradeBand: GradeBand
): Promise<SentenceScoreResult> {
  const { data, error } = await supabase.functions.invoke('score-sentence', {
    body: { sentence, targetWord, gradeBand, mode: 'sentence' },
  });

  if (error) {
    console.warn('Edge function unavailable, falling back to mock scoring');
    return scoreSentenceMock(sentence, targetWord);
  }

  return {
    ...data,
    passed: data.overallScore >= 0.65,
    xpEarned: data.passed ? XP_VALUES.SENTENCE_BUILDER : 0,
  };
}

export async function scoreSayItBetter(
  originalSentence: string,
  improvedSentence: string,
  targetWord: string,
  gradeBand: GradeBand
): Promise<SayItBetterResult> {
  const { data, error } = await supabase.functions.invoke('score-sentence', {
    body: { originalSentence, improvedSentence, targetWord, gradeBand, mode: 'sayItBetter' },
  });

  if (error) {
    console.warn('Edge function unavailable, falling back to mock scoring');
    return scoreSayItBetterMock(improvedSentence, targetWord);
  }

  return {
    ...data,
    xpEarned: XP_VALUES.SAY_IT_BETTER,
  };
}

// ─── Mock scoring (Phase 1–4) ─────────────────────────────────────────────────

export async function scoreSentenceMock(
  sentence: string,
  targetWord: string
): Promise<SentenceScoreResult> {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

  const wordUsed = sentence.toLowerCase().includes(targetWord.toLowerCase());
  const wordCount = sentence.trim().split(/\s+/).length;
  const hasGoodLength = wordCount >= 6;

  const vocabularyStrength = wordUsed ? 0.65 + Math.random() * 0.3 : 0.2 + Math.random() * 0.3;
  const clarity = hasGoodLength ? 0.6 + Math.random() * 0.35 : 0.4 + Math.random() * 0.2;
  const gradeAppropriateness = 0.6 + Math.random() * 0.35;
  const overallScore = (vocabularyStrength + clarity + gradeAppropriateness) / 3;
  const passed = overallScore >= 0.65;

  const feedbackOptions = passed
    ? [
        `Great use of "${targetWord}"! Your sentence clearly shows you understand the meaning.`,
        `Well done! The sentence flows naturally and demonstrates strong vocabulary usage.`,
        `Excellent! You used "${targetWord}" in a meaningful context.`,
      ]
    : [
        `Try using "${targetWord}" more centrally in the sentence to show its meaning.`,
        `Good effort! Try writing a longer sentence that gives more context around "${targetWord}".`,
        `Almost there! Make sure "${targetWord}" is clearly the key word in your sentence.`,
      ];

  return {
    vocabularyStrength,
    clarity,
    gradeAppropriateness,
    overallScore,
    passed,
    feedback: feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)],
    xpEarned: passed ? XP_VALUES.SENTENCE_BUILDER : 0,
  };
}

export async function scoreSayItBetterMock(
  _improvedSentence: string,
  targetWord: string
): Promise<SayItBetterResult> {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

  const vocabularyStrength = 0.65 + Math.random() * 0.3;
  const tonalMaturity = 0.6 + Math.random() * 0.35;
  const clarity = 0.65 + Math.random() * 0.3;
  const overallScore = (vocabularyStrength + tonalMaturity + clarity) / 3;

  return {
    vocabularyStrength,
    tonalMaturity,
    clarity,
    overallScore,
    feedback: `Your rewrite uses "${targetWord}" with more precision and confidence. Well done!`,
    alternatives: [
      `The team demonstrated ${targetWord} resilience by continuing despite three consecutive losses.`,
      `Her ${targetWord} approach to the challenge inspired everyone around her.`,
    ],
    xpEarned: XP_VALUES.SAY_IT_BETTER,
  };
}
