export type HandshakeChallengeType =
  | 'quest_completion'
  | 'pronunciation_score'
  | 'sentence_score'
  | 'streak_target'
  | 'words_mastered'
  | 'boss_battle_completion'
  | 'speaking_confidence_improvement'
  | 'hybrid_goal';

export type HandshakeTaskType =
  | 'vocabulary_quiz'
  | 'pronunciation_assessment'
  | 'sentence_building_assessment'
  | 'usage_in_context'
  | 'boss_battle'
  | 'mixed_knowledge';

export type HandshakeRewardType =
  | 'xp_bonus'
  | 'badge_unlock'
  | 'unlockable_item'
  | 'parent_real_world_reward'
  | 'mixed_reward';

export type HandshakeFundingStatus = 'not_funded' | 'pending' | 'funded' | 'failed' | 'refunded';

export type HandshakeStatus =
  | 'draft'
  | 'initiated'
  | 'funded'
  | 'pending_acceptance'
  | 'accepted'
  | 'task_in_progress'
  | 'awaiting_test_initiation'
  | 'testing_in_progress'
  | 'scored_passed'
  | 'scored_failed'
  | 'awaiting_parent_redemption_review'
  | 'approved_for_claim'
  | 'retake_required'
  | 'redemption_rejected'
  | 'claimed'
  | 'fulfilled'
  | 'expired'
  | 'cancelled'
  // Backward compatibility statuses still present in old rows:
  | 'pending'
  | 'active'
  | 'completed'
  | 'claimable';

export type HandshakeClaimStatus = 'submitted' | 'approved' | 'fulfilled' | 'rejected';
export type HandshakePassFailResult = 'passed' | 'failed';
export type HandshakeParentRedemptionDecision = 'approved' | 'rejected' | 'retake_required';

export type HandshakeTestSessionStatus = 'in_progress' | 'completed' | 'cancelled';
export type HandshakeRedemptionStatus = 'requested' | 'approved' | 'rejected' | 'claimed' | 'fulfilled';

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
  task_type: HandshakeTaskType | string;
  target_metric: string;
  target_config: Record<string, unknown>;
  target_value: number;
  min_result_value: number | null;
  minimum_score_required: number | null;
  progress_value: number;
  progress_percent: number | null;
  reward_type: HandshakeRewardType;
  reward_label: string | null;
  reward_description: string;
  reward_value: number | null;
  reward_config: RewardConfig;
  funding_status: HandshakeFundingStatus;
  funded_at: string | null;
  verification_type: HandshakeVerificationType;
  start_date: string;
  due_date: string;
  end_date: string;
  status: HandshakeStatus;
  accepted_at: string | null;
  child_accepted_at: string | null;
  task_completed_at: string | null;
  testing_started_at: string | null;
  scored_at: string | null;
  score_value: number | null;
  pass_fail_result: HandshakePassFailResult | null;
  parent_redemption_decision: HandshakeParentRedemptionDecision | null;
  approved_for_claim_at: string | null;
  completed_at: string | null;
  claimable_at: string | null;
  claimed_at: string | null;
  fulfilled_at: string | null;
  expired_at: string | null;
  cancelled_at: string | null;
  allow_retake: boolean;
  max_retakes: number;
  retake_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandshakeFundingEvent {
  id: string;
  handshake_id: string;
  parent_id: string;
  funding_type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata: Record<string, unknown>;
  created_at: string;
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

export interface HandshakeTestSession {
  id: string;
  handshake_id: string;
  child_id: string;
  initiated_by_parent_id: string;
  started_at: string;
  completed_at: string | null;
  test_type: string;
  score_value: number | null;
  pass_fail_result: HandshakePassFailResult | null;
  analysis_payload: Record<string, unknown>;
  status: HandshakeTestSessionStatus;
  created_at: string;
  updated_at: string;
}

export interface HandshakeRedemption {
  id: string;
  handshake_id: string;
  child_id: string;
  status: HandshakeRedemptionStatus;
  requested_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  claimed_at: string | null;
  fulfilled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandshakeCreateInput {
  studentId: string;
  title: string;
  description?: string;
  challengeType: HandshakeChallengeType;
  taskType?: HandshakeTaskType;
  targetMetric: string;
  targetConfig?: Record<string, unknown>;
  targetValue: number;
  minResultValue?: number;
  minimumScoreRequired?: number;
  rewardType: HandshakeRewardType;
  rewardLabel?: string;
  rewardDescription: string;
  rewardValue?: number;
  rewardConfig?: RewardConfig;
  verificationType?: HandshakeVerificationType;
  startDate: string;
  dueDate?: string;
  endDate: string;
  notes?: string;
  allowRetake?: boolean;
  maxRetakes?: number;
}

export interface HandshakeProgressSnapshot {
  value: number;
  target: number;
  percent: number;
  completed: boolean;
}
