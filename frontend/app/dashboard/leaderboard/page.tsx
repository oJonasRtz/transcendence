import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <CardShell>
        <CardHeader title="Leaderboard" accentClassName="text-blue-400" />
        <EmptyState
          title="Leaderboard coming soon"
          message="This page will show the full global rankings."
        />
      </CardShell>
    </div>
  );
}
