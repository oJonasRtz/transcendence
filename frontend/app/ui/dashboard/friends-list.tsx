// app/ui/dashboard/friends-list.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export default async function FriendsList({ userId }: { userId: number }) {
  const allFriends = [
    {
      id: 301,
      username: 'Ion',
      avatar: '/images/avatar2.png',
      isOnline: true,
    },
    {
      id: 302,
      username: 'Drift',
      avatar: '/images/avatar3.png',
      isOnline: true,
    },
  ];
  const onlineFriends = allFriends.filter((friend) => friend.isOnline);

  return (
    <div className="rounded-lg bg-slate-900/50 backdrop-blur-sm border border-white/10 shadow-2xl">
      <div className="border-b border-white/10 p-6">
        <h2 className="text-xl font-black tracking-tight text-white uppercase">
          <span className="text-green-400">//</span> Online Friends
        </h2>
        <p className="mt-2 text-sm font-mono text-slate-400">
          <span className="text-green-400">{onlineFriends.length}</span> active
        </p>
      </div>

      <div className="max-h-96 divide-y divide-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {onlineFriends.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500 font-mono text-sm">// NO FRIENDS ONLINE</p>
          </div>
        ) : (
          onlineFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex cursor-pointer items-center space-x-3 p-4 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="relative">
                <Image
                  src={friend.avatar}
                  alt={friend.username}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white/10 group-hover:border-green-400/50 transition-colors"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400 animate-pulse"></span>
              </div>

              <div className="flex-1">
                <p className="font-semibold text-white">{friend.username}</p>
                <p className="text-xs font-mono text-green-400 uppercase">Online</p>
              </div>

              <button className="text-blue-400 hover:text-blue-300 transition-colors hover:scale-110 duration-300">
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/10 p-4 bg-white/5">
        <Link
          href="/friends"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View all friends 
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
