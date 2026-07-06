import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileText, Folder, HardDrive, Share2 } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatBytes } from '../../utils/formatBytes';
import { formatDateTime } from '../../utils/formatDate';
const defaultSummary = { storageUsedBytes: 0, storageLimitBytes: 10 * 1024 * 1024 * 1024, totalFiles: 0, totalFolders: 0, sharedFiles: 0 };
export default function DashboardPage() {
  const [summary, setSummary] = useState(defaultSummary); const [recentUploads, setRecentUploads] = useState([]); const [recentDownloads, setRecentDownloads] = useState([]); const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { async function loadDashboard() { try { const [s,u,d] = await Promise.all([dashboardApi.getSummary(), dashboardApi.getRecentUploads(), dashboardApi.getRecentDownloads()]); setSummary(s.summary || defaultSummary); setRecentUploads(u.items || []); setRecentDownloads(d.items || []); } catch (error) { toast.error(error.message || 'Unable to load dashboard'); } finally { setIsLoading(false); } } loadDashboard(); }, []);
  const cards = [{ label: 'Storage Used', value: `${formatBytes(summary.storageUsedBytes)} / ${formatBytes(summary.storageLimitBytes)}`, icon: HardDrive }, { label: 'Total Files', value: summary.totalFiles, icon: FileText }, { label: 'Total Folders', value: summary.totalFolders, icon: Folder }, { label: 'Shared Files', value: summary.sharedFiles, icon: Share2 }];
  if (isLoading) return <LoadingSpinner label="Loading dashboard..." />;
  return <div><PageHeader title="Dashboard" description="Storage, recent uploads, downloads, and security activity." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Card key={card.label}><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{card.label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p></div><card.icon className="h-9 w-9 text-brand-600" /></div></Card>)}</div><div className="mt-6 grid gap-6 xl:grid-cols-2"><Card><h2 className="mb-4 font-semibold text-slate-900">Recent Uploads</h2><div className="space-y-3">{recentUploads.length ? recentUploads.map((item) => <div key={item.itemId} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>{item.name}</span><span className="text-slate-500">{formatDateTime(item.createdAt)}</span></div>) : <p className="text-sm text-slate-500">No uploads yet.</p>}</div></Card><Card><h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Download className="h-4 w-4" /> Recent Downloads</h2><div className="space-y-3">{recentDownloads.length ? recentDownloads.map((item) => <div key={item.eventId} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>{item.fileName}</span><span className="text-slate-500">{formatDateTime(item.downloadedAt)}</span></div>) : <p className="text-sm text-slate-500">No downloads yet.</p>}</div></Card></div></div>;
}
