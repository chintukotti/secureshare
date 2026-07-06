import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { ROUTES } from '../../utils/constants';
import { isStrongPassword } from '../../utils/validators';
export default function ResetPasswordPage() {
  const [params] = useSearchParams(); const navigate = useNavigate(); const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: params.get('email') || '', code: '', newPassword: '' } });
  const onSubmit = async (values) => { setServerError(''); try { await authApi.resetPassword(values); toast.success('Password reset successful'); navigate(ROUTES.LOGIN); } catch (error) { setServerError(error.message || 'Password reset failed'); } };
  return <Card><h1 className="text-2xl font-bold text-slate-950">Reset password</h1><form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4"><Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} /><Input label="Reset code" error={errors.code?.message} {...register('code', { required: 'Reset code is required' })} /><Input label="New password" type="password" error={errors.newPassword?.message} {...register('newPassword', { required: 'New password is required', validate: (value) => isStrongPassword(value) || 'Use 8+ chars with uppercase, lowercase, and number' })} />{serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}<Button type="submit" className="w-full" isLoading={isSubmitting}>Reset password</Button></form><p className="mt-5 text-center text-sm"><Link to={ROUTES.LOGIN} className="font-medium text-brand-700 hover:underline">Back to login</Link></p></Card>;
}
