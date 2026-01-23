import { getUser } from "@/app/lib/auth";
import StatusPage from "@/app/ui/dashboard/statusPage";
import { redirect } from "next/dist/server/api-utils";


export default async function StatsPage() {
	const user = await getUser();

	if (!user)
		redirect('/login');

	return (
		<main className="p-4 md:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<StatusPage user={user} />
			</div>
		</main>
	);
}
