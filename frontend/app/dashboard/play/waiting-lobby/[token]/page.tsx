import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import WaitingLobby from '@/app/ui/dashboard/Waiting-lobby';
import { onInvite } from '../page';

export default async function WaitingLobbyPage({
  params,
}: {
  params: { token: string };
}) {
  const user = await getUser();

  if (!user) redirect('/login');

  // params.lobbyId contém o ID da lobby
  // console.log('Lobby ID:', params.token);

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <WaitingLobby user={user} />
      </div>
    </main>
  );
}
