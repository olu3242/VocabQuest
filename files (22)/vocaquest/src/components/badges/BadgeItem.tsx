// src/components/badges/BadgeItem.tsx
import { Lock } from 'lucide-react';

interface BadgeItemProps {
  emoji:    string;
  name:     string;
  desc:     string;
  unlocked: boolean;
}

export function BadgeItem({ emoji, name, desc, unlocked }: BadgeItemProps) {
  return (
    <div className={`bg-white rounded-2xl p-4 flex items-start gap-3 border transition-all ${unlocked ? 'border-amber-100 shadow-sm' : 'opacity-50'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${unlocked ? 'bg-amber-50' : 'bg-gray-100'}`}>
        {unlocked ? emoji : <Lock className="w-5 h-5 text-gray-400" />}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-800">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
