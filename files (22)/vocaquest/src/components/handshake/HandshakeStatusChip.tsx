import type { HandshakeStatus } from '../../types/handshake.types';

const STATUS_STYLES: Record<HandshakeStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-700',
  initiated: 'bg-indigo-50 text-indigo-700',
  funded: 'bg-teal-100 text-teal-700',
  pending_acceptance: 'bg-slate-100 text-slate-700',
  accepted: 'bg-indigo-100 text-indigo-700',
  task_in_progress: 'bg-blue-100 text-blue-700',
  awaiting_test_initiation: 'bg-orange-100 text-orange-700',
  testing_in_progress: 'bg-cyan-100 text-cyan-700',
  scored_passed: 'bg-emerald-100 text-emerald-700',
  scored_failed: 'bg-rose-100 text-rose-700',
  awaiting_parent_redemption_review: 'bg-amber-100 text-amber-700',
  approved_for_claim: 'bg-lime-100 text-lime-700',
  retake_required: 'bg-fuchsia-100 text-fuchsia-700',
  redemption_rejected: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-700',
  active: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-blue-100 text-blue-700',
  claimable: 'bg-amber-100 text-amber-700',
  claimed: 'bg-purple-100 text-purple-700',
  fulfilled: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-zinc-200 text-zinc-700',
};

export default function HandshakeStatusChip({ status }: { status: HandshakeStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
