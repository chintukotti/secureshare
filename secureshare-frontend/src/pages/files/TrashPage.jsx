import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { File, Folder, RotateCcw, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import { fileApi } from '../../api/fileApi';
import { formatDateTime } from '../../utils/formatDate';

export default function TrashPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);

  const loadTrash = async () => {
    setIsLoading(true);
    try {
      const response = await fileApi.listTrash();
      setItems(response.items || []);
    } catch (error) {
      toast.error(error.message || 'Unable to load trash');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const restore = async (item) => {
    setBusyItemId(item.itemId);
    try {
      await fileApi.restoreFromTrash(item.itemId);
      toast.success('Item restored');
      loadTrash();
    } catch (error) {
      toast.error(error.message || 'Unable to restore item');
    } finally {
      setBusyItemId(null);
    }
  };

  const deletePermanently = async (item) => {
    const confirmed = window.confirm(`Permanently delete "${item.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusyItemId(item.itemId);
    try {
      await fileApi.permanentlyDelete(item.itemId);
      toast.success('Item permanently deleted');
      loadTrash();
    } catch (error) {
      toast.error(error.message || 'Unable to permanently delete item');
    } finally {
      setBusyItemId(null);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading trash..." />;

  return (
    <div>
      <PageHeader title="Trash" description="Restore files or delete them permanently." />

      {!items.length ? (
        <EmptyState title="Trash is empty" description="Deleted files and folders will appear here." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isFolder = item.itemType === 'FOLDER';
            const isBusy = busyItemId === item.itemId;

            return (
              <div key={item.itemId} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {isFolder ? <Folder className="h-5 w-5 shrink-0 text-amber-500" /> : <File className="h-5 w-5 shrink-0 text-brand-600" />}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {item.itemType} · Deleted {formatDateTime(item.trashedAt || item.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button variant="secondary" onClick={() => restore(item)} disabled={isBusy} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Restore
                  </Button>
                  <Button variant="danger" onClick={() => deletePermanently(item)} disabled={isBusy} className="gap-2">
                    <Trash2 className="h-4 w-4" /> Delete Permanently
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
