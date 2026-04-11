// src/pages/public/AuthPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  getRoleRedirectPath,
  fetchProfile,
  resendConfirmationEmail,
} from '../../services/auth.service';
import Button from '../../components/common/Button';
import { UserRole } from '../../types/student.types';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [role, setRole]         = useState<UserRole>('student');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');

  const handleSubmit = async () => {
    setError(''); setMessage(''); setLoading(true);
    try {
      if (mode === 'signin') {
        const { user } = await signInWithEmail(email, password);
        if (user) {
          const profile = await fetchProfile(user.id).catch(() => null);
          if (!profile?.role) {
            navigate('/onboarding');
            return;
          }
          navigate(getRoleRedirectPath(profile.role));
        }
      } else {
        const { session } = await signUpWithEmail(email, password, name, role);
        if (session) {
          navigate('/onboarding');
          return;
        }
        setMode('signin');
        setMessage('Check your email to confirm your account, then sign in.');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎮</div>
          <h1 className="text-2xl font-black text-indigo-600">VocaQuest</h1>
          <p className="text-gray-500 text-sm mt-1">Level up your vocabulary</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(['signin','signup'] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === m ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500'}`}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="relative">
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              type={showPw ? 'text' : 'password'}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10" />
            <button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === 'signup' && (
            <div>
              <p className="text-xs text-gray-500 mb-2">I am a…</p>
              <div className="grid grid-cols-2 gap-2">
                {(['student','parent','teacher'] as UserRole[]).map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`py-2 text-sm font-semibold rounded-xl border-2 capitalize transition-all ${role === r ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {message && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{message}</p>}

          {mode === 'signin' && email && (
            <button
              onClick={async () => {
                setError('');
                setMessage('');
                try {
                  await resendConfirmationEmail(email);
                  setMessage('Confirmation email sent. Check your inbox and spam folder.');
                } catch (e: unknown) {
                  setError(e instanceof Error ? e.message : 'Could not resend confirmation email.');
                }
              }}
              className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              type="button"
            >
              Resend confirmation email
            </button>
          )}

          <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" />
          </div>

          <button onClick={() => signInWithGoogle().catch(e => setError(e.message))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
