'use client';

import React, { useState } from 'react';
import { Home, Minus, Plus, HelpCircle, X } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

export default function BottomRightControls() {
  const triggerZoomIn = useBookingStore((s) => s.triggerZoomIn);
  const triggerZoomOut = useBookingStore((s) => s.triggerZoomOut);
  const triggerResetView = useBookingStore((s) => s.triggerResetView);
  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <>
      {/* Floating Controls Bar */}
      <div className="absolute bottom-20 sm:bottom-24 right-3 sm:right-4 z-20 flex items-center gap-1 rounded-xl border border-white/15 bg-black/60 p-1 backdrop-blur-xl shadow-lg pointer-events-auto">
        <button
          onClick={triggerResetView}
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          title="Reset Camera (Overview)"
        >
          <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        <button
          onClick={triggerZoomOut}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          onClick={triggerZoomIn}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition-colors ${
            legendOpen ? 'bg-amber-400 text-black font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          title="Seat Types & Legend"
        >
          <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>

      {/* Seat Legend Card */}
      {legendOpen && (
        <div className="absolute bottom-32 sm:bottom-36 right-3 sm:right-4 z-30 w-60 sm:w-64 rounded-2xl border border-white/15 bg-black/95 p-4 shadow-2xl pointer-events-auto text-xs space-y-3 backdrop-blur-xl text-white animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white text-sm">Seat Categories</span>
            <button
              onClick={() => setLegendOpen(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-md bg-slate-500/50 border border-slate-400/50" />
                <span className="text-white/80">Classic (A-D)</span>
              </div>
              <span className="font-bold text-white">₹150</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-md bg-emerald-500/40 border border-emerald-400/60" />
                <span className="text-white/80">Prime (E-K)</span>
              </div>
              <span className="font-bold text-white">₹240</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-md bg-amber-500/40 border border-amber-400/60" />
                <span className="text-white/80">Recliner (L-M)</span>
              </div>
              <span className="font-bold text-white">₹550</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-md bg-[#15803d]" />
                <span className="text-emerald-400 font-bold">Selected</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-md bg-white/10" />
                <span className="text-white/40">Sold / Occupied</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
