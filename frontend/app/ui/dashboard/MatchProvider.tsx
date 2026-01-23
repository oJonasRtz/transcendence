"use client";

import { Match } from "@/app/api/match-service/match.class";
import { User } from "@/app/lib/auth";
import { useEffect } from "react";

export const match: Match = new Match();

export default function MatchProvider({user}: {user: User}) {
  useEffect(() => {
    if (match.isConnected || !user) return;

    match.connect({
      id: user.user_id,
      email: user.email,
      name: user.nickname || user.username,
    });
  }, []);

  return null;
}
