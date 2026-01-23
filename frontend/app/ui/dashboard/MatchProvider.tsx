"use client";

import { Match } from "@/app/api/match-service/match.class";
import { User } from "@/app/lib/auth";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export const match: Match = new Match();

export default function MatchProvider({user, children}: {user: User, children: React.ReactNode}) {
  const router = useRouter();

  useEffect(() => {
    match.onMatch = (match_id) => {
      router.push(`/dashboard/play/pong`);
    };

    match.onResults = () => {
      router.push(`/dashboard/play/statsPage`);
    }

    if (!match.isConnected && user) {
      match.connect({
        id: user.user_id,
        email: user.email,
        name: user.nickname || user.username,
      });
    }
  }, [router]);
  
  return <>{children}</>;
}
