import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useUser from "../hook/useUser.jsx";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logoutUserHandler } = useUser();

  const handleLogout = async () => {
    setMobileOpen(false);
    await logoutUserHandler();
    navigate('/');
  };

  const linkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
      ? 'text-orange-300 bg-orange-500/10'
      : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <span className="h-9 w-9 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center text-lg shadow-md shadow-orange-500/20 group-hover:bg-orange-400 transition-colors">
            🧳
          </span>
          <span className="font-display text-xl font-semibold text-slate-200 tracking-tight">
            Wanderlog
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={linkClasses} end>
            Browse
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClasses}>
                My Trips
              </NavLink>
              <div className="ml-2 flex items-center gap-3 pl-3 border-l border-slate-700">
                <span className="text-sm font-medium text-slate-300">Hi, {user.name}</span>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] text-slate-300 hover:bg-slate-800 px-3 py-1.5 text-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="ml-3 flex items-center gap-2">
              <NavLink to="/login">
                <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm">Login</button>
              </NavLink>
              <NavLink to="/register">
                <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-3 py-1.5 text-sm">Sign up</button>
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-1">
          <NavLink to="/" className={({ isActive }) => `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-orange-300 bg-orange-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`} end onClick={closeMobile}>
            Browse
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-orange-300 bg-orange-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`} onClick={closeMobile}>
                My Trips
              </NavLink>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-sm font-medium text-slate-300 truncate">Hi, {user.name}</span>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] text-slate-300 hover:bg-slate-800 px-3 py-1.5 text-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <NavLink to="/login" onClick={closeMobile}>
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm">Login</button>
              </NavLink>
              <NavLink to="/register" onClick={closeMobile}>
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm">Sign up</button>
              </NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;