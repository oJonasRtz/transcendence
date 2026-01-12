'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayNow = async () => {
    setIsLoading(true);
    try {
      // Navigate to game/queue page
      router.push('/dashboard/play');
    } catch (error) {
      console.error('Error navigating to game:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlayNow}
      disabled={isLoading}
      className="group relative px-8 py-4 rounded-lg
                 bg-gradient-to-r from-blue-500 to-purple-600
                 hover:from-blue-600 hover:to-purple-700
                 text-white font-bold text-lg
                 transform transition-all duration-300
                 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 border-2 border-blue-400/30"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500
                      opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300 -z-10" />

      {/* Button content */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>PLAY NOW</span>
          </>
        )}
      </div>

      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-lg bg-white/20 animate-pulse-slow opacity-0 group-hover:opacity-100" />
    </button>
  );
}
