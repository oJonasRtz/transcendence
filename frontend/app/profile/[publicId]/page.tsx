import Link from 'next/link';
import ProfileHeader from '@/app/ui/profile/profile-header';
import ProfileStats from '@/app/ui/profile/profile-stats';
import ProfileActions from '@/app/ui/profile/profile-actions';
import ProfileSkeleton from '@/app/ui/profile/profile-skeleton';
import { CardHeader, CardShell, ErrorState } from '@/app/ui/dashboard/card-primitives';
import { getMatchHistory } from '@/app/ui/dashboard/dashboard-stats';
import { cookies } from 'next/headers';

/* =======================
   TYPES
======================= */

interface BackendUser {
  id: number;
  user_id: string;
  public_id: string;
  username: string;
  nickname?: string | null;
  email?: string;
  avatar: string;
  isOnline: number | boolean;
  state: {
    colour: string;
    text: string;
  };
  rank: {
    rank: number;
    tier: string;
    rank_points: number;
  };
  tier: string;
  rank_points: number;
  level: number;
  title: string;
  description: string | null;
  friends: number;
  wins: number;
  losses: number;
  experience_points: number;
  experience_to_next_level: number;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  public_id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  title: string;
  experience_points: number;
  wins: number;
  losses: number;
  description: string;
  state: {
    colour: string;
    text: string;
  };
  rank: {
    rank: string;
    pts: number;
  };
}

/* =======================
   FETCH PROFILE
======================= */

export async function getUserProfile(publicId: string): Promise<BackendUser | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');

    const res = await fetch(
      `http://localhost:3000/api/profile?public_id=${publicId}`,
      {
        headers: { Cookie: cookieHeader },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.error('[getUserProfile] API returned', res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('[getUserProfile] Error fetching user profile:', err);
    return null;
  }
}

/* =======================
   MAPPER
======================= */

function mapBackendToProfileData(user: BackendUser): ProfileData {
  const online = Boolean(user.isOnline);

  return {
    public_id: user.public_id,
    username: user.username,
    avatar: user.avatar,
    isOnline: online,
    title: user.title,
    experience_points: user.experience_points,
    wins: user.wins,
    losses: user.losses,
    description: user.description ?? '',
    state: {
      colour: online ? 'green' : 'gray',
      text: online ? 'Online' : 'Offline',
    },
    rank: {
      rank: user.tier,
      pts: user.rank_points,
    },
  };
}

/* =======================
   PAGE
======================= */

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  if (!publicId) {
    return (
      <main className="flex min-h-full justify-center items-center p-4 md:p-6 lg:p-8">
        <CardShell className="max-w-2xl">
          <CardHeader title="Profile" accentClassName="text-blue-400" />
          <ErrorState
            message="Profile id is missing"
            action={
              <Link
                href="/dashboard"
                className="text-blue-400 hover:text-blue-300 font-mono uppercase text-xs"
              >
                Back to Dashboard
              </Link>
            }
          />
        </CardShell>
      </main>
    );
  }

  let backendUser: BackendUser | null = null;
  let profile: ProfileData | null = null;
  let historyData: any = null;

  try {
    backendUser = await getUserProfile(publicId);

    if (!backendUser) {
      console.error('[ProfilePage] getUserProfile returned null:', publicId);
      throw new Error('User not found');
    }

    profile = mapBackendToProfileData(backendUser);
    console.log('backend user:', backendUser);

    historyData = await getMatchHistory(backendUser.user_id);
    console.log('history data:', historyData);
  } catch (err) {
    console.error('[ProfilePage] Failed to load profile:', err);

    return (
      <main className="flex min-h-screen justify-center items-center p-4 md:p-6 lg:p-8">
        <CardShell className="max-w-2xl">
          <CardHeader title="Profile" accentClassName="text-blue-400" />
          <ErrorState
            message="Failed to load profile"
            action={
              <Link
                href="/dashboard"
                className="text-blue-400 hover:text-blue-300 font-mono uppercase text-xs"
              >
                Back to Dashboard
              </Link>
            }
          />
        </CardShell>
      </main>
    );
  }

  if (!profile || !backendUser) {
    return <ProfileSkeleton />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <CardShell className="max-w-2xl">
        <CardHeader
          title="Profile"
          accentClassName="text-blue-400"
          subtitle="Public profile"
        />
        <div className="p-6">
          <ProfileHeader profile={profile} />
          <ProfileActions publicId={profile.public_id} />
          <ProfileStats user={backendUser} history={historyData?.history ?? []} stats={historyData?.stats ?? {}} />
        </div>
      </CardShell>
    </main>
  );
}
