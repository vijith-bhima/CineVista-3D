'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronUp, ChevronDown, Trash2, X, Eye } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

interface BottomSummaryBarProps {
  onContinue: () => void;
}

function getSeatPrice(seatLabel: string): number {
  const row = seatLabel.charAt(0);
  if (row >= 'L') return 550;
  if (row >= 'E') return 240;
  return 150;
}

export default function BottomSummaryBar({ onContinue }: BottomSummaryBarProps) {
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const clearSeats = useBookingStore((s) => s.clearSeats);
  const toggleSeat = useBookingStore((s) => s.toggleSeat);
  const setActiveSeatEyeView = useBookingStore((s) => s.setActiveSeatEyeView);
  const activeSeat = useBookingStore((s) => s.activeSeatEyeView);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Price calculations
  const seatTotal = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  const convenienceFee = selectedSeats.length > 0 ? 35 : 0;
  const finalTotal = seatTotal + convenienceFee;
  const hasSeats = selectedSeats.length > 0;
  const currentTargetSeat = activeSeat && selectedSeats.includes(activeSeat) ? activeSeat : selectedSeats[0];

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none p-2 sm:p-3">
      <div className="mx-auto max-w-4xl">

        {/* ─── Expandable Price Breakdown (Compact Popover) ─── */}
        {detailsOpen && hasSeats && (
          <div className="mb-2 max-w-xs ml-auto sm:ml-0 rounded-2xl border border-white/15 bg-black/95 backdrop-blur-xl p-3.5 shadow-2xl pointer-events-auto text-xs space-y-2 text-white animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-white">Price Breakdown</span>
              <button
                onClick={clearSeats}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="space-y-1.5 text-white/80 text-[11px]">
              <div className="flex justify-between">
                <span>Seats ({selectedSeats.join(', ')})</span>
                <span className="font-semibold text-white">₹{seatTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fees</span>
                <span className="font-semibold text-white">₹{convenienceFee}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-xs">
                <span>Total Amount</span>
                <span className="text-[#e8b634]">₹{finalTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Streamlined Bottom Action Bar ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-white/20 bg-black/85 backdrop-blur-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-2xl pointer-events-auto">
          {/* Left: Selected Seats chips + Clear Button */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            {hasSeats ? (
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Count Badge & Clear All */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/90">
                    {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
                  </span>
                  <button
                    onClick={clearSeats}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-md px-1.5 py-0.5 transition-colors"
                    title="Remove all selected seats"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>

                {/* Seat Removal Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {selectedSeats.map((seat) => (
                    <button
                      key={seat}
                      onClick={() => toggleSeat(seat)}
                      className="group flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-rose-500/25 border border-white/20 hover:border-rose-400/60 px-2 py-1 text-xs font-bold text-white transition-all shadow-sm active:scale-95"
                      title={`Click to remove seat ${seat}`}
                    >
                      <span>{seat}</span>
                      <X className="h-3 w-3 text-white/60 group-hover:text-rose-300 stroke-[2.5]" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70 font-medium whitespace-nowrap">
                  Click any seat in 3D or 2D to select (max 6)
                </span>
              </div>
            )}
          </div>

          {/* Center / Right: Dedicated "View from Seat" Option & Pay Now */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10">
            {/* ─── Prominent View from Seat Button ─── */}
            {hasSeats ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveSeatEyeView(currentTargetSeat)}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-500/30 hover:from-emerald-500/50 hover:to-teal-400/50 border border-emerald-400/70 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-100 transition-all shadow-lg shadow-emerald-950/40 hover:-translate-y-0.5 active:translate-y-0"
                  title="Experience 3D Sightline directly from this seat"
                >
                  <Eye className="h-3.5 w-3.5 text-emerald-400" />
                  <span>View from {currentTargetSeat}</span>
                </button>

                {/* If multiple seats selected, quick dropdown pills to switch target seat */}
                {selectedSeats.length > 1 && (
                  <div className="hidden md:flex items-center gap-0.5 bg-black/50 rounded-lg p-0.5 border border-white/10">
                    {selectedSeats.map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveSeatEyeView(s)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                          s === currentTargetSeat
                            ? 'bg-emerald-500 text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                        title={`View from seat ${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveSeatEyeView('F13')}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-all"
                title="Preview hall sightline from prime center seat F13"
              >
                <Eye className="h-3.5 w-3.5 text-amber-400" />
                <span>Preview Hall View</span>
              </button>
            )}

            {/* Price Total & Breakdown Toggle */}
            {hasSeats && (
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Toggle price details"
              >
                <span className="text-sm sm:text-base font-black text-[#e8b634]">
                  ₹{finalTotal}
                </span>
                {detailsOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5 text-white/50" />
                )}
              </button>
            )}

            {/* Pay Now / Select Seats CTA */}
            <button
              onClick={onContinue}
              disabled={!hasSeats}
              className={`flex items-center gap-1.5 rounded-xl px-4 sm:px-5 py-2 text-xs font-bold transition-all shadow-md ${
                hasSeats
                  ? 'bg-[#e8b634] hover:bg-[#d8a529] text-slate-950 shadow-[#e8b634]/25 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
              }`}
            >
              <span>{hasSeats ? 'Pay Now' : 'Select Seats'}</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
