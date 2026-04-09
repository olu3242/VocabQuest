import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { supabase, isMockMode } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '../types/student.types';

async function fetchProfileSafe(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

export default function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // In mock mode there is no real Supabase session — go straight to unauthenticated.
    if (isMockMode) {
      setUser(null);
      return;
    }

    // Get initial session
    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error }) => {
        if (error || !session?.user) {
          setUser(null);
          return;
        }
        const profile = await fetchProfileSafe(session.user.id);
        setUser(profile);
      })
      .catch(() => setUser(null));

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const profile = await fetchProfileSafe(session.user.id);
      setUser(profile);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return <RouterProvider router={router} />;
}
