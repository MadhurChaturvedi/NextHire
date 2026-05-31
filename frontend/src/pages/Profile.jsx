import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle2, Mail, Calendar, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-8">Profile Settings</h1>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/40 dark:border-slate-800/40 shadow-sm">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg mb-4">
              <UserCircle2 size={48} />
            </div>
            <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.email || ''}</p>
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/20">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Email Address</p>
                <p className="text-sm font-medium">{user?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/20">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Account Type</p>
                <p className="text-sm font-medium">Standard User</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/20">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Member Since</p>
                <p className="text-sm font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
