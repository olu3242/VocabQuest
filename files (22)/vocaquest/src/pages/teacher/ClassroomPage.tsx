// src/pages/teacher/ClassroomPage.tsx

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ChevronRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes.constants';

const MOCK_STUDENTS = [
  { id: 's1', name: 'Amara O.',   xp: 2840, streak: 14, mastered: 34, completion: 95, atRisk: false },
  { id: 's2', name: 'Jordan K.',  xp: 2610, streak: 9,  mastered: 29, completion: 88, atRisk: false },
  { id: 's3', name: 'Priya S.',   xp: 1180, streak: 5,  mastered: 18, completion: 72, atRisk: false },
  { id: 's4', name: 'Marcus T.',  xp: 340,  streak: 0,  mastered: 4,  completion: 20, atRisk: true  },
  { id: 's5', name: 'Nia W.',     xp: 210,  streak: 0,  mastered: 2,  completion: 15, atRisk: true  },
  { id: 's6', name: 'Luca M.',    xp: 990,  streak: 3,  mastered: 14, completion: 65, atRisk: false },
];

export default function ClassroomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const atRisk = MOCK_STUDENTS.filter(s => s.atRisk);
  const onTrack = MOCK_STUDENTS.filter(s => !s.atRisk);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <button onClick={() => navigate('/teacher')} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Period 2 — Reading</h1>
        <p className="text-gray-500 text-sm mb-6">{MOCK_STUDENTS.length} students · Grades 3–5</p>

        <div className="flex gap-2 mb-6">
          <Button size="sm" onClick={() => navigate(ROUTES.TEACHER_ASSIGN)}>+ Assign Words</Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.TEACHER_REPORTS)}>Reports</Button>
        </div>

        {atRisk.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-700">At Risk ({atRisk.length})</h2>
            </div>
            <div className="space-y-2">
              {atRisk.map(s => (
                <div key={s.id} onClick={() => navigate(ROUTES.TEACHER_STUDENT(id!, s.id))}
                  className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-card-hover transition-shadow">
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-sm font-bold text-amber-800 flex-shrink-0">{s.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">Streak: {s.streak} · {s.completion}% completion</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">On Track ({onTrack.length})</h2>
          <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-100">
            {onTrack.map(s => (
              <div key={s.id} onClick={() => navigate(ROUTES.TEACHER_STUDENT(id!, s.id))}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">{s.name[0]}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.mastered} mastered · {s.xp.toLocaleString()} XP · 🔥{s.streak}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-teal-600">{s.completion}%</p>
                  <div className="h-1 w-12 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${s.completion}%` }} />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-2" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
