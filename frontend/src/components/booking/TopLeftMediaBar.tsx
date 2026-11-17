'use client';

import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

interface TopLeftMediaBarProps {
  movieTitle?: string;
}

export default function TopLeftMediaBar({ movieTitle }: TopLeftMediaBarProps) {
  const soundEnabled = useBookingStore((s) => s.soundEnabled);
  const toggleSound = useBookingStore((s) => s.toggleSound);
  const videoPlaying = useBookingStore((s) => s.videoPlaying);
  const toggleVideoPlaying = useBookingStore((s) => s.toggleVideoPlaying);

  return (
    <div className="absolute top-16 sm:top-20 left-3 sm:left-4 z-20 pointer-events-none">
      <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/60 p-1 sm:p-1.5 backdrop-blur-xl shadow-lg pointer-events-auto">
        {/* Play / Pause Toggle Button */}
        <button
          onClick={toggleVideoPlaying}
          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-black shadow-md transition-all active:scale-95"
          title={videoPlaying ? 'Pause Trailer' : 'Play Trailer'}
        >
          {videoPlaying ? (
            <>
              <Pause className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-black" />
              <span className="hidden xs:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-black" />
              <span className="hidden xs:inline">Play</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition-all ${
            soundEnabled
              ? 'text-amber-400 bg-amber-400/10'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </button>
      </div>
    </div>
  );
}
