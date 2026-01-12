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
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
  };

  const iconClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  };

  return (
    <div className={`rounded-lg bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
            <span className={iconClasses[color].split(' ')[2]}>//</span> {title}
          </p>
          <p className="text-4xl font-black text-white drop-shadow-lg">{value}</p>
        </div>
        <div className={`rounded-lg p-3 border ${iconClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}