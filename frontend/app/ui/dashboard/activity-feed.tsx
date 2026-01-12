// app/ui/dashboard/activity-feed.tsx
import { getActivityFeed } from '@/app/lib/data';
import {
  BoltIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default async function ActivityFeed({ userId }: { userId: number }) {
  const activities = await getActivityFeed(userId, 10);

  return (
    <div className="rounded-lg bg-slate-900/50 backdrop-blur-sm border border-white/10 shadow-2xl">
      <div className="border-b border-white/10 p-6">
        <h2 className="text-xl font-black tracking-tight text-white uppercase">
          <span className="text-yellow-400">//</span> Recent Activity
        </h2>
      </div>

      <div className="divide-y divide-white/5">
        {activities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500 font-mono text-sm">// NO RECENT ACTIVITY</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="p-4 hover:bg-white/5 transition-all duration-300">
              {activity.type === 'match' && (
                <ActivityItem
                  icon={BoltIcon}
                  iconColor="blue"
                  text={
                    <>
                      Played against{' '}
                      <span className="font-semibold text-blue-400">
                        {activity.data.player1Id === userId
                          ? activity.data.player2.username
                          : activity.data.player1.username}
                      </span>
                    </>
                  }
                  date={activity.date}
                />
              )}

              {activity.type === 'achievement' && (
                <ActivityItem
                  icon={StarIcon}
                  iconColor="yellow"
                  text={
                    <>
                      Unlocked{' '}
                      <span className="font-semibold text-yellow-400">
                        {activity.data.achievement.name}
                      </span>
                    </>
                  }
                  date={activity.date}
                />
              )}

              {activity.type === 'friendship' && (
                <ActivityItem
                  icon={UserGroupIcon}
                  iconColor="green"
                  text={
                    <>
                      New friend:{' '}
                      <span className="font-semibold text-green-400">
                        {activity.data.userId === userId
                          ? activity.data.friend.username
                          : activity.data.user.username}
                      </span>
                    </>
                  }
                  date={activity.date}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
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
  date: Date;
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