// src/types/subscription.types.ts
export type PlanType = 'free' | 'family' | 'premium' | 'teacher' | 'school' | 'district';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
  id:                     string;
  user_id:                string;
  plan_type:              PlanType;
  stripe_customer_id?:    string;
  stripe_subscription_id?:string;
  status:                 SubscriptionStatus;
  current_period_start?:  string;
  current_period_end?:    string;
  cancel_at_period_end:   boolean;
  created_at:             string;
  updated_at:             string;
}
