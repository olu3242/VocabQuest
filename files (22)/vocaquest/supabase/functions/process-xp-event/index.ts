// supabase/functions/process-xp-event/index.ts
// Called by DB trigger after xp_events insert
// Checks for badge unlocks and level-up notifications

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BADGE_RULES = [
  { id: 'streak-3',     category: 'streak',       requirement_type: 'streak_current',  value: 3   },
  { id: 'streak-7',     category: 'streak',       requirement_type: 'streak_current',  value: 7   },
  { id: 'streak-14',    category: 'streak',       requirement_type: 'streak_current',  value: 14  },
  { id: 'streak-30',    category: 'streak',       requirement_type: 'streak_current',  value: 30  },
  { id: 'mastery-1',    category: 'mastery',      requirement_type: 'words_mastered',  value: 1   },
  { id: 'mastery-10',   category: 'mastery',      requirement_type: 'words_mastered',  value: 10  },
  { id: 'mastery-25',   category: 'mastery',      requirement_type: 'words_mastered',  value: 25  },
  { id: 'mastery-100',  category: 'mastery',      requirement_type: 'words_mastered',  value: 100 },
  { id: 'battle-1',     category: 'battle',       requirement_type: 'battles_won',     value: 1   },
  { id: 'battle-5',     category: 'battle',       requirement_type: 'battles_won',     value: 5   },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { record } = await req.json();
    const studentId = record.student_id;

    // Fetch current game state
    const { data: gameState } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (!gameState) {
      return new Response(JSON.stringify({ error: 'Game state not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch already earned badge IDs
    const { data: earnedBadges } = await supabase
      .from('student_badges')
      .select('badge_id')
      .eq('student_id', studentId);

    const earnedIds = new Set((earnedBadges ?? []).map((b: { badge_id: string }) => b.badge_id));

    // Check each badge rule
    const newBadges: string[] = [];

    for (const rule of BADGE_RULES) {
      const statValue = gameState[rule.requirement_type as keyof typeof gameState] as number ?? 0;

      if (statValue >= rule.value) {
        // Find badge by requirement_type + value in badges table
        const { data: badge } = await supabase
          .from('badges')
          .select('id')
          .eq('category', rule.category)
          .eq('requirement_value', rule.value)
          .single();

        if (badge && !earnedIds.has(badge.id)) {
          await supabase.from('student_badges').insert({
            student_id: studentId,
            badge_id: badge.id,
          });
          newBadges.push(badge.id);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      newBadgesAwarded: newBadges.length,
      badgeIds: newBadges,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
