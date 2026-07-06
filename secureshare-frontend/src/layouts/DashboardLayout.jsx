import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileBottomNav from '../components/layout/MobileBottomNav';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-72">
        <Topbar />
        <main className="p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
