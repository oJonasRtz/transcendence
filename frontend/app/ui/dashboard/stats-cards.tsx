// app/ui/dashboard/stats-cards.tsx
import { getDashboardStats } from '@/app/lib/data';
import {
  TrophyIcon,
  StarIcon,
  CheckCircleIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

export default async function StatsCards({ userId }: { userId: number }) {
  const stats = await getDashboardStats(userId);

  return (
    <>
      <Card
        title="Ranking"
        value={stats.ranking.toString()}
        icon={TrophyIcon}
        color="blue"
      />
      <Card
        title="Level"
        value={stats.level.toString()}
        icon={StarIcon}
        color="purple"
      />
      <Card
        title="Wins"
        value={stats.wins.toString()}
        icon={CheckCircleIcon}
        color="green"
      />
      <Card
        title="Win Streak"
        value={stats.winStreak.toString()}
        icon={FireIcon}
        color="orange"
      />
    </>
  );
}

function Card({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}