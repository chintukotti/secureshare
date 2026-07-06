import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ folders = [], onNavigateRoot, onNavigateFolder }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <button
        type="button"
        onClick={onNavigateRoot}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-slate-100 hover:text-brand-700"
      >
        <Home className="h-4 w-4" />
        Root
      </button>

      {folders.map((folder, index) => (
        <span key={folder.id} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          <button
            type="button"
            onClick={() => onNavigateFolder(folder, index)}
            className="rounded-lg px-2 py-1 hover:bg-slate-100 hover:text-brand-700"
          >
            {folder.name}
          </button>
        </span>
      ))}
    </div>
  );
}
