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
} from './handshake.service';

function buildSelectChain(response: { data: unknown; error: unknown }) {
  const chain = {
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(response),
    single: vi.fn().mockResolvedValue(response),
    order: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
  };
  return chain;
}

function buildInsertChain(response: { data: unknown; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(response),
  };
}

function buildUpdateChain(response: { data: unknown; error: unknown }) {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(response),
  };
}

describe('handshake.service access and lifecycle guards', () => {
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
      return buildInsertChain({ data: null, error: null });
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

  it('child can accept own handshake when already active (idempotent)', async () => {
    const activeHandshake = {
      id: 'h-1',
      student_id: 'student-1',
      parent_id: 'parent-1',
      status: 'active',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: activeHandshake, error: null })),
        };
      }
      return buildInsertChain({ data: null, error: null });
    });

    const result = await acceptHandshake('student-1', 'h-1');
    expect(result.status).toBe('active');
    expect(result.student_id).toBe('student-1');
  });

  it('expired handshake cannot be claimed', async () => {
    const expiredHandshake = {
      id: 'h-2',
      student_id: 'student-1',
      parent_id: 'parent-1',
      status: 'expired',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: expiredHandshake, error: null })),
        };
      }
      return buildInsertChain({ data: null, error: null });
    });

    await expect(claimHandshakeReward('student-1', 'h-2')).rejects.toThrow(
      'This handshake can no longer be claimed.'
    );
  });

  it('unauthorized student cannot claim unrelated handshake', async () => {
    const claimableHandshake = {
      id: 'h-3',
      student_id: 'student-owner',
      parent_id: 'parent-1',
      status: 'claimable',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: claimableHandshake, error: null })),
        };
      }
      return buildInsertChain({ data: null, error: null });
    });

    await expect(claimHandshakeReward('student-other', 'h-3')).rejects.toThrow(
      'Only the assigned child can claim this reward.'
    );
  });

  it('unauthorized parent cannot confirm fulfillment', async () => {
    const claimedHandshake = {
      id: 'h-4',
      student_id: 'student-1',
      parent_id: 'parent-owner',
      status: 'claimed',
    };

    fromMock.mockImplementation((table: string) => {
      if (table === 'handshake_agreements') {
        return {
          select: vi.fn().mockReturnValue(buildSelectChain({ data: claimedHandshake, error: null })),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        } as unknown as ReturnType<typeof buildUpdateChain>;
      }
      return buildUpdateChain({ data: claimedHandshake, error: null });
    });

    await expect(confirmHandshakeFulfillment('parent-other', 'h-4')).rejects.toThrow(
      'Only the parent owner can confirm fulfillment.'
    );
  });
});
