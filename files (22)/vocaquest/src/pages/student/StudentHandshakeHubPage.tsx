import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import HandshakeProgressBar from '../../components/handshake/HandshakeProgressBar';
import HandshakeStatusChip from '../../components/handshake/HandshakeStatusChip';
import { useCurrentProfile } from '../../hooks/useCurrentProfile';
import {
  acceptHandshake,
  claimHandshakeReward,
  evaluateAllActiveHandshakesForStudent,
  getHandshakeBlockerReason,
  getStudentHandshakes,
} from '../../services/handshake.service';
import type { HandshakeAgreement, HandshakeStatus } from '../../types/handshake.types';
import { ROUTES } from '../../constants/routes.constants';
import { useUIStore } from '../../store/uiStore';

const FILTERS: Array<'all' | HandshakeStatus> = [
  'all',
  'pending_acceptance',
  'accepted',
  'task_in_progress',
  'awaiting_test_initiation',
  'testing_in_progress',
  'awaiting_parent_redemption_review',
  'approved_for_claim',
  'retake_required',
  'claimed',
  'fulfilled',
  'expired',
  'cancelled',
];

export default function StudentHandshakeHubPage() {
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentProfile();

  const [handshakes, setHandshakes] = useState<HandshakeAgreement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<HandshakeAgreement | null>(null);
  const [filter, setFilter] = useState<'all' | HandshakeStatus>('all');
  const addToast = useUIStore((state) => state.addToast);

  const load = async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await evaluateAllActiveHandshakesForStudent(studentId);
      const rows = await getStudentHandshakes(studentId);
      const becameClaimable = rows.find((item) => item.status === 'approved_for_claim');
      if (becameClaimable) {
        setCelebration(becameClaimable);
      }
      setHandshakes(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load handshake rewards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile?.id || profile.role !== 'student') return;
    void load(profile.id);
  }, [profile?.id, profile?.role]);

  const visible = useMemo(() => {
    if (filter === 'all') return handshakes;
    return handshakes.filter((item) => item.status === filter);
  }, [handshakes, filter]);

  const onAccept = async (handshakeId: string) => {
    if (!profile?.id) return;
    try {
      await acceptHandshake(profile.id, handshakeId);
      addToast('Handshake accepted. Progress tracking is now active.', 'success');
      await load(profile.id);
    } catch {
      addToast('Unable to accept handshake.', 'error');
    }
  };

  const onClaim = async (handshakeId: string) => {
    if (!profile?.id) return;
    try {
      await claimHandshakeReward(profile.id, handshakeId);
      addToast('Reward claimed successfully.', 'success');
      await load(profile.id);
    } catch {
      addToast('Unable to claim reward yet.', 'error');
    }
  };

  if (isLoading || loading) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-gray-500">Loading handshake hub...</div>;
  }

  if (!profile || profile.role !== 'student') {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-red-600">Student access required.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Handshake Hub</p>
          <h1 className="text-2xl font-bold text-gray-900">Parent Challenges & Rewards</h1>
          <p className="mt-1 text-sm text-gray-500">Accept challenge handshakes, build progress, and claim your rewards.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-6">
        {error && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

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

        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No handshakes available yet. Check back after your parent creates one.
          </div>
        )}

        {visible.map((item) => {
          const dueDate = item.due_date ?? item.end_date;
          const daysLeft = Math.max(0, Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          const blockerReason = getHandshakeBlockerReason(item);
          return (
            <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                <HandshakeStatusChip status={item.status} />
              </div>

              <p className="mb-3 text-sm text-gray-500">{item.description || 'Learning challenge agreement'}</p>
              <HandshakeProgressBar value={Number(item.progress_value)} target={Number(item.target_value)} />
              <p className="mt-2 text-xs text-gray-500">{daysLeft} day(s) left · Reward: {item.reward_description}</p>
              {blockerReason && item.status !== 'approved_for_claim' && (
                <p className="mt-1 text-xs text-amber-700">Blocked: {blockerReason}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => navigate(ROUTES.STUDENT_HANDSHAKE_DETAIL(item.id))}>View Details</Button>
                {item.status === 'pending_acceptance' && (
                  <Button onClick={() => void onAccept(item.id)}>Accept Handshake</Button>
                )}
                {item.status === 'approved_for_claim' && (
                  <Button variant="xp" onClick={() => void onClaim(item.id)}>Claim Reward</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {celebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-4xl">🎉</p>
            <h3 className="mt-2 text-xl font-bold text-gray-900">Reward Unlocked!</h3>
            <p className="mt-2 text-sm text-gray-600">{celebration.title} is now claimable. Keep up the momentum!</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="xp" onClick={() => void onClaim(celebration.id)}>Claim Now</Button>
              <Button variant="ghost" onClick={() => setCelebration(null)}>Later</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
