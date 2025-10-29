import { useState } from 'react';
import { login, getCurrentSession } from '../../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../providers/ToastProvider';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notify } = useToast();

  // Redirect if already logged in
  if (getCurrentSession()) {
    navigate('/');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user) {
        notify({ type: 'success', message: `Welcome back, ${user.name}!` });
        navigate('/');
      } else {
        notify({ type: 'error', message: 'Invalid username or password' });
      }
    } catch (error: any) {
      notify({ type: 'error', message: error?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="tf-card p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold tf-title mb-6 text-center">TALENTFLOW</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold tf-muted mb-2">Username</label>
            <input
              type="text"
              className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-400"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin / recruiter / viewer"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold tf-muted mb-2">Password</label>
            <input
              type="password"
              className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="password (default)"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full tf-btn tf-btn--primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="text-xs tf-muted mt-4">
            <p>Default accounts:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>admin / password (Admin)</li>
              <li>recruiter / password (Recruiter)</li>
              <li>viewer / password (Viewer)</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}

