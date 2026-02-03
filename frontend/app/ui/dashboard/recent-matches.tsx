// app/ui/dashboard/recent-matches.tsx
import Image from 'next/image';
import Link from 'next/link';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';
import { getMatchHistory } from './dashboard-stats';
import { getUser } from '@/app/lib/auth';
import MatchHistoryList from './history';

type MatchPlayer = {
  user_id: string;
  name: string;
  score: number;
  avatar: string;
  public_id: string;
};

type MatchHistoryItem = {
  match_id: number;
  created_at: string;
  game_type: string;
  duration: string;
  isVictory: boolean;
  players: MatchPlayer[];
};

export default async function RecentMatches() {
  const [historyData, user] = await Promise.all([getMatchHistory(), getUser()]);
  const matches: MatchHistoryItem[] = historyData?.history ?? [];

  return (
    <CardShell>
      <CardHeader title="Recent Matches" accentClassName="text-purple-400" />

      <MatchHistoryList
        userId={user?.user_id || ''}
        history={matches}
      />

    </CardShell>
  );
}
