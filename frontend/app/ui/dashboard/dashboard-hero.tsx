"use client";

import Link from 'next/link';
import { DashboardProfile } from '@/app/lib/dashboard-data';
import { CardShell } from '@/app/ui/dashboard/card-primitives';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type DashboardHeroProps = {
  profile: DashboardProfile;
  primaryActionHref?: string;
  secondaryActionHref?: string;
};

export default function DashboardHero({
  profile,
  primaryActionHref = '/dashboard/play',
  secondaryActionHref = '/dashboard/matches',
}: DashboardHeroProps) {
  const displayName = profile.username;
  const avatarSrc = profile.avatar || '/images/default_avatar.png';
  const hasNickname = profile.nickname;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <CardShell className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10" />
      <div className="relative p-4 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
        <div className="relative group">
        {/* Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-40 blur-lg group-hover:opacity-70 transition-opacity" />

        {/* frame */}
        <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-500 shadow-2xl">
          <div className="relative p-2 rounded-full bg-slate-900/80">
            <button onClick={() => router.push(`/profile/${profile.publicId}`)}>
              <img
                src={avatarSrc}
                alt={`${displayName} avatar`}
                width={96}
                height={96}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
              />
            </button>

            {profile.title && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-semibold text-blue-300 bg-slate-900 border border-blue-500/30 rounded-full shadow-lg backdrop-blur">
                {profile.title}
              </div>
            )}
          </div>
        </div>

      </div>


          <div className="flex flex-col gap-1">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              <span className="text-blue-400">//</span> Welcome back
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl lg:text-4xl font-black text-white drop-shadow">
                {displayName}
              </h1>
            </div>

            {hasNickname && (
              <span className="text-sm italic text-slate-400 mt-1">
                <span className="uppercase text-xs text-slate-500 mr-1">AKA</span>
                “{profile.nickname}”
              </span>
            )}

          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:ml-auto">
          <button
            onClick={() => router.push(primaryActionHref)}
            className="group relative inline-flex items-center justify-center gap-3 rounded-lg px-6 py-3
                       bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm uppercase tracking-wider
                       transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              &gt;
            </span>
            Play Now
            <span className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </CardShell>
  );
}
