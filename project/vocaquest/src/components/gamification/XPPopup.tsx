// src/components/gamification/XPPopup.tsx
// Floating "+15 XP" popup that animates upward then fades

import { useEffect, useState } from 'react';

interface XPPopupProps {
  amount: number;
  onComplete?: () => void;
}

export default function XPPopup({ amount, onComplete }: XPPopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed z-50 inset-0 flex items-center justify-center">
      <span
        className="text-2xl font-bold text-amber-500 font-mono animate-[floatUp_1.2s_ease-out_forwards] drop-shadow-lg"
      >
        +{amount} XP
      </span>
    </div>
  );
}
