// src/components/gamification/XPBar.tsx

import { useEffect, useRef } from 'react';
import { getXPProgress } from '../../utils/xp.utils';

interface XPBarProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

export default function XPBar({ xp, size = 'md', showLabel = true, className = '' }: XPBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const { level, title, currentLevelXP, nextLevelXP, progressPercent, isMaxLevel } = getXPProgress(xp);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty('--xp-width', `${progressPercent}%`);
    }
  }, [progressPercent]);

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-indigo-700">Lv {level} · {title}</span>
          <span className="text-gray-400 font-mono">
            {isMaxLevel ? 'MAX' : `${currentLevelXP} / ${nextLevelXP} XP`}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          ref={barRef}
          className="xp-bar-fill h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          style={{ '--xp-width': `${progressPercent}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
