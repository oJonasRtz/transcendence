// app/ui/dashboard/friends-list.tsx
"use client";

import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { DashboardFriend } from '@/app/lib/dashboard-data';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';
import { useRouter } from 'next/navigation';

type FriendsListProps = {
  friends: DashboardFriend[];
};

export default async function FriendsList({ friends }: FriendsListProps) {
  const onlineFriends = friends.filter((friend) => friend.isOnline);
  const router = useRouter();

  return (
    <CardShell>
      <CardHeader
        title="Online Friends"
        accentClassName="text-green-400"
        subtitle={`${onlineFriends.length} active`}
      />

      <div className="max-h-96 divide-y divide-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
      {onlineFriends.map((friend) => (
      <div
        key={friend.id}
        className="flex items-center space-x-3 p-4 group"
      >
        <button
          onClick={() => router.push(`/profile/${friend.publicId}`)}
          aria-label={`View ${friend.username}'s profile`}
          className="flex flex-1 items-center space-x-3 cursor-pointer"
        >
          <div className="relative rounded-2xl p-[2px] border border-blue-600 shadow-2xl group-hover:border-purple-500 transition-colors">
            <img
              src={friend.avatar}
              alt={friend.username}
              width={40}
              height={40}
              className="rounded-full border-2 border-white/10 group-hover:border-green-400/50 transition-colors"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400 animate-pulse"></span>
          </div>

          <div className="flex-1">
            <p className="font-semibold text-white flex justify-start">{friend.username}</p>
            <p className="text-xs font-mono text-green-400 uppercase flex justify-start">Online</p>
          </div>
        </button>

        {friend.publicId && (
          <button
            onClick={() => router.push(`/direct/${friend.publicId}`)}
            className="text-blue-400 hover:text-blue-300 transition-colors hover:scale-110 duration-300"
            aria-label={`Message ${friend.username}`}
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    ))}

      </div>

      <div className="border-t border-white/10 p-4 bg-white/5">
        <button
          onClick={() => router.push("/dashboard/friends")}
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View all friends
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </CardShell>
  );
}
