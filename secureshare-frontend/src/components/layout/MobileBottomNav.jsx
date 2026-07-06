import { NavLink } from 'react-router-dom';
import { BarChart3, FileText, LayoutDashboard, Link2, User } from 'lucide-react';

const mobileItems = [
  { label: 'Home', to: '/', icon: LayoutDashboard },
  { label: 'Files', to: '/files', icon: FileText },
  { label: 'Shares', to: '/shares', icon: Link2 },
  { label: 'Stats', to: '/analytics', icon: BarChart3 },
  { label: 'Profile', to: '/profile', icon: User },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs font-medium ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500'
              }`
            }
          >
            <item.icon className="mb-1 h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
