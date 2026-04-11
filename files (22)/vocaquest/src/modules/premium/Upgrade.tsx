import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

export default function Upgrade() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      alert('Payment config missing');
      return;
    }

    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        alert('Payment failed');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session');

      if (error || !data?.url) {
        alert('Payment failed');
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-10">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Premium Plan</h1>
        <p className="mt-2 text-3xl font-black">$5/month</p>

        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>Unlimited words</li>
          <li>Advanced difficulty</li>
          <li>Faster XP</li>
        </ul>

        <button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Starting Checkout...' : 'Start Plan'}
        </button>
      </section>
    </main>
  );
}