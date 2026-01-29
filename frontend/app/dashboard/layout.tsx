// import SideNav from '@/app/ui/dashboard/sidenav'
// import Starfield from '@/app/ui/starfield'
// import MatchProvider from '../ui/dashboard/MatchProvider';

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
    
//       <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
//         <Starfield />
//         {/* <MatchProvider> */}
//         <div className="w-full flex-none md:w-64">
//           <SideNav />
//         </div>
//         <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
//         {/* </MatchProvider> */}
//       </div>
//   );
// }

'use client';

import { useState } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import Starfield from '@/app/ui/starfield';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <Starfield />

      {/* Sidebar */}
      <div
        className={`flex-none transition-all duration-300 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } w-full`}
      >
        <SideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Conteúdo */}
      <div className="grow p-6 md:overflow-y-auto md:p-12 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
