'use client';

import { useState } from 'react';
import { inter } from "../fonts";
import { match } from './MatchProvider';

const redSkins = ['red', 'orange', 'yellow'];
const blueSkins = ['blue', 'green', 'purple'];

interface PaddleSelectorPanelProps {
  blueSkin: string;
  redSkin: string;
  onBlueSelect: (skin: string) => void;
  onRedSelect: (skin: string) => void;
}

export default function PaddleSelectorPanel({
  blueSkin,
  redSkin,
  onBlueSelect,
  onRedSelect,
}: PaddleSelectorPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`${inter.className} w-64`}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full mb-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
      >
        {open ? 'Hide Paddle Skins ▲' : 'Show Paddle Skins ▼'}
      </button>

      {open && (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur p-4 space-y-4">
          <h3 className="text-white font-semibold text-sm text-center">
            Select Paddle Skins
          </h3>

          {/* 🔴 Red paddle selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              Red Paddle
            </div>

            <div className="grid grid-cols-3 gap-3">
              {redSkins.map((skin) => (
                <button
                  key={skin}
                  onClick={() => {
					onRedSelect(skin);
					match.setSkins(skin,blueSkin);
				}}
                  className={`relative rounded-lg border p-2 bg-white/5 hover:bg-white/10 transition-all ${
                    redSkin === skin
                      ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                      : 'border-white/10'
                  }`}
                >
                  <img
                    src={`/sprites/Pong/Paddles/${skin}_paddle.png`}
                    alt={`${skin} paddle`}
                    className="w-6 h-20 mx-auto"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 🔵 Blue paddle selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Blue Paddle
            </div>

            <div className="grid grid-cols-3 gap-3">
              {blueSkins.map((skin) => (
                <button
                  key={skin}
                  onClick={() => {
					onBlueSelect(skin);
					match.setSkins(redSkin, skin);
				}}
                  className={`relative rounded-lg border p-2 bg-white/5 hover:bg-white/10 transition-all ${
                    blueSkin === skin
                      ? 'border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                      : 'border-white/10'
                  }`}
                >
                  <img
                    src={`/sprites/Pong/Paddles/${skin}_paddle.png`}
                    alt={`${skin} paddle`}
                    className="w-6 h-20 mx-auto"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
