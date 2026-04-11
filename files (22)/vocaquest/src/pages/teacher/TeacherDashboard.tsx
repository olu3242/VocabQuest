// src/pages/teacher/TeacherDashboard.tsx

import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, ClipboardList, BarChart2, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes.constants';

const MOCK_CLASSROOMS = [
  { id: 'cls1', name: 'Period 2 — Reading',   grade_band: '35',  students: 24, completion: 72, atRisk: 3 },
  { id: 'cls2', name: 'Period 4 — Vocabulary', grade_band: '68', students: 28, completion: 58, atRisk: 5 },
  { id: 'cls3', name: 'Period 6 — Advanced',   grade_band: '912',students: 19, completion: 89, atRisk: 1 },
];

const MOCK_AT_RISK = [
  { name: 'Marcus T.', streak: 0, completion: 20, lastActive: '5 days ago' },
  { name: 'Nia W.',    streak: 0, completion: 15, lastActive: '3 days ago' },
  { name: 'Dev P.',    streak: 1, completion: 33, lastActive: 'Yesterday'  },
];

const BAND_COLORS: Record<string, string> = { k2: '#10B981', '35': '#3B82F6', '68': '#8B5CF6', '912': '#EF4444' };

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const firstName = user?.full_name?.split(' ')[0] ?? 'Teacher';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-500 mb-0.5">Welcome back,</p>
          <h1 className="text-2xl font-bold text-gray-900">{firstName} 👩‍🏫</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <Users className="w-4 h-4 text-indigo-500" />, value: '71', label: 'Students',   bg: 'bg-indigo-50' },
            { icon: <BarChart2 className="w-4 h-4 text-teal-500" />, value: '73%', label: 'Avg completion', bg: 'bg-teal-50' },
            { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, value: '9', label: 'At risk',  bg: 'bg-amber-50' },
            { icon: <ClipboardList className="w-4 h-4 text-purple-500" />, value: '3', label: 'Classes',  bg: 'bg-purple-50' },
          ].map(({ icon, value, label, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <div className="flex justify-center mb-1">{icon}</div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Classrooms */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">My Classrooms</h2>
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.TEACHER_ASSIGN)}>+ Assign Words</Button>
          </div>
          <div className="space-y-3">
            {MOCK_CLASSROOMS.map(cls => (
              <div key={cls.id} onClick={() => navigate(ROUTES.TEACHER_CLASSROOM(cls.id))}
                className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: BAND_COLORS[cls.grade_band] }}>
                  {cls.grade_band.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">{cls.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{cls.students} students</span>
                    {cls.atRisk > 0 && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">⚠️ {cls.atRisk} at risk</span>}
                  </div>
                  {/* Completion bar */}
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${cls.completion}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{cls.completion}% quest completion today</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* At-risk students */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">⚠️ At-Risk Students</h2>
          <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-100">
            {MOCK_AT_RISK.map(s => (
              <div key={s.name} className="flex items-center gap-4 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
                  {s.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">Last active: {s.lastActive} · {s.completion}% this week</p>
                </div>
                <span className="text-xs font-semibold text-red-500">Streak: {s.streak}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📋', label: 'Assign Words',  sub: 'Set this week\'s quest',  route: ROUTES.TEACHER_ASSIGN },
            { icon: '📊', label: 'View Reports',  sub: 'Performance analytics',   route: ROUTES.TEACHER_REPORTS },
            { icon: '🏆', label: 'Leaderboard',   sub: 'Class rankings',          route: '/teacher/leaderboard' },
            { icon: '⚔️', label: 'Create Battle', sub: 'Custom Boss Battle',      route: '/teacher/challenges' },
          ].map(({ icon, label, sub, route }) => (
            <button key={label} onClick={() => navigate(route)}
              className="bg-white rounded-xl shadow-card p-4 text-left hover:shadow-card-hover transition-shadow">
              <p className="text-2xl mb-2">{icon}</p>
              <p className="font-semibold text-sm text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
