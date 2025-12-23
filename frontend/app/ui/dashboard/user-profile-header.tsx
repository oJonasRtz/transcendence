import { poppins as futuraPtBold } from '@/app/ui/fonts';
import { getUserById } from '@/app/lib/data';

export default async function UserProfileHeader({ userId }: { userId: number }) {
  const user = await getUserById(userId);

  return (
    <>
      <div className="flex items-center gap-4">
        <img
          src={user?.avatar || 'images/default_avatar.png'}
          alt="User Avatar"
          className="h-40 w-40 rounded-full"
        />
      </div>
      <div className="mt-4 mb-8">
        <h2 className={`${futuraPtBold.className} text-2xl font-bold text-center py-4 lg:text-left lg:py-0 drop-shadow-md`}>
          Welcome back, {user?.username}!
        </h2>
      </div>
    </>
  );
}
