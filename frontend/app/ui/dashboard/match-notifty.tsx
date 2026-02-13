"use client";

import { useEffect, useState } from "react";

export default function MatchNotify({
  title,
  time,
  onComplete,
}: {
  title: string;
  time: number;
  onComplete?: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);

    const start = Date.now();
    const duration = time * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(duration - elapsed, 0);
      const percentage = (remaining / duration) * 100;
      setProgress(percentage);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [time, onComplete]);

  const formattedTitle = title.split(" ").join("\n");
  const key = title.toLowerCase();

  const glowColors = {
    victory: {
      glow: "from-green-500 to-emerald-400",
      ring: "border-green-400/30",
      textGlow: "drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]",
    },
    defeat: {
      glow: "from-red-500 to-rose-400",
      ring: "border-red-400/30",
      textGlow: "drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]",
    },
    default: {
      glow: "from-blue-500 to-purple-500",
      ring: "border-blue-400/30",
      textGlow: "drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]",
    },
  };

  const theme =
    glowColors[key as keyof typeof glowColors] || glowColors.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`relative group transition-all duration-300 ease-out
          ${animate ? "scale-100 opacity-100" : "scale-90 opacity-0"}
        `}
      >
        <div
          className={`absolute -inset-2 bg-gradient-to-r ${theme.glow} rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-300`}
        />

        <div
          className={`relative w-72 h-72 rounded-2xl border ${theme.ring}
            bg-slate-900/60 backdrop-blur-xl shadow-xl
            flex flex-col items-center justify-center gap-4 p-6 text-center`}
        >
          <h1
            className={`text-3xl font-black text-white leading-tight whitespace-pre-line ${theme.textGlow}`}
            style={{ lineHeight: "1.15" }}
          >
            {formattedTitle}
          </h1>

          <div className="w-12 h-1 rounded-full bg-white/20" />

          <div className="mt-2 w-44 h-2 rounded-full bg-white/10 overflow-hidden border border-white/20">
            <div
              className="h-full bg-orange-500 transition-all duration-100 ease-linear shadow-[0_0_12px_rgba(249,115,22,0.9)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-400">
            Redirecting...
          </span>
        </div>
      </div>
    </div>
  );
}
