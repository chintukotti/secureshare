import { FolderOpen } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', description = 'Create or upload something to get started.' }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><FolderOpen className="h-12 w-12 text-slate-400" /><h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3><p className="mt-1 max-w-md text-sm text-slate-500">{description}</p></div>;
}
