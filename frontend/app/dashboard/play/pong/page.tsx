import { getUser } from "@/app/lib/auth";
import PongGame from "@/app/ui/dashboard/pong-game";
import { redirect } from "next/navigation";

export default async function PongPage() {
	const user = await getUser();

	if (!user)
		redirect('/login');

	return (
		<main className="p-4 md:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<PongGame user={user} />
			</div>
		</main>
	);
}