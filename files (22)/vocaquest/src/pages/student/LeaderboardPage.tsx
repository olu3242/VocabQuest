// src/pages/student/LeaderboardPage.tsx

import { Zap, Flame } from 'lucide-react';
import { useStudentGameState } from '../../hooks/useStudentGameState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Amara O.', xp: 2840, streak: 14, isYou: false },
  { rank: 2, name: 'Jordan K.', xp: 2610, streak: 9,  isYou: false },
  { rank: 3, name: 'You',       xp: 1240, streak: 7,  isYou: true  },
  { rank: 4, name: 'Priya S.', xp: 1180, streak: 5,  isYou: false },
  { rank: 5, name: 'Luca M.',  xp: 990,  streak: 3,  isYou: false },
  { rank: 6, name: 'Destiny W.',xp: 780, streak: 2,  isYou: false },
  { rank: 7, name: 'Noah T.',  xp: 540,  streak: 1,  isYou: false },
];

const rankMedal: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const { isLoading } = useStudentGameState();
  if (isLoading) return <LoadingSkeleton lines={5} />;

  const topThree = MOCK_LEADERBOARD.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-10">
        <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">Leaderboard</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">This Week's Rankings</h1>
        <p className="text-gray-500 text-sm mb-6">XP earned in the last 7 days · resets Monday</p>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 mb-8">
          {[topThree[1], topThree[0], topThree[2]].map((p, i) => {
            const heights = ['h-20', 'h-28', 'h-16'];
            const accent  = ['bg-gray-200', 'bg-amber-400', 'bg-orange-300'];
            return (
              <div key={p.rank} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700">
                  {p.name[0]}
                </div>
                <p className="text-xs font-semibold text-gray-700 text-center max-w-[60px] truncate">{p.name}</p>
                <div className={`w-16 ${heights[i]} ${accent[i]} rounded-t-xl flex items-center justify-center text-2xl`}>
                  {rankMedal[p.rank]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="space-y-2">
          {MOCK_LEADERBOARD.map(player => (
            <div key={player.rank} className={`rounded-2xl px-4 py-3 flex items-center gap-4 ${player.isYou ? 'bg-indigo-600 text-white' : 'bg-white shadow-card'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${player.isYou ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {rankMedal[player.rank] ?? player.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${player.isYou ? 'text-white' : 'text-gray-800'}`}>
                  {player.name} {player.isYou && <span className="text-xs opacity-70">(you)</span>}
                </p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${player.isYou ? 'text-amber-300' : 'text-amber-500'}`}>
                <Zap className="w-3.5 h-3.5" />{player.xp.toLocaleString()} XP
              </div>
              <div className={`flex items-center gap-1 text-xs ${player.isYou ? 'text-orange-300' : 'text-orange-400'}`}>
                <Flame className="w-3.5 h-3.5" />{player.streak}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
