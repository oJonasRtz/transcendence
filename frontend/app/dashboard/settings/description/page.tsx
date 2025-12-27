import { Suspense } from 'react';
import SettingsForm from '@/app/ui/dashboard/settings-form';
import { changeDescription } from '@/app/actions/profile';
import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import LoadingSkeleton from '@/app/ui/dashboard/loading-skeleton';

async function DescriptionFormContent() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Note: user object from JWT doesn't contain description
  // For now, we'll just show the form without pre-populating
  // To show current description, we'd need to fetch from backend or Prisma

  return (
    <SettingsForm
      title="Change Description"
      description="Update your profile description. Tell other players about yourself!"
      action={changeDescription}
    >
      {/* Description Textarea */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
          <span className="text-blue-400">01</span> // Profile Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          maxLength={500}
          placeholder="Tell us about yourself..."
          className="w-full px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                     transition-all duration-300
                     resize-none"
        />
        <p className="mt-2 text-xs text-slate-500 font-mono">
          Maximum 500 characters.
        </p>
      </div>
    </SettingsForm>
  );
}

export default function ChangeDescriptionPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DescriptionFormContent />
    </Suspense>
  );
}
