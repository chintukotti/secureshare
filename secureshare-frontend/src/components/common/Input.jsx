export default function Input({ label, error, className = '', ...props }) {
  return <label className="block">{label && <span className="form-label">{label}</span>}<input className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${error ? 'border-red-500' : ''} ${className}`} {...props} />{error && <span className="form-error">{error}</span>}</label>;
}
