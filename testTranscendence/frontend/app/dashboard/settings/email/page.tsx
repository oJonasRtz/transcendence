import { Suspense } from 'react';
import SettingsForm from '@/app/ui/dashboard/settings-form';
import { changeEmail } from '@/app/actions/profile';
import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import LoadingSkeleton from '@/app/ui/dashboard/loading-skeleton';

async function EmailFormContent() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <SettingsForm
      title="Change Email"
      description="Update your account email address. This will be used for login and notifications."
      action={changeEmail}
    >
      {/* Current Email */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Current Email
        </label>
        <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-400">
          {user.email}
        </div>
      </div>

      {/* New Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
          <span className="text-blue-400">01</span> // New Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Enter new email"
          className="w-full px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                     transition-all duration-300"
        />
        <p className="mt-2 text-xs text-slate-500 font-mono">
          Must be a valid email address.
        </p>
      </div>
    </SettingsForm>
  );
}

export default function ChangeEmailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EmailFormContent />
    </Suspense>
  );
}
