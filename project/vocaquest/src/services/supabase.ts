// src/services/supabase.ts
// Supabase client initialization

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isMockMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('placeholder') ||
  supabaseAnonKey.includes('placeholder');

if (isMockMode) {
  console.warn(
    '[VocaQuest] Supabase env vars missing or set to placeholder values. ' +
    'Running in offline/mock mode — all data comes from mock services.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export { isMockMode };

export type { User, Session } from '@supabase/supabase-js';
