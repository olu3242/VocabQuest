// src/pages/parent/ChildProgressPage.tsx

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const XP_DATA = [
  { week: 'Wk 1', xp: 320 }, { week: 'Wk 2', xp: 510 }, { week: 'Wk 3', xp: 280 },
  { week: 'Wk 4', xp: 590 }, { week: 'Wk 5', xp: 470 }, { week: 'Wk 6', xp: 640 },
];

const RECENT_WORDS = ['resilient', 'collaborate', 'adequate', 'persevere', 'inquisitive'];

export default function ChildProgressPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-10">
        <button onClick={() => navigate('/parent')} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">A</div>
          <div><h1 className="text-xl font-bold text-gray-900">Aisha</h1><p className="text-sm text-gray-500">Grade 4 · Sentence City</p></div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[['1,240','Total XP'],['7','Day Streak'],['22','Words Mastered']].map(([v,l]) => (
            <div key={l} className="bg-white rounded-xl shadow-card p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{v}</p>
              <p className="text-xs text-gray-400">{l}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">XP Growth (6 weeks)</p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={XP_DATA}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="xp" stroke="#4F46E5" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Recently Mastered Words</p>
          <div className="flex flex-wrap gap-2">
            {RECENT_WORDS.map(w => (
              <span key={w} className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full capitalize">{w}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
