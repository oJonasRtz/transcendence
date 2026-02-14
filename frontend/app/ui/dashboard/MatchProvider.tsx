"use client";

import { Match } from "@/app/api/match-service/match.class";
import { User } from "@/app/lib/auth";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MatchNotify from "./match-notifty";
import FloatingRoomWidget from "./FloatingRoomWidget";
import { usePathname } from "next/navigation";
import { DashboardProfile } from "@/app/lib/dashboard-data";

export const match: Match = new Match();

export const __TIME_TO_WAIT__ = {
  MAX_TIME: 5,
  MIN_TIME: 3,
  RECONNECT_INTERVAL: 5,
};

export default function MatchProvider({ user, profile, children }:
  { user: User | null;
    children: React.ReactNode;
    profile?: DashboardProfile;
  }) {
  const router = useRouter();
  const reconnecIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [matchFound, setMatchFound] = useState(false);
  const [showFloating, setShowFloating] = useState(false);

  const pathname = usePathname();
  const hiddenFloat = [
    '/dashboard/play/pong',
    '/dashboard/play/statsPage',
    '/dashboard/play/waiting-lobby',
    '/login',
  ]

  useEffect(() => {
    if (!user) return;

    const currentName = profile?.nickname || user.username;
    const tryConnect = () => {
      match.connect({
        id: user.user_id,
        email: user.email,
        name: currentName,
      });
    };

    tryConnect();

    reconnecIntervalRef.current = setInterval(tryConnect, __TIME_TO_WAIT__.RECONNECT_INTERVAL * 1000);

    match.onMatch = (match_id, skip) => {
      if (!match_id) return;
    
      setMatchFound(true);
    };
    
    match.onParty = () => {
      setShowFloating(true);
    }

    match.onResults = () => {
      setTimeout(() => {
        router.push(`/dashboard/play/statsPage`);
      }, __TIME_TO_WAIT__.MIN_TIME * 1000);
    };

    return () => {
      if (reconnecIntervalRef.current) clearInterval(reconnecIntervalRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, [router, user?.user_id, user?.email, user?.username, profile?.nickname]);

  return (
    <>
      {children}
      {(showFloating && !hiddenFloat.some((path) => pathname.startsWith(path))) && <FloatingRoomWidget />}

      {(matchFound && !pathname.startsWith('/dashboard/play/pong')) && (
        <MatchNotify
          title="Match Found!"
          time={__TIME_TO_WAIT__.MAX_TIME}
          onComplete={() => {
            setMatchFound(false);
            router.push(`/dashboard/play/pong`);
          }}
        />
      )}
    </>
  );
}
