import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../services/authService';
import { supabase } from '../../lib/supabase';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;
      if (data.session) {
        navigate('/dashboard');
        return;
      }
      alert('Check your email to confirm your account, then log in.');
      navigate('/');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to sign up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to continue with Google.';
      alert(
        message.includes('Unsupported provider')
          ? 'Google sign-in is not enabled in Supabase yet. Enable the Google provider in Supabase Authentication settings.'
          : message
      );
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-4">
      <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">Signup</h1>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
          value={email}
        />
        <input
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          value={password}
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account...' : 'Signup'}
        </button>
        <button type="button" onClick={handleGoogleLogin}>
          Continue with Google
        </button>
        <Link to="/">Back to login</Link>
      </form>
    </main>
  );
}