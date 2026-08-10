import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="text-7xl mb-6">🧭</div>
      <h1 className="text-4xl font-bold text-slate-200">Page not found</h1>
      <p className="mt-3 text-slate-400 max-w-md mx-auto">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium shadow-md shadow-orange-500/20 px-6 py-3 text-base"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;