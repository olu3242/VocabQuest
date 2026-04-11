// src/pages/student/ProfilePage.tsx

import { useAuthStore } from '../../store/authStore';
import { useStudentGameState } from '../../hooks/useStudentGameState';
import XPBar from '../../components/gamification/XPBar';
import StreakFlame from '../../components/gamification/StreakFlame';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { GRADE_BANDS } from '../../constants/worlds.constants';
import { signOut } from '../../services/auth.service';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { GradeBand } from '../../constants/worlds.constants';
import { LogOut, Star, BookOpen } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { gameState, xpProgress, isLoading } = useStudentGameState();
  const navigate = useNavigate();
  const gradeBand = (user?.grade_band ?? '35') as GradeBand;
  const world = GRADE_BANDS[gradeBand];

  if (isLoading) return <LoadingSkeleton lines={4} />;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'VQ';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-10">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white mb-3">
            {initials}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{user?.full_name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: world.color }}>
              {world.emoji} {world.worldName} · Grades {world.grades}
            </span>
          </div>
        </div>

        {/* Level card */}
        {gameState && xpProgress && (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs opacity-70 mb-0.5">Current Level</p>
                <p className="text-2xl font-black">Level {xpProgress.level}</p>
                <p className="text-sm opacity-80">{xpProgress.title}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70 mb-0.5">Total XP</p>
                <p className="text-2xl font-black font-mono">{gameState.xp_total.toLocaleString()}</p>
              </div>
            </div>
            <XPBar xp={gameState.xp_total} showLabel={false} />
            {!xpProgress.isMaxLevel && (
              <p className="text-xs opacity-60 mt-1.5">{xpProgress.nextLevelXP - xpProgress.currentLevelXP} XP to next level</p>
            )}
          </div>
        )}

        {/* Stats grid */}
        {gameState && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <StreakFlame streak={gameState.streak_current} size="sm" />, label: 'Streak', sub: `Best: ${gameState.streak_longest}` },
              { icon: <div className="flex items-center gap-1 text-teal-600 font-bold text-xl"><BookOpen className="w-5 h-5" />{gameState.words_mastered}</div>, label: 'Mastered', sub: 'words' },
              { icon: <div className="flex items-center gap-1 text-amber-500 font-bold text-xl"><Star className="w-5 h-5" />{gameState.badges_earned}</div>, label: 'Badges', sub: 'earned' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="bg-white rounded-xl shadow-card p-3 text-center">
                <div className="flex justify-center mb-1">{icon}</div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Settings section */}
        <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-100 mb-6">
          {[
            { label: 'Grade Band', value: `${world.worldName} (${world.grades})` },
            { label: 'Role',       value: 'Student' },
            { label: 'Account',    value: user?.email ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <Button variant="ghost" fullWidth onClick={handleSignOut} className="text-red-500 hover:bg-red-50">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
