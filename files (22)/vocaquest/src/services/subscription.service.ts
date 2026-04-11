// src/services/subscription.service.ts
import { supabase } from './supabase';

export async function fetchSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCheckoutSession(
  userId: string,
  planType: string,
  priceId: string
) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { userId, planType, priceId },
  });
  if (error) throw error;
  return data as { url: string };
}
