'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronUp, ChevronDown, Trash2, X } from 'lucide-react';
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
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Price calculations
  const seatTotal = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  const convenienceFee = selectedSeats.length > 0 ? 35 : 0;
  const finalTotal = seatTotal + convenienceFee;
  const hasSeats = selectedSeats.length > 0;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none p-2 sm:p-3">
      <div className="mx-auto max-w-3xl">

        {/* ─── Expandable Price Breakdown (Compact Popover) ─── */}
        {detailsOpen && hasSeats && (
          <div className="mb-2 max-w-xs ml-auto sm:ml-0 rounded-xl border border-white/15 bg-black/90 backdrop-blur-xl p-3 shadow-2xl pointer-events-auto text-xs space-y-2 text-white animate-fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="font-bold text-white">Price Breakdown</span>
              <button
                onClick={clearSeats}
                className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
              >
                <Trash2 className="h-2.5 w-2.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="space-y-1 text-white/80 text-[11px]">
              <div className="flex justify-between">
                <span>Seats ({selectedSeats.join(', ')})</span>
                <span className="font-semibold text-white">₹{seatTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fees</span>
                <span className="font-semibold text-white">₹{convenienceFee}</span>
              </div>
              <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-white text-xs">
                <span>Total</span>
                <span className="text-[#e8b634]">₹{finalTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Compact Streamlined Bottom Bar (Decreased Size, Sleek UI) ─── */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-black/75 backdrop-blur-xl px-3 sm:px-4 py-2 shadow-2xl pointer-events-auto">
          {/* Left: Selected Seats as compact chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            {hasSeats ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white/80 whitespace-nowrap hidden sm:inline">
                  {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}:
                </span>

                <div className="flex items-center gap-1">
                  {selectedSeats.map((seat) => (
                    <button
                      key={seat}
                      onClick={() => toggleSeat(seat)}
                      className="group flex items-center gap-1 rounded-md bg-white/10 hover:bg-rose-500/20 border border-white/15 hover:border-rose-400/40 px-1.5 py-0.5 text-[11px] font-bold text-white transition-colors"
                      title={`Click to remove ${seat}`}
                    >
                      <span>{seat}</span>
                      <X className="h-2.5 w-2.5 text-white/50 group-hover:text-rose-300" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="text-[10px] font-medium text-white/50 hover:text-white flex items-center ml-1 whitespace-nowrap"
                >
                  {detailsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
              </div>
            ) : (
              <span className="text-xs text-white/60 font-medium whitespace-nowrap">
                Select seats on the map or in 3D
              </span>
            )}
          </div>

          {/* Right: Total Price & Compact Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {hasSeats && (
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-white/50 hidden sm:inline">Total:</span>
                <span className="text-base sm:text-lg font-black text-[#e8b634]">
                  ₹{finalTotal}
                </span>
              </div>
            )}

            <button
              onClick={onContinue}
              disabled={!hasSeats}
              className={`flex items-center gap-1.5 rounded-lg px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-bold transition-all shadow-md ${
                hasSeats
                  ? 'bg-[#e8b634] hover:bg-[#d8a529] text-slate-950 shadow-[#e8b634]/20 hover:-translate-y-0.5 active:translate-y-0'
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
