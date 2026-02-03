import {
  TrophyIcon,
  StarIcon,
  CheckCircleIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';
import { DashboardStats as DashboardStatsType } from '@/app/lib/dashboard-data';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://api-gateway:3000';

type StatCard = {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'purple' | 'green' | 'orange';
};

type DashboardStatsProps = {
  stats: DashboardStatsType;
};

// export async function getMatchHistory(): Promise<any> {
//   const cookieStore = await cookies();
//   const jwt = cookieStore.get('jwt')?.value;
//   if (!jwt) return { stats: {}, history: [] };

//   const res = await fetch(`${API_GATEWAY_URL}/api/history`, {
//     method: 'GET',
//     headers: {
//       Cookie: `jwt=${jwt}`,
//     },
//     cache: 'no-store',
//   });

//   if (!res.ok) return { stats: {}, history: [] };
//   return res.json();
// }

export async function getMatchHistory(userId?: string): Promise<any> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value;
  if (!jwt) return { stats: {}, history: [] };

  const url = userId
    ? `${API_GATEWAY_URL}/api/history?user_id=${userId}`
    : `${API_GATEWAY_URL}/api/history`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Cookie: `jwt=${jwt}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) return { stats: {}, history: [] };
  return res.json();
}


export default async function DashboardStats({ stats }: DashboardStatsProps) {
  const historyData = await getMatchHistory();
  console.log('DashboardStats - historyData:', historyData);
  const totalXP = stats.experience_points + stats.experience_to_next_level;
  const xpPercent = Math.min(
    Math.round((stats.experience_points / totalXP) * 100),
    100
  );

  const cards: StatCard[] = [
    {
      title: 'Ranking',
      value: stats.tier,
      subtitle: `${stats.rankingPoints}${stats.tier === 'MASTER' ? ' RP' : `/100 RP`}`,
      icon: TrophyIcon,
      color: 'blue',
    },
    {
      title: 'Level',
      value: stats.level.toString(),
      subtitle: `${stats.experience_points}/${totalXP} XP | ${xpPercent}%`,
      icon: StarIcon,
      color: 'purple',
    },
    // {
    //   title: 'Wins',
    //   value: historyData?.stats?.wins?.toString() ?? '0',
    //   icon: CheckCircleIcon,
    //   color: 'green',
    // },
    {
      title: 'Win Rate',
      value: `${historyData?.stats?.win_rate?.toString() ?? '0'}%`,
      subtitle: `Wins: ${historyData?.stats?.wins ?? 0} | Losses: ${historyData?.stats?.losses}`,
      icon: FireIcon,
      color: 'orange',
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}

async function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: StatCard) {
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
    <div
      className={`rounded-lg bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
            <span className={iconClasses[color].split(' ')[2]}>//</span> {title}
          </p>
          <p className="text-4xl font-black text-white drop-shadow-lg">{value}</p>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className={`flex-shrink-0 max-w-full max-h-full rounded-lg p-3 border ${iconClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
