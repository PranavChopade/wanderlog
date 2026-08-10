import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useTrip from '../hook/useTrip.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const Home = () => {
  const { trips, loading, pagination, fetchAllTrips } = useTrip();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingTripId, setPendingTripId] = useState(null);

  useEffect(() => {
    fetchAllTrips(page, 9);
  }, [fetchAllTrips, page]);

  const handleTripClick = (e, tripId) => {
    if (user) return;

    e.preventDefault();
    setPendingTripId(tripId);
    setShowLoginPrompt(true);
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: `/trips/${pendingTripId}` } });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <span role="status" aria-label="Loading" className="inline-block animate-spin rounded-full border-slate-700 border-t-orange-400 h-10 w-10 border-[3px]" />
        <p className="mt-4 text-sm font-medium">Loading…</p>
      </div>
    );
  }

  const totalPages = pagination.totalPages || 1;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.15),transparent_55%)]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-300">
            ✈️ Your travel journal
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-200">
            Plan trips. Capture days.
            <br className="hidden sm:block" />
            <span className="text-orange-400">Relive the journey.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Organize every trip with day-by-day itineraries, photos, and memories — all in one beautiful place.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-orange-500 px-7 py-3.5 font-medium text-slate-950 shadow-lg shadow-orange-500/25 hover:bg-orange-400 transition-colors"
              >
                Go to my trips
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-lg bg-orange-500 px-7 py-3.5 font-medium text-slate-950 shadow-lg shadow-orange-500/25 hover:bg-orange-400 transition-colors"
                >
                  Start planning free
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-700 bg-slate-800/60 px-7 py-3.5 font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Browse trips */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-200">Explore trips</h2>
            <p className="mt-1 text-slate-400">Discover adventures from the community</p>
          </div>
          {pagination.totalCount > 0 && (
            <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-300">
              {pagination.totalCount} {pagination.totalCount === 1 ? 'trip' : 'trips'}
            </span>
          )}
        </div>

        {trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 py-20 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-xl font-semibold text-slate-200">No public trips yet</p>
            <p className="mt-2 text-slate-400">Be the first to share an adventure with the world.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <Link
                  key={trip._id}
                  to={`/trips/${trip._id}`}
                  onClick={(e) => handleTripClick(e, trip._id)}
                  className="group overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300"
                >
                  <div className="aspect-[16/10] bg-slate-900 overflow-hidden">
                    {trip.coverImage ? (
                      <img
                        src={trip.coverImage}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🏝️</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">
                      {trip.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">📍 {trip.destination}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
                    </div>
                    {trip.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {trip.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full border border-orange-400/20 bg-orange-500/10 text-orange-300 text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Prev
                </button>
                <span className="px-4 py-2 text-sm text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-slate-200">Sign in to explore</h3>
            <p className="mt-2 text-sm text-slate-400">
              Create a free account or sign in to view this trip's full itinerary, photos, and day-by-day details.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={handleLoginRedirect} className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm">Sign in to continue</button>
              <button onClick={() => setShowLoginPrompt(false)} className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm">Not now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;