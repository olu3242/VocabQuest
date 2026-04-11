// src/pages/teacher/TeacherReportsPage.tsx

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COMPLETION_DATA = [
  { week: 'Wk 1', cls1: 62, cls2: 55, cls3: 78 },
  { week: 'Wk 2', cls1: 70, cls2: 60, cls3: 82 },
  { week: 'Wk 3', cls1: 65, cls2: 58, cls3: 88 },
  { week: 'Wk 4', cls1: 72, cls2: 58, cls3: 89 },
];

const PRONUNCIATION_DATA = [
  { name: 'Amara',  score: 94 }, { name: 'Jordan', score: 89 }, { name: 'Priya',  score: 84 },
  { name: 'Luca',   score: 76 }, { name: 'Marcus', score: 52 }, { name: 'Nia',    score: 48 },
];

export default function TeacherReportsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <button onClick={() => navigate('/teacher')} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Class Reports</h1>

        <div className="bg-white rounded-2xl shadow-card p-5 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Weekly Quest Completion (%)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={COMPLETION_DATA}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[40, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="cls1" stroke="#4F46E5" strokeWidth={2} dot={false} name="Period 2" />
              <Line type="monotone" dataKey="cls2" stroke="#0D9488" strokeWidth={2} dot={false} name="Period 4" />
              <Line type="monotone" dataKey="cls3" stroke="#F59E0B" strokeWidth={2} dot={false} name="Period 6" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[['#4F46E5','Period 2'],['#0D9488','Period 4'],['#F59E0B','Period 6']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: c }} />{l}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Pronunciation Accuracy by Student</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={PRONUNCIATION_DATA} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={52} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v}%`, 'Score']} />
              <Bar dataKey="score" fill="#4F46E5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
