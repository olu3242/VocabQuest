// src/pages/teacher/StudentPerformancePage.tsx

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Mic, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const XP_DATA = [
  { day: 'Mon', xp: 60 }, { day: 'Tue', xp: 130 }, { day: 'Wed', xp: 90 }, { day: 'Thu', xp: 200 },
  { day: 'Fri', xp: 170 }, { day: 'Sat', xp: 50 }, { day: 'Sun', xp: 140 },
];

export default function StudentPerformancePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Student header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">P</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Priya S.</h1>
            <p className="text-sm text-gray-500">Grade 3–5 · Sentence City</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: <Zap className="w-4 h-4 text-amber-500" />, value: '1,180', label: 'XP' },
            { icon: <BookOpen className="w-4 h-4 text-teal-500" />, value: '18', label: 'Mastered' },
            { icon: '🔥', value: '5', label: 'Streak' },
            { icon: <Mic className="w-4 h-4 text-indigo-500" />, value: '84%', label: 'Pronunciation' },
          ].map(({ icon, value, label }) => (
            <div key={label} className="bg-white rounded-xl shadow-card p-3 text-center">
              <div className="flex justify-center mb-1 text-lg">{icon}</div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* XP Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">XP This Week</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={XP_DATA}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="xp" stroke="#4F46E5" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent quests */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Recent Quests</p>
          <div className="space-y-2">
            {[
              { date: 'Today',      words: 'resilient, collaborate, adequate', completed: true,  xp: 50 },
              { date: 'Yesterday',  words: 'persevere, inquisitive',           completed: true,  xp: 50 },
              { date: '2 days ago', words: 'brave, curious',                   completed: false, xp: 0  },
            ].map((q, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${q.completed ? 'bg-teal-500' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-700">{q.date}</p>
                  <p className="text-xs text-gray-400">{q.words}</p>
                </div>
                <span className={`text-xs font-semibold ${q.completed ? 'text-amber-500' : 'text-gray-400'}`}>
                  {q.completed ? `+${q.xp} XP` : 'Incomplete'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
