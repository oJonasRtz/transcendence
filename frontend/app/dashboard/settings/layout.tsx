'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  EnvelopeIcon,
  KeyIcon,
  IdentificationIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const settingsTabs = [
  { name: 'Avatar', href: '/dashboard/settings/avatar', icon: PhotoIcon },
  { name: 'Username', href: '/dashboard/settings/username', icon: IdentificationIcon },
  { name: 'Email', href: '/dashboard/settings/email', icon: EnvelopeIcon },
  { name: 'Password', href: '/dashboard/settings/password', icon: KeyIcon },
  { name: 'Nickname', href: '/dashboard/settings/nickname', icon: IdentificationIcon },
  { name: 'Description', href: '/dashboard/settings/description', icon: DocumentTextIcon },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          ACCOUNT SETTINGS
        </h1>
        <p className="text-sm font-mono uppercase tracking-wider text-slate-400">
          // Manage Your Profile Configuration
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 border-b border-white/10">
        <nav className="flex gap-2 overflow-x-auto pb-4" aria-label="Settings tabs">
          {settingsTabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  group relative flex items-center gap-2 px-4 py-2 rounded-lg
                  border transition-all duration-300 whitespace-nowrap
                  ${isActive
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{tab.name}</span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-500" />
                )}

                {/* Hover glow */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/5
                                transition-all duration-300 -z-10 blur-xl" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-2xl">
        {children}
      </div>
    </div>
  );
}
