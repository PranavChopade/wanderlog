import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useDashboard from '../hook/useDashboard.jsx';
import useTrip from '../hook/useTrip.jsx';

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const Dashboard = () => {
  const { stats, loading: statsLoading, fetchDashboardStats } = useDashboard();
  const { trips, loading: tripsLoading, fetchMyTrips } = useTrip();
  const { trips: browseTrips, loading: browseLoading, pagination, fetchAllTrips } = useTrip();
  const [browsePage, setBrowsePage] = useState(1);

  useEffect(() => {
    fetchDashboardStats();
    fetchMyTrips();
  }, [fetchDashboardStats, fetchMyTrips]);

  useEffect(() => {
    fetchAllTrips(browsePage, 6);
  }, [fetchAllTrips, browsePage]);

  if (statsLoading || tripsLoading || browseLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <span role="status" aria-label="Loading" className="inline-block animate-spin rounded-full border-slate-700 border-t-orange-400 h-10 w-10 border-[3px]" />
        <p className="mt-4 text-sm font-medium">Loading…</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Trips', value: stats?.totalTrips ?? 0, icon: '🧳', accent: 'text-orange-400' },
    { label: 'Destinations', value: stats?.uniqueDestinations ?? 0, icon: '📍', accent: 'text-orange-300' },
    { label: 'Days Planned', value: stats?.totalDays ?? 0, icon: '📅', accent: 'text-orange-400' },
    { label: 'Photos', value: stats?.totalPhotos ?? 0, icon: '📷', accent: 'text-orange-300' },
  ];

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">My Trips</h1>
          <p className="mt-1 text-slate-400">Manage your adventures</p>
        </div>
        <Link to="/trips/new">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-6 py-3 text-base">+ New Trip</button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-lg shadow-black/20 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{card.icon}</span>
              <div className={`text-3xl font-bold text-slate-200`}>{card.value}</div>
            </div>
            <div className={`mt-2 text-sm font-medium ${card.accent}`}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Trips list */}
      {trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 py-20 text-center">
          <p className="text-5xl mb-3">✈️</p>
          <p className="text-xl font-semibold text-slate-200">No trips yet</p>
          <p className="mt-1 text-sm text-slate-400">Plan your first adventure to get started.</p>
          <Link to="/trips/new" className="mt-6 inline-block">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm">Create your first trip</button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link
              key={trip._id}
              to={`/trips/${trip._id}`}
              className="group overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300"
            >
              <div className="aspect-[16/10] bg-slate-900 overflow-hidden">
                {trip.coverImage ? (
                  <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🏝️</div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">{trip.destination}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">{trip.title}</h3>
                  </div>
                  {trip.isPublic && (
                    <span className="shrink-0 rounded-full border border-orange-400/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-300">Public</span>
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Browse community trips */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Explore community trips</h2>
            <p className="mt-1 text-sm text-slate-400">Discover adventures from other travelers</p>
          </div>
          <Link to="/" className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">
            View all →
          </Link>
        </div>

        {browseTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 py-16 text-center">
            <div className="text-5xl mb-3">🗺️</div>
            <p className="text-slate-400">No public trips from the community yet.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {browseTrips.map((trip) => (
                <Link
                  key={trip._id}
                  to={`/trips/${trip._id}`}
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
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm"
                  disabled={browsePage <= 1}
                  onClick={() => setBrowsePage((p) => Math.max(1, p - 1))}
                >
                  ← Prev
                </button>
                <span className="px-4 py-2 text-sm text-slate-400">
                  Page {browsePage} of {totalPages}
                </span>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm"
                  disabled={browsePage >= totalPages}
                  onClick={() => setBrowsePage((p) => Math.min(totalPages, p + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;