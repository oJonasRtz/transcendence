import Form from '@/app/ui/matches/create-form';
import Breadcrumbs from '@/app/ui/matches/breadcrumbs';
import { getOnlineUsers } from '@/app/lib/data';
 
export default async function Page() {
  const users = await getOnlineUsers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Matches', href: '/dashboard/matches' },
          {
            label: 'Create Match',
            href: '/dashboard/matches/create',
            active: true,
          },
        ]}
      />
      <Form users={users} />
    </main>
  );
}