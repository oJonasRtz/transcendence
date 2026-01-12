import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import FlappyBirdGame from '@/app/ui/dashboard/flappy-bird-game';

export default async function FlappyBirdPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <FlappyBirdGame user={user} />
      </div>
    </main>
  );
}
