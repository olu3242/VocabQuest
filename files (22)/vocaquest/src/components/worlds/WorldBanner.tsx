// src/components/worlds/WorldBanner.tsx
import { ChevronRight } from 'lucide-react';
import { GRADE_BANDS, GradeBand } from '@/constants/worlds.constants';

export function WorldBanner({ gradeBand }: { gradeBand: GradeBand }) {
  const world = GRADE_BANDS[gradeBand];
  return (
    <div className="rounded-2xl p-5 text-white flex items-center justify-between"
      style={{ background: `linear-gradient(135deg, ${world.color}cc, ${world.color})` }}>
      <div>
        <p className="text-xs font-semibold opacity-70 mb-1">Your World</p>
        <p className="text-xl font-bold">{world.emoji} {world.worldName}</p>
        <p className="text-sm opacity-80">Grades {world.grades}</p>
      </div>
      <ChevronRight className="w-5 h-5 opacity-60" />
    </div>
  );
}
