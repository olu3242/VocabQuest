interface HandshakeProgressBarProps {
  value: number;
  target: number;
}

export default function HandshakeProgressBar({ value, target }: HandshakeProgressBarProps) {
  const safeTarget = target > 0 ? target : 1;
  const percent = Math.min(100, Math.round((value / safeTarget) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span>Progress</span>
        <span className="font-mono">{value.toFixed(0)} / {target.toFixed(0)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-teal-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
