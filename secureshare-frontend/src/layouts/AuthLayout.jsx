import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { APP_NAME } from '../utils/constants';
export default function AuthLayout() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-slate-50 lg:grid-cols-2">
      <section className="hidden bg-gradient-to-br from-brand-700 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-2xl font-bold"><ShieldCheck className="h-9 w-9" />{APP_NAME}</div>
        <div><h1 className="max-w-xl text-5xl font-bold leading-tight">Secure cloud file sharing with control, tracking, and privacy.</h1><p className="mt-6 max-w-lg text-lg text-blue-100">One-time links, expiring URLs, password-protected downloads, analytics, and audit logs using AWS.</p></div>
        <p className="text-sm text-blue-100">Production-style AWS portfolio project</p>
      </section>
      <section className="flex items-center justify-center p-6"><div className="w-full max-w-md"><div className="mb-8 flex items-center justify-center gap-2 text-2xl font-bold text-brand-700 lg:hidden"><ShieldCheck className="h-8 w-8" />{APP_NAME}</div><Outlet /></div></section>
    </main>
  );
}
