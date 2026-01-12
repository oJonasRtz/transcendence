import { Suspense } from 'react';
import { getUser } from '@/app/lib/auth';
import { getUserByEmail } from '@/app/lib/data';
import { redirect } from 'next/navigation';
import LoadingSkeleton from '@/app/ui/dashboard/loading-skeleton';
import AvatarUploadForm from '@/app/ui/dashboard/avatar-upload-form';

async function AvatarFormContent() {
  const authUser = await getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Fetch full user data from Prisma
  const user = await getUserByEmail(authUser.email);

  if (!user) {
    redirect('/login');
  }

  return <AvatarUploadForm user={user} />;
}

export default function ChangeAvatarPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AvatarFormContent />
    </Suspense>
  );
}
