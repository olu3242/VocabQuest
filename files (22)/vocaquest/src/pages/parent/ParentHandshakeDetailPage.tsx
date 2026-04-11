import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import HandshakeProgressBar from '../../components/handshake/HandshakeProgressBar';
import HandshakeStatusChip from '../../components/handshake/HandshakeStatusChip';
import { useCurrentProfile } from '../../hooks/useCurrentProfile';
import {
  approveHandshakeRedemption,
  cancelHandshake,
  confirmHandshakeFulfillment,
  evaluateHandshakeProgress,
  fundHandshake,
  getHandshakeById,
  getHandshakeClaim,
  initiateHandshakeTest,
  rejectHandshakeRedemption,
  scoreHandshakeTest,
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
  const [busy, setBusy] = useState(false);
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

  const withRefresh = async () => {
    if (!handshakeId) return;
    const [data, claimData] = await Promise.all([
      evaluateHandshakeProgress(handshakeId),
      getHandshakeClaim(handshakeId),
    ]);
    setHandshake(data);
    setClaim(claimData);
  };

  const handleFund = async () => {
    if (!profile?.id || !handshake) return;
    try {
      setBusy(true);
      await fundHandshake({
        parentId: profile.id,
        handshakeId: handshake.id,
        fundingType: 'wallet_commitment',
        amount: Number(handshake.reward_value ?? 1),
      });
      await withRefresh();
      addToast('Handshake funded and sent to child.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fund handshake.');
      addToast('Unable to fund handshake.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleStartTest = async () => {
    if (!profile?.id || !handshake) return;
    try {
      setBusy(true);
      const session = await initiateHandshakeTest({
        parentId: profile.id,
        handshakeId: handshake.id,
        testType: handshake.task_type || 'mixed_knowledge',
      });
      const syntheticScore = Number(handshake.progress_percent ?? 0);
      await scoreHandshakeTest({
        handshakeId: handshake.id,
        sessionId: session.id,
        scoreValue: syntheticScore,
        analysisPayload: {
          source: 'handshake_progress_percent',
          score: syntheticScore,
        },
      });
      await withRefresh();
      addToast('Knowledge test initiated and scored.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to initiate test.');
      addToast('Unable to initiate test.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    if (!profile?.id || !handshake) return;
    try {
      setBusy(true);
      await approveHandshakeRedemption({ parentId: profile.id, handshakeId: handshake.id });
      await withRefresh();
      addToast('Redemption approved for child claim.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve redemption.');
      addToast('Unable to approve redemption.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (requireRetake: boolean) => {
    if (!profile?.id || !handshake) return;
    try {
      setBusy(true);
      await rejectHandshakeRedemption({ parentId: profile.id, handshakeId: handshake.id, requireRetake });
      await withRefresh();
      addToast(requireRetake ? 'Retake required set.' : 'Redemption rejected.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update redemption review.');
      addToast('Unable to update redemption review.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!profile?.id || !handshake) return;
    try {
      setBusy(true);
      await cancelHandshake(profile.id, handshake.id);
      await withRefresh();
      addToast('Handshake cancelled.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to cancel handshake.');
      addToast('Unable to cancel handshake.', 'error');
    } finally {
      setBusy(false);
    }
  };

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
              <p>Funding: {handshake.funding_status}</p>
              <p>Minimum Score: {handshake.minimum_score_required ?? handshake.min_result_value ?? '—'}</p>
              <p>Start: {handshake.start_date}</p>
              <p>Due: {handshake.due_date ?? handshake.end_date}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(handshake.status === 'initiated' || handshake.status === 'draft') && handshake.funding_status !== 'funded' && (
              <Button onClick={() => void handleFund()} loading={busy}>Fund Handshake</Button>
            )}
            {['accepted', 'task_in_progress', 'awaiting_test_initiation'].includes(handshake.status) && (
              <Button variant="secondary" onClick={() => void handleStartTest()} loading={busy}>Initiate Knowledge Test</Button>
            )}
            {handshake.status === 'awaiting_parent_redemption_review' && (
              <>
                <Button variant="xp" onClick={() => void handleApprove()} loading={busy}>Approve Claim</Button>
                <Button variant="secondary" onClick={() => void handleReject(true)} loading={busy}>Require Retake</Button>
                <Button variant="ghost" onClick={() => void handleReject(false)} loading={busy}>Reject</Button>
              </>
            )}
            {!['fulfilled', 'claimed', 'cancelled', 'expired'].includes(handshake.status) && (
              <Button variant="ghost" onClick={() => void handleCancel()} loading={busy}>Cancel</Button>
            )}
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
