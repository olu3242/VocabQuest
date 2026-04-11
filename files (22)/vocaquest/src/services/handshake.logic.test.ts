import { describe, expect, it } from 'vitest';
import {
  createProgressSnapshot,
  resolveClaimOutcome,
  SUPPORTED_HANDSHAKE_CHALLENGES,
} from './handshake.logic';

describe('handshake.logic', () => {
  it('covers all supported challenge types', () => {
    expect(SUPPORTED_HANDSHAKE_CHALLENGES).toEqual([
      'quest_completion',
      'pronunciation_score',
      'sentence_score',
      'streak_target',
      'words_mastered',
      'boss_battle_completion',
      'speaking_confidence_improvement',
      'hybrid_goal',
    ]);
  });

  it('computes progress snapshot and completion state', () => {
    expect(createProgressSnapshot(3, 5)).toEqual({
      value: 3,
      target: 5,
      percent: 60,
      completed: false,
    });

    expect(createProgressSnapshot(7, 5)).toEqual({
      value: 7,
      target: 5,
      percent: 100,
      completed: true,
    });
  });

  it('resolves claim outcome for digital rewards', () => {
    const now = new Date().toISOString();
    const outcome = resolveClaimOutcome('xp_bonus', { xpAmount: 100 }, now);

    expect(outcome.requiresParentFulfillment).toBe(false);
    expect(outcome.nextStatus).toBe('fulfilled');
    expect(outcome.claimStatus).toBe('fulfilled');
    expect(outcome.parentConfirmedAt).toBe(now);
  });

  it('requires parent fulfillment for real-world and mixed rewards', () => {
    const now = new Date().toISOString();

    const realWorld = resolveClaimOutcome('parent_real_world_reward', {}, now);
    expect(realWorld.requiresParentFulfillment).toBe(true);
    expect(realWorld.nextStatus).toBe('claimed');
    expect(realWorld.claimStatus).toBe('submitted');
    expect(realWorld.parentConfirmedAt).toBeNull();

    const mixed = resolveClaimOutcome('mixed_reward', { realWorldRewardRequired: true }, now);
    expect(mixed.requiresParentFulfillment).toBe(true);
    expect(mixed.nextStatus).toBe('claimed');
    expect(mixed.claimStatus).toBe('submitted');
    expect(mixed.parentConfirmedAt).toBeNull();
  });
});
