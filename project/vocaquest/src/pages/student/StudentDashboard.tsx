// src/pages/student/StudentDashboard.tsx

import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Trophy, Star, ChevronRight } from 'lucide-react';
import { useStudentGameState } from '../../hooks/useStudentGameState';
import { useDailyQuest } from '../../hooks/useDailyQuest';
import { useAuthStore } from '../../store/authStore';
import XPBar from '../../components/gamification/XPBar';
import StreakFlame from '../../components/gamification/StreakFlame';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes.constants';
import { GRADE_BANDS } from '../../constants/worlds.constants';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { gameState, xpProgress, isLoading: gameLoading } = useStudentGameState();
  const { quest, words, isLoading: questLoading } = useDailyQuest();

  const gradeBand = user?.grade_band ?? '35';
  const world = GRADE_BANDS[gradeBand as keyof typeof GRADE_BANDS];

  if (gameLoading || questLoading) return <LoadingSkeleton lines={5} />;

  const questCompleted = quest?.status === 'completed';
  const firstName = user?.full_name?.split(' ')[0] ?? 'Explorer';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-6">
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-gray-500 mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold text-gray-900">{firstName} 👋</h1>

          {/* XP + Level */}
          {gameState && xpProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Level {xpProgress.level} · {xpProgress.title}
                </span>
                <span className="text-xs text-gray-400 font-mono">{gameState.xp_total} XP total</span>
              </div>
              <XPBar xp={gameState.xp_total} showLabel={false} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

        {/* Stats row */}
        {gameState && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Streak"
              value={<StreakFlame streak={gameState.streak_current} size="sm" />}
              sub={`Best: ${gameState.streak_longest}`}
            />
            <StatCard
              label="Mastered"
              value={<span className="text-xl font-bold text-teal-600">{gameState.words_mastered}</span>}
              sub="words"
            />
            <StatCard
              label="Badges"
              value={<span className="text-xl font-bold text-amber-500">{gameState.badges_earned}</span>}
              sub="earned"
            />
          </div>
        )}

        {/* Daily Quest Card */}
        <div className={`rounded-2xl p-5 ${questCompleted
          ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white'
          : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 opacity-80" />
              <span className="font-semibold text-sm opacity-90">Daily Quest</span>
            </div>
            {questCompleted && <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">✓ Complete</span>}
          </div>

          {questCompleted ? (
            <div>
              <p className="text-xl font-bold mb-1">Quest complete! 🎉</p>
              <p className="text-sm opacity-80">You earned +50 XP today. Come back tomorrow!</p>
            </div>
          ) : quest ? (
            <div>
              <p className="text-xl font-bold mb-1">
                {words.length} word{words.length !== 1 ? 's' : ''} waiting
              </p>
              <p className="text-sm opacity-80 mb-4">
                {words.map(w => w?.word).join(' · ')}
              </p>
              <Button
                variant="ghost"
                className="bg-white/20 text-white hover:bg-white/30 border-0"
                onClick={() => navigate(ROUTES.STUDENT_QUEST)}
              >
                Start Quest
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <EmptyState
              emoji="⏳"
              title="No quest today yet"
              description="Your teacher will assign words soon!"
              className="text-white py-4"
            />
          )}
        </div>

        {/* World banner */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${world.color}cc, ${world.color})` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold opacity-80 mb-1">Your World</p>
              <p className="text-xl font-bold">{world.emoji} {world.worldName}</p>
              <p className="text-sm opacity-80">Grades {world.grades}</p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-60" />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            icon={<Trophy className="w-5 h-5 text-amber-500" />}
            label="Boss Battle"
            sub="Weekly challenge"
            onClick={() => navigate(ROUTES.STUDENT_BOSS_BATTLE)}
            color="bg-amber-50"
          />
          <QuickAction
            icon={<Star className="w-5 h-5 text-indigo-500" />}
            label="Achievements"
            sub={`${gameState?.badges_earned ?? 0} badges earned`}
            onClick={() => navigate(ROUTES.STUDENT_ACHIEVEMENTS)}
            color="bg-indigo-50"
          />
          <QuickAction
            icon={<Zap className="w-5 h-5 text-teal-500" />}
            label="Say It Better"
            sub="+25 XP per session"
            onClick={() => navigate(ROUTES.STUDENT_SAY_IT_BETTER)}
            color="bg-teal-50"
          />
          <QuickAction
            icon={<Trophy className="w-5 h-5 text-purple-500" />}
            label="Leaderboard"
            sub="See class rankings"
            onClick={() => navigate(ROUTES.STUDENT_LEADERBOARD)}
            color="bg-purple-50"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-card text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex justify-center">{value}</div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({ icon, label, sub, onClick, color }: {
  icon: React.ReactNode; label: string; sub: string;
  onClick: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} rounded-xl p-4 text-left hover:shadow-card-hover transition-shadow duration-200`}
    >
      <div className="mb-2">{icon}</div>
      <p className="font-semibold text-sm text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">{sub}</p>
    </button>
  );
}
