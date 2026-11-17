'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface LegendBarProps {
  cleanView?: boolean;
}

export default function LegendBar({ cleanView = false }: LegendBarProps) {
  const [open, setOpen] = useState(false);

  if (cleanView) return null;

  return (
    <div className="absolute bottom-20 left-4 z-20 pointer-events-none">
      <div className="rounded-xl border border-white/6 bg-[#08090C]/90 backdrop-blur-xl shadow-xl p-1 pointer-events-auto">
        {/* Toggle Pill */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <Info className="h-3.5 w-3.5 text-gray-400" />
          <span>Seat legend</span>
          {open ? <ChevronDown className="h-3 w-3 text-gray-500" /> : <ChevronUp className="h-3 w-3 text-gray-500" />}
        </button>

        {/* Legend Content */}
        {open && (
          <div className="mt-1 flex flex-col gap-1.5 border-t border-white/6 pt-2 px-2 pb-1 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0284C7]" />
              <span>Standard (₹150)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#D97706]" />
              <span>Premium (₹250)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#9333EA]" />
              <span>Recliner (₹400)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#10B981]" />
              <span className="text-emerald-400 font-medium">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#252932]" />
              <span className="text-gray-500">Sold</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
