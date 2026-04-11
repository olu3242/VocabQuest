import { supabase } from './supabase';
import {
  HandshakeAgreement,
  HandshakeClaim,
  HandshakeCreateInput,
  HandshakeProgressEvent,
  HandshakeProgressSnapshot,
  HandshakeStatus,
  RewardConfig,
} from '../types/handshake.types';
import { createProgressSnapshot, resolveClaimOutcome } from './handshake.logic';

interface LinkedChild {
  id: string;
  full_name: string;
  grade_band: string | null;
  avatar_url: string | null;
}

interface ConfidencePoint {
  value: number;
  created_at: string;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoDate(dateLike: string): string {
  return new Date(dateLike).toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function calculatePercent(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 10000) / 100);
}

async function logHandshakeEvent(input: {
  handshakeId: string;
  studentId: string;
  eventType: string;
  message: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await supabase.from('handshake_activity_log').insert({
    handshake_id: input.handshakeId,
    actor_id: input.actorId ?? null,
    student_id: input.studentId,
    event_type: input.eventType,
    message: input.message,
    metadata: input.metadata ?? {},
  });
}

async function ensureParentLinkedToStudent(parentId: string, studentId: string): Promise<void> {
  const { data, error } = await supabase
    .from('parent_child_links')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .eq('verified', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to validate parent-child link: ${error.message}`);
  }

  if (!data) {
    throw new Error('Parent is not linked to this student.');
  }
}

async function getHandshakeOrThrow(handshakeId: string): Promise<HandshakeAgreement> {
  const { data, error } = await supabase
    .from('handshake_agreements')
    .select('*')
    .eq('id', handshakeId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Handshake not found.');
  }

  return data as HandshakeAgreement;
}

async function countCompletedQuests(studentId: string, startDate: string, endDate: string): Promise<number> {
  const { count, error } = await supabase
    .from('daily_quests')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('status', 'completed')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw new Error(`Failed to count completed quests: ${error.message}`);
  return count ?? 0;
}

async function averageProgressEventValue(
  handshakeId: string,
  eventType: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const fromTs = `${startDate}T00:00:00.000Z`;
  const toTs = `${endDate}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('handshake_progress_events')
    .select('metric_value, created_at')
    .eq('handshake_id', handshakeId)
    .eq('event_type', eventType)
    .gte('created_at', fromTs)
    .lte('created_at', toTs);

  if (error) {
    throw new Error(`Failed to read handshake progress events: ${error.message}`);
  }

  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, row) => acc + toNumber(row.metric_value), 0);
  return sum / data.length;
}

async function averageXpMetadataScore(
  studentId: string,
  actionType: string,
  startDate: string,
  endDate: string,
  metadataKey: string
): Promise<number> {
  const fromTs = `${startDate}T00:00:00.000Z`;
  const toTs = `${endDate}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('xp_events')
    .select('metadata, created_at')
    .eq('student_id', studentId)
    .eq('action_type', actionType)
    .gte('created_at', fromTs)
    .lte('created_at', toTs);

  if (error) {
    throw new Error(`Failed to read XP metadata scores: ${error.message}`);
  }

  if (!data || data.length === 0) return 0;

  const values = data
    .map((row) => {
      const metadata = (row.metadata ?? {}) as Record<string, unknown>;
      return toNumber(metadata[metadataKey], NaN);
    })
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

async function getStudentStreak(studentId: string): Promise<number> {
  const { data, error } = await supabase
    .from('student_gamification')
    .select('streak_current')
    .eq('student_id', studentId)
    .single();

  if (error) throw new Error(`Failed to fetch streak: ${error.message}`);
  return toNumber(data.streak_current);
}

async function getWordsMasteredInRange(studentId: string, startDate: string, endDate: string): Promise<number> {
  const fromTs = `${startDate}T00:00:00.000Z`;
  const toTs = `${endDate}T23:59:59.999Z`;

  const { count, error } = await supabase
    .from('student_word_progress')
    .select('word_id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('status', 'mastered')
    .gte('last_practiced_at', fromTs)
    .lte('last_practiced_at', toTs);

  if (error) throw new Error(`Failed to count mastered words: ${error.message}`);
  return count ?? 0;
}

async function countBossBattleCompletions(
  studentId: string,
  startDate: string,
  endDate: string,
  minScore?: number
): Promise<number> {
  const fromTs = `${startDate}T00:00:00.000Z`;
  const toTs = `${endDate}T23:59:59.999Z`;

  let query = supabase
    .from('boss_battle_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .gte('completed_at', fromTs)
    .lte('completed_at', toTs);

  if (typeof minScore === 'number') {
    query = query.gte('score', minScore);
  }

  const { count, error } = await query;
  if (error) throw new Error(`Failed to count boss battle attempts: ${error.message}`);
  return count ?? 0;
}

async function getConfidenceSeries(handshakeId: string, startDate: string, endDate: string): Promise<ConfidencePoint[]> {
  const fromTs = `${startDate}T00:00:00.000Z`;
  const toTs = `${endDate}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('handshake_progress_events')
    .select('metric_value, created_at')
    .eq('handshake_id', handshakeId)
    .eq('event_type', 'speaking_confidence')
    .gte('created_at', fromTs)
    .lte('created_at', toTs)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to read speaking confidence events: ${error.message}`);

  return (data ?? []).map((row) => ({
    value: toNumber(row.metric_value),
    created_at: String(row.created_at),
  }));
}

async function evaluateHybridGoal(handshake: HandshakeAgreement): Promise<HandshakeProgressSnapshot> {
  const config = (handshake.reward_config?.hybridGoal ?? {}) as RewardConfig['hybridGoal'];
  const checks: Array<{ required: boolean; passed: boolean; progressValue: number; target: number }> = [];

  const dateWindowDays = toNumber(config?.dateWindowDays, 0);
  const effectiveStartDate = dateWindowDays > 0
    ? toIsoDate(new Date(Date.now() - dateWindowDays * 24 * 60 * 60 * 1000).toISOString())
    : handshake.start_date;

  if (typeof config?.minActivityCount === 'number') {
    const questCount = await countCompletedQuests(handshake.student_id, effectiveStartDate, handshake.end_date);
    checks.push({
      required: true,
      passed: questCount >= config.minActivityCount,
      progressValue: questCount,
      target: config.minActivityCount,
    });
  }

  if (typeof config?.scoreThreshold === 'number') {
    const pronunciationAverage = await averageProgressEventValue(
      handshake.id,
      'pronunciation_score',
      effectiveStartDate,
      handshake.end_date
    );
    checks.push({
      required: true,
      passed: pronunciationAverage >= config.scoreThreshold,
      progressValue: pronunciationAverage,
      target: config.scoreThreshold,
    });
  }

  if (typeof config?.improvementThreshold === 'number') {
    const confidenceSeries = await getConfidenceSeries(handshake.id, effectiveStartDate, handshake.end_date);
    const improvement = confidenceSeries.length >= 2
      ? confidenceSeries[confidenceSeries.length - 1].value - confidenceSeries[0].value
      : 0;
    checks.push({
      required: true,
      passed: improvement >= config.improvementThreshold,
      progressValue: improvement,
      target: config.improvementThreshold,
    });
  }

  if (checks.length === 0) {
    return { value: 0, target: 1, percent: 0, completed: false };
  }

  const passedCount = checks.filter((check) => check.passed).length;
  const value = passedCount;
  const target = checks.length;

  return {
    value,
    target,
    percent: calculatePercent(value, target),
    completed: passedCount === checks.length,
  };
}

async function evaluateByChallengeType(handshake: HandshakeAgreement): Promise<HandshakeProgressSnapshot> {
  const startDate = handshake.start_date;
  const endDate = handshake.end_date;
  const target = toNumber(handshake.target_value);

  switch (handshake.challenge_type) {
    case 'quest_completion': {
      const value = await countCompletedQuests(handshake.student_id, startDate, endDate);
      return createProgressSnapshot(value, target);
    }

    case 'pronunciation_score': {
      const scoreFromEvents = await averageProgressEventValue(handshake.id, 'pronunciation_score', startDate, endDate);
      const scoreFromXp = await averageXpMetadataScore(handshake.student_id, 'PRONUNCIATION_CORRECT', startDate, endDate, 'score');
      const value = scoreFromEvents > 0 ? scoreFromEvents : scoreFromXp;
      return createProgressSnapshot(value, target);
    }

    case 'sentence_score': {
      const scoreFromEvents = await averageProgressEventValue(handshake.id, 'sentence_score', startDate, endDate);
      const scoreFromXp = await averageXpMetadataScore(handshake.student_id, 'SENTENCE_BUILDER', startDate, endDate, 'score');
      const value = scoreFromEvents > 0 ? scoreFromEvents : scoreFromXp;
      return createProgressSnapshot(value, target);
    }

    case 'streak_target': {
      const value = await getStudentStreak(handshake.student_id);
      return createProgressSnapshot(value, target);
    }

    case 'words_mastered': {
      const value = await getWordsMasteredInRange(handshake.student_id, startDate, endDate);
      return createProgressSnapshot(value, target);
    }

    case 'boss_battle_completion': {
      const minScore = handshake.min_result_value ?? undefined;
      const value = await countBossBattleCompletions(handshake.student_id, startDate, endDate, minScore ?? undefined);
      return createProgressSnapshot(value, target);
    }

    case 'speaking_confidence_improvement': {
      const confidenceSeries = await getConfidenceSeries(handshake.id, startDate, endDate);
      const value = confidenceSeries.length >= 2
        ? confidenceSeries[confidenceSeries.length - 1].value - confidenceSeries[0].value
        : 0;
      return createProgressSnapshot(value, target);
    }

    case 'hybrid_goal': {
      return evaluateHybridGoal(handshake);
    }

    default:
      return { value: 0, target, percent: 0, completed: false };
  }
}

export async function listLinkedChildren(parentId: string): Promise<LinkedChild[]> {
  const { data, error } = await supabase
    .from('parent_child_links')
    .select('student:profiles!parent_child_links_student_id_fkey(id, full_name, grade_band, avatar_url)')
    .eq('parent_id', parentId)
    .eq('verified', true);

  if (error) {
    throw new Error(`Failed to load linked children: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{ student: LinkedChild | LinkedChild[] | null }>;

  return rows
    .map((row) => (Array.isArray(row.student) ? row.student[0] : row.student))
    .filter((student): student is LinkedChild => Boolean(student));
}

export async function createHandshake(parentId: string, payload: HandshakeCreateInput): Promise<HandshakeAgreement> {
  await ensureParentLinkedToStudent(parentId, payload.studentId);

  const { data, error } = await supabase
    .from('handshake_agreements')
    .insert({
      parent_id: parentId,
      student_id: payload.studentId,
      title: payload.title,
      description: payload.description ?? null,
      challenge_type: payload.challengeType,
      target_metric: payload.targetMetric,
      target_value: payload.targetValue,
      min_result_value: payload.minResultValue ?? null,
      reward_type: payload.rewardType,
      reward_description: payload.rewardDescription,
      reward_value: payload.rewardValue ?? null,
      reward_config: payload.rewardConfig ?? {},
      verification_type: payload.verificationType ?? 'automatic',
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: 'pending',
      progress_value: 0,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create handshake.');
  }

  await logHandshakeEvent({
    handshakeId: data.id,
    studentId: data.student_id,
    actorId: parentId,
    eventType: 'handshake_created',
    message: 'Parent created a new handshake challenge.',
    metadata: {
      challengeType: data.challenge_type,
      rewardType: data.reward_type,
      targetValue: data.target_value,
    },
  });

  return data as HandshakeAgreement;
}

export async function acceptHandshake(studentId: string, handshakeId: string): Promise<HandshakeAgreement> {
  const handshake = await getHandshakeOrThrow(handshakeId);

  if (handshake.student_id !== studentId) {
    throw new Error('Only the assigned child can accept this handshake.');
  }

  if (handshake.status !== 'pending') {
    return handshake;
  }

  const now = nowIso();

  const { data, error } = await supabase
    .from('handshake_agreements')
    .update({
      status: 'active',
      child_accepted_at: now,
      updated_at: now,
    })
    .eq('id', handshakeId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to accept handshake.');
  }

  await logHandshakeEvent({
    handshakeId: data.id,
    studentId: data.student_id,
    actorId: studentId,
    eventType: 'handshake_accepted',
    message: 'Student accepted the handshake challenge.',
  });

  await evaluateHandshakeProgress(handshakeId);
  return data as HandshakeAgreement;
}

export async function getParentHandshakes(parentId: string): Promise<HandshakeAgreement[]> {
  const { data, error } = await supabase
    .from('handshake_agreements')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch parent handshakes: ${error.message}`);
  }

  return (data ?? []) as HandshakeAgreement[];
}

export async function getStudentHandshakes(studentId: string): Promise<HandshakeAgreement[]> {
  const { data, error } = await supabase
    .from('handshake_agreements')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch student handshakes: ${error.message}`);
  }

  return (data ?? []) as HandshakeAgreement[];
}

export async function getHandshakeById(handshakeId: string): Promise<HandshakeAgreement> {
  return getHandshakeOrThrow(handshakeId);
}

export async function getHandshakeProgressEvents(handshakeId: string): Promise<HandshakeProgressEvent[]> {
  const { data, error } = await supabase
    .from('handshake_progress_events')
    .select('*')
    .eq('handshake_id', handshakeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch handshake progress events: ${error.message}`);
  }

  return (data ?? []) as HandshakeProgressEvent[];
}

export async function getHandshakeActivityLog(handshakeId: string) {
  const { data, error } = await supabase
    .from('handshake_activity_log')
    .select('*')
    .eq('handshake_id', handshakeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch handshake activity log: ${error.message}`);
  }

  return data ?? [];
}

export async function evaluateHandshakeProgress(handshakeId: string): Promise<HandshakeAgreement> {
  const handshake = await getHandshakeOrThrow(handshakeId);

  if (handshake.status === 'cancelled' || handshake.status === 'fulfilled' || handshake.status === 'claimed') {
    return handshake;
  }

  if (new Date(handshake.end_date) < new Date(toIsoDate(new Date().toISOString()))) {
    const { data, error } = await supabase
      .from('handshake_agreements')
      .update({ status: 'expired', updated_at: nowIso() })
      .eq('id', handshakeId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to expire handshake.');
    }

    return data as HandshakeAgreement;
  }

  const snapshot = await evaluateByChallengeType(handshake);
  const now = nowIso();
  const updates: Record<string, unknown> = {
    progress_value: snapshot.value,
    progress_percent: snapshot.percent,
    updated_at: now,
  };

  if (snapshot.completed && handshake.status !== 'claimable') {
    updates.status = 'claimable';
    updates.completed_at = handshake.completed_at ?? now;
    updates.claimable_at = handshake.claimable_at ?? now;
  } else if (!snapshot.completed && handshake.status === 'pending' && handshake.child_accepted_at) {
    updates.status = 'active';
  }

  const { data, error } = await supabase
    .from('handshake_agreements')
    .update(updates)
    .eq('id', handshake.id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update handshake progress.');
  }

  await supabase.from('handshake_progress_events').insert({
    handshake_id: handshake.id,
    student_id: handshake.student_id,
    event_type: 'system_progress_snapshot',
    metric_value: snapshot.value,
    source_type: 'system',
    source_id: handshake.challenge_type,
    metadata: {
      target: snapshot.target,
      percent: snapshot.percent,
      completed: snapshot.completed,
    },
  });

  if (String(data.status) === 'claimable' && handshake.status !== 'claimable') {
    await logHandshakeEvent({
      handshakeId: handshake.id,
      studentId: handshake.student_id,
      eventType: 'handshake_claimable',
      message: 'Handshake target met and reward became claimable.',
      metadata: {
        progressValue: snapshot.value,
        targetValue: snapshot.target,
        percent: snapshot.percent,
      },
    });
  }

  return data as HandshakeAgreement;
}

export async function evaluateAllActiveHandshakesForStudent(studentId: string): Promise<HandshakeAgreement[]> {
  const { data, error } = await supabase
    .from('handshake_agreements')
    .select('id')
    .eq('student_id', studentId)
    .in('status', ['active', 'pending', 'completed']);

  if (error) {
    throw new Error(`Failed to load active handshakes for evaluation: ${error.message}`);
  }

  const handshakeIds = (data ?? []).map((row) => String(row.id));
  const evaluated: HandshakeAgreement[] = [];

  for (const handshakeId of handshakeIds) {
    const result = await evaluateHandshakeProgress(handshakeId);
    evaluated.push(result);
  }

  return evaluated;
}

export async function markHandshakeClaimable(handshakeId: string): Promise<HandshakeAgreement> {
  const now = nowIso();

  const { data, error } = await supabase
    .from('handshake_agreements')
    .update({
      status: 'claimable',
      completed_at: now,
      claimable_at: now,
      updated_at: now,
    })
    .eq('id', handshakeId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to mark handshake claimable.');
  }

  await logHandshakeEvent({
    handshakeId: data.id,
    studentId: data.student_id,
    eventType: 'handshake_claimable',
    message: 'Handshake moved to claimable.',
  });

  return data as HandshakeAgreement;
}

async function grantDigitalRewards(handshake: HandshakeAgreement): Promise<void> {
  const rewardConfig = handshake.reward_config ?? {};

  if (handshake.reward_type === 'xp_bonus') {
    const xpAmount = toNumber(rewardConfig.xpAmount ?? handshake.reward_value, 0);
    if (xpAmount > 0) {
      const { error } = await supabase.from('xp_events').insert({
        student_id: handshake.student_id,
        action_type: 'HANDSHAKE_XP_BONUS',
        xp_amount: xpAmount,
        metadata: {
          handshake_id: handshake.id,
          reward_type: handshake.reward_type,
        },
      });

      if (error) {
        throw new Error(`Failed to grant XP reward: ${error.message}`);
      }
    }
  }

  if (handshake.reward_type === 'badge_unlock') {
    const badgeId = String(rewardConfig.badgeId ?? '');
    if (badgeId) {
      const { error } = await supabase.from('student_badges').upsert(
        {
          student_id: handshake.student_id,
          badge_id: badgeId,
        },
        { onConflict: 'student_id,badge_id', ignoreDuplicates: true }
      );

      if (error) {
        throw new Error(`Failed to grant badge reward: ${error.message}`);
      }
    }
  }

  if (handshake.reward_type === 'unlockable_item') {
    const unlockableId = String(rewardConfig.unlockableId ?? '');
    if (unlockableId) {
      const { error } = await supabase.from('student_unlockables').upsert(
        {
          student_id: handshake.student_id,
          unlockable_id: unlockableId,
          equipped: false,
        },
        { onConflict: 'student_id,unlockable_id', ignoreDuplicates: true }
      );

      if (error) {
        throw new Error(`Failed to grant unlockable reward: ${error.message}`);
      }
    }
  }

  if (handshake.reward_type === 'mixed_reward') {
    const digitalRewards = (rewardConfig.digitalRewards ?? {}) as Record<string, unknown>;

    const xpAmount = toNumber(digitalRewards.xpAmount, 0);
    if (xpAmount > 0) {
      const { error } = await supabase.from('xp_events').insert({
        student_id: handshake.student_id,
        action_type: 'HANDSHAKE_MIXED_XP',
        xp_amount: xpAmount,
        metadata: {
          handshake_id: handshake.id,
          reward_type: handshake.reward_type,
        },
      });
      if (error) throw new Error(`Failed to grant mixed XP reward: ${error.message}`);
    }

    const badgeId = String(digitalRewards.badgeId ?? '');
    if (badgeId) {
      const { error } = await supabase.from('student_badges').upsert(
        {
          student_id: handshake.student_id,
          badge_id: badgeId,
        },
        { onConflict: 'student_id,badge_id', ignoreDuplicates: true }
      );
      if (error) throw new Error(`Failed to grant mixed badge reward: ${error.message}`);
    }

    const unlockableId = String(digitalRewards.unlockableId ?? '');
    if (unlockableId) {
      const { error } = await supabase.from('student_unlockables').upsert(
        {
          student_id: handshake.student_id,
          unlockable_id: unlockableId,
          equipped: false,
        },
        { onConflict: 'student_id,unlockable_id', ignoreDuplicates: true }
      );
      if (error) throw new Error(`Failed to grant mixed unlockable reward: ${error.message}`);
    }
  }
}

export async function claimHandshakeReward(studentId: string, handshakeId: string): Promise<HandshakeAgreement> {
  const handshake = await getHandshakeOrThrow(handshakeId);

  if (handshake.student_id !== studentId) {
    throw new Error('Only the assigned child can claim this reward.');
  }

  if (handshake.status === 'expired' || handshake.status === 'cancelled') {
    throw new Error('This handshake can no longer be claimed.');
  }

  const evaluated = await evaluateHandshakeProgress(handshakeId);

  if (evaluated.status !== 'claimable' && evaluated.status !== 'completed') {
    throw new Error('Reward is not claimable yet.');
  }

  const now = nowIso();
  await grantDigitalRewards(evaluated);
  const outcome = resolveClaimOutcome(evaluated.reward_type, evaluated.reward_config, now);
  const nextStatus: HandshakeStatus = outcome.nextStatus;

  const { error: claimError } = await supabase.from('handshake_claims').upsert(
    {
      handshake_id: evaluated.id,
      student_id: studentId,
      claim_status: outcome.claimStatus,
      claimed_at: now,
      parent_confirmed_at: outcome.parentConfirmedAt,
    },
    { onConflict: 'handshake_id' }
  );

  if (claimError) {
    throw new Error(`Failed to create claim record: ${claimError.message}`);
  }

  const updates: Record<string, unknown> = {
    status: nextStatus,
    claimed_at: now,
    updated_at: now,
  };

  if (!outcome.requiresParentFulfillment) {
    updates.fulfilled_at = now;
  }

  const { data, error } = await supabase
    .from('handshake_agreements')
    .update(updates)
    .eq('id', evaluated.id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to finalize claim.');
  }

  await logHandshakeEvent({
    handshakeId: data.id,
    studentId: data.student_id,
    actorId: studentId,
    eventType: 'handshake_claimed',
    message: outcome.requiresParentFulfillment
      ? 'Student claimed reward and is waiting for parent fulfillment.'
      : 'Student claimed reward and it was fulfilled automatically.',
    metadata: {
      rewardType: evaluated.reward_type,
      status: data.status,
    },
  });

  return data as HandshakeAgreement;
}

export async function confirmHandshakeFulfillment(parentId: string, handshakeId: string, notes?: string): Promise<HandshakeAgreement> {
  const handshake = await getHandshakeOrThrow(handshakeId);

  if (handshake.parent_id !== parentId) {
    throw new Error('Only the parent owner can confirm fulfillment.');
  }

  if (handshake.status !== 'claimed') {
    throw new Error('Handshake is not awaiting parent fulfillment.');
  }

  const now = nowIso();

  const { error: claimError } = await supabase
    .from('handshake_claims')
    .update({
      claim_status: 'fulfilled',
      parent_confirmed_at: now,
      notes: notes ?? null,
      updated_at: now,
    })
    .eq('handshake_id', handshakeId);

  if (claimError) {
    throw new Error(`Failed to update claim record: ${claimError.message}`);
  }

  const { data, error } = await supabase
    .from('handshake_agreements')
    .update({
      status: 'fulfilled',
      fulfilled_at: now,
      updated_at: now,
    })
    .eq('id', handshakeId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to confirm fulfillment.');
  }

  await logHandshakeEvent({
    handshakeId: data.id,
    studentId: data.student_id,
    actorId: parentId,
    eventType: 'handshake_fulfilled',
    message: 'Parent confirmed reward fulfillment.',
    metadata: { notes: notes ?? null },
  });

  return data as HandshakeAgreement;
}

export async function getHandshakeClaim(handshakeId: string): Promise<HandshakeClaim | null> {
  const { data, error } = await supabase
    .from('handshake_claims')
    .select('*')
    .eq('handshake_id', handshakeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch handshake claim: ${error.message}`);
  }

  return (data as HandshakeClaim | null) ?? null;
}

export async function expireOverdueHandshakes(): Promise<number> {
  const { data, error } = await supabase.rpc('expire_overdue_handshakes');

  if (error) {
    throw new Error(`Failed to expire overdue handshakes: ${error.message}`);
  }

  return toNumber(data, 0);
}

export async function recordHandshakeProgressEvent(input: {
  handshakeId: string;
  studentId: string;
  eventType: string;
  metricValue: number;
  sourceType: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<HandshakeProgressEvent> {
  const { data, error } = await supabase
    .from('handshake_progress_events')
    .insert({
      handshake_id: input.handshakeId,
      student_id: input.studentId,
      event_type: input.eventType,
      metric_value: input.metricValue,
      source_type: input.sourceType,
      source_id: input.sourceId ?? null,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to record handshake progress event.');
  }

  return data as HandshakeProgressEvent;
}
