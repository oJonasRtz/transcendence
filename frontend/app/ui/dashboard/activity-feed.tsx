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
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
      </div>

      <div className="divide-y">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="p-4">
              {activity.type === 'match' && (
                <ActivityItem
                  icon={BoltIcon}
                  iconColor="blue"
                  text={
                    <>
                      Played against{' '}
                      <span className="font-semibold">
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
                      <span className="font-semibold">
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
                      <span className="font-semibold">
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
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`rounded-full p-2 ${colorClasses[iconColor]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-gray-500">
          {new Date(date).toLocaleString()}
        </p>
      </div>
    </div>
  );
}