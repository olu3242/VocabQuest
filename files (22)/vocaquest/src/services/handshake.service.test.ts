import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fromMock, rpcMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: {
    from: fromMock,
    rpc: rpcMock,
  },
}));

import {
  acceptHandshake,
  claimHandshakeReward,
  confirmHandshakeFulfillment,
  createHandshake,
  initiateHandshakeTest,
} from './handshake.service';

function buildSelectChain(response: { data: unknown; error: unknown }) {
  return {
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(response),
    single: vi.fn().mockResolvedValue(response),
    order: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
  };
}

describe('handshake.service workflow guards', () => {
  beforeEach(() => {
    fromMock.mockReset();
    rpcMock.mockReset();
  });

  it('parent can only create handshake for linked child', async () => {
    const parentLinkChain = buildSelectChain({ data: null, error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === 'parent_child_links') {
        return {
          select: vi.fn().mockReturnValue(parentLinkChain),
        };
      }

      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    await expect(
      createHandshake('parent-1', {
        studentId: 'student-1',
        title: 'Quest Goal',
        challengeType: 'quest_completion',
        targetMetric: 'completed_quests',
        targetValue: 3,
        rewardType: 'xp_bonus',
        rewardDescription: 'XP reward',
        rewardValue: 100,
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      })
    ).rejects.toThrow('Parent is not linked to this student.');
  });

  it('unfunded handshake cannot be accepted', async () => {
    const handshake = {
      id: 'h-1',
      student_id: 'student-1',
      parent_id: 'parent-1',
      status: 'pending_acceptance',
      funding_status: 'not_funded',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: handshake, error: null })),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    await expect(acceptHandshake('student-1', 'h-1')).rejects.toThrow('Handshake must be funded before acceptance.');
  });

  it('child can accept funded handshake', async () => {
    const handshake = {
      id: 'h-2',
      student_id: 'student-1',
      parent_id: 'parent-1',
      status: 'pending_acceptance',
      funding_status: 'funded',
      accepted_at: null,
      reward_config: {},
      challenge_type: 'quest_completion',
      target_value: 3,
      start_date: '2026-04-01',
      due_date: '2026-04-30',
      end_date: '2026-04-30',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: handshake, error: null })),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        };
      }
      if (table === 'handshake_progress_events' || table === 'handshake_activity_log') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      if (table === 'daily_quests') {
        const chain = {
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockResolvedValue({ count: 0, error: null }),
        };
        return { select: vi.fn().mockReturnValue(chain) };
      }
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { ...handshake, status: 'accepted', funding_status: 'funded' }, error: null }),
      };
    });

    const result = await acceptHandshake('student-1', 'h-2');
    expect(result.student_id).toBe('student-1');
  });

  it('parent can initiate test only after acceptance', async () => {
    const handshake = {
      id: 'h-3',
      student_id: 'student-1',
      parent_id: 'parent-1',
      status: 'pending_acceptance',
      funding_status: 'funded',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: handshake, error: null })),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    await expect(
      initiateHandshakeTest({ parentId: 'parent-1', handshakeId: 'h-3', testType: 'vocabulary_quiz' })
    ).rejects.toThrow('Child must accept and progress task before testing starts.');
  });

  it('early claim is blocked before parent approval', async () => {
    const handshake = {
      id: 'h-4',
      student_id: 'student-1',
      parent_id: 'parent-1',
      status: 'awaiting_parent_redemption_review',
      funding_status: 'funded',
      accepted_at: '2026-04-10T00:00:00.000Z',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: handshake, error: null })),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    await expect(claimHandshakeReward('student-1', 'h-4')).rejects.toThrow('Awaiting parent redemption decision.');
  });

  it('expired handshake cannot be claimed', async () => {
    const handshake = {
      id: 'h-5',
      student_id: 'student-1',
      parent_id: 'parent-1',
      status: 'expired',
      funding_status: 'funded',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: handshake, error: null })),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    await expect(claimHandshakeReward('student-1', 'h-5')).rejects.toThrow('This handshake can no longer be claimed.');
  });

  it('unauthorized parent cannot confirm fulfillment', async () => {
    const handshake = {
      id: 'h-6',
      student_id: 'student-1',
      parent_id: 'parent-owner',
      status: 'claimed',
      funding_status: 'funded',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: handshake, error: null })),
        };
      }
      return { update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    });

    await expect(confirmHandshakeFulfillment('parent-other', 'h-6')).rejects.toThrow(
      'Only the parent owner can confirm fulfillment.'
    );
  });
});
