import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import { isStrongPassword } from '../../utils/validators';
export default function RegisterPage() {
  const { register: registerUser } = useAuth(); const navigate = useNavigate(); const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm(); const password = watch('password');
  const onSubmit = async (values) => { setServerError(''); try { await registerUser(values); navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}`); } catch (error) { setServerError(error.message || 'Registration failed'); } };
  return <Card><h1 className="text-2xl font-bold text-slate-950">Create account</h1><p className="mt-1 text-sm text-slate-500">Register with email verification through Amazon Cognito.</p><form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4"><Input label="Full name" error={errors.fullName?.message} {...register('fullName', { required: 'Full name is required' })} /><Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} /><Input label="Password" type="password" error={errors.password?.message} {...register('password', { required: 'Password is required', validate: (value) => isStrongPassword(value) || 'Use 8+ chars with uppercase, lowercase, and number' })} /><Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword', { required: 'Confirm password is required', validate: (value) => value === password || 'Passwords do not match' })} />{serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}<Button type="submit" className="w-full" isLoading={isSubmitting}>Register</Button></form><p className="mt-5 text-center text-sm text-slate-600">Already have an account? <Link to={ROUTES.LOGIN} className="font-medium text-brand-700 hover:underline">Login</Link></p></Card>;
}
