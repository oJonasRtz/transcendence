"use client";

import { Match } from "@/app/api/match-service/match.class";
import { User } from "@/app/lib/auth";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MatchNotify from "./match-notifty";
import FloatingRoomWidget from "./FloatingRoomWidget";

export const match: Match = new Match();
/**
 * Time to wait before take an action (in seconds)
 * MAX_TIME: Maximum time to wait
 * MIN_TIME: Minimum time to wait
 * RECONNECT_INTERVAL: Time interval to attempt reconnection
*/
export const __TIME_TO_WAIT__ = {
  MAX_TIME: 5,
  MIN_TIME: 3, 
  RECONNECT_INTERVAL: 5,
};

export default function MatchProvider({user, children}: {user: User, children: React.ReactNode}) {
  const router = useRouter();
  const [timeout, setTime] = useState<boolean>(false);
  const reconnecIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    match.onTimeout = setTime;
 
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

    const tryConnect = () => {
      if (!match.isConnected && user) {
        match.connect({
          id: user.user_id,
          email: user.email,
          name: user.nickname || user.username,
        });
      }
    };

    tryConnect();

    reconnecIntervalRef.current = setInterval(() => {
      tryConnect();
    }, __TIME_TO_WAIT__.RECONNECT_INTERVAL * 1000);

  }, [router, user]);
  
  // useEffect(() => {
  //   const time = setTimeout(() => {
  //     setTime(false);
  //     router.push(`/dashboard/play`);
  //   }, __TIME_TO_WAIT__.MIN_TIME * 1000);

  //   return () => clearTimeout(time);
  // }, [timeout]);

  return (
    <>
      {children}
      {(match.party && match.state === 'IDLE') && (
        <FloatingRoomWidget />
      )}
      {/* {timeout && (
        <MatchNotify
          title="Room disbanded"
          time={__TIME_TO_WAIT__.MIN_TIME}
        />
      )} */}
    </>
  );
}
