import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdminStats } from './useAdminStats';

const MAX_WORD_TARGET = 25000;

function hasAdminAccess(email: string | undefined, role: unknown) {
  const allowedEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((entry: string) => entry.trim().toLowerCase())
    .filter(Boolean);

  const byEmail = !!email && allowedEmails.includes(email.toLowerCase());
  const byRole = role === 'admin';

  return byEmail || byRole;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const {
    isLoading,
    error,
    totalWords,
    totalSentences,
    difficultyBreakdown,
    gradeBreakdown,
    lastGeneration,
    automationEnabled,
    lastAutoRun,
    generateWords,
    setAutomation,
  } = useAdminStats();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [actionError, setActionError] = useState('');

  const role = (user?.app_metadata as Record<string, unknown> | undefined)?.role
    ?? (user?.user_metadata as Record<string, unknown> | undefined)?.role;
  const isAdmin = hasAdminAccess(user?.email, role);

  const progress = useMemo(() => {
    return Math.min(100, Math.round((totalWords / MAX_WORD_TARGET) * 100));
  }, [totalWords]);

  if (loading || isLoading) {
    return <main className="mx-auto max-w-5xl p-6">Loading admin dashboard...</main>;
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Admin Access Required</h1>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to view this page.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-indigo-600">Back to Dashboard</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <span>Auto Generation</span>
            <button
              type="button"
              disabled={isToggling}
              onClick={async () => {
                setActionError('');
                setIsToggling(true);
                try {
                  await setAutomation(!automationEnabled);
                } catch (toggleError) {
                  setActionError(toggleError instanceof Error ? toggleError.message : 'Toggle failed.');
                } finally {
                  setIsToggling(false);
                }
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${automationEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'} disabled:opacity-60`}
            >
              {automationEnabled ? 'ON' : 'OFF'}
            </button>
          </label>

          <button
            type="button"
            disabled={isGenerating}
            onClick={async () => {
              setActionError('');
              setIsGenerating(true);
              try {
                await generateWords();
              } catch (invokeError) {
                setActionError(invokeError instanceof Error ? invokeError.message : 'Generation failed.');
              } finally {
                setIsGenerating(false);
              }
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isGenerating ? 'Generating...' : 'Generate Words'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {actionError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Words</p>
          <p className="text-2xl font-bold">{totalWords.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Sentences</p>
          <p className="text-2xl font-bold">{totalSentences.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Word Bank Progress</p>
          <p className="text-2xl font-bold">{progress}%</p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-500">{totalWords} / {MAX_WORD_TARGET}</p>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Difficulty Breakdown</h2>
          <ul className="space-y-2 text-sm">
            {difficultyBreakdown.map((row) => (
              <li key={row.label} className="flex justify-between border-b border-gray-100 pb-2">
                <span>{row.label}</span>
                <span className="font-semibold">{row.count}</span>
              </li>
            ))}
            {difficultyBreakdown.length === 0 && <li className="text-gray-500">No data</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Grade Distribution</h2>
          <ul className="space-y-2 text-sm">
            {gradeBreakdown.map((row) => (
              <li key={row.label} className="flex justify-between border-b border-gray-100 pb-2">
                <span>{row.label}</span>
                <span className="font-semibold">{row.count}</span>
              </li>
            ))}
            {gradeBreakdown.length === 0 && <li className="text-gray-500">No data</li>}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Last Generation Result</h2>
        {lastGeneration ? (
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <p>total_inserted: <strong>{lastGeneration.total_inserted}</strong></p>
            <p>skipped_duplicates: <strong>{lastGeneration.skipped_duplicates}</strong></p>
            <p>prefiltered_duplicates: <strong>{lastGeneration.prefiltered_duplicates}</strong></p>
            <p>invalid_entries: <strong>{lastGeneration.invalid_entries}</strong></p>
            <p>failed_batches: <strong>{lastGeneration.failed_batches}</strong></p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No generation has run yet in this session.</p>
        )}

        <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
          <p>last_auto_run: <strong>{lastAutoRun?.run_at ? new Date(lastAutoRun.run_at).toLocaleString() : 'Never'}</strong></p>
          <p>last_auto_inserted: <strong>{lastAutoRun?.total_inserted ?? 0}</strong></p>
          <p>last_auto_failed_batches: <strong>{lastAutoRun?.failed_batches ?? 0}</strong></p>
        </div>
      </section>
    </main>
  );
}