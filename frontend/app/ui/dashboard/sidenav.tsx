// import Link from 'next/link';
// import NavLinks from '@/app/ui/dashboard/nav-links';
// import AcmeLogo from '@/app/ui/pong-logo';
// import LogoutButton from '@/app/ui/dashboard/logout-button';
// import EmailVerificationStatus from '@/app/ui/dashboard/email-verification-status';

// export default function SideNav() {
//   return (
//       <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-slate-950/50 backdrop-blur-md border-r border-white/10">
//         <Link
//           className="mb-2 flex h-20 items-end justify-start rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 p-4 md:h-40 hover:border-blue-500/30 transition-all duration-300 group"
//           href="/"
//         >
//           <div className="w-32 text-white md:w-40 group-hover:scale-105 transition-transform">
//             <AcmeLogo />
//           </div>
//         </Link>
//         <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
//           <NavLinks />
//           <div className="hidden h-auto w-full grow rounded-lg bg-gradient-to-br from-slate-900/50 to-black/50 border border-white/5 md:block backdrop-blur-sm"></div>
//           <EmailVerificationStatus />
//           <LogoutButton />
//         </div>
//       </div>
//   );
// }

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import AcmeLogo from "@/app/ui/pong-logo";
import LogoutButton from "@/app/ui/dashboard/logout-button";
import EmailVerificationStatus from "@/app/ui/dashboard/email-verification-status";

export default function SideNav({isCollapsed, setIsCollapsed}: {isCollapsed: boolean, setIsCollapsed: (collapsed: boolean) => void}) {
  const navRef = useRef<HTMLDivElement | null>(null);

  // Fecha quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsCollapsed(true);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsCollapsed]);

  return (
    <div
      ref={navRef}
      onClick={() => setIsCollapsed(false)}
      className="flex w-full h-auto md:h-screen flex-col px-3 py-4 md:px-2 bg-slate-950/50 backdrop-blur-md border-b border-white/10 md:border-b-0 md:border-r transition-all duration-300 ease-in-out cursor-pointer"
    >
      {/* Header / Logo */}
      <div className={`mb-2 flex justify-start rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 p-4 hover:border-blue-500/30 transition-all duration-300 group ${
          isCollapsed ? "h-auto items-center" : "h-20 md:h-40 items-end"
        }`}>
        <div
          className={`text-white transition-all duration-300 group-hover:scale-105 ${
            isCollapsed ? "w-10" : "w-32 md:w-40"
          }`}
        >
          <AcmeLogo isCollapsed={isCollapsed} />
        </div>
      </div>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks isCollapsed={isCollapsed} />

        <div className="hidden h-auto w-full grow rounded-lg bg-gradient-to-br from-slate-900/50 to-black/50 border border-white/5 md:block backdrop-blur-sm" />

        <div className="h-[48px]">
          <EmailVerificationStatus isCollapsed={isCollapsed} />
        </div>

          <LogoutButton isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
