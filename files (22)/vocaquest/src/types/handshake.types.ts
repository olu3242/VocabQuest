export type HandshakeChallengeType =
  | 'quest_completion'
  | 'pronunciation_score'
  | 'sentence_score'
  | 'streak_target'
  | 'words_mastered'
  | 'boss_battle_completion'
  | 'speaking_confidence_improvement'
  | 'hybrid_goal';

export type HandshakeRewardType =
  | 'xp_bonus'
  | 'badge_unlock'
  | 'unlockable_item'
  | 'parent_real_world_reward'
  | 'mixed_reward';

export type HandshakeStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'claimable'
  | 'claimed'
  | 'fulfilled'
  | 'expired'
  | 'cancelled';

export type HandshakeClaimStatus = 'submitted' | 'approved' | 'fulfilled' | 'rejected';

export type HandshakeVerificationType = 'automatic' | 'parent_review' | 'hybrid';

export interface HybridGoalConfig {
  minActivityCount?: number;
  scoreThreshold?: number;
  improvementThreshold?: number;
  dateWindowDays?: number;
}

export interface RewardConfig {
  xpAmount?: number;
  badgeId?: string;
  unlockableId?: string;
  digitalRewards?: {
    xpAmount?: number;
    badgeId?: string;
    unlockableId?: string;
  };
  realWorldRewardRequired?: boolean;
  hybridGoal?: HybridGoalConfig;
  [key: string]: unknown;
}

export interface HandshakeAgreement {
  id: string;
  parent_id: string;
  student_id: string;
  title: string;
  description: string | null;
  challenge_type: HandshakeChallengeType;
  target_metric: string;
  target_value: number;
  min_result_value: number | null;
  progress_value: number;
  progress_percent: number | null;
  reward_type: HandshakeRewardType;
  reward_description: string;
  reward_value: number | null;
  reward_config: RewardConfig;
  verification_type: HandshakeVerificationType;
  start_date: string;
  end_date: string;
  status: HandshakeStatus;
  child_accepted_at: string | null;
  completed_at: string | null;
  claimable_at: string | null;
  claimed_at: string | null;
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandshakeProgressEvent {
  id: string;
  handshake_id: string;
  student_id: string;
  event_type: string;
  metric_value: number;
  source_type: string;
  source_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface HandshakeClaim {
  id: string;
  handshake_id: string;
  student_id: string;
  claim_status: HandshakeClaimStatus;
  claimed_at: string;
  parent_confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandshakeCreateInput {
  studentId: string;
  title: string;
  description?: string;
  challengeType: HandshakeChallengeType;
  targetMetric: string;
  targetValue: number;
  minResultValue?: number;
  rewardType: HandshakeRewardType;
  rewardDescription: string;
  rewardValue?: number;
  rewardConfig?: RewardConfig;
  verificationType?: HandshakeVerificationType;
  startDate: string;
  endDate: string;
}

export interface HandshakeProgressSnapshot {
  value: number;
  target: number;
  percent: number;
  completed: boolean;
}
