'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { Seat } from '@/types';
import { useBookingStore } from '@/store/useBookingStore';

interface TwoDSeatMapProps {
  seats: Seat[];
  onSeatClick?: (seatLabel: string, price: number) => void;
}

const ROWS = ['M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
const SEATS_PER_ROW = 26;
const AISLE_GAP = 13;

export default function TwoDSeatMap({ seats, onSeatClick }: TwoDSeatMapProps) {
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const toggleSeat = useBookingStore((s) => s.toggleSeat);
  const setActiveSeatEyeView = useBookingStore((s) => s.setActiveSeatEyeView);
  const setViewMode = useBookingStore((s) => s.setViewMode);

  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [maxWarning, setMaxWarning] = useState(false);

  // Seat map from backend
  const seatMap = useMemo(() => {
    const map = new Map<string, Seat>();
    seats.forEach((s) => map.set(s.label, s));
    return map;
  }, [seats]);

  // Exact match to 3D theater sold logic
  const isSeatSold = useCallback(
    (label: string): boolean => {
      const s = seatMap.get(label);
      const rowChar = label.charAt(0).toUpperCase();
      const num = parseInt(label.substring(1), 10);
      const rIdx = rowChar.charCodeAt(0) - 65;

      // Realistic booked seat pattern matching 3D theater
      const defaultSold =
        rIdx >= 2 &&
        (((num * 7 + rIdx * 13 + (num % 3) * 5) % 100) < 32);

      return (s && s.status === 'sold') || defaultSold;
    },
    [seatMap]
  );

  const getTier = (row: string): { name: string; price: number; colorClass: string; textColor: string } => {
    if (row === 'L' || row === 'M') {
      return {
        name: 'ROYAL RECLINER',
        price: 550,
        colorClass: 'border-amber-400/80 bg-amber-50/40 hover:border-amber-500 hover:bg-amber-100/60',
        textColor: 'text-amber-800',
      };
    }
    if (row >= 'E') {
      return {
        name: 'PRIME',
        price: 240,
        colorClass: 'border-emerald-400/80 bg-emerald-50/40 hover:border-emerald-500 hover:bg-emerald-100/60',
        textColor: 'text-emerald-800',
      };
    }
    return {
      name: 'CLASSIC',
      price: 150,
      colorClass: 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-100',
      textColor: 'text-slate-700',
    };
  };

  const handleSeatClick = (label: string) => {
    if (isSeatSold(label)) return;

    const row = label.charAt(0);
    const tier = getTier(row);
    const success = toggleSeat(label, tier.price);

    if (!success) {
      setMaxWarning(true);
      setTimeout(() => setMaxWarning(false), 3000);
    }

    if (onSeatClick) {
      onSeatClick(label, tier.price);
    }
  };

  // Preview in 3D from seat
  const handlePreviewSeat = (e: React.MouseEvent, label: string) => {
    e.stopPropagation();
    setActiveSeatEyeView(label);
    setViewMode('3D');
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col pt-20 pb-20 px-3 sm:px-6 overflow-y-auto bg-[#fafafa] dark:bg-[#07080B] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="mx-auto w-full max-w-5xl my-auto flex flex-col items-center">

        {/* ─── Screen Curved Arc (BookMyShow Style) ─── */}
        <div className="w-full max-w-lg flex flex-col items-center mb-5">
          <div className="relative w-full h-7 flex items-center justify-center">
            <svg
              className="w-full h-6 overflow-visible"
              viewBox="0 0 500 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 20 18 Q 250 2 480 18"
                stroke="#cbd5e1"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 60 18 Q 250 4 440 18"
                stroke="#e8b634"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            SCREEN THIS WAY
          </span>
        </div>

        {/* Max Seats Alert */}
        {maxWarning && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-lg">
              Maximum 6 seats allowed per booking
            </div>
          </div>
        )}

        {/* ─── Seating Grid Card (BookMyShow Style) ─── */}
        <div className="w-full bg-white dark:bg-[#0e1017] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-5 overflow-x-auto">
          <div className="min-w-[800px] flex flex-col items-center gap-3.5">

            {/* Tiers */}
            {[
              { title: 'ROYAL RECLINER · ₹550', rows: ['M', 'L'] },
              { title: 'PRIME · ₹240', rows: ['K', 'J', 'I', 'H', 'G', 'F', 'E'] },
              { title: 'CLASSIC · ₹150', rows: ['D', 'C', 'B', 'A'] },
            ].map((section) => (
              <div key={section.title} className="w-full flex flex-col items-center gap-1.5">
                {/* Section Header */}
                <div className="w-full flex items-center justify-between pb-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{section.title}</span>
                </div>

                {/* Rows in this tier */}
                {section.rows.map((row) => {
                  const tier = getTier(row);

                  return (
                    <div key={row} className="flex items-center justify-center gap-1.5 w-full">
                      {/* Left Row Label */}
                      <span className="w-5 text-center text-xs font-bold text-slate-400 select-none">
                        {row}
                      </span>

                      {/* Seats */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: SEATS_PER_ROW }, (_, idx) => {
                          const seatNum = idx + 1;
                          const label = `${row}${seatNum}`;
                          const sold = isSeatSold(label);
                          const selected = selectedSeats.includes(label);
                          const isHovered = hoveredSeat === label;

                          return (
                            <React.Fragment key={label}>
                              {/* Central Aisle Spacer */}
                              {seatNum === AISLE_GAP + 1 && (
                                <div className="w-5 flex items-center justify-center">
                                  <div className="w-0.5 h-3 bg-slate-200 rounded-full" />
                                </div>
                              )}

                              {/* Seat Button */}
                              <button
                                onClick={() => handleSeatClick(label)}
                                onMouseEnter={() => !sold && setHoveredSeat(label)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                disabled={sold}
                                className={`
                                  group relative flex items-center justify-center rounded-[5px] transition-all
                                  w-6 h-6 sm:w-7 sm:h-7 text-[10px] font-semibold select-none
                                  ${
                                    sold
                                      ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70'
                                      : selected
                                      ? 'bg-[#15803d] text-white font-bold border border-[#15803d] shadow-sm scale-105 z-10'
                                      : `bg-white border ${tier.colorClass} ${tier.textColor}`
                                  }
                                `}
                                title={sold ? `Seat ${label} (Already Booked)` : `Seat ${label} · ₹${tier.price}`}
                              >
                                {selected ? (
                                  <Check className="h-3 w-3 stroke-[3]" />
                                ) : sold ? (
                                  <span className="text-[9px] text-slate-400">✕</span>
                                ) : (
                                  <span>{seatNum}</span>
                                )}

                                {/* Hover tooltip */}
                                {isHovered && !sold && !selected && (
                                  <div
                                    className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded bg-slate-950 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md flex items-center gap-1"
                                  >
                                    <span>{label}</span>
                                    <span className="text-amber-400 font-extrabold">₹{tier.price}</span>
                                  </div>
                                )}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Right Row Label */}
                      <span className="w-5 text-center text-xs font-bold text-slate-400 select-none">
                        {row}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Legend Bar (BookMyShow Style) ─── */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-5 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-600 shadow-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-md bg-white border border-slate-300 flex items-center justify-center text-[9px] text-slate-600 font-bold">1</div>
            <span>Available</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-md bg-[#15803d] text-white flex items-center justify-center">
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </div>
            <span className="font-bold text-[#15803d]">Selected</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-[9px] text-slate-400">✕</div>
            <span className="text-slate-500 font-medium">Already Booked</span>
          </div>
        </div>

      </div>
    </div>
  );
}
