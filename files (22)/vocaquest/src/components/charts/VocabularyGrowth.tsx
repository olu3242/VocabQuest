// src/components/charts/VocabularyGrowth.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK = [
  { week: 'Wk1', words: 5 }, { week: 'Wk2', words: 12 }, { week: 'Wk3', words: 18 },
  { week: 'Wk4', words: 22 }, { week: 'Wk5', words: 29 }, { week: 'Wk6', words: 34 },
];

export function VocabularyGrowth({ data = MOCK }: { data?: typeof MOCK }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">Vocabulary Growth</p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data}>
          <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Line type="monotone" dataKey="words" stroke="#4F46E5" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
