import Link from 'next/link';
import { DashboardProfile } from '@/app/lib/dashboard-data';
import { CardShell } from '@/app/ui/dashboard/card-primitives';

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
  const displayName = profile.nickname || profile.username;
  const avatarSrc = profile.avatar || '/images/default_avatar.png';
  const showHandle =
    profile.nickname && profile.nickname !== profile.username
      ? profile.username
      : null;

  return (
    <CardShell className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10" />
      <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-lg opacity-50" />
            <img
              src={avatarSrc}
              alt={`${displayName} avatar`}
              width={96}
              height={96}
              className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-white/20 shadow-xl object-cover"
            />
            <span
              className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${
                profile.isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
              }`}
              aria-label={profile.isOnline ? 'Online' : 'Offline'}
              title={profile.isOnline ? 'Online' : 'Offline'}
            />
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              <span className="text-blue-400">//</span> Welcome back
            </p>
            <h1 className="text-3xl lg:text-4xl font-black text-white drop-shadow">
              {displayName}
            </h1>
            {showHandle ? (
              <p className="mt-1 text-sm font-mono text-slate-400">
                @{showHandle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:ml-auto">
          <Link
            href={primaryActionHref}
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
          </Link>

          {/* <Link
            href={secondaryActionHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3
                       border border-white/15 text-slate-200 font-semibold text-sm uppercase tracking-wider
                       bg-white/5 hover:bg-white/10 transition-all duration-300
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            View Matches
          </Link> */}
        </div>
      </div>
    </CardShell>
  );
}
