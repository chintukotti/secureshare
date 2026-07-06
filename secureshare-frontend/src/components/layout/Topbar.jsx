import { LogOut } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
export default function Topbar() {
  const { user, logout } = useAuth();
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div><p className="text-sm text-slate-500">Welcome back</p><p className="font-semibold text-slate-900">{user?.fullName || user?.email || 'SecureShare User'}</p></div><Button variant="secondary" onClick={logout} className="gap-2"><LogOut className="h-4 w-4" /> Logout</Button></div></header>;
}
