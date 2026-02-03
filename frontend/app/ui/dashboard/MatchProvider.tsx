"use client";

import { Match } from "@/app/api/match-service/match.class";
import { User } from "@/app/lib/auth";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MatchNotify from "./match-notifty";
import FloatingRoomWidget from "./FloatingRoomWidget";
import { usePathname } from "next/navigation";

export const match: Match = new Match();

export const __TIME_TO_WAIT__ = {
  MAX_TIME: 5,
  MIN_TIME: 3,
  RECONNECT_INTERVAL: 5,
};

export default function MatchProvider({ user, children }: { user: User; children: React.ReactNode }) {
  const router = useRouter();
  const reconnecIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [matchFound, setMatchFound] = useState(false);

  const pathname = usePathname();
  const hiddenFloat = [
    '/dashboard/play/pong',
    '/dashboard/play/statsPage',
    '/dashboard/play/waiting-lobby',
  ]

  // 🔹 Conecta ao match e define callbacks
  useEffect(() => {
    if (!user) return;

    // Função de conexão
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

    // Intervalo de reconexão
    reconnecIntervalRef.current = setInterval(tryConnect, __TIME_TO_WAIT__.RECONNECT_INTERVAL * 1000);

    // Callback quando um match é encontrado
    match.onMatch = (match_id, skip) => {
      setMatchFound(true);
      const go = () => router.push(`/dashboard/play/pong`);

      // Limpa qualquer timeout antigo antes de criar um novo
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);

      if (skip) {
        go();
        return;
      }

      redirectTimeoutRef.current = setTimeout(go, __TIME_TO_WAIT__.MAX_TIME * 1000);
    };

    // Callback quando resultados aparecem
    match.onResults = () => {
      setTimeout(() => {
        router.push(`/dashboard/play/statsPage`);
      }, __TIME_TO_WAIT__.MIN_TIME * 1000);
    };

    return () => {
      if (reconnecIntervalRef.current) clearInterval(reconnecIntervalRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, [router, user]);

  return (
    <>
      {children}
      {((match.party || match.partyToken) && !hiddenFloat.some((path) => pathname.startsWith(path))) && <FloatingRoomWidget />}

      {matchFound && (
        <MatchNotify
          title="Match Found!"
          time={__TIME_TO_WAIT__.MAX_TIME}
          onComplete={() => {
            setMatchFound(false);
          }}
        />
      )}
    </>
  );
}
