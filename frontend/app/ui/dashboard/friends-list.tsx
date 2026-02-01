// app/ui/dashboard/friends-list.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { DashboardFriend } from '@/app/lib/dashboard-data';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';

type FriendsListProps = {
  friends: DashboardFriend[];
};

export default async function FriendsList({ friends }: FriendsListProps) {
  const onlineFriends = friends.filter((friend) => friend.isOnline);

  return (
    <CardShell>
      <CardHeader
        title="Online Friends"
        accentClassName="text-green-400"
        subtitle={`${onlineFriends.length} active`}
      />

      <div className="max-h-96 divide-y divide-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
        {onlineFriends.length === 0 ? (
          <EmptyState
            title="No friends online"
            message="Invite friends or check back later."
          />
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

              {friend.publicId ? (
                <Link
                  href={`/direct/${friend.publicId}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors hover:scale-110 duration-300"
                  aria-label={`Message ${friend.username}`}
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                </Link>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/10 p-4 bg-white/5">
        <Link
          href="/dashboard/friends"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View all friends
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </CardShell>
  );
}
