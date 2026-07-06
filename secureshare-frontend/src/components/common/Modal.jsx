import Button from './Button';
export default function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{title}</h2><Button variant="ghost" onClick={onClose}>Close</Button></div>{children}</div></div>;
}
