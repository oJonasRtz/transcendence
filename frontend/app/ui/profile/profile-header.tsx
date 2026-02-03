interface ProfileData {
  username: string;
  avatar: string;
  nickname?: string;
  title: string;
  description: string;
  state: {
    colour: string;
    text: string;
  };
}

interface ProfileHeaderProps {
  profile: ProfileData;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const stateColorClass: Record<string, string> = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className="flex flex-col items-center mb-6">
      {/* Avatar */}
      <img
        src={profile.avatar || '/images/default_avatar.png'}
        alt={`${profile.username}'s avatar`}
        className="w-32 h-32 rounded-full object-cover border-4 border-white/20 mb-4"
      />

      {/* Username */}
      <h2 className="text-2xl font-bold text-white mb-2">{profile.username}</h2>
      {profile?.nickname && (
        <p className="text-gray-400 italic mb-2">"{profile.nickname}"</p>
      )}

      {/* Online Status */}
      <p className={`font-semibold mb-2 ${stateColorClass[profile.state.colour] || 'text-gray-400'}`}>
        {profile.state.text}
      </p>

      {/* Title */}
      {profile.title && (
        <p className="text-gray-300 mb-2">
          <span className="font-semibold">Title:</span> {profile.title}
        </p>
      )}

      {/* Description */}
      <p className="text-gray-400 text-center max-w-md">
        {profile.description || 'The user has no description'}
      </p>
    </div>
  );
}
