// src/pages/student/AchievementsPage.tsx

import { Lock } from 'lucide-react';
import { useStudentGameState } from '../../hooks/useStudentGameState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const ALL_BADGES = [
  { id: 'streak-3',   emoji: '🔥', name: '3-Day Streak',      desc: 'Complete quests 3 days in a row',   req: 3,   stat: 'streak' },
  { id: 'streak-7',   emoji: '⚡', name: 'Week Warrior',       desc: 'Complete quests 7 days in a row',   req: 7,   stat: 'streak' },
  { id: 'streak-14',  emoji: '💥', name: 'Fortnight Fire',     desc: 'Complete quests 14 days in a row',  req: 14,  stat: 'streak' },
  { id: 'streak-30',  emoji: '🌟', name: 'Monthly Master',     desc: '30-day streak champion',            req: 30,  stat: 'streak' },
  { id: 'mastery-1',  emoji: '📖', name: 'First Word',         desc: 'Master your first word',            req: 1,   stat: 'mastered' },
  { id: 'mastery-10', emoji: '📚', name: 'Word Collector',     desc: 'Master 10 words',                   req: 10,  stat: 'mastered' },
  { id: 'mastery-25', emoji: '🎓', name: 'Word Scholar',       desc: 'Master 25 words',                   req: 25,  stat: 'mastered' },
  { id: 'mastery-100',emoji: '🏛️', name: 'Word Champion',     desc: 'Master 100 words',                  req: 100, stat: 'mastered' },
  { id: 'battle-1',   emoji: '⚔️', name: 'First Blood',       desc: 'Win your first Boss Battle',        req: 1,   stat: 'battles' },
  { id: 'battle-5',   emoji: '🗡️', name: 'Battle Hardened',   desc: 'Win 5 Boss Battles',                req: 5,   stat: 'battles' },
  { id: 'speak-10',   emoji: '🎙️', name: 'Voice Activated',   desc: 'Pass 10 pronunciation challenges',  req: 10,  stat: 'pronounce'},
  { id: 'speak-50',   emoji: '📣', name: 'Clear Speaker',      desc: 'Pass 50 pronunciation challenges',  req: 50,  stat: 'pronounce'},
];

export default function AchievementsPage() {
  const { gameState, isLoading } = useStudentGameState();
  if (isLoading) return <LoadingSkeleton lines={4} />;

  const streak = gameState?.streak_current ?? 0;
  const mastered = gameState?.words_mastered ?? 0;
  const earned = gameState?.badges_earned ?? 0;

  const isUnlocked = (badge: typeof ALL_BADGES[0]) => {
    if (badge.stat === 'streak')    return streak   >= badge.req;
    if (badge.stat === 'mastered')  return mastered >= badge.req;
    return false;
  };

  const unlocked = ALL_BADGES.filter(isUnlocked);
  const locked   = ALL_BADGES.filter(b => !isUnlocked(b));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-10">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">Achievements</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Badge Cabinet</h1>
        <p className="text-gray-500 text-sm mb-6">{earned} badge{earned !== 1 ? 's' : ''} earned · {locked.length} to unlock</p>

        {/* Progress bar */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Collection progress</span>
            <span className="font-mono">{unlocked.length} / {ALL_BADGES.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${(unlocked.length / ALL_BADGES.length) * 100}%`, transition: 'width 0.7s' }} />
          </div>
        </div>

        {/* Earned */}
        {unlocked.length > 0 && (
          <section className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">✅ Earned</p>
            <div className="grid grid-cols-2 gap-3">
              {unlocked.map(b => (
                <div key={b.id} className="bg-white rounded-2xl shadow-card p-4 flex items-start gap-3 border border-amber-100">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl flex-shrink-0">{b.emoji}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{b.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Locked */}
        <section>
          <p className="text-sm font-semibold text-gray-700 mb-3">🔒 Locked</p>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-card p-4 flex items-start gap-3 opacity-50">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-700">{b.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
