// src/components/leaderboards/LeaderboardTable.tsx
import { LeaderboardRow } from './LeaderboardRow';

interface Entry { rank: number; name: string; xp: number; streak: number; isYou?: boolean; }

export function LeaderboardTable({ entries }: { entries: Entry[] }) {
  return (
    <div className="space-y-2">
      {entries.map(e => <LeaderboardRow key={e.rank} {...e} />)}
    </div>
  );
}
