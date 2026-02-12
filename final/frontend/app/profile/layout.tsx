"use client";

import { useState } from "react";
import SideNav from "@/app/ui/dashboard/sidenav";
import Starfield from "@/app/ui/starfield";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <Starfield />

      <div
        className={`flex-none transition-all duration-300 ${
          isCollapsed ? "md:w-20" : "md:w-72"
        } w-full`}
      >
        <SideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className="grow min-w-0 md:overflow-y-auto transition-all duration-300">
        {children}
      </div>
    </div>
  );
}

