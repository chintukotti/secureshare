import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import { shareApi } from '../../api/shareApi';
import { formatDateTime } from '../../utils/formatDate';
export default function SharesPage() {
  const [shares, setShares] = useState([]); const [isLoading, setIsLoading] = useState(true);
  const loadShares = async () => { setIsLoading(true); try { const response = await shareApi.listShares(); setShares(response.shares || []); } catch (error) { toast.error(error.message || 'Unable to load shares'); } finally { setIsLoading(false); } };
  useEffect(() => { loadShares(); }, []);
  const revoke = async (share) => { if (!window.confirm('Revoke this share link?')) return; await shareApi.revokeShare(share.shareId); toast.success('Share link revoked'); loadShares(); };
  if (isLoading) return <LoadingSpinner label="Loading share links..." />;
  return <div><PageHeader title="Shared Links" description="Manage expiring, one-time, password-protected, public, and private links." />{!shares.length ? <EmptyState title="No shared links" description="Create a share link from My Files." /> : <div className="grid gap-4">{shares.map((share) => <Card key={share.shareId}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{share.fileName || share.fileId}</h3><Badge variant={share.status === 'ACTIVE' ? 'green' : 'red'}>{share.status}</Badge>{share.isOneTime && <Badge variant="blue">One-time</Badge>}{share.hasPassword && <Badge>Password</Badge>}</div><p className="mt-1 text-sm text-slate-500">Expires: {formatDateTime(share.expiresAt)} · Downloads: {share.downloadCount || 0}</p><p className="mt-1 break-all text-xs text-brand-700">{share.shareUrl}</p></div><Button variant="danger" onClick={() => revoke(share)}>Revoke</Button></div></Card>)}</div>}</div>;
}
