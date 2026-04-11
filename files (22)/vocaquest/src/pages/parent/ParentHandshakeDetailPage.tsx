import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import HandshakeProgressBar from '../../components/handshake/HandshakeProgressBar';
import HandshakeStatusChip from '../../components/handshake/HandshakeStatusChip';
import { useCurrentProfile } from '../../hooks/useCurrentProfile';
import {
  confirmHandshakeFulfillment,
  evaluateHandshakeProgress,
  getHandshakeById,
  getHandshakeClaim,
} from '../../services/handshake.service';
import type { HandshakeAgreement, HandshakeClaim } from '../../types/handshake.types';
import { ROUTES } from '../../constants/routes.constants';
import { useUIStore } from '../../store/uiStore';

export default function ParentHandshakeDetailPage() {
  const { handshakeId = '' } = useParams();
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentProfile();

  const [handshake, setHandshake] = useState<HandshakeAgreement | null>(null);
  const [claim, setClaim] = useState<HandshakeClaim | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    const load = async () => {
      if (!handshakeId || !profile?.id || profile.role !== 'parent') return;

      try {
        setLoading(true);
        setError(null);
        const [data, claimData] = await Promise.all([
          evaluateHandshakeProgress(handshakeId),
          getHandshakeClaim(handshakeId),
        ]);

        setHandshake(data);
        setClaim(claimData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load handshake.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [handshakeId, profile?.id, profile?.role]);

  const canConfirmFulfillment = useMemo(() => {
    return handshake?.status === 'claimed' && Boolean(profile?.id);
  }, [handshake?.status, profile?.id]);

  const onConfirmFulfillment = async () => {
    if (!profile?.id || !handshake) return;

    try {
      setFulfilling(true);
      const updated = await confirmHandshakeFulfillment(profile.id, handshake.id);
      setHandshake(updated);
      const claimData = await getHandshakeClaim(handshake.id);
      setClaim(claimData);
      addToast('Reward fulfillment confirmed.', 'success');
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Unable to confirm fulfillment.');
      addToast('Unable to confirm fulfillment.', 'error');
    } finally {
      setFulfilling(false);
    }
  };

  if (isLoading || loading) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-gray-500">Loading handshake detail...</div>;
  }

  if (!profile || profile.role !== 'parent') {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-red-600">Parent access required.</div>;
  }

  if (!handshake) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-gray-500">Handshake not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-8">
        <Button variant="ghost" onClick={() => navigate(ROUTES.PARENT_HANDSHAKES)}>← Back to handshakes</Button>

        {error && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{handshake.title}</h1>
            <HandshakeStatusChip status={handshake.status} />
          </div>

          <p className="text-sm text-gray-600">{handshake.description || 'Family accountability challenge'}</p>

          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <HandshakeProgressBar value={Number(handshake.progress_value)} target={Number(handshake.target_value)} />
            <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
              <p>Challenge Type: {handshake.challenge_type.replace(/_/g, ' ')}</p>
              <p>Target Metric: {handshake.target_metric}</p>
              <p>Reward Type: {handshake.reward_type.replace(/_/g, ' ')}</p>
              <p>Reward: {handshake.reward_description}</p>
              <p>Start: {handshake.start_date}</p>
              <p>End: {handshake.end_date}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-card">
          <h2 className="text-lg font-bold text-gray-900">Claim & Fulfillment</h2>
          <p className="mt-1 text-sm text-gray-500">Digital rewards are granted on claim. Real-world rewards require parent confirmation.</p>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>Claim status: {claim?.claim_status ?? 'not claimed yet'}</p>
            <p>Claimed at: {claim?.claimed_at ?? '—'}</p>
            <p>Parent confirmed: {claim?.parent_confirmed_at ?? '—'}</p>
          </div>

          {canConfirmFulfillment && (
            <div className="mt-5 flex gap-2">
              <Button onClick={onConfirmFulfillment} loading={fulfilling}>Confirm Fulfillment</Button>
              <Button variant="secondary" onClick={async () => setHandshake(await getHandshakeById(handshake.id))}>
                Refresh
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
