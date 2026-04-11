import type {
  HandshakeFundingStatus,
  HandshakeRewardType,
  HandshakeStatus,
  RewardConfig,
} from '../types/handshake.types';

export const SUPPORTED_HANDSHAKE_CHALLENGES = [
  'quest_completion',
  'pronunciation_score',
  'sentence_score',
  'streak_target',
  'words_mastered',
  'boss_battle_completion',
  'speaking_confidence_improvement',
  'hybrid_goal',
] as const;

export function createProgressSnapshot(value: number, target: number) {
  const safeTarget = target > 0 ? target : 1;
  const percent = Math.min(100, Math.round((value / safeTarget) * 10000) / 100);
  return {
    value,
    target,
    percent,
    completed: value >= safeTarget,
  };
}

export function resolveClaimOutcome(
  rewardType: HandshakeRewardType,
  rewardConfig: RewardConfig,
  claimedAt: string
) {
  const requiresParentFulfillment =
    rewardType === 'parent_real_world_reward' ||
    (rewardType === 'mixed_reward' && Boolean(rewardConfig?.realWorldRewardRequired));

  return {
    requiresParentFulfillment,
    nextStatus: requiresParentFulfillment ? 'claimed' : 'fulfilled',
    claimStatus: requiresParentFulfillment ? 'submitted' : 'fulfilled',
    parentConfirmedAt: requiresParentFulfillment ? null : claimedAt,
  } as const;
}

export function isHandshakeFunded(fundingStatus: HandshakeFundingStatus) {
  return fundingStatus === 'funded';
}

export function canAcceptHandshake(status: HandshakeStatus, fundingStatus: HandshakeFundingStatus) {
  const eligibleStatuses: HandshakeStatus[] = ['pending_acceptance', 'pending'];
  return eligibleStatuses.includes(status) && isHandshakeFunded(fundingStatus);
}

export function canInitiateParentTest(status: HandshakeStatus) {
  const allowed: HandshakeStatus[] = ['accepted', 'task_in_progress', 'awaiting_test_initiation', 'active', 'completed'];
  return allowed.includes(status);
}

export function determinePassFail(scoreValue: number, minimumRequired: number) {
  return scoreValue >= minimumRequired ? 'passed' : 'failed';
}

export function canClaimReward(status: HandshakeStatus) {
  return status === 'approved_for_claim' || status === 'claimable';
}
