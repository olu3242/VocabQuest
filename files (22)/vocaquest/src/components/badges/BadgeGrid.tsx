// src/components/badges/BadgeGrid.tsx
import { BadgeItem } from './BadgeItem';

interface Badge { id: string; emoji: string; name: string; desc: string; unlocked: boolean; }

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map(b => <BadgeItem key={b.id} {...b} />)}
    </div>
  );
}
