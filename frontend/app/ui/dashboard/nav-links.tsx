'use client';

import {
  Cog6ToothIcon as SettingsIcon,
  HomeIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Matches',
    href: '/dashboard/matches',
    icon: TrophyIcon,
  },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "group relative flex h-[48px] grow items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold transition-all duration-300 md:flex-none md:justify-start md:p-2 md:px-3 border",
              {
                'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-lg shadow-blue-500/20': isActive,
                'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-blue-500/30': !isActive,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block uppercase tracking-wider font-mono text-xs">{link.name}</p>
            
            {/* Hover glow effect */}
            {!isActive && (
              <div className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-blue-500/5 transition-all duration-300 -z-10 blur-xl" />
            )}
          </Link>
        );
      })}
    </>
  );
}
