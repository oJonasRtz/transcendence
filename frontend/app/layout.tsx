import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { lusitana } from '@/app/ui/fonts';
import { getUser, User } from './lib/auth';
import MatchProvider from './ui/dashboard/MatchProvider';
import { DashboardProfile, getDashboardData } from './lib/dashboard-data';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user: User | null = await getUser();
  let profile: DashboardProfile | undefined = undefined;
  if (user) {
     const data = await getDashboardData(user);
     profile = data.profile;
  } 

  return (
    <html lang="en" className="bg-black">
      <MatchProvider user={user} profile={profile} >
      <body className={`${inter.className} antialiased bg-black`}>
          {children}  
      </body>
      </MatchProvider>
    </html>
  );
}
