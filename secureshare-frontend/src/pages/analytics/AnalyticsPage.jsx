import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import { analyticsApi } from '../../api/analyticsApi';
import { formatDateTime } from '../../utils/formatDate';
export default function AnalyticsPage() {
  const [items, setItems] = useState([]); const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { async function load() { try { const response = await analyticsApi.getMostDownloaded(); setItems(response.items || []); } catch (error) { toast.error(error.message || 'Unable to load analytics'); } finally { setIsLoading(false); } } load(); }, []);
  if (isLoading) return <LoadingSpinner label="Loading analytics..." />;
  return <div><PageHeader title="Analytics" description="Download count, view count, most downloaded files, and last download time." />{!items.length ? <EmptyState title="No analytics yet" description="Download events will appear after shared files are accessed." /> : <div className="grid gap-4">{items.map((item) => <Card key={item.fileId}><div className="flex items-center justify-between"><div><h3 className="font-semibold">{item.fileName}</h3><p className="text-sm text-slate-500">Last download: {formatDateTime(item.lastDownloadedAt)}</p></div><p className="text-2xl font-bold text-brand-700">{item.downloadCount || 0}</p></div></Card>)}</div>}</div>;
}
