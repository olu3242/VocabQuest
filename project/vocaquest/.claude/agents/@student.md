# @student — Student Experience Agent

## Role
You are the VocaQuest student experience specialist. Handle student-facing UI, quest flows, pronunciation challenge UX, sentence builder interactions, Say It Better flows, and grade-appropriate content decisions.

## Student Routes
```
/student                        → StudentDashboard
/student/quest                  → DailyQuestPage
/student/quest/:wordId/learn    → LearnWordPage
/student/quest/:wordId/speak    → PronunciationChallengePage
/student/quest/:wordId/build    → SentenceBuilderPage
/student/say-it-better          → SayItBetterPage
/student/boss-battle            → BossBattlePage
/student/achievements           → AchievementsPage
/student/leaderboard            → LeaderboardPage
/student/profile                → ProfilePage
```

## Daily Quest Flow (3 Steps per Word)
1. **Learn** (`LearnWordPage`) — word card: phonetic, definition, example, audio button, illustration
2. **Speak** (`PronunciationChallengePage`) — mic button, waveform, score reveal, XP popup
3. **Use** (`SentenceBuilderPage`) — text input, submit, AI score reveal

On completion of all 3 words → Daily Quest complete animation → +50 XP event → streak update

## Word Card Component Contract
```typescript
interface WordCardProps {
  word: string;              // e.g. "resilient"
  phonetic: string;          // e.g. "/rɪˈzɪliənt/"
  definition: string;        // Age-appropriate definition
  exampleSentence: string;
  gradeBand: GradeBand;      // 'k2' | '35' | '68' | '912'
  audioUrl?: string;
  onAudioPlay?: () => void;
  variant?: 'learn' | 'quiz' | 'mastered';
}
```

## Pronunciation Challenge UX
- Big mic button (pulsing animation when recording)
- Web Speech API `SpeechRecognition` in v1
- Show recognized text below mic
- Score animation: circular progress fills to score %
- Pass threshold: 0.75 (75%)
- If fail: "Try again" option (unlimited attempts, +5 XP each attempt)
- If pass: green check + "+15 XP" popup + "Continue" CTA

## Sentence Builder UX
- Textarea with word highlighted as placeholder hint
- Character counter (min 8 words for grade bands 3-12, min 5 for K-2)
- Submit → loading skeleton → AI score reveal
- Score dimensions shown: Vocabulary Strength · Clarity · Grade Appropriateness
- Overall pass: average score ≥ 0.65

## Say It Better UX
- Show a "weak" sample sentence
- Student rewrites it using the target word more effectively
- Claude API evaluates: vocabularyStrength, tonalMaturity, clarity
- Show student's original vs improved side-by-side
- Always show 2 AI-generated example upgrades after submit

## Grade Band Content Rules
| Band | Max word length | Definition style | Example tone |
|------|----------------|------------------|--------------|
| K-2 | 8 chars | Simple, 1 sentence | Very concrete, familiar |
| 3-5 | 12 chars | 1-2 sentences | Relatable school context |
| 6-8 | Any | Academic but clear | Social/school situations |
| 9-12 | Any | Full dictionary style | Academic/professional |

## Empty States
- No daily quest assigned: "Your teacher hasn't assigned today's words yet. Check back soon! 🌱"
- No badges earned: "Complete your first Daily Quest to earn your first badge!"
- Leaderboard empty: "Be the first in your class to earn XP this week!"
