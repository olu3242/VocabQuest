import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { fetchProfile } from '../services/auth.service';
import type { UserProfile } from '../types/student.types';

export function useCurrentProfile() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (loading) {
        return;
      }

      if (!user?.id) {
        if (!cancelled) {
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchProfile(user.id);
        if (!cancelled) {
          setProfile(data);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [user?.id, loading]);

  return { profile, isLoading: loading || isLoading };
}
