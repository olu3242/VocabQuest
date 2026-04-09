// supabase/functions/update-streaks/index.ts
// Nightly cron job — resets streaks for students who missed a day
// Schedule: 0 1 * * * (1am UTC daily)
// Set in Supabase Dashboard → Edge Functions → Schedule

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verify cron secret to prevent unauthorized calls
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

    // Call the SQL function to reset lapsed streaks
    const { error } = await supabase.rpc('reset_lapsed_streaks');

    if (error) throw error;

    // Count how many were reset
    const { count } = await supabase
      .from('student_gamification')
      .select('*', { count: 'exact', head: true })
      .eq('streak_current', 0)
      .lt('last_active_date', new Date(Date.now() - 86400000).toISOString().split('T')[0]);

    return new Response(JSON.stringify({
      success: true,
      message: 'Streak reset complete',
      resetAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
