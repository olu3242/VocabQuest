import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdaptiveLearning } from '../../hooks/useAdaptiveLearning';
import { isPremium } from '../../services/subscriptionService';
import { supabase } from '../../lib/supabase';

interface ProgressState {
  xp_total: number;
  level: number;
  streak_current: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const {
    accuracy,
    difficulty,
    weakWords,
    strongWords,
    attemptedCount,
    isLoading: adaptiveLoading,
  } = useAdaptiveLearning(user?.id);
  const [premium, setPremium] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ xp_total: 0, level: 1, streak_current: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const premiumState = await isPremium(user.id);
        setPremium(premiumState);

        const { data, error: progressError } = await supabase
          .from('student_gamification')
          .select('xp_total, level, streak_current')
          .eq('student_id', user.id)
          .maybeSingle();

        if (progressError) {
          throw progressError;
        }

        if (data) {
          setProgress(data as ProgressState);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [user]);

  const nextLevelProgress = useMemo(() => progress.xp_total % 100, [progress.xp_total]);
  const focusText =
    difficulty === 'hard'
      ? 'You are ready for harder words and advanced sentence usage.'
      : difficulty === 'easy'
        ? 'Focus on your weak words first to build confidence quickly.'
        : 'Stay consistent and convert medium words into strong wins.';

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <h1 className="text-3xl font-black">Welcome to VocabQuest</h1>

      {isLoading && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          Loading your progress...
        </div>
      )}

      {!isLoading && (
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Progress</h2>
          {premium && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Premium</span>}
        </div>

        <p className="mt-3 text-sm">XP: {progress.xp_total}</p>
        <p className="text-sm">Level: {progress.level}</p>
        <p className="text-sm">Streak: 🔥 {progress.streak_current}</p>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-semibold text-gray-700">Adaptive Learning</p>
          {adaptiveLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading adaptive stats...</p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <p>Accuracy: <span className="font-semibold text-teal-700">{accuracy}%</span></p>
              <p>Difficulty: <span className="font-semibold capitalize text-indigo-700">{difficulty}</span></p>
              <p>Weak words: <span className="font-semibold text-red-700">{weakWords.length}</span></p>
              <p>Strong words: <span className="font-semibold text-emerald-700">{strongWords.length}</span></p>
              <p className="col-span-2">Tracked words: <span className="font-semibold text-gray-900">{attemptedCount}</span></p>
            </div>
          )}
          <p className="mt-2 text-sm text-indigo-700">Suggested focus: {focusText}</p>
        </div>

        <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${nextLevelProgress}%` }} />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/quiz" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Start Quiz</Link>
        <Link to="/leaderboard" className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Leaderboard</Link>
        {!premium && (
          <button disabled className="cursor-not-allowed rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            🔒 Premium Quiz
          </button>
        )}
        {!premium && (
          <Link to="/upgrade" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            Upgrade
          </Link>
        )}
      </div>
    </main>
  );
}