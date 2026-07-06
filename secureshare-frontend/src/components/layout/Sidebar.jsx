import { NavLink } from 'react-router-dom';
import { Activity, BarChart3, FileText, Heart, LayoutDashboard, Link2, ShieldCheck, Trash2, User } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';
const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard }, { label: 'My Files', to: '/files', icon: FileText }, { label: 'Favorites', to: '/favorites', icon: Heart }, { label: 'Shared Links', to: '/shares', icon: Link2 }, { label: 'Analytics', to: '/analytics', icon: BarChart3 }, { label: 'Activity Logs', to: '/activity', icon: Activity }, { label: 'Trash', to: '/trash', icon: Trash2 }, { label: 'Profile', to: '/profile', icon: User },
];
export default function Sidebar() {
  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block"><div className="mb-8 flex items-center gap-3 text-xl font-bold text-brand-700"><ShieldCheck className="h-8 w-8" />{APP_NAME}</div><nav className="space-y-1">{navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><item.icon className="h-5 w-5" />{item.label}</NavLink>)}</nav></aside>;
}
