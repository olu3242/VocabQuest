// supabase/functions/compute-leaderboard/index.ts
// Weekly cron job — computes and snapshots classroom leaderboards
// Schedule: 0 0 * * 1 (every Monday midnight UTC)

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Last Monday
    weekStart.setHours(0, 0, 0, 0);
    const weekStartISO = weekStart.toISOString().split('T')[0];

    const oneWeekAgo = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all classrooms
    const { data: classrooms } = await supabase
      .from('classrooms')
      .select('id');

    if (!classrooms) {
      return new Response(JSON.stringify({ success: true, classroomsProcessed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalSnapshots = 0;

    for (const classroom of classrooms) {
      // Get students in this classroom
      const { data: members } = await supabase
        .from('classroom_students')
        .select('student_id')
        .eq('classroom_id', classroom.id);

      if (!members?.length) continue;

      const studentIds = members.map((m: { student_id: string }) => m.student_id);

      // Sum XP events for each student in the past week
      const xpSums: Record<string, number> = {};
      for (const studentId of studentIds) {
        const { data: events } = await supabase
          .from('xp_events')
          .select('xp_amount')
          .eq('student_id', studentId)
          .gte('created_at', oneWeekAgo);

        xpSums[studentId] = (events ?? []).reduce(
          (sum: number, e: { xp_amount: number }) => sum + e.xp_amount, 0
        );
      }

      // Sort by XP descending and assign ranks
      const ranked = Object.entries(xpSums)
        .sort(([, a], [, b]) => b - a)
        .map(([studentId, xpThisWeek], index) => ({
          student_id: studentId,
          classroom_id: classroom.id,
          week_start: weekStartISO,
          xp_this_week: xpThisWeek,
          rank: index + 1,
          streak: 0, // Will be populated from student_gamification in a full impl
        }));

      // Upsert snapshots
      if (ranked.length) {
        await supabase
          .from('leaderboard_snapshots')
          .upsert(ranked, { onConflict: 'student_id,classroom_id,week_start' });

        totalSnapshots += ranked.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      weekStart: weekStartISO,
      classroomsProcessed: classrooms.length,
      totalSnapshots,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
