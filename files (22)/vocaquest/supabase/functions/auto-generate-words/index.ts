import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment variables.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: config } = await adminClient
      .from('auto_generation_settings')
      .select('enable_auto_generation')
      .eq('id', 1)
      .maybeSingle();

    if (config && config.enable_auto_generation === false) {
      return new Response(JSON.stringify({ success: true, message: 'Auto generation disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { count: totalWords, error: countError } = await adminClient
      .from('words')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      return new Response(JSON.stringify({ error: countError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if ((totalWords ?? 0) >= 25000) {
      await adminClient.from('auto_generation_runs').insert({
        status: 'full',
        total_inserted: 0,
        failed_batches: 0,
        details: { message: 'Word bank full' },
      });

      return new Response(JSON.stringify({ success: true, message: 'Word bank full' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const invokeResponse = await fetch(`${supabaseUrl}/functions/v1/generate-words`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: 200 }),
    });

    const result = await invokeResponse.json();
    const totalInserted = Number((result as Record<string, unknown>)?.total_inserted ?? 0);
    const failedBatches = Number((result as Record<string, unknown>)?.failed_batches ?? 0);

    await adminClient.from('auto_generation_runs').insert({
      status: invokeResponse.ok ? 'success' : 'failed',
      total_inserted: totalInserted,
      failed_batches: failedBatches,
      details: {
        timestamp: new Date().toISOString(),
        ...result,
      },
    });

    console.log({
      timestamp: new Date().toISOString(),
      total_inserted: totalInserted,
      failed_batches: failedBatches,
    });

    return new Response(JSON.stringify({ success: invokeResponse.ok, ...result }), {
      status: invokeResponse.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});