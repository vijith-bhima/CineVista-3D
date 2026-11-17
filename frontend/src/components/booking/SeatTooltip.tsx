'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

export default function SeatTooltip() {
  const hoveredSeatInfo = useBookingStore((s) => s.hoveredSeatInfo);
  const setActiveSeatEyeView = useBookingStore((s) => s.setActiveSeatEyeView);

  if (!hoveredSeatInfo) return null;

  const isRecliner = hoveredSeatInfo.row === 'L' || hoveredSeatInfo.row === 'M';

  return (
    <div
      className="pointer-events-auto fixed z-40 -translate-x-1/2 -translate-y-full pb-3 transition-transform"
      style={{
        left: hoveredSeatInfo.x ? `${hoveredSeatInfo.x}px` : '50%',
        top: hoveredSeatInfo.y ? `${hoveredSeatInfo.y - 12}px` : '50%',
      }}
    >
      <div className="flex flex-col gap-1 rounded-xl border border-white/20 bg-black/85 px-3.5 py-2.5 backdrop-blur-xl shadow-2xl text-xs min-w-[160px] text-white">
        {/* Row & Seat Number */}
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-sm ${isRecliner ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span className="font-bold text-white text-sm">
            Row {hoveredSeatInfo.row} · Seat {hoveredSeatInfo.number}
          </span>
        </div>

        {/* Category & Price */}
        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span>{isRecliner ? 'Royal Recliner' : hoveredSeatInfo.category}</span>
          <span className="font-bold text-amber-300 text-xs">
            {isRecliner ? '₹550' : `₹${hoveredSeatInfo.price}`}
          </span>
        </div>

        {/* Optional 3D POV preview button */}
        <button
          onClick={() => setActiveSeatEyeView(hoveredSeatInfo.label)}
          className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 py-1 text-[10px] font-bold text-white transition-colors"
        >
          <Compass className="h-3 w-3 text-amber-300" />
          <span>Preview Sightline</span>
        </button>
      </div>
    </div>
  );
}
