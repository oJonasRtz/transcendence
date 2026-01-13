'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import ProfileHeader from '@/app/ui/profile/profile-header';
import ProfileStats from '@/app/ui/profile/profile-stats';
import ProfileActions from '@/app/ui/profile/profile-actions';
import ProfileSkeleton from '@/app/ui/profile/profile-skeleton';

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

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  const { publicId } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'Profile not found'}</p>
          <Link href="/home" className="text-blue-400 hover:underline">
            Go back home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-6">
        {/* Navigation */}
        <nav className="flex gap-4 mb-6">
          <Link href="/home" className="text-blue-400 hover:underline">
            Home
          </Link>
          <Link href="/seeAllUsers" className="text-blue-400 hover:underline">
            See All Users
          </Link>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-6">Public Profile</h1>

        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {/* Action Buttons */}
        <ProfileActions publicId={profile.public_id} />

        {/* Stats */}
        <ProfileStats profile={profile} />
      </div>
    </main>
  );
}
