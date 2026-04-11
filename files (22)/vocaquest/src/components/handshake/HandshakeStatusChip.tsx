import type { HandshakeStatus } from '../../types/handshake.types';

const STATUS_STYLES: Record<HandshakeStatus, string> = {
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
