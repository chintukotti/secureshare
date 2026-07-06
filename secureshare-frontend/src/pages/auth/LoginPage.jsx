import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
export default function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const onSubmit = async (values) => { setServerError(''); try { await login(values); navigate(location.state?.from?.pathname || ROUTES.DASHBOARD, { replace: true }); } catch (error) { setServerError(error.message || 'Login failed'); } };
  return <Card><h1 className="text-2xl font-bold text-slate-950">Login</h1><p className="mt-1 text-sm text-slate-500">Access your SecureShare workspace.</p><form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4"><Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email', { required: 'Email is required' })} /><Input label="Password" type="password" placeholder="********" error={errors.password?.message} {...register('password', { required: 'Password is required' })} />{serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}<Button type="submit" className="w-full" isLoading={isSubmitting}>Login</Button></form><div className="mt-5 flex items-center justify-between text-sm"><Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-brand-700 hover:underline">Forgot password?</Link><Link to={ROUTES.REGISTER} className="font-medium text-brand-700 hover:underline">Create account</Link></div></Card>;
}
