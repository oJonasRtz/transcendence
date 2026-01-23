import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { lusitana } from '@/app/ui/fonts';
import { getUser } from './lib/auth';
import MatchProvider from './ui/dashboard/MatchProvider';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en" className="bg-black">
      <MatchProvider user={user} >
      <body className={`${inter.className} antialiased bg-black`}>
          {children}  
      </body>
      </MatchProvider>
    </html>
  );
}
