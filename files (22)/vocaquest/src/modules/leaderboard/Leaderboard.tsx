import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchLeaderboard } from '../../services/quizService';

interface LeaderboardItem {
  user_id: string;
  full_name: string;
  xp_total: number;
  is_premium: boolean;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchLeaderboard();
        setItems(data as LeaderboardItem[]);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">Leaderboard</h1>

      {loading && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading leaderboard...
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          No leaderboard data yet.
        </div>
      )}

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={item.user_id}
            className={`rounded-xl border px-4 py-3 ${item.user_id === user?.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                #{index + 1} {item.full_name}
              </p>
              <p className="text-sm font-bold">{item.xp_total} XP</p>
            </div>
            {item.is_premium && <p className="mt-1 text-xs text-amber-700">Premium</p>}
          </div>
        ))}
      </div>
    </main>
  );
}