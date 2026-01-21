import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';

export default function FriendsPage() {
  return (
    <div className="space-y-6">
      <CardShell>
        <CardHeader title="Friends" accentClassName="text-green-400" />
        <EmptyState
          title="Friends page coming soon"
          message="This page will list all friends and pending invites."
        />
      </CardShell>
    </div>
  );
}
