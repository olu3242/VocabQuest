// src/services/pronunciation.service.ts
// v1: Web Speech API SpeechRecognition
// v2: Audio blob → Supabase Edge Function → Whisper API

import { XP_VALUES } from '../constants/gamification.constants';

export interface SpeechRecognitionResultLike {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
}

export interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export interface PronunciationResult {
  recognized: string;
  targetWord: string;
  clarity: number;        // 0.0 – 1.0
  confidence: number;     // Speech API confidence
  passed: boolean;        // clarity >= 0.75
  xpEarned: number;
  feedback: string;
  attemptNumber: number;
}

// ─── Web Speech API recorder ─────────────────────────────────────────────────

export function createSpeechRecognizer(): SpeechRecognitionLike | null {
  const SpeechRecognitionAPI =
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
      .webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) return null;

  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 3;
  return recognition;
}

export function scorePronunciation(
  recognized: string,
  targetWord: string,
  confidence: number,
  attemptNumber: number
): PronunciationResult {
  const normalizedRecognized = recognized.toLowerCase().trim();
  const normalizedTarget = targetWord.toLowerCase().trim();

  // Exact match
  if (normalizedRecognized === normalizedTarget || normalizedRecognized.includes(normalizedTarget)) {
    const clarity = Math.min(0.75 + confidence * 0.25, 1.0);
    return {
      recognized,
      targetWord,
      clarity,
      confidence,
      passed: true,
      xpEarned: XP_VALUES.PRONUNCIATION_CORRECT,
      feedback: clarity > 0.9
        ? 'Perfect pronunciation! Crystal clear! 🎯'
        : 'Great job! Your pronunciation was clear and accurate.',
      attemptNumber,
    };
  }

  // Partial similarity check (simple edit distance approximation)
  const similarity = stringSimilarity(normalizedRecognized, normalizedTarget);
  const clarity = similarity * confidence;

  if (clarity >= 0.75) {
    return {
      recognized,
      targetWord,
      clarity,
      confidence,
      passed: true,
      xpEarned: XP_VALUES.PRONUNCIATION_CORRECT,
      feedback: 'Good pronunciation! Keep it up.',
      attemptNumber,
    };
  }

  return {
    recognized,
    targetWord,
    clarity,
    confidence,
    passed: false,
    xpEarned: XP_VALUES.PRONUNCIATION_ATTEMPT,
    feedback: attemptNumber === 1
      ? `Heard "${recognized}". Try again — say the word slowly and clearly.`
      : `Say "${targetWord}" one syllable at a time. You've got this!`,
    attemptNumber,
  };
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
