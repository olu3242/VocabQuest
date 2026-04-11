import Stripe from 'npm:stripe@14.14.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Missing Stripe signature configuration.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (!userId || !session.subscription) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await activatePremiumSubscription(supabase, userId, subscription);
        break;
      }
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function activatePremiumSubscription(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  subscription: Stripe.Subscription
) {
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('name', 'Premium')
    .single();

  if (planError || !plan) {
    throw new Error(planError?.message ?? 'Premium plan not found.');
  }

  const periodEnd =
    typeof subscription.current_period_end === 'number'
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

  const { error } = await supabase.from('user_subscriptions').upsert(
    {
      user_id: userId,
      plan_id: plan.id,
      status: 'active',
      current_period_end: periodEnd,
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}
