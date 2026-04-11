// src/pages/onboarding/RoleSelectionPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import { UserRole } from '../../types/student.types';
import { getRoleRedirectPath } from '../../services/auth.service';
import { GradeBand, GRADE_BANDS } from '../../constants/worlds.constants';

const ROLES: { role: UserRole; emoji: string; label: string; desc: string }[] = [
  { role: 'student', emoji: '🎮', label: 'Student',  desc: 'I want to level up my vocabulary' },
  { role: 'parent',  emoji: '👨‍👩‍👧', label: 'Parent',   desc: 'I want to track my child\'s progress' },
  { role: 'teacher', emoji: '👩‍🏫', label: 'Teacher',  desc: 'I want to manage my classroom' },
];

export default function RoleSelectionPage() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [role, setRole]         = useState<UserRole>('student');
  const [gradeBand, setGradeBand] = useState<GradeBand>('35');
  const [loading, setLoading]   = useState(false);

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updates: Record<string, string> = { role };
      if (role === 'student') updates.grade_band = gradeBand;

      await supabase.from('profiles').update(updates).eq('id', user.id);
      setUser({ ...user, role, grade_band: role === 'student' ? gradeBand : undefined });
      navigate(getRoleRedirectPath(role));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">👋</p>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to VocaQuest!</h1>
          <p className="text-gray-500 text-sm mt-1">Tell us a bit about yourself</p>
        </div>

        <p className="text-sm font-semibold text-gray-700 mb-3">I am a…</p>
        <div className="space-y-2 mb-6">
          {ROLES.map(r => (
            <button key={r.role} onClick={() => setRole(r.role)}
              className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-all ${role === r.role ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
              <span className="text-2xl">{r.emoji}</span>
              <div>
                <p className="font-semibold text-gray-800">{r.label}</p>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {role === 'student' && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">My grade band</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(GRADE_BANDS) as [GradeBand, typeof GRADE_BANDS[GradeBand]][]).map(([key, band]) => (
                <button key={key} onClick={() => setGradeBand(key)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${gradeBand === key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                  <span className="text-xl">{band.emoji}</span>
                  <p className="text-xs font-semibold text-gray-800 mt-1">{band.worldName}</p>
                  <p className="text-xs text-gray-400">Grades {band.grades}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button fullWidth size="lg" loading={loading} onClick={handleContinue}>
          Let's Go! 🚀
        </Button>
      </div>
    </div>
  );
}
