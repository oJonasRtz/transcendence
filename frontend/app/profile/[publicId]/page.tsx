'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProfileHeader from '@/app/ui/profile/profile-header';
import ProfileStats from '@/app/ui/profile/profile-stats';
import ProfileActions from '@/app/ui/profile/profile-actions';
import ProfileSkeleton from '@/app/ui/profile/profile-skeleton';
import { CardHeader, CardShell, ErrorState } from '@/app/ui/dashboard/card-primitives';

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

export default function ProfilePage() {
  const params = useParams<{ publicId?: string | string[] }>();
  const rawPublicId = params?.publicId;
  const publicId = Array.isArray(rawPublicId) ? rawPublicId[0] : rawPublicId;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!publicId) {
          throw new Error('Profile id is missing');
        }
        const res = await fetch(`/api/profile?public_id=${publicId}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          let message = 'Failed to fetch profile';
          try {
            const data = await res.json();
            if (data?.error) {
              message = data.error;
            }
          } catch {
            // Ignore non-JSON error responses.
          }
          throw new Error(message);
        }
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [publicId]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <main className="p-4 md:p-6 lg:p-8">
        <CardShell className="max-w-2xl">
          <CardHeader title="Profile" accentClassName="text-blue-400" />
          <ErrorState
            message={error || 'Profile not found'}
            action={
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 font-mono uppercase text-xs">
                Back to Dashboard
              </Link>
            }
          />
        </CardShell>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <CardShell className="max-w-2xl">
        <CardHeader
          title="Profile"
          accentClassName="text-blue-400"
          subtitle="Public profile"
        />
        <div className="p-6">
          <ProfileHeader profile={profile} />
          <ProfileActions publicId={profile.public_id} />
          <ProfileStats profile={profile} />
        </div>
      </CardShell>
    </main>
  );
}
