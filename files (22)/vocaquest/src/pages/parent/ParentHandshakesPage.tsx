import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import HandshakeProgressBar from '../../components/handshake/HandshakeProgressBar';
import HandshakeStatusChip from '../../components/handshake/HandshakeStatusChip';
import { useCurrentProfile } from '../../hooks/useCurrentProfile';
import {
  createHandshake,
  getParentHandshakes,
  listLinkedChildren,
} from '../../services/handshake.service';
import {
  HandshakeAgreement,
  HandshakeChallengeType,
  HandshakeRewardType,
  HandshakeStatus,
} from '../../types/handshake.types';
import { ROUTES } from '../../constants/routes.constants';
import { useUIStore } from '../../store/uiStore';

const CHALLENGE_OPTIONS: HandshakeChallengeType[] = [
  'quest_completion',
  'pronunciation_score',
  'sentence_score',
  'streak_target',
  'words_mastered',
  'boss_battle_completion',
  'speaking_confidence_improvement',
  'hybrid_goal',
];

const REWARD_OPTIONS: HandshakeRewardType[] = [
  'xp_bonus',
  'badge_unlock',
  'unlockable_item',
  'parent_real_world_reward',
  'mixed_reward',
];

const DEFAULT_FORM = {
  studentId: '',
  title: '',
  description: '',
  challengeType: 'quest_completion' as HandshakeChallengeType,
  targetMetric: 'completed_quests',
  targetValue: 5,
  minResultValue: '',
  rewardType: 'xp_bonus' as HandshakeRewardType,
  rewardDescription: 'Bonus XP reward',
  rewardValue: 100,
  verificationType: 'automatic',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
};

const FILTERS: Array<'all' | HandshakeStatus> = ['all', 'pending', 'active', 'claimable', 'fulfilled', 'expired'];

interface ChildOption {
  id: string;
  full_name: string;
  grade_band: string | null;
  avatar_url: string | null;
}

export default function ParentHandshakesPage() {
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentProfile();
  const [handshakes, setHandshakes] = useState<HandshakeAgreement[]>([]);
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<'all' | HandshakeStatus>('all');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id || profile.role !== 'parent') return;

      try {
        setLoadingData(true);
        setError(null);

        const [linkedChildren, parentHandshakes] = await Promise.all([
          listLinkedChildren(profile.id),
          getParentHandshakes(profile.id),
        ]);

        setChildren(linkedChildren);
        setHandshakes(parentHandshakes);

        if (!form.studentId && linkedChildren[0]) {
          setForm((prev) => ({ ...prev, studentId: linkedChildren[0].id }));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load handshakes.');
      } finally {
        setLoadingData(false);
      }
    };

    void load();
  }, [profile?.id, profile?.role]);

  const visibleHandshakes = useMemo(() => {
    if (filter === 'all') return handshakes;
    return handshakes.filter((item) => item.status === filter);
  }, [handshakes, filter]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile?.id || profile.role !== 'parent') return;

    try {
      setSubmitting(true);
      setError(null);

      const created = await createHandshake(profile.id, {
        studentId: form.studentId,
        title: form.title,
        description: form.description,
        challengeType: form.challengeType,
        targetMetric: form.targetMetric,
        targetValue: Number(form.targetValue),
        minResultValue: form.minResultValue ? Number(form.minResultValue) : undefined,
        rewardType: form.rewardType,
        rewardDescription: form.rewardDescription,
        rewardValue: Number(form.rewardValue),
        rewardConfig: {
          xpAmount: form.rewardType === 'xp_bonus' ? Number(form.rewardValue) : undefined,
          realWorldRewardRequired:
            form.rewardType === 'parent_real_world_reward' || form.rewardType === 'mixed_reward',
        },
        verificationType: form.verificationType as 'automatic' | 'parent_review' | 'hybrid',
        startDate: form.startDate,
        endDate: form.endDate,
      });

      setHandshakes((prev) => [created, ...prev]);
      setShowCreate(false);
      setForm((prev) => ({ ...DEFAULT_FORM, studentId: prev.studentId }));
      addToast('Handshake created successfully.', 'success');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create handshake.');
      addToast('Failed to create handshake.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingData) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-gray-500">Loading handshake rewards...</div>;
  }

  if (!profile || profile.role !== 'parent') {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-red-600">Parent access required.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Handshake Rewards</p>
            <h1 className="text-2xl font-bold text-gray-900">Family Challenge Agreements</h1>
            <p className="mt-1 text-sm text-gray-500">Create trust-based goals and celebrate progress together.</p>
          </div>
          <Button onClick={() => setShowCreate((prev) => !prev)}>
            {showCreate ? 'Close Builder' : 'Create Handshake'}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-6">
        {error && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {showCreate && (
          <form onSubmit={handleCreate} className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-card">
            <h2 className="text-lg font-bold text-gray-900">New Handshake</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-gray-600">
                Child
                <select
                  value={form.studentId}
                  onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  required
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.full_name} {child.grade_band ? `(${child.grade_band})` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-600">
                Title
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Finish 5 quests this week"
                  required
                />
              </label>

              <label className="text-sm text-gray-600 md:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  rows={3}
                />
              </label>

              <label className="text-sm text-gray-600">
                Challenge Type
                <select
                  value={form.challengeType}
                  onChange={(e) => setForm((prev) => ({ ...prev, challengeType: e.target.value as HandshakeChallengeType }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                >
                  {CHALLENGE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-600">
                Target Metric
                <input
                  value={form.targetMetric}
                  onChange={(e) => setForm((prev) => ({ ...prev, targetMetric: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-600">
                Target Value
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.targetValue}
                  onChange={(e) => setForm((prev) => ({ ...prev, targetValue: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  required
                />
              </label>

              <label className="text-sm text-gray-600">
                Minimum Result (optional)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.minResultValue}
                  onChange={(e) => setForm((prev) => ({ ...prev, minResultValue: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-600">
                Start Date
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  required
                />
              </label>

              <label className="text-sm text-gray-600">
                End Date
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  required
                />
              </label>

              <label className="text-sm text-gray-600">
                Reward Type
                <select
                  value={form.rewardType}
                  onChange={(e) => setForm((prev) => ({ ...prev, rewardType: e.target.value as HandshakeRewardType }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                >
                  {REWARD_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-600">
                Reward Value
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.rewardValue}
                  onChange={(e) => setForm((prev) => ({ ...prev, rewardValue: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  required
                />
              </label>

              <label className="text-sm text-gray-600 md:col-span-2">
                Reward Description
                <input
                  value={form.rewardDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, rewardDescription: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  required
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Create Handshake</Button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === status ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {visibleHandshakes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
              No handshake agreements match this filter yet.
            </div>
          )}

          {visibleHandshakes.map((item) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(item.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

            return (
              <button
                key={item.id}
                onClick={() => navigate(ROUTES.PARENT_HANDSHAKE_DETAIL(item.id))}
                className="w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-card transition hover:shadow-card-hover"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <HandshakeStatusChip status={item.status} />
                </div>
                <p className="mb-3 text-sm text-gray-500">{item.description || 'Family challenge agreement'}</p>
                <HandshakeProgressBar value={Number(item.progress_value)} target={Number(item.target_value)} />
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>Challenge: {item.challenge_type.replace(/_/g, ' ')}</span>
                  <span>Reward: {item.reward_type.replace(/_/g, ' ')}</span>
                  <span>{daysLeft} day(s) left</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
