// src/pages/student/BossBattlePage.tsx

import { useState, useEffect, useRef } from 'react';
import { Trophy, Timer, CheckCircle, XCircle, Zap } from 'lucide-react';
import { MOCK_WORDS } from '../../data/mockWords';
import { useAuthStore } from '../../store/authStore';
import { GradeBand } from '../../constants/worlds.constants';
import { XP_VALUES, BOSS_BATTLE_QUESTION_COUNT, BOSS_BATTLE_TIME_LIMIT_SECONDS } from '../../constants/gamification.constants';
import Button from '../../components/common/Button';
import XPPopup from '../../components/gamification/XPPopup';

type Phase = 'intro' | 'battle' | 'results';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function BossBattlePage() {
  const { user } = useAuthStore();
  const gradeBand = (user?.grade_band ?? '35') as GradeBand;
  const words = shuffle(MOCK_WORDS.filter(w => w.grade_band === gradeBand)).slice(0, BOSS_BATTLE_QUESTION_COUNT);

  const [phase, setPhase] = useState<Phase>('intro');
  const [qIdx, setQIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(BOSS_BATTLE_TIME_LIMIT_SECONDS);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showXP, setShowXP] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'battle') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); setPhase('results'); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  if (words.length === 0) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-gray-500">No words available for your grade band.</p></div>;
  }

  const currentWord = words[qIdx];

  // Build 4 answer choices: correct def + 3 distractors
  const choices = currentWord ? shuffle([
    { text: currentWord.definition, correct: true },
    ...shuffle(MOCK_WORDS.filter(w => w.id !== currentWord.id)).slice(0, 3).map(w => ({ text: w.definition, correct: false })),
  ]) : [];

  const handleAnswer = (choice: { text: string; correct: boolean }) => {
    if (selected) return;
    setSelected(choice.text);
    const isCorrect = choice.correct;
    if (isCorrect) setCorrect(c => c + 1);
    setAnswers(a => [...a, isCorrect]);
    setTimeout(() => {
      if (qIdx + 1 >= words.length) {
        clearInterval(timerRef.current!);
        setPhase('results');
        setShowXP(true);
      } else {
        setQIdx(i => i + 1);
        setSelected(null);
      }
    }, 900);
  };

  const xpEarned = Math.round((correct / words.length) * XP_VALUES.BOSS_BATTLE_WIN);
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  // ─── Intro ────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-4">⚔️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Weekly Boss Battle</h1>
        <p className="text-gray-500 mb-6 text-sm">Answer {words.length} vocabulary questions in {BOSS_BATTLE_TIME_LIMIT_SECONDS / 60} minutes. Win up to <span className="font-bold text-amber-500">+{XP_VALUES.BOSS_BATTLE_WIN} XP</span>.</p>
        <div className="bg-white rounded-2xl shadow-card p-5 mb-6 text-left space-y-2">
          {[`${words.length} questions`, `${BOSS_BATTLE_TIME_LIMIT_SECONDS / 60}-minute timer`, 'Choose the correct definition', 'XP based on score'].map(r => (
            <div key={r} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />{r}</div>
          ))}
        </div>
        <Button fullWidth size="lg" onClick={() => setPhase('battle')}>Start Battle ⚔️</Button>
      </div>
    </div>
  );

  // ─── Battle ───────────────────────────────────────────────────────────────
  if (phase === 'battle' && currentWord) return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-20">
        {/* HUD */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <span>{qIdx + 1}</span><span className="text-gray-300">/</span><span className="text-gray-400">{words.length}</span>
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
            <Timer className="w-3.5 h-3.5" />{mins}:{secs}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
            <Zap className="w-3.5 h-3.5" />{correct} correct
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(qIdx / words.length) * 100}%` }} />
        </div>

        {/* Word */}
        <div className="bg-indigo-600 text-white rounded-2xl p-6 text-center mb-6">
          <p className="text-xs opacity-70 mb-1 font-semibold uppercase tracking-widest">What does this mean?</p>
          <p className="text-3xl font-bold capitalize">{currentWord.word}</p>
          <p className="text-sm opacity-60 font-mono mt-1">{currentWord.phonetic}</p>
        </div>

        {/* Choices */}
        <div className="space-y-3">
          {choices.map((choice, i) => {
            const isSelected = selected === choice.text;
            const reveal = !!selected;
            let bg = 'bg-white hover:bg-indigo-50 border-gray-200';
            if (reveal && isSelected && choice.correct) bg = 'bg-teal-50 border-teal-400';
            else if (reveal && isSelected && !choice.correct) bg = 'bg-red-50 border-red-400';
            else if (reveal && choice.correct) bg = 'bg-teal-50 border-teal-300';
            return (
              <button key={i} onClick={() => handleAnswer(choice)} disabled={!!selected}
                className={`w-full text-left rounded-xl border-2 p-4 text-sm text-gray-800 font-medium transition-all ${bg} disabled:cursor-default`}>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{choice.text}</span>
                  {reveal && choice.correct && <CheckCircle className="w-4 h-4 text-teal-500 ml-auto flex-shrink-0 mt-0.5" />}
                  {reveal && isSelected && !choice.correct && <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0 mt-0.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─── Results ──────────────────────────────────────────────────────────────
  const pct = Math.round((correct / words.length) * 100);
  const grade = pct >= 90 ? 'S' : pct >= 70 ? 'A' : pct >= 50 ? 'B' : 'C';
  const gradeColor = { S: 'text-amber-500', A: 'text-teal-600', B: 'text-indigo-500', C: 'text-gray-500' }[grade];

  return (
    <div className="min-h-screen bg-background pb-20">
      {showXP && <XPPopup amount={xpEarned} onComplete={() => setShowXP(false)} />}
      <div className="max-w-lg mx-auto px-4 pt-10 text-center">
        <div className="text-6xl mb-3">{pct >= 80 ? '🏆' : pct >= 50 ? '⚔️' : '💪'}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Battle Complete!</h1>
        <p className="text-gray-500 text-sm mb-6">You answered {correct} of {words.length} correctly</p>

        {/* Score ring */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-5 inline-flex flex-col items-center w-full">
          <div className={`text-7xl font-black mb-2 ${gradeColor}`}>{grade}</div>
          <p className="text-3xl font-bold text-gray-900">{pct}%</p>
          <p className="text-sm text-gray-500 mt-1">{correct} / {words.length} correct</p>
          <div className="mt-4 flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-600">+{xpEarned} XP earned</span>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="bg-white rounded-2xl shadow-card p-5 mb-6 text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Question breakdown</p>
          <div className="flex flex-wrap gap-2">
            {answers.map((correct, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${correct ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-500'}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <Button fullWidth size="lg" onClick={() => { setPhase('intro'); setQIdx(0); setCorrect(0); setSelected(null); setTimeLeft(BOSS_BATTLE_TIME_LIMIT_SECONDS); setAnswers([]); }}>
          <Trophy className="w-4 h-4" /> Battle Again
        </Button>
      </div>
    </div>
  );
}
