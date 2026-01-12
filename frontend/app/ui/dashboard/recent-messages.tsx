// app/ui/dashboard/recent-messages.tsx
import Image from 'next/image';
import Link from 'next/link';

export default async function RecentMessages({ userId }: { userId: number }) {
  const conversations = [
    {
      id: 401,
      otherUser: {
        username: 'Orbit',
        avatar: '/images/avatar4.png',
        isOnline: true,
      },
      lastMessage: {
        content: 'Queueing for a match?',
        createdAt: new Date().toISOString(),
      },
    },
  ];
  const unreadCount = 1;

  const recentConversations = conversations.slice(0, 5);

  return (
    <div className="rounded-lg bg-slate-900/50 backdrop-blur-sm border border-white/10 shadow-2xl">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-white uppercase">
            <span className="text-purple-400">//</span> Messages
          </h2>
          {unreadCount > 0 && (
            <span className="rounded-lg bg-red-500/20 border border-red-500/50 px-3 py-1 text-xs font-black text-red-400 animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-96 divide-y divide-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {recentConversations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500 font-mono text-sm">// NO MESSAGES YET</p>
          </div>
        ) : (
          recentConversations.map((conv) =>
            conv.otherUser ? (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="block p-4 hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={conv.otherUser.avatar}
                      alt={conv.otherUser.username}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white/10 group-hover:border-purple-400/50 transition-colors"
                    />
                    {conv.otherUser.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400 animate-pulse"></span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{conv.otherUser.username}</p>
                    {conv.lastMessage && (
                      <>
                        <p className="truncate text-sm text-slate-400 font-mono">
                          {conv.lastMessage.content.substring(0, 50)}
                          {conv.lastMessage.content.length > 50 ? '...' : ''}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 font-mono">
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

      <div className="border-t border-white/10 p-4 bg-white/5">
        <Link
          href="/messages"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View all messages 
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
