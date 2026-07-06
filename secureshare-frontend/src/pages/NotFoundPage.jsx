import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
export default function NotFoundPage() { return <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center"><h1 className="text-5xl font-bold text-slate-950">404</h1><p className="mt-3 text-slate-600">The page you are looking for does not exist.</p><Link to="/" className="mt-6"><Button>Go Home</Button></Link></main>; }
