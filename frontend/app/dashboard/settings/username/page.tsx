import { Suspense } from 'react';
import SettingsForm from '@/app/ui/dashboard/settings-form';
import { changeUsername } from '@/app/actions/profile';
import { getUser } from '@/app/lib/auth';
import { redirect} from 'next/navigation';
import LoadingSkeleton from '@/app/ui/dashboard/loading-skeleton';

async function UsernameFormContent() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <SettingsForm
      title="Change Username"
      description="Update your account username (login name). This is different from your in-game nickname."
      action={changeUsername}
    >
      {/* Current Username */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Current Username
        </label>
        <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-400">
          {user.username}
        </div>
      </div>

      {/* New Username Input */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
          <span className="text-blue-400">01</span> // New Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9._-]+"
          placeholder="Enter new username"
          className="w-full px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                     transition-all duration-300"
        />
        <p className="mt-2 text-xs text-slate-500 font-mono">
          3-20 characters. Letters, numbers, dots, dashes, underscores only.
        </p>
      </div>
    </SettingsForm>
  );
}

export default function ChangeUsernamePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <UsernameFormContent />
    </Suspense>
  );
}
