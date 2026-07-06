import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { ROUTES } from '../../utils/constants';
export default function VerifyEmailPage() {
  const [params] = useSearchParams(); const navigate = useNavigate(); const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: params.get('email') || '', code: '' } });
  const onSubmit = async (values) => { setServerError(''); try { await authApi.confirmEmail(values); toast.success('Email verified. You can login now.'); navigate(ROUTES.LOGIN); } catch (error) { setServerError(error.message || 'Verification failed'); } };
  return <Card><h1 className="text-2xl font-bold text-slate-950">Verify email</h1><p className="mt-1 text-sm text-slate-500">Enter the verification code sent by Amazon Cognito.</p><form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4"><Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} /><Input label="Verification code" error={errors.code?.message} {...register('code', { required: 'Code is required' })} />{serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}<Button type="submit" className="w-full" isLoading={isSubmitting}>Verify</Button></form><p className="mt-5 text-center text-sm"><Link to={ROUTES.LOGIN} className="font-medium text-brand-700 hover:underline">Back to login</Link></p></Card>;
}
