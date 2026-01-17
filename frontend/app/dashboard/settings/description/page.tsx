import { Suspense } from 'react';
import SettingsForm from '@/app/ui/dashboard/settings-form';
import { changeDescription } from '@/app/actions/profile';
import { getUser } from '@/app/lib/auth';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import LoadingSkeleton from '@/app/ui/dashboard/loading-skeleton';

async function DescriptionFormContent() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  let currentDescription = '';
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');
    const headerList = headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host');
    const protocol =
      headerList.get('x-forwarded-proto') ||
      (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      (host ? `${protocol}://${host}` : null);
    if (jwt && baseUrl) {
      const response = await fetch(
        `${baseUrl}/api/profile?public_id=${encodeURIComponent(user.public_id)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Cookie: `jwt=${jwt.value}`,
          },
          credentials: 'include',
          cache: 'no-store',
        }
      );
      if (response.ok) {
        const data = await response.json();
        currentDescription = data?.description || '';
      }
    }
  } catch (error) {
    console.error('[description settings] Failed to fetch profile:', error);
  }

  return (
    <SettingsForm
      title="Change Description"
      description="Update your profile description. Tell other players about yourself!"
      action={changeDescription}
    >
      {/* Current Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Current Description
        </label>
        <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-400 whitespace-pre-wrap">
          {currentDescription || 'No description set'}
        </div>
      </div>

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
          defaultValue={currentDescription}
          className="w-full px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                     transition-all duration-300
                     resize-none"
        />
        <p className="mt-2 text-xs text-slate-500 font-mono">
          Maximum 500 characters. Leave empty to clear your description.
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
