import SideNav from '@/app/ui/dashboard/sidenav'
import Starfield from '@/app/ui/starfield'
import MatchProvider from '../ui/dashboard/MatchProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <Starfield />
        {/* <MatchProvider> */}
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        {/* </MatchProvider> */}
      </div>
  );
}
