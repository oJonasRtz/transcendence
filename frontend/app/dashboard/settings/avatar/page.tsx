import { Suspense } from 'react';
import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import LoadingSkeleton from '@/app/ui/dashboard/loading-skeleton';
import AvatarUploadForm from '@/app/ui/dashboard/avatar-upload-form';

async function AvatarFormContent() {
  const authUser = await getUser();

  if (!authUser) {
    redirect('/login');
  }

  const user = {
    id: 0,
    username: authUser.username ?? authUser.nickname ?? 'Player',
    email: authUser.email ?? '',
    avatar: null,
  };

  return <AvatarUploadForm user={user} />;
}

export default function ChangeAvatarPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AvatarFormContent />
    </Suspense>
  );
}
