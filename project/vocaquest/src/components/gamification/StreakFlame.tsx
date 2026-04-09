// src/components/gamification/StreakFlame.tsx

import { getStreakFlameLevel } from '../../utils/streak.utils';

interface StreakFlameProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const sizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl' };
const countSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl' };

const flameEmojis = {
  cold: '🌱',
  warm: '🔥',
  hot: '🔥',
  blazing: '⚡🔥',
};

const flameColors = {
  cold: 'text-gray-400',
  warm: 'text-amber-500',
  hot: 'text-orange-500',
  blazing: 'text-red-500',
};

export default function StreakFlame({ streak, size = 'md', showCount = true, className = '' }: StreakFlameProps) {
  const level = getStreakFlameLevel(streak);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`${sizes[size]} ${streak > 0 ? 'animate-[flamePulse_1.5s_ease-in-out_infinite]' : ''}`}>
        {flameEmojis[level]}
      </span>
      {showCount && (
        <span className={`font-bold font-mono ${countSizes[size]} ${flameColors[level]}`}>
          {streak}
        </span>
      )}
    </div>
  );
}
