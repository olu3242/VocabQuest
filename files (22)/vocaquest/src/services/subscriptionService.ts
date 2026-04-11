import { supabase } from '../lib/supabase';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*, plan:subscription_plans(name, price, features)')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function isPremium(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
    return false;
  }

  if (!subscription.current_period_end) {
    return true;
  }

  return new Date(subscription.current_period_end).getTime() > Date.now();
}

export async function upgradeToPremium(_userId: string) {
  const { data, error } = await supabase.functions.invoke('create-checkout-session');

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.url) {
    throw new Error('Checkout URL not returned.');
  }

  return data as { url: string };
}