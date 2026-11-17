'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

export default function BottomLeftControls() {
  const houseLights = useBookingStore((s) => s.houseLights);
  const toggleHouseLights = useBookingStore((s) => s.toggleHouseLights);

  return (
    <div className="absolute bottom-20 sm:bottom-24 left-3 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
      {/* Lights Toggle */}
      <button
        onClick={toggleHouseLights}
        className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-lg backdrop-blur-xl ${
          houseLights
            ? 'border-amber-400/50 bg-amber-400/20 text-amber-300'
            : 'border-white/15 bg-black/60 text-white/80 hover:bg-black/80 hover:text-white'
        }`}
        title={houseLights ? 'Turn Off House Lights' : 'Turn On House Lights'}
      >
        <Lightbulb className={`h-3.5 w-3.5 ${houseLights ? 'text-amber-400 fill-amber-400' : 'text-white/60'}`} />
        <span className="hidden xs:inline">Lights</span>
      </button>

      {/* 4K Badge */}
      <div className="hidden xs:flex items-center rounded-xl border border-white/15 bg-black/60 px-2 py-1.5 text-[10px] sm:text-[11px] font-bold text-white/60 shadow-lg backdrop-blur-xl">
        <span>4K</span>
      </div>
    </div>
  );
}
