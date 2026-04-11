// src/components/charts/StreakCalendar.tsx
// 7-week heatmap showing daily quest completion

interface StreakCalendarProps { activeDays?: Set<string>; }

function getLast49Days(): string[] {
  return Array.from({ length: 49 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (48 - i));
    return d.toISOString().split('T')[0];
  });
}

export function StreakCalendar({ activeDays = new Set() }: StreakCalendarProps) {
  const days = getLast49Days();
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <p className="text-sm font-semibold text-gray-700 mb-3">Activity (last 7 weeks)</p>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => (
          <div key={day} title={day}
            className={`w-full aspect-square rounded-md ${activeDays.has(day) ? 'bg-indigo-500' : 'bg-gray-100'}`} />
        ))}
      </div>
    </div>
  );
}
