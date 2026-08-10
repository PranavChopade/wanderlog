const Input = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:bg-slate-900 disabled:text-slate-500 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
          }`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;