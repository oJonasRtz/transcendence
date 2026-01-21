// app/ui/dashboard/activity-feed.tsx
import {
  BoltIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { DashboardActivity } from '@/app/lib/dashboard-data';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';

type ActivityFeedProps = {
  activity: DashboardActivity[];
};

export default async function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <CardShell>
      <CardHeader title="Recent Activity" accentClassName="text-yellow-400" />

      <div className="divide-y divide-white/5">
        {activity.length === 0 ? (
          <EmptyState
            title="No activity yet"
            message="Play matches and unlock achievements to see updates here."
          />
        ) : (
          activity.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-white/5 transition-all duration-300"
            >
              {item.type === 'match' && (
                <ActivityItem
                  icon={BoltIcon}
                  iconColor="blue"
                  text={
                    <>
                      Played against{' '}
                      <span className="font-semibold text-blue-400">
                        {item.text.replace(/^Played against /, '')}
                      </span>
                    </>
                  }
                  date={item.date}
                />
              )}

              {item.type === 'achievement' && (
                <ActivityItem
                  icon={StarIcon}
                  iconColor="yellow"
                  text={
                    <>
                      Unlocked{' '}
                      <span className="font-semibold text-yellow-400">
                        {item.text.replace(/^Unlocked /, '')}
                      </span>
                    </>
                  }
                  date={item.date}
                />
              )}

              {item.type === 'friendship' && (
                <ActivityItem
                  icon={UserGroupIcon}
                  iconColor="green"
                  text={
                    <>
                      New friend:{' '}
                      <span className="font-semibold text-green-400">
                        {item.text.replace(/^New friend: /, '')}
                      </span>
                    </>
                  }
                  date={item.date}
                />
              )}
            </div>
          ))
        )}
      </div>
    </CardShell>
  );
}

function ActivityItem({
  icon: Icon,
  iconColor,
  text,
  date,
}: {
  icon: any;
  iconColor: 'blue' | 'yellow' | 'green';
  text: React.ReactNode;
  date: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`rounded-lg p-2 border ${colorClasses[iconColor]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-300">{text}</p>
        <p className="text-xs font-mono text-slate-500">
          {new Date(date).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
