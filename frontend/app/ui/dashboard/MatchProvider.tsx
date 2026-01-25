"use client";

import { Match } from "@/app/api/match-service/match.class";
import { User } from "@/app/lib/auth";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export const match: Match = new Match();
/**
 * Time to wait before take an action (in seconds)
 * MAX_TIME: Maximum time to wait
 * MIN_TIME: Minimum time to wait
*/
export const __TIME_TO_WAIT__ = {
  MAX_TIME: 5,
  MIN_TIME: 3, 
};

export default function MatchProvider({user, children}: {user: User, children: React.ReactNode}) {
  const router = useRouter();

  useEffect(() => {
    match.onMatch = (match_id, skip) => {
      const go = () => router.push(`/dashboard/play/pong`);
      
      if (skip)
        return go();

      setTimeout(go, __TIME_TO_WAIT__.MAX_TIME * 1000);
    };

    match.onResults = () => {
      setTimeout(() => {
        router.push(`/dashboard/play/statsPage`);
      }, __TIME_TO_WAIT__.MIN_TIME * 1000);
    };

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
