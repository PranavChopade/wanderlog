const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-[3px]',
  };

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-slate-700 border-t-orange-400 ${sizes[size]} ${className}`}
    />
  );
};

export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-24 text-slate-400">
    <Spinner size="lg" />
    <p className="mt-4 text-sm font-medium">{label}</p>
  </div>
);

export default Spinner;