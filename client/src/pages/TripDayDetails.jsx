import { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom'
import useDay from "../hook/useDay";

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const TripDayDetails = () => {
  const { tripId, dayNumber } = useParams();
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getDay, updateDay, removePhotoFromDay } = useDay()

  // Modal states
  const [deletePhotoModal, setDeletePhotoModal] = useState(null); // photoUrl
  const [addPhotoModal, setAddPhotoModal] = useState(false);
  const [editPhotoModal, setEditPhotoModal] = useState(null); // photoUrl to replace
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);

  useEffect(() => {
    const fetchDay = async () => {
      try {
        setLoading(true);
        const data = await getDay(tripId, dayNumber);
        setDayData(data);
      } catch (error) {
        setError(error.message || 'Failed to load day details');
      } finally {
        setLoading(false);
      }
    }
    fetchDay()
  }, [tripId, dayNumber])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <span role="status" aria-label="Loading" className="inline-block animate-spin rounded-full border-slate-700 border-t-orange-400 h-10 w-10 border-[3px]" />
        <p className="mt-4 text-sm font-medium">Loading day…</p>
      </div>
    );
  }

  if (error || !dayData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-5xl mb-4">🗓️</p>
        <p className="text-slate-400">{error || 'Day not found'}</p>
        <Link to={`/trips/${tripId}`} className="mt-4 inline-block text-orange-400 font-medium hover:text-orange-300 transition-colors">← Back to trip</Link>
      </div>
    );
  }

  const photos = dayData.photos || [];
  const photoCount = photos.length;
  const remaining = 10 - photoCount;

  const handleDeletePhotoConfirm = async () => {
    if (!deletePhotoModal) return;
    try {
      await removePhotoFromDay(tripId, dayData._id, deletePhotoModal);
      setDeletePhotoModal(null);
      const data = await getDay(tripId, dayNumber);
      setDayData(data);
    } catch (err) {
      setError(err.message || 'Failed to remove photo');
    }
  };

  const handleAddPhotos = async (e) => {
    e.preventDefault();
    if (photoFiles.length === 0 || remaining <= 0) return;

    setPhotoSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dayNumber', dayData.dayNumber);
      formData.append('date', dayData.date ? dayData.date.slice(0, 10) : '');
      if (dayData.title) formData.append('title', dayData.title);
      if (dayData.description) formData.append('description', dayData.description);
      if (dayData.location) formData.append('location', dayData.location);
      photoFiles.slice(0, remaining).forEach((photo) => formData.append('photos', photo));

      await updateDay(tripId, dayData._id, formData);
      setAddPhotoModal(false);
      setPhotoFiles([]);
      const data = await getDay(tripId, dayNumber);
      setDayData(data);
    } catch (err) {
      setError(err.message || 'Failed to add photos');
    } finally {
      setPhotoSubmitting(false);
    }
  };

  const handleEditPhotos = async (e) => {
    e.preventDefault();
    if (!editPhotoModal || photoFiles.length === 0) return;

    const oldPhotoUrl = editPhotoModal;

    setPhotoSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dayNumber', dayData.dayNumber);
      formData.append('date', dayData.date ? dayData.date.slice(0, 10) : '');
      if (dayData.title) formData.append('title', dayData.title);
      if (dayData.description) formData.append('description', dayData.description);
      if (dayData.location) formData.append('location', dayData.location);
      photoFiles.slice(0, 1).forEach((photo) => formData.append('photos', photo));

      // Upload the replacement photo
      await updateDay(tripId, dayData._id, formData);
      // Remove the old photo being replaced
      try {
        await removePhotoFromDay(tripId, dayData._id, oldPhotoUrl);
      } catch (removeErr) {
        setError(removeErr.message || 'Failed to remove old photo');
      }

      setEditPhotoModal(null);
      setPhotoFiles([]);
      const data = await getDay(tripId, dayNumber);
      setDayData(data);
    } catch (err) {
      setError(err.message || 'Failed to replace photo');
    } finally {
      setPhotoSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Breadcrumb navigation */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-orange-400 transition-colors">My Trips</Link>
        <span aria-hidden>›</span>
        <Link to={`/trips/${tripId}`} className="hover:text-orange-400 transition-colors">Trip</Link>
        <span aria-hidden>›</span>
        <span className="text-slate-300">Day {dayNumber}</span>
      </nav>

      {/* Hero header with cover image */}
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 mb-8">
        <div className="relative">
          {photos.length > 0 ? (
            <img
              src={photos[0]}
              alt={dayData.title || `Day ${dayNumber}`}
              className="h-48 sm:h-64 lg:h-80 w-full object-cover"
            />
          ) : (
            <div className="h-48 sm:h-64 lg:h-80 w-full bg-gradient-to-br from-orange-500/20 via-slate-800 to-slate-900 flex items-center justify-center text-6xl sm:text-7xl">
              🏝️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

          {/* Day badge + title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="text-white min-w-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-display flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg sm:text-xl font-semibold text-slate-950 shadow-md shadow-orange-500/20">
                    {dayData.dayNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">Day {dayData.dayNumber}</p>
                    <h1 className="font-display mt-0.5 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-100 break-words">
                      {dayData.title || 'Untitled Day'}
                    </h1>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                  {dayData.date && <span>📅 {formatDate(dayData.date)}</span>}
                  {dayData.location && <span>📍 {dayData.location}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content grid: main + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main content column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {dayData.description && (
            <section className="rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-200 mb-3">About this day</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line break-words">{dayData.description}</p>
            </section>
          )}

          {/* Photo gallery */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold text-slate-200">
                Photos <span className="text-sm font-normal text-slate-500">({photoCount}/10)</span>
              </h2>
              {photoCount < 10 && (
                <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm" onClick={() => { setAddPhotoModal(true); setPhotoFiles([]); }}>
                  + Add photo
                </button>
              )}
            </div>

            {photoCount > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {photos.map((photo, index) => (
                  <div key={photo} className="group relative overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50">
                    <img
                      src={photo}
                      alt={`${dayData.title || 'Day'} photo ${index + 1}`}
                      className="h-32 sm:h-40 lg:h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Delete button on hover */}
                    <button
                      onClick={() => setDeletePhotoModal(photo)}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-500"
                      title="Delete photo"
                    >
                      ✕
                    </button>
                    {/* Edit pencil on hover */}
                    <button
                      onClick={() => { setEditPhotoModal(photo); setPhotoFiles([]); }}
                      className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-xs text-orange-300 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-slate-800"
                      title="Replace photo"
                    >
                      ✏️
                    </button>
                  </div>
                ))}
                {/* Add photo tile if under 10 */}
                {photoCount < 10 && (
                  <button
                    onClick={() => { setAddPhotoModal(true); setPhotoFiles([]); }}
                    className="flex h-32 sm:h-40 lg:h-48 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 hover:border-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-xs font-medium">Add photo</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/40 py-16 text-center">
                <p className="text-4xl mb-3">📷</p>
                <p className="text-slate-400">No photos yet for this day</p>
                <div className="mt-4">
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-3 py-1.5 text-sm" onClick={() => { setAddPhotoModal(true); setPhotoFiles([]); }}>+ Add photos</button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar column */}
        <aside className="space-y-6">
          {/* Quick facts card */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 p-5 sm:p-6">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-orange-400 mb-4">Quick facts</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Day</dt>
                <dd className="text-slate-200 font-medium">Day {dayData.dayNumber}</dd>
              </div>
              {dayData.date && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Date</dt>
                  <dd className="text-slate-200 font-medium text-right">{formatDate(dayData.date)}</dd>
                </div>
              )}
              {dayData.location && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Location</dt>
                  <dd className="text-slate-200 font-medium text-right break-words">{dayData.location}</dd>
                </div>
              )}
              {dayData.createdAt && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Added</dt>
                  <dd className="text-slate-200 font-medium">{formatDate(dayData.createdAt)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Photos</dt>
                <dd className="text-slate-200 font-medium">{photoCount}/10</dd>
              </div>
            </dl>
          </div>

          {/* Back to trip card */}
          <Link
            to={`/trips/${tripId}`}
            className="block rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 p-5 sm:p-6 hover:border-orange-500/30 transition-colors group"
          >
            <p className="text-sm text-slate-400 group-hover:text-orange-300 transition-colors">← Back to trip</p>
            <p className="font-display mt-1 text-slate-200 font-medium">View full itinerary</p>
          </Link>
        </aside>
      </div>


      {/* Delete photo modal */}
      {deletePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletePhotoModal(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">📷</div>
            <h3 className="mt-4 text-lg font-semibold text-slate-200">Remove this photo?</h3>
            <p className="mt-2 text-sm text-slate-400">The photo will be permanently removed from this day.</p>
            <div className="mt-6 flex gap-3">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm flex-1" onClick={() => setDeletePhotoModal(null)}>Cancel</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20 px-4 py-2 text-sm flex-1" onClick={handleDeletePhotoConfirm}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Add photo modal */}
      {addPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddPhotoModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 p-6">
            <h3 className="text-lg font-semibold text-slate-200">Add photos to Day {dayData.dayNumber}</h3>
            <p className="mt-1 text-sm text-slate-400">{photoCount}/10 photos used</p>
            <form onSubmit={handleAddPhotos} className="mt-5 space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500/10 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-orange-300 hover:file:bg-orange-500/20"
              />
              {photoFiles.length > 0 && (
                <p className="text-xs text-slate-500">{photoFiles.length} photo{photoFiles.length === 1 ? '' : 's'} selected</p>
              )}
              <div className="flex gap-3">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm flex-1" onClick={() => { setAddPhotoModal(false); setPhotoFiles([]); }}>Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm flex-1" disabled={photoSubmitting || photoFiles.length === 0}>
                  {photoSubmitting ? 'Uploading…' : 'Add photos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace photo modal */}
      {editPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditPhotoModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 p-6">
            <h3 className="text-lg font-semibold text-slate-200">Replace photo</h3>
            <p className="mt-1 text-sm text-slate-400">
              Day {dayData.dayNumber} · {photoCount}/10 photos
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900">
              <img src={editPhotoModal} alt="Photo to replace" className="h-44 w-full object-cover" />
            </div>
            <form onSubmit={handleEditPhotos} className="mt-5 space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500/10 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-orange-300 hover:file:bg-orange-500/20"
              />
              {photoFiles.length > 0 && (
                <p className="text-xs text-slate-500">{photoFiles.length} photo{photoFiles.length === 1 ? '' : 's'} selected</p>
              )}
              <div className="flex gap-3">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm flex-1" onClick={() => { setEditPhotoModal(null); setPhotoFiles([]); }}>Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm flex-1" disabled={photoSubmitting || photoFiles.length === 0}>
                  {photoSubmitting ? 'Replacing…' : 'Replace photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripDayDetails