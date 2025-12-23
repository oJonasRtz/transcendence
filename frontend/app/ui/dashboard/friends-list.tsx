// app/ui/dashboard/friends-list.tsx
import { getFriends } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export default async function FriendsList({ userId }: { userId: number }) {
  const allFriends = await getFriends(userId);
  const onlineFriends = allFriends.filter((friend) => friend.isOnline);

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">Online Friends</h2>
        <p className="mt-1 text-sm text-gray-500">{onlineFriends.length} online</p>
      </div>

      <div className="max-h-96 divide-y overflow-y-auto">
        {onlineFriends.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No friends online</p>
          </div>
        ) : (
          onlineFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex cursor-pointer items-center space-x-3 p-4 hover:bg-gray-50"
            >
              <div className="relative">
                <Image
                  src={friend.avatar}
                  alt={friend.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
              </div>

              <div className="flex-1">
                <p className="font-semibold">{friend.username}</p>
                <p className="text-xs text-green-600">Online</p>
              </div>

              <button className="text-blue-600 hover:text-blue-800">
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4">
        <Link
          href="/friends"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View all friends →
        </Link>
      </div>
    </div>
  );
}