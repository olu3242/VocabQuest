import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../../services/authService';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to sign in.');
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

  const handleResetPassword = async () => {
    if (!email) {
      alert('Enter your email first.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;
      alert('Password reset email sent. Check your inbox.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to send reset email.');
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-4">
      <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">Login</h1>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
          value={email}
        />
        <input
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          value={password}
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
        <button type="button" onClick={handleGoogleLogin}>
          Continue with Google
        </button>
        <button type="button" onClick={handleResetPassword}>
          Forgot password?
        </button>
        <Link to="/signup">Create an account</Link>
      </form>
    </main>
  );
}