import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useUser from "../hook/useUser.jsx";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const { loginUserHandler } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginUserHandler({ email, password });
      navigate(from);
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left panel — immersive brand */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-slate-200 p-12 relative overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(251,146,60,0.15),transparent_55%)]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
            ✈️ Wanderlog
          </span>
          <h1 className="mt-8 text-4xl xl:text-5xl font-semibold leading-tight text-slate-200">
            Welcome back,
            <br />
            <span className="text-orange-400">traveler.</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-md">
            Sign in to pick up where you left off — your itineraries, photos, and memories are exactly where you put them.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            { icon: '🗺️', title: 'Plan trips', desc: 'Organize every journey with day-by-day itineraries.' },
            { icon: '📸', title: 'Capture memories', desc: 'Add photos to every day and relive the moments.' },
            { icon: '✨', title: 'Share adventures', desc: 'Make trips public and inspire fellow travelers.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-800/60 p-5">
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div>
                <p className="font-medium text-slate-200">{item.title}</p>
                <p className="mt-0.5 text-sm text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
              ✈️ Wanderlog
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-200">Sign in</h2>
          <p className="mt-1 text-sm text-slate-400">Continue your adventures.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-6 py-3 text-base"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-orange-400 hover:text-orange-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;