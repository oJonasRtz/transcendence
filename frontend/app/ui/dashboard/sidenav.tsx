import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/pong-logo';
import LogoutButton from '@/app/ui/dashboard/logout-button';
import EmailVerificationStatus from '@/app/ui/dashboard/email-verification-status';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-slate-950/50 backdrop-blur-md border-r border-white/10">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 p-4 md:h-40 hover:border-blue-500/30 transition-all duration-300 group"
        href="/"
      >
        <div className="w-32 text-white md:w-40 group-hover:scale-105 transition-transform">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-lg bg-gradient-to-br from-slate-900/50 to-black/50 border border-white/5 md:block backdrop-blur-sm"></div>
        <EmailVerificationStatus />
        <LogoutButton />
      </div>
    </div>
  );
}
