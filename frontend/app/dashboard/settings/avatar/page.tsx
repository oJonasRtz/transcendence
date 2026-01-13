import { Suspense } from 'react';
import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import LoadingSkeleton from '@/app/ui/dashboard/loading-skeleton';
import AvatarUploadForm from '@/app/ui/dashboard/avatar-upload-form';
import { cookies } from 'next/headers';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

async function AvatarFormContent() {
  const authUser = await getUser();

  if (!authUser) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt');
  let avatar: string | null = null;

  if (jwt && authUser.public_id) {
    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/profile?public_id=${encodeURIComponent(authUser.public_id)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Cookie: `jwt=${jwt.value}`,
          },
          cache: 'no-store',
        }
      );

      if (response.ok) {
        const data = await response.json();
        avatar = data?.avatar ?? null;
      }
    } catch {
      avatar = null;
    }
  }

  const user = {
    id: 0,
    username: authUser.username ?? authUser.nickname ?? 'Player',
    email: authUser.email ?? '',
    avatar,
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
