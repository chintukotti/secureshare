import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download, ShieldCheck } from 'lucide-react';
import { shareApi } from '../../api/shareApi';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
export default function PublicSharePage() {
  const { shareToken } = useParams(); const [share, setShare] = useState(null); const [password, setPassword] = useState(''); const [isLoading, setIsLoading] = useState(true); const [isVerified, setIsVerified] = useState(false);
  useEffect(() => { async function load() { try { const response = await shareApi.getPublicShare(shareToken); setShare(response.share); setIsVerified(!response.share?.requiresPassword); } catch (error) { toast.error(error.message || 'Unable to open share link'); } finally { setIsLoading(false); } } load(); }, [shareToken]);
  const verify = async () => { try { await shareApi.verifyPassword(shareToken, { password }); setIsVerified(true); toast.success('Password verified'); } catch (error) { toast.error(error.message || 'Invalid password'); } };
  const download = async () => { try { const response = await shareApi.getPublicDownloadUrl(shareToken, share?.requiresPassword ? { password } : {}); window.location.href = response.downloadUrl; } catch (error) { toast.error(error.message || 'Download failed'); } };
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner label="Opening secure link..." /></div>;
  if (!share) return <div className="flex min-h-screen items-center justify-center p-4"><Card className="max-w-md text-center"><h1 className="text-xl font-bold">Link unavailable</h1><p className="mt-2 text-sm text-slate-500">This link may be expired, revoked, or invalid.</p></Card></div>;
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4"><Card className="w-full max-w-md text-center"><ShieldCheck className="mx-auto h-12 w-12 text-brand-600" /><h1 className="mt-4 text-2xl font-bold text-slate-950">SecureShare Download</h1><p className="mt-2 text-slate-600">{share.fileName}</p>{share.requiresPassword && !isVerified && <div className="mt-6 space-y-3 text-left"><Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /><Button className="w-full" onClick={verify}>Verify Password</Button></div>}{isVerified && <Button className="mt-6 w-full gap-2" onClick={download}><Download className="h-4 w-4" /> Download File</Button>}<p className="mt-4 text-xs text-slate-400">This secure link may expire or work only once depending on owner settings.</p></Card></main>;
}
