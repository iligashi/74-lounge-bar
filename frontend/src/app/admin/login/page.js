'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(form);
      localStorage.setItem('admin_token', data.token);
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lounge-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-5xl font-serif font-bold text-gold-400">74</span>
          <p className="text-sm text-lounge-500 tracking-[0.3em] uppercase mt-2">Admin Panel</p>
        </div>

        <div className="card-dark p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
              <Lock size={20} className="text-gold-500/70" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Username" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="input-field" required autoComplete="username" />
            <input type="password" placeholder="Password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="input-field" required autoComplete="current-password" />
            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
