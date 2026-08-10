import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTrip from '../hook/useTrip.jsx';

const TripForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { trip, error: tripError, fetchTripById, createTrip, updateTrip } = useTrip();

  const [form, setForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    isPublic: false,
    tags: '',
    coverImage: null,
  });
  const [coverPreview, setCoverPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    fetchTripById(id);
  }, [id, isEdit, fetchTripById]);

  const loadError = tripError?.message || '';
  const displayError = error || loadError;

  useEffect(() => {
    if (!isEdit || !trip) return;
    setForm({
      title: trip.title || '',
      destination: trip.destination || '',
      startDate: trip.startDate ? trip.startDate.slice(0, 10) : '',
      endDate: trip.endDate ? trip.endDate.slice(0, 10) : '',
      description: trip.description || '',
      isPublic: trip.isPublic || false,
      tags: (trip.tags || []).join(', '),
      coverImage: null,
    });
    if (trip.coverImage) setCoverPreview(trip.coverImage);
  }, [isEdit, trip]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'coverImage') {
      const file = files[0] || null;
      setForm({ ...form, coverImage: file });
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          setError('Only JPEG, PNG, WebP, and GIF images are allowed');
          e.target.value = '';
          setCoverPreview('');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('File too large. Maximum size is 5MB.');
          e.target.value = '';
          setCoverPreview('');
          return;
        }
        setError('');
        const reader = new FileReader();
        reader.onload = () => setCoverPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setCoverPreview('');
      }
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (isEdit) {
        await updateTrip(id, payload);
      } else {
        await createTrip(payload);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">{isEdit ? 'Edit journey' : 'New journey'}</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-200">{isEdit ? 'Edit Trip' : 'Create a New Trip'}</h1>
      <p className="mt-1 text-slate-400">{isEdit ? 'Update the details of your adventure.' : 'Tell us where you’re headed — you can add days next.'}</p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/60 p-6 sm:p-8 shadow-lg shadow-black/20 space-y-5">
        {displayError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">{displayError}</div>
        )}

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-300">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Summer in Bali" required className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
        </div>

        <div>
          <label htmlFor="destination" className="mb-1.5 block text-sm font-medium text-slate-300">Destination</label>
          <input id="destination" name="destination" value={form.destination} onChange={handleChange} placeholder="Bali, Indonesia" required className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Start date</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">End date</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="What makes this trip special?" className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-y" />
        </div>

        <div>
          <label htmlFor="tags" className="mb-1.5 block text-sm font-medium text-slate-300">Tags (comma separated)</label>
          <input id="tags" name="tags" value={form.tags} onChange={handleChange} placeholder="beach, adventure, food" className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Cover image</label>
          <input
            type="file"
            name="coverImage"
            accept="image/*"
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500/10 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-orange-300 hover:file:bg-orange-500/20"
          />
          {coverPreview && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
              <img src={coverPreview} alt="Cover preview" className="h-40 w-full object-cover" />
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer rounded-xl bg-slate-900/60 border border-slate-700 p-4 hover:border-orange-500/30 transition-colors">
          <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-900" />
          <span className="text-sm text-slate-300">
            <span className="font-medium">Make this trip public</span>
            <span className="block text-xs text-slate-500">Anyone can browse and view your itinerary.</span>
          </span>
        </label>

        <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-4 py-2 text-sm"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;