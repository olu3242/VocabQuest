import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPassword) {
      alert('Enter a new password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert('Password updated. Please log in.');
      navigate('/login');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-4">
      <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">Reset Password</h1>
        <input
          autoComplete="new-password"
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Enter new password"
          type="password"
          value={newPassword}
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </main>
  );
}
