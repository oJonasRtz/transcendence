interface ProfileData {
  experience_points: number;
  wins: number;
  losses: number;
  rank: {
    rank: string;
    pts: number;
  };
}

interface ProfileStatsProps {
  profile: ProfileData;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const totalGames = profile.wins + profile.losses;
  const winRate = totalGames > 0
    ? ((profile.wins / totalGames) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rank */}
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Rank</p>
          <p className="text-white font-bold">{profile.rank.rank}</p>
          <p className="text-gray-500 text-xs">{profile.rank.pts} pts</p>
        </div>

        {/* Experience */}
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Experience</p>
          <p className="text-white font-bold">{profile.experience_points}</p>
          <p className="text-gray-500 text-xs">XP</p>
        </div>

        {/* Wins / Losses */}
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Record</p>
          <p className="text-white font-bold">
            <span className="text-green-400">{profile.wins}W</span>
            {' / '}
            <span className="text-red-400">{profile.losses}L</span>
          </p>
          <p className="text-gray-500 text-xs">{totalGames} games</p>
        </div>

        {/* Win Rate */}
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Win Rate</p>
          <p className="text-white font-bold">{winRate}%</p>
          <p className="text-gray-500 text-xs">ratio</p>
        </div>
      </div>
    </div>
  );
}
