import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useDay from '../hook/useDay.jsx';
import useTrip from '../hook/useTrip.jsx';

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    trip,
    loading: tripLoading,
    error: tripError,
    fetchTripById,
    deleteTrip,
  } = useTrip();
  const {
    days,
    loading: daysLoading,
    error: daysError,
    fetchDaysByTrip,
    createDay,
    updateDay,
    deleteDay,
    generateDaysForTrip,
    removePhotoFromDay,
  } = useDay();

  const [error, setError] = useState('');
  const [showDayForm, setShowDayForm] = useState(false);
  const [editingDayId, setEditingDayId] = useState(null);
  const [dayForm, setDayForm] = useState({ dayNumber: '', date: '', title: '', description: '', location: '' });
  const [daySubmitting, setDaySubmitting] = useState(false);

  // Modal states
  const [deleteDayModal, setDeleteDayModal] = useState(null); // { dayId, dayNumber }
  const [deletePhotoModal, setDeletePhotoModal] = useState(null); // { dayId, photoUrl }
  const [deleteTripModal, setDeleteTripModal] = useState(false);
  const [addPhotoDay, setAddPhotoDay] = useState(null); // day object
  const [editPhotoDay, setEditPhotoDay] = useState(null); // day object
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);

  const load = useCallback(async () => {
    await Promise.all([fetchTripById(id), fetchDaysByTrip(id)]);
  }, [id, fetchTripById, fetchDaysByTrip]);

  useEffect(() => { load(); }, [load]);

  const loadError = tripError?.message || daysError?.message;
  const displayError = error || loadError;

  const handleGenerateDays = async () => {
    try { await generateDaysForTrip(id); await load(); }
    catch (err) { setError(err.message || 'Failed to generate days'); }
  };

  const handleCreateDay = async (e) => {
    e.preventDefault();
    setDaySubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dayNumber', dayForm.dayNumber);
      formData.append('date', dayForm.date);
      if (dayForm.title) formData.append('title', dayForm.title);
      if (dayForm.description) formData.append('description', dayForm.description);
      if (dayForm.location) formData.append('location', dayForm.location);

      if (editingDayId) {
        // Editing — no photo upload allowed
        await updateDay(id, editingDayId, formData);
      } else {
        // Create — allow photo upload
        dayForm.photos?.forEach((photo) => formData.append('photos', photo));
        await createDay(id, formData);
      }
      setShowDayForm(false);
      setEditingDayId(null);
      setDayForm({ dayNumber: '', date: '', title: '', description: '', location: '' });
      await load();
    } catch (err) { setError(err.message || 'Failed to save day'); }
    finally { setDaySubmitting(false); }
  };

  const handleDeleteDayConfirm = async () => {
    if (!deleteDayModal) return;
    try {
      await deleteDay(id, deleteDayModal.dayId);
      setDeleteDayModal(null);
      await load();
    } catch (err) { setError(err.message || 'Failed to delete day'); }
  };

  const handleEditDay = (day) => {
    setEditingDayId(day._id);
    setDayForm({
      dayNumber: day.dayNumber,
      date: day.date ? day.date.slice(0, 10) : '',
      title: day.title || '',
      description: day.description || '',
      location: day.location || '',
    });
    setShowDayForm(true);
  };

  const handleCancelDayForm = () => {
    setShowDayForm(false);
    setEditingDayId(null);
    setDayForm({ dayNumber: '', date: '', title: '', description: '', location: '' });
  };

  const handleRemovePhotoConfirm = async () => {
    if (!deletePhotoModal) return;
    try {
      await removePhotoFromDay(id, deletePhotoModal.dayId, deletePhotoModal.photoUrl);
      setDeletePhotoModal(null);
      await load();
    } catch (err) { setError(err.message || 'Failed to remove photo'); }
  };

  const handleAddPhotos = async (e) => {
    e.preventDefault();
    if (!addPhotoDay || photoFiles.length === 0) return;

    const currentCount = addPhotoDay.photos?.length || 0;
    const remaining = 10 - currentCount;
    if (remaining <= 0) return;

    setPhotoSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dayNumber', addPhotoDay.dayNumber);
      formData.append('date', addPhotoDay.date ? addPhotoDay.date.slice(0, 10) : '');
      if (addPhotoDay.title) formData.append('title', addPhotoDay.title);
      if (addPhotoDay.description) formData.append('description', addPhotoDay.description);
      if (addPhotoDay.location) formData.append('location', addPhotoDay.location);
      photoFiles.slice(0, remaining).forEach((photo) => formData.append('photos', photo));

      await updateDay(id, addPhotoDay._id, formData);
      setAddPhotoDay(null);
      setPhotoFiles([]);
      await load();
    } catch (err) { setError(err.message || 'Failed to add photos'); }
    finally { setPhotoSubmitting(false); }
  };

  const handleEditPhoto = async (e) => {
    e.preventDefault();
    if (!editPhotoDay || photoFiles.length === 0) return;

    const { day: editDay, photoUrl: oldPhotoUrl } = editPhotoDay;

    setPhotoSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dayNumber', editDay.dayNumber);
      formData.append('date', editDay.date ? editDay.date.slice(0, 10) : '');
      if (editDay.title) formData.append('title', editDay.title);
      if (editDay.description) formData.append('description', editDay.description);
      if (editDay.location) formData.append('location', editDay.location);
      photoFiles.slice(0, 1).forEach((photo) => formData.append('photos', photo));

      // Upload the replacement photo
      await updateDay(id, editDay._id, formData);
      // Remove the old photo being replaced
      try {
        await removePhotoFromDay(id, editDay._id, oldPhotoUrl);
      } catch (removeErr) {
        setError(removeErr.message || 'Failed to remove old photo');
      }

      setEditPhotoDay(null);
      setPhotoFiles([]);
      await load();
    } catch (err) { setError(err.message || 'Failed to replace photo'); }
    finally { setPhotoSubmitting(false); }
  };

  const handleDeleteTripConfirm = async () => {
    try { await deleteTrip(id); navigate('/dashboard'); }
    catch (err) { setError(err.message || 'Failed to delete trip'); }
  };

  if (tripLoading || daysLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <span role="status" aria-label="Loading" className="inline-block animate-spin rounded-full border-slate-700 border-t-orange-400 h-10 w-10 border-[3px]" />
        <p className="mt-4 text-sm font-medium">Loading…</p>
      </div>
    );
  }

  if (displayError && !trip) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-slate-400">{displayError}</p>
        <Link to="/" className="mt-4 inline-block text-orange-400 font-medium">← Back to trips</Link>
      </div>
    );
  }

  const handleDayOpen = (day) => {
    navigate(`/trips/${trip._id}/days/${day.dayNumber}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-orange-400 transition-colors">My Trips</Link>
        <span aria-hidden>›</span>
        <span className="text-slate-300">{trip.title}</span>
      </nav>

      {/* Trip header — hero cover */}
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 mb-10">
        <div className="relative aspect-[4/3] sm:aspect-[16/7] lg:aspect-[21/9] bg-slate-900">
          {trip.coverImage ? (
            <img src={trip.coverImage} alt={trip.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-6xl">🏝️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="text-white min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">{trip.destination}</p>
                <h1 className="font-display mt-1 text-2xl sm:text-4xl font-semibold tracking-tight text-slate-200 break-words">{trip.title}</h1>
                <p className="mt-2 text-sm text-slate-300">📅 {formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/trips/${id}/edit`}><button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm">Edit</button></Link>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20 px-3 py-1.5 text-sm" onClick={() => setDeleteTripModal(true)}>Delete</button>
              </div>
            </div>
          </div>
          {trip.isPublic && (
            <span className="absolute top-4 right-4 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">Public</span>
          )}
        </div>
        {(trip.description || trip.tags?.length > 0) && (
          <div className="p-6 sm:p-8">
            {trip.description && <p className="text-slate-300 max-w-3xl">{trip.description}</p>}
            {trip.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {trip.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-orange-400/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-300">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {displayError && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">{displayError}</div>
      )}

      {/* Days section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">Itinerary</p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-slate-200">{days.length} {days.length === 1 ? 'day' : 'days'} planned</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm" onClick={handleGenerateDays}>⚡ Auto-generate</button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-3 py-1.5 text-sm" onClick={() => setShowDayForm(!showDayForm)}>+ Add day</button>
        </div>
      </div>

      {/* Day form — create only (no photo upload on edit) */}
      {showDayForm && (
        <form onSubmit={handleCreateDay} className="mb-8 rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 p-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Day number</label>
            <input type="number" min="1" required value={dayForm.dayNumber} onChange={(e) => setDayForm({ ...dayForm, dayNumber: e.target.value })} className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Date</label>
            <input type="date" required value={dayForm.date} onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })} className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Title</label>
            <input type="text" value={dayForm.title} onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })} placeholder="Beach day" className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Location</label>
            <input type="text" value={dayForm.location} onChange={(e) => setDayForm({ ...dayForm, location: e.target.value })} placeholder="Bali, Indonesia" className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
            <textarea value={dayForm.description} onChange={(e) => setDayForm({ ...dayForm, description: e.target.value })} rows="3" placeholder="What did you do this day?" className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-y" />
          </div>
          {!editingDayId && (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setDayForm({ ...dayForm, photos: Array.from(e.target.files || []) })}
                className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500/10 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-orange-300 hover:file:bg-orange-500/20"
              />
              {dayForm.photos?.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-500">{dayForm.photos.length} photo{dayForm.photos.length === 1 ? '' : 's'} selected</p>
              )}
            </div>
          )}
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm" onClick={handleCancelDayForm}>Cancel</button>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm" disabled={daySubmitting}>{daySubmitting ? 'Saving…' : editingDayId ? 'Save day' : 'Add day'}</button>
          </div>
        </form>
      )}

      {/* Days list */}
      {days.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 py-20 text-center">
          <p className="text-5xl mb-3">🗓️</p>
          <p className="text-xl font-semibold text-slate-200">No days planned yet</p>
          <p className="mt-1 text-sm text-slate-400">Auto-generate days from your trip dates, or add them manually.</p>
          <div className="mt-6"><button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 px-4 py-2 text-sm" onClick={handleGenerateDays}>⚡ Generate days</button></div>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const photoCount = day.photos?.length || 0;
            return (
              <div key={day._id} className="rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg shadow-black/20 p-5 sm:p-6 hover:border-orange-500/30 transition-colors">
                {/* Day summary row — click to open */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer" onClick={() => handleDayOpen(day)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-semibold text-slate-950 shadow-md shadow-orange-500/20">
                      {day.dayNumber}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold text-slate-200 break-words">
                        {day.title || `Day ${day.dayNumber}`}
                      </h3>
                      <p className="mt-0.5 text-sm text-slate-400">{formatDate(day.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-sm" onClick={() => handleEditDay(day)}>Edit</button>
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] text-slate-300 hover:bg-slate-800 px-3 py-1.5 text-sm" onClick={() => setDeleteDayModal({ dayId: day._id, dayNumber: day.dayNumber })}>Delete</button>
                  </div>
                </div>

                {/* Photos section */}
                {photoCount > 0 && (
                  <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                    {day.photos.map((photo) => (
                      <div key={photo} className="group relative overflow-hidden rounded-xl bg-slate-900">
                        <img src={photo} alt="" className="h-32 w-full object-cover" />
                        {/* Delete button on hover */}
                        <button
                          onClick={() => setDeletePhotoModal({ dayId: day._id, photoUrl: photo })}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-500"
                          title="Delete photo"
                        >
                          ✕
                        </button>
                        {/* Edit pencil on hover */}
                        <button
                          onClick={() => { setEditPhotoDay({ day, photoUrl: photo }); setPhotoFiles([]); }}
                          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-xs text-orange-300 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-slate-800"
                          title="Replace photo"
                        >
                          ✏️
                        </button>
                      </div>
                    ))}
                    {/* Add photo button if under 10 */}
                    {photoCount < 10 && (
                      <button
                        onClick={() => { setAddPhotoDay(day); setPhotoFiles([]); }}
                        className="flex h-32 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 hover:border-orange-400 hover:text-orange-300 transition-colors"
                      >
                        <span className="text-2xl">+</span>
                        <span className="text-xs font-medium">Add photo</span>
                      </button>
                    )}
                  </div>
                )}
                {photoCount === 0 && (
                  <div className="mt-5">
                    <button
                      onClick={() => { setAddPhotoDay(day); setPhotoFiles([]); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-600 py-4 text-sm text-slate-400 hover:border-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <span className="text-lg">+</span> Add photos
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


      {/* Delete day modal */}
      {deleteDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteDayModal(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">🗑️</div>
            <h3 className="mt-4 text-lg font-semibold text-slate-200">Delete Day {deleteDayModal.dayNumber}?</h3>
            <p className="mt-2 text-sm text-slate-400">This will permanently remove this day and all its photos. This action cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm flex-1" onClick={() => setDeleteDayModal(null)}>Cancel</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20 px-4 py-2 text-sm flex-1" onClick={handleDeleteDayConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

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
              <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20 px-4 py-2 text-sm flex-1" onClick={handleRemovePhotoConfirm}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete trip modal */}
      {deleteTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTripModal(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">⚠️</div>
            <h3 className="mt-4 text-lg font-semibold text-slate-200">Delete this trip?</h3>
            <p className="mt-2 text-sm text-slate-400">This will permanently delete the trip and all its days. This action cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm flex-1" onClick={() => setDeleteTripModal(false)}>Cancel</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20 px-4 py-2 text-sm flex-1" onClick={handleDeleteTripConfirm}>Delete trip</button>
            </div>
          </div>
        </div>
      )}

      {/* Add photo modal */}
      {addPhotoDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddPhotoDay(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 p-6">
            <h3 className="text-lg font-semibold text-slate-200">Add photos to Day {addPhotoDay.dayNumber}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {addPhotoDay.photos?.length || 0}/10 photos used
            </p>
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
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm flex-1" onClick={() => { setAddPhotoDay(null); setPhotoFiles([]); }}>Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm flex-1" disabled={photoSubmitting || photoFiles.length === 0}>
                  {photoSubmitting ? 'Uploading…' : 'Add photos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace photo modal */}
      {editPhotoDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditPhotoDay(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 p-6">
            <h3 className="text-lg font-semibold text-slate-200">Replace photo</h3>
            <p className="mt-1 text-sm text-slate-400">
              Day {editPhotoDay.day.dayNumber} · {editPhotoDay.day.photos?.length || 0}/10 photos
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900">
              <img src={editPhotoDay.photoUrl} alt="Photo to replace" className="h-44 w-full object-cover" />
            </div>
            <form onSubmit={handleEditPhoto} className="mt-5 space-y-4">
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
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm flex-1" onClick={() => { setEditPhotoDay(null); setPhotoFiles([]); }}>Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm flex-1" disabled={photoSubmitting || photoFiles.length === 0}>
                  {photoSubmitting ? 'Replacing…' : 'Replace photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetail;