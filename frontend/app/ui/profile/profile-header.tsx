interface ProfileData {
  username: string;
  avatar: string;
  nickname?: string | null;
  title: string;
  description: string;
  state: {
    colour: string;
    text: string;
  };
}

interface ProfileHeaderProps {
  profile: ProfileData;
  actions?: React.ReactNode;
}
export default function ProfileHeader({ profile, actions }: ProfileHeaderProps) {
  const isOnline = profile.state.colour === "green";

  return (
    <div className="flex flex-col items-start mb-6">
      {/* Avatar + Name */}
      <div className="flex items-center gap-6 mb-4">
        {/* Avatar + Status */}
        <div className="relative group">
          {/* Glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-40 blur-lg group-hover:opacity-70 transition-opacity" />

          {/* Frame */}
          <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-500 shadow-2xl">
            <div className="relative p-2 rounded-full bg-slate-900/80">
              <img
                src={profile.avatar || "/images/default_avatar.png"}
                alt={`${profile.username}'s avatar`}
                className="w-32 h-32 rounded-full object-cover"
              />

              {/* Status Dot */}
              <div
                className={`absolute bottom-3 right-3 flex items-center justify-center
                  border-2 border-black rounded-full
                  transition-all duration-200
                  ${isOnline ? "bg-green-500" : "bg-red-500"}
                  w-4 h-4
                  group-hover:w-20 group-hover:h-7`}
              >
                <span className="text-xs font-bold text-white bg-black px-2 py-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {profile.title && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-semibold text-blue-300 bg-slate-900 border border-blue-500/30 rounded-full shadow-lg backdrop-blur">
                  {profile.title}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name + Title + Nickname */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-white tracking-wide">
              {profile.username}
            </h2>
          </div>

          {profile.nickname && (
            <span className="text-sm italic text-gray-400 mt-1">
              <span className="uppercase text-xs text-gray-500 mr-1">AKA</span>
              “{profile.nickname}”
            </span>
          )}

          {/* Actions under title */}
          {actions && (
            <div className="mt-3 flex gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Description Box */}
      <div className="w-full max-w-2xl mt-2 px-5 py-4 bg-slate-600 border border-white/10 rounded-xl shadow-inner">
        <h2 className="text-xs uppercase tracking-widest text-gray-300 mb-2">
          Description
        </h2>
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
          {profile.description || "The user has no description"}
        </p>
      </div>
    </div>
  );
}
