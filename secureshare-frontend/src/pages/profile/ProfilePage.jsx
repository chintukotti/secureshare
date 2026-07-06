import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import { authApi } from '../../api/authApi';
import { profileApi } from '../../api/profileApi';
import { useAuth } from '../../hooks/useAuth';
export default function ProfilePage() {
  const { user, setUser } = useAuth(); const [fullName, setFullName] = useState(user?.fullName || ''); const [oldPassword, setOldPassword] = useState(''); const [newPassword, setNewPassword] = useState('');
  const updateProfile = async () => { try { const response = await profileApi.updateProfile({ fullName }); setUser(response.user); toast.success('Profile updated'); } catch (error) { toast.error(error.message || 'Unable to update profile'); } };
  const changePassword = async () => { try { await authApi.changePassword({ oldPassword, newPassword }); setOldPassword(''); setNewPassword(''); toast.success('Password changed'); } catch (error) { toast.error(error.message || 'Unable to change password'); } };
  return <div><PageHeader title="Profile" description="Update profile details and change your Cognito password." /><div className="grid gap-6 xl:grid-cols-2"><Card><h2 className="font-semibold text-slate-900">Profile Details</h2><div className="mt-4 space-y-4"><Input label="Email" value={user?.email || ''} disabled /><Input label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} /><Button onClick={updateProfile}>Update Profile</Button></div></Card><Card><h2 className="font-semibold text-slate-900">Change Password</h2><div className="mt-4 space-y-4"><Input label="Current password" type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} /><Input label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><Button onClick={changePassword}>Change Password</Button></div></Card></div></div>;
}
