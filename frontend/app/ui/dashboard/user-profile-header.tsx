import { poppins as futuraPtBold } from '@/app/ui/fonts';
import { cookies } from 'next/headers';
import { User } from '@/app/lib/auth';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

export default async function UserProfileHeader({ user }: { user: User }) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt');
  let avatar: string | null = null;
  let isOnline = true;

  if (jwt && user.public_id) {
    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/profile?public_id=${encodeURIComponent(user.public_id)}`,
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
        isOnline = Boolean(data?.isOnline ?? true);
      }
    } catch {
      avatar = null;
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="relative rounded-xl bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-slate-900/90 backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 animate-pulse"></div>
        
        <div className="relative p-8 flex flex-col lg:flex-row items-center gap-6">
          {/* Avatar with glow effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
            <img
              src={avatar || '/images/default_avatar.png'}
              alt="User Avatar"
              className="relative h-40 w-40 rounded-full border-4 border-white/20 shadow-2xl"
            />
            {isOnline && (
              <span className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-slate-900 bg-green-400 animate-pulse shadow-lg"></span>
            )}
          </div>

          {/* User info */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className={`${futuraPtBold.className} text-4xl font-black text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-2`}>
              <span className="text-blue-400">//</span> Welcome back,
            </h2>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">
              {user?.username || 'Player'}
            </p>
            <p className="mt-4 text-sm font-mono uppercase tracking-widest text-slate-400">
              <span className="text-green-400">●</span> SYSTEM ONLINE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
