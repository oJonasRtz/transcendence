'use client';

import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { logout } from '@/app/actions/auth';
import { useTransition } from 'react';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="group relative flex items-center gap-2 px-4 py-2 rounded-lg
                 bg-red-500/10 hover:bg-red-500/20
                 border border-red-500/30 hover:border-red-500/50
                 text-red-400 hover:text-red-300
                 transition-all duration-300
                 disabled:opacity-50 disabled:cursor-not-allowed
                 font-medium text-sm"
      title="Logout"
    >
      <ArrowLeftOnRectangleIcon className="h-5 w-5" />
      <span className="hidden sm:inline">
        {isPending ? 'Logging out...' : 'Logout'}
      </span>

      {/* Cyber glow effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-red-500/0 group-hover:bg-red-500/5
                      transition-all duration-300 -z-10 blur-xl" />
    </button>
  );
}
