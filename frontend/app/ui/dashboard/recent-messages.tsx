// app/ui/dashboard/recent-messages.tsx
import { getUserConversations, getUnreadMessageCount } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default async function RecentMessages({ userId }: { userId: number }) {
  const [conversations, unreadCount] = await Promise.all([
    getUserConversations(userId),
    getUnreadMessageCount(userId),
  ]);

  const recentConversations = conversations.slice(0, 5);

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Messages</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-96 divide-y overflow-y-auto">
        {recentConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No messages yet</p>
          </div>
        ) : (
          recentConversations.map((conv) =>
            conv.otherUser ? (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="block p-4 hover:bg-gray-50"
              >
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={conv.otherUser.avatar}
                      alt={conv.otherUser.username}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    {conv.otherUser.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{conv.otherUser.username}</p>
                    {conv.lastMessage && (
                      <>
                        <p className="truncate text-sm text-gray-500">
                          {conv.lastMessage.content.substring(0, 50)}
                          {conv.lastMessage.content.length > 50 ? '...' : ''}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(
                            conv.lastMessage.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ) : null
          )
        )}
      </div>

      <div className="border-t p-4">
        <Link
          href="/messages"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View all messages →
        </Link>
      </div>
    </div>
  );
}