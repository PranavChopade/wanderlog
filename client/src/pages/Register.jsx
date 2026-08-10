import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUser from "../hook/useUser.jsx";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { registerUserHandler } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerUserHandler({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left panel — immersive brand */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-slate-200 p-12 relative overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.15),transparent_55%)]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
            ✈️ Wanderlog
          </span>
          <h1 className="mt-8 text-4xl xl:text-5xl font-semibold leading-tight text-slate-200">
            Start your next
            <br />
            <span className="text-orange-400">adventure.</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-md">
            Create a free account and turn any trip into a beautifully organized, day-by-day itinerary you’ll actually want to revisit.
          </p>
        </div>
        <div className="relative grid gap-3 sm:grid-cols-3">
          {[
            { icon: '🗺️', label: 'Plan' },
            { icon: '📸', label: 'Capture' },
            { icon: '✨', label: 'Relive' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 text-center">
              <div className="text-2xl">{item.icon}</div>
              <div className="mt-1 text-xs font-medium text-slate-300">{item.label}</div>
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

          <h2 className="text-2xl font-semibold text-slate-200">Create your account</h2>
          <p className="mt-1 text-sm text-slate-400">Free forever. Start planning in minutes.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

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
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-6 py-3 text-base"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-orange-400 hover:text-orange-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;