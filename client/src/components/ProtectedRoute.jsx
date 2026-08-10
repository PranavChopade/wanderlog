import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <span role="status" aria-label="Loading" className="inline-block animate-spin rounded-full border-slate-700 border-t-orange-400 h-10 w-10 border-[3px]" />
        <p className="mt-4 text-sm font-medium">Loading…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;