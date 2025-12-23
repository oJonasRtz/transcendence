// app/ui/dashboard/recent-matches.tsx
import { getMatchHistory } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default async function RecentMatches({ userId }: { userId: number }) {
  const matches = await getMatchHistory(userId, 5);

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">Recent Matches</h2>
      </div>

      <div className="divide-y">
        {matches.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No matches played yet</p>
          </div>
        ) : (
          matches.map((match) => {
            const opponent =
              match.player1Id === userId ? match.player2 : match.player1;
            const isWin =
              (match.player1Id === userId && match.result === 'player1Win') ||
              (match.player2Id === userId && match.result === 'player2Win');
            const isDraw = match.result === 'draw';

            return (
              <div
                key={match.id}
                className="p-4 transition hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={opponent.avatar}
                      alt={opponent.username}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{opponent.username}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(match.playedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {match.score && (
                      <span className="font-mono text-sm text-gray-600">
                        {match.score}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        isWin
                          ? 'bg-green-100 text-green-800'
                          : isDraw
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isWin ? 'Win' : isDraw ? 'Draw' : 'Loss'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t p-4">
        <Link
          href="/matches"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View all matches →
        </Link>
      </div>
    </div>
  );
}