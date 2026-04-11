import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import HandshakeProgressBar from '../../components/handshake/HandshakeProgressBar';
import HandshakeStatusChip from '../../components/handshake/HandshakeStatusChip';
import { useCurrentProfile } from '../../hooks/useCurrentProfile';
import {
  acceptHandshake,
  claimHandshakeReward,
  evaluateHandshakeProgress,
  getHandshakeById,
  getHandshakeClaim,
  getHandshakeProgressEvents,
} from '../../services/handshake.service';
import type { HandshakeAgreement } from '../../types/handshake.types';
import { ROUTES } from '../../constants/routes.constants';
import { useUIStore } from '../../store/uiStore';

export default function StudentHandshakeDetailPage() {
  const { handshakeId = '' } = useParams();
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentProfile();

  const [handshake, setHandshake] = useState<HandshakeAgreement | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [claimStatus, setClaimStatus] = useState<string>('not claimed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addToast = useUIStore((state) => state.addToast);

  const load = async () => {
    if (!handshakeId || !profile?.id || profile.role !== 'student') return;

    try {
      setLoading(true);
      setError(null);
      const [evaluated, current, events, claim] = await Promise.all([
        evaluateHandshakeProgress(handshakeId),
        getHandshakeById(handshakeId),
        getHandshakeProgressEvents(handshakeId),
        getHandshakeClaim(handshakeId),
      ]);

      setHandshake(evaluated.status === current.status ? current : evaluated);
      setEventCount(events.length);
      setClaimStatus(claim?.claim_status ?? 'not claimed');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load handshake detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [handshakeId, profile?.id, profile?.role]);

  const daysLeft = useMemo(() => {
    if (!handshake) return 0;
    return Math.max(0, Math.ceil((new Date(handshake.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [handshake]);

  const onAccept = async () => {
    if (!profile?.id || !handshake) return;
    try {
      await acceptHandshake(profile.id, handshake.id);
      addToast('Handshake accepted.', 'success');
      await load();
    } catch {
      addToast('Unable to accept handshake.', 'error');
    }
  };

  const onClaim = async () => {
    if (!profile?.id || !handshake) return;
    try {
      await claimHandshakeReward(profile.id, handshake.id);
      addToast('Reward claimed.', 'success');
      await load();
    } catch {
      addToast('Reward is not claimable yet.', 'error');
    }
  };

  if (isLoading || loading) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-gray-500">Loading handshake details...</div>;
  }

  if (!profile || profile.role !== 'student') {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-red-600">Student access required.</div>;
  }

  if (!handshake) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-gray-500">Handshake not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-8">
        <Button variant="ghost" onClick={() => navigate(ROUTES.STUDENT_HANDSHAKES)}>← Back to handshake hub</Button>

        {error && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{handshake.title}</h1>
            <HandshakeStatusChip status={handshake.status} />
          </div>

          <p className="text-sm text-gray-600">{handshake.description || 'Challenge agreement'}</p>

          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <HandshakeProgressBar value={Number(handshake.progress_value)} target={Number(handshake.target_value)} />
            <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
              <p>Challenge: {handshake.challenge_type.replace(/_/g, ' ')}</p>
              <p>Target metric: {handshake.target_metric}</p>
              <p>Reward: {handshake.reward_description}</p>
              <p>Claim status: {claimStatus}</p>
              <p>Tracked progress events: {eventCount}</p>
              <p>Days left: {daysLeft}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {handshake.status === 'pending' && <Button onClick={() => void onAccept()}>Accept Handshake</Button>}
            {handshake.status === 'claimable' && <Button variant="xp" onClick={() => void onClaim()}>Claim Reward</Button>}
            {(handshake.status === 'active' || handshake.status === 'pending') && (
              <Button variant="secondary" onClick={() => void load()}>Refresh Progress</Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
