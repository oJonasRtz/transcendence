// app/ui/dashboard/recent-messages.tsx
import Image from 'next/image';
import Link from 'next/link';
import { DashboardMessage } from '@/app/lib/dashboard-data';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';

type RecentMessagesProps = {
  messages: DashboardMessage[];
  unreadCount: number;
};

export default async function RecentMessages({
  messages,
  unreadCount,
}: RecentMessagesProps) {
  const recentConversations = messages.slice(0, 5);

  return (
    <CardShell>
      <CardHeader
        title="Messages"
        accentClassName="text-purple-400"
        action={
          unreadCount > 0 ? (
            <span className="rounded-lg bg-red-500/20 border border-red-500/50 px-3 py-1 text-xs font-black text-red-400 animate-pulse">
              {unreadCount}
            </span>
          ) : null
        }
      />

      <div className="max-h-96 divide-y divide-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
        {recentConversations.length === 0 ? (
          <EmptyState
            title="No messages yet"
            message="Start a chat to see it here."
          />
        ) : (
          recentConversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/direct/${conv.publicId}`}
              className="block p-4 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.username}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-white/10 group-hover:border-purple-400/50 transition-colors"
                  />
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400 animate-pulse"></span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{conv.username}</p>
                  <p className="truncate text-sm text-slate-400 font-mono">
                    {conv.preview.substring(0, 50)}
                    {conv.preview.length > 50 ? '...' : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 font-mono">
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="border-t border-white/10 p-4 bg-white/5">
        <Link
          href="/dashboard/messages"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View all messages
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </CardShell>
  );
}
