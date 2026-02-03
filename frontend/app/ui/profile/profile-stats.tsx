"use client";
import { useState } from "react";

import MatchHistoryList from "../dashboard/history";

interface BackendUser {
  id: number;
  user_id: string;
  public_id: string;
  username: string;
  nickname?: string | null;
  email?: string;
  avatar: string;
  isOnline: number | boolean;
  state: {
    colour: string;
    text: string;
  };
  rank: {
    rank: number;
    tier: string;
    rank_points: number;
  };
  tier: string;
  rank_points: number;
  level: number;
  title: string;
  description: string | null;
  friends: number;
  wins: number;
  losses: number;
  experience_points: number;
  experience_to_next_level: number;
  created_at: string;
  updated_at: string;
}

interface MatchHistoryItem {
  match_id: string | number;
  game_type: string;
  duration: string;
  created_at: string;
  isVictory: boolean;
  players: {
    user_id: string;
    name: string;
    avatar: string;
    score: number;
    isSelf?: boolean;
    public_id?: string;
  }[];
}

interface MatchStats {
  wins: number;
  losses: number;
  total_games: number;
  win_rate: number;
}

interface ProfileStatsProps {
  user: BackendUser;
  history: MatchHistoryItem[];
  stats: MatchStats;
}

export default function ProfileStats({ user, history, stats }: ProfileStatsProps) {
  const [tab, setTab] = useState<'stats' | 'history'>('stats');

  return (
    <div className="mt-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('stats')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'stats'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'history'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          History
        </button>
      </div>

      {/* STATISTICS TAB */}
      {tab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Rank</p>
            <p className="text-white font-bold">{user.tier}</p>
            <p className="text-gray-500 text-xs">{user.rank_points} RP</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Level</p>
            <p className="text-white font-bold">{user.level}</p>
            <p className="text-gray-500 text-xs">
              {user.experience_to_next_level} XP to next
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Record</p>
            <p className="text-white font-bold">
              <span className="text-green-400">{stats.wins}W</span>
              {' / '}
              <span className="text-red-400">{stats.losses}L</span>
            </p>
            <p className="text-gray-500 text-xs">{stats.total_games} games</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Win Rate</p>
            <p className="text-white font-bold">{stats.win_rate}%</p>
            <p className="text-gray-500 text-xs">ratio</p>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div
          className="overflow-y-auto max-h-96"
        >
          <MatchHistoryList
            userId={user.user_id}
            history={history}
          />
        </div>
      )}
    </div>
  );
}
