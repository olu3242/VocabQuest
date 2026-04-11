// src/pages/parent/ParentDashboard.tsx

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChevronRight, TrendingUp, Zap, BookOpen } from 'lucide-react';
import { ROUTES } from '../../constants/routes.constants';

const MOCK_CHILDREN = [
  { id: 'c1', name: 'Aisha',  grade: 'Grade 4', xp: 1240, streak: 7,  mastered: 22, completion: 88 },
  { id: 'c2', name: 'Kofi',   grade: 'Grade 2', xp: 540,  streak: 3,  mastered: 10, completion: 65 },
];

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const firstName = user?.full_name?.split(' ')[0] ?? 'Parent';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-5">
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-gray-500 mb-0.5">Welcome back,</p>
          <h1 className="text-2xl font-bold text-gray-900">{firstName}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Your Children</h2>
        {MOCK_CHILDREN.map(child => (
          <div key={child.id} onClick={() => navigate(ROUTES.PARENT_CHILD(child.id))}
            className="bg-white rounded-2xl shadow-card p-5 cursor-pointer hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">{child.name[0]}</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{child.name}</p>
                <p className="text-sm text-gray-500">{child.grade}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Zap className="w-3.5 h-3.5 text-amber-500" />, value: child.xp.toLocaleString(), label: 'XP' },
                { icon: <span className="text-sm">🔥</span>, value: child.streak, label: 'Streak' },
                { icon: <BookOpen className="w-3.5 h-3.5 text-teal-500" />, value: child.mastered, label: 'Words' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="flex justify-center mb-0.5">{icon}</div>
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Weekly completion</span><span>{child.completion}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${child.completion}%` }} />
              </div>
            </div>
          </div>
        ))}

        <div className="bg-indigo-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <p className="text-sm font-semibold text-indigo-800">Weekly Summary</p>
          </div>
          <p className="text-sm text-indigo-700">Your children completed <strong>88%</strong> of their quests this week. Aisha is on a <strong>7-day streak</strong>! 🔥</p>
          <button
            onClick={() => navigate(ROUTES.PARENT_HANDSHAKES)}
            className="mt-3 text-xs font-semibold text-indigo-700 underline-offset-2 hover:underline"
          >
            Open Handshake Rewards →
          </button>
        </div>
      </div>
    </div>
  );
}
