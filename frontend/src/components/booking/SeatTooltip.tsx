'use client';

import React from 'react';
import { useBookingStore } from '@/store/useBookingStore';

export default function SeatTooltip() {
  const hoveredSeatInfo = useBookingStore((s) => s.hoveredSeatInfo);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);

  if (!hoveredSeatInfo) return null;

  const isSelected = selectedSeats.includes(hoveredSeatInfo.label);
  const isSold = hoveredSeatInfo.category === 'Booked Seat';
  const isRecliner = hoveredSeatInfo.row === 'L' || hoveredSeatInfo.row === 'M';

  return (
    <div
      className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-full pb-4 transition-all duration-75 ease-out select-none"
      style={{
        left: hoveredSeatInfo.x ? `${hoveredSeatInfo.x}px` : '50%',
        top: hoveredSeatInfo.y ? `${hoveredSeatInfo.y - 12}px` : '50%',
      }}
    >
      <div className="flex flex-col gap-1 rounded-xl border border-white/20 bg-black/90 px-3.5 py-2 backdrop-blur-xl shadow-2xl text-xs min-w-[150px] text-white">
        {/* Row & Seat Number */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-sm ${
                isSold
                  ? 'bg-slate-500'
                  : isSelected
                  ? 'bg-emerald-400 ring-2 ring-emerald-400/50'
                  : isRecliner
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-bold text-white text-sm">
              Seat {hoveredSeatInfo.label}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isSold
                ? 'bg-slate-800 text-slate-400'
                : isSelected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-white/10 text-white/80'
            }`}
          >
            {isSold ? 'Occupied' : isSelected ? 'Selected' : 'Available'}
          </span>
        </div>

        {/* Category & Price */}
        <div className="flex items-center justify-between text-[11px] text-white/70 pt-1 border-t border-white/10">
          <span>{isRecliner ? 'Royal Recliner' : hoveredSeatInfo.category}</span>
          <span className="font-bold text-amber-300 text-xs">
            {isSold ? '-' : isRecliner ? '₹550' : `₹${hoveredSeatInfo.price}`}
          </span>
        </div>

        {/* Action hint */}
        <div className="text-[10px] text-center font-semibold pt-0.5">
          {isSold ? (
            <span className="text-slate-400">Seat already booked</span>
          ) : isSelected ? (
            <span className="text-rose-300">Click to remove from selection</span>
          ) : (
            <span className="text-emerald-300">Click to select seat</span>
          )}
        </div>
      </div>
    </div>
  );
}
