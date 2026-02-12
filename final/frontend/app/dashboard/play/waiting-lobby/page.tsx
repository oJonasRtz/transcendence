import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import WaitingLobby from '@/app/ui/dashboard/Waiting-lobby';

export default async function WaitingLobbyPage() {
	const user = await getUser();

	if (!user)
		redirect('/login');

	//Save in Match.class the type of game

	return (
	<main className="p-4 md:p-6 lg:p-8">
		<div className="max-w-7xl mx-auto">
		<WaitingLobby user={user}/>
		</div>
	</main>
	);
}
