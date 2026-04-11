// src/components/worlds/WorldMap.tsx
import { GRADE_BANDS } from '@/constants/worlds.constants';

export function WorldMap() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(GRADE_BANDS).map(([key, band]) => (
        <div key={key} className="rounded-2xl p-4 text-white" style={{ backgroundColor: band.color }}>
          <p className="text-2xl mb-1">{band.emoji}</p>
          <p className="font-bold text-sm">{band.worldName}</p>
          <p className="text-xs opacity-80">Grades {band.grades}</p>
        </div>
      ))}
    </div>
  );
}
