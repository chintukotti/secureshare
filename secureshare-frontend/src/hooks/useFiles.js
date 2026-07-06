import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fileApi } from '../api/fileApi';
export function useFiles({ folderId = 'root', search = '', sort = 'updatedAt_desc' } = {}) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try { const response = await fileApi.listItems({ folderId, search, sort }); setItems(response.items || []); }
    catch (error) { toast.error(error.message || 'Unable to load files'); }
    finally { setIsLoading(false); }
  }, [folderId, search, sort]);
  useEffect(() => { loadItems(); }, [loadItems]);
  return { items, isLoading, reload: loadItems, setItems };
}
