import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, Award, Key, Save, ShieldAlert, History } from 'lucide-react';
import { updateProfile } from '../../app/slices/authSlice';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { MOCK_ACTIVITY_LOGS } from '../../services/mockApi';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  avatar: z.string().url('Please enter a valid image URL')
});

export function UserProfile() {
  const dispatch = useDispatch();
  const { user, rolesPermissions } = useSelector((state) => state.auth);

  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
    }
  });

  const onSubmit = (data) => {
    setSaving(true);
    setTimeout(() => {
      dispatch(updateProfile(data));
      setSaving(false);
      toast.success('Profile details updated!');
    }, 800);
  };

  const userPermissions = rolesPermissions[user?.role] || {};

  // Filter logs for current user
  const userLogs = MOCK_ACTIVITY_LOGS.filter(log => log.user.toLowerCase().includes(user?.name.split(' ')[0].toLowerCase()));

  const avatarsList = [
    { name: 'Default Female', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
    { name: 'Default Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    { name: 'Alternate Female', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    { name: 'Alternate Male', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' }
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">My Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your login credentials, avatar photos, and review security levels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md font-bold">
                <User className="h-4.5 w-4.5 text-primary" />
                <span>Account Profile</span>
              </CardTitle>
              <CardDescription>Personal details and profile photograph.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border/60 pb-4 mb-2">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-16 w-16 rounded-full border-2 border-primary/20 object-cover shadow-sm"
                  />
                  
                  <div className="flex-1 flex flex-col gap-1 text-left w-full">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Choose Avatar Preset</label>
                    <select
                      {...register('avatar')}
                      className="h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      {avatarsList.map(av => (
                        <option key={av.name} value={av.url}>{av.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  {...register('name')}
                  label="Display Full Name"
                  error={errors.name?.message}
                />
                
                <Input
                  {...register('email')}
                  label="Registered Email Address"
                  type="email"
                  error={errors.email?.message}
                />

                <div className="flex justify-end pt-4 border-t border-border mt-6">
                  <Button
                    type="submit"
                    loading={saving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Update Profile
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>

          {/* User Specific Audit History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md font-bold">
                <History className="h-4.5 w-4.5 text-primary" />
                <span>My Work Logs</span>
              </CardTitle>
              <CardDescription>Logs of recent activity actions recorded under your user session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pr-1 max-h-[220px] overflow-y-auto">
              {userLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No recent actions recorded for your account.</p>
              ) : (
                userLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-xs py-0.5 border-b border-border/40 pb-2">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">{log.action}</p>
                      <p className="text-muted-foreground">Module: {log.module}</p>
                    </div>
                    <span className="text-muted-foreground">{log.time}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security clearances details */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-md font-bold flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-primary" />
                <span>Clearance Level</span>
              </CardTitle>
              <CardDescription>Security clearance role and permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Security Clearance</p>
                <p className="text-lg font-black text-primary mt-0.5">{user?.role}</p>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Module Permissions</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.keys(userPermissions).map(mod => {
                    const isGranted = userPermissions[mod];
                    return (
                      <div key={mod} className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isGranted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={`capitalize ${isGranted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {mod === 'pos' ? 'POS Terminal' : mod}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Help Desk</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-primary flex-shrink-0" />
              <p>Permissions are managed globally by System Administrators. If your account lacks clearance to specific features, contact your store supervisor.</p>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}

export default UserProfile;
