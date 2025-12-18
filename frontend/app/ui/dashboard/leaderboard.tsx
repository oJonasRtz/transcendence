// app/ui/dashboard/leaderboard.tsx
import { getLeaderboard, getUserRankPosition } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default async function Leaderboard({ userId }: { userId: number }) {
  const [leaderboard, userRank] = await Promise.all([
    getLeaderboard(10),
    getUserRankPosition(userId),
  ]);

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">Leaderboard</h2>
        {userRank && (
          <p className="mt-1 text-sm text-gray-500">Your rank: #{userRank}</p>
        )}
      </div>

      <div className="divide-y">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.user.id === userId;
          const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];

          return (
            <div
              key={entry.id}
              className={`flex items-center space-x-4 p-4 ${
                isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-8 text-lg font-bold ${
                  index < 3 ? rankColors[index] : 'text-gray-600'
                }`}
              >
                #{index + 1}
              </span>

              <div className="relative">
                <Image
                  src={entry.user.avatar}
                  alt={entry.user.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                {entry.user.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold">{entry.user.username}</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-blue-600">{entry.ranking}</p>
                <p className="text-xs text-gray-500">ELO</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t p-4">
        <Link
          href="/leaderboard"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View full leaderboard →
        </Link>
      </div>
    </div>
  );
}