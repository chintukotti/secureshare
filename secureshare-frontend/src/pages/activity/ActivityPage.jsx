import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import { activityApi } from '../../api/activityApi';
import { formatDateTime } from '../../utils/formatDate';
export default function ActivityPage() {
  const [logs, setLogs] = useState([]); const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { async function load() { try { const response = await activityApi.listActivity(); setLogs(response.logs || []); } catch (error) { toast.error(error.message || 'Unable to load activity logs'); } finally { setIsLoading(false); } } load(); }, []);
  if (isLoading) return <LoadingSpinner label="Loading activity logs..." />;
  return <div><PageHeader title="Activity Logs" description="Login, upload, download, delete, share, and security events." />{!logs.length ? <EmptyState title="No activity logs" description="Actions will be recorded here after backend logging is implemented." /> : <div className="space-y-3">{logs.map((log) => <Card key={log.logId}><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Badge variant="blue">{log.action}</Badge><span className="text-sm text-slate-700">{log.details || log.itemId || '-'}</span></div><span className="text-sm text-slate-500">{formatDateTime(log.createdAt)}</span></div></Card>)}</div>}</div>;
}
