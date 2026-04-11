// src/components/leaderboards/LeaderboardRow.tsx
import { Zap, Flame } from 'lucide-react';

interface LeaderboardRowProps {
  rank: number; name: string; xp: number; streak: number; isYou?: boolean;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function LeaderboardRow({ rank, name, xp, streak, isYou = false }: LeaderboardRowProps) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl ${isYou ? 'bg-indigo-600 text-white' : 'bg-white shadow-card'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isYou ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
        {MEDALS[rank] ?? rank}
      </div>
      <p className={`flex-1 font-semibold text-sm ${isYou ? 'text-white' : 'text-gray-800'}`}>
        {name}{isYou && <span className="text-xs opacity-70 ml-1">(you)</span>}
      </p>
      <div className={`flex items-center gap-1 text-xs font-semibold ${isYou ? 'text-amber-300' : 'text-amber-500'}`}>
        <Zap className="w-3.5 h-3.5" />{xp.toLocaleString()}
      </div>
      <div className={`flex items-center gap-1 text-xs ${isYou ? 'text-orange-300' : 'text-orange-400'}`}>
        <Flame className="w-3.5 h-3.5" />{streak}
      </div>
    </div>
  );
}
