'use client';

import React, { useState } from 'react';
import { Camera, Volume2, VolumeX, UserCheck, Layers, Eye, Disc } from 'lucide-react';
import { CameraPreset } from '@/types';
import { useBookingStore } from '@/store/useBookingStore';
import { getBestSeats } from '@/lib/api';

interface CameraPresetBarProps {
  showId: number | null;
  cleanView?: boolean;
  onAlert?: (msg: string) => void;
}

const PRESETS: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
  { id: 'Overview', label: 'Overview', icon: <Eye className="h-3.5 w-3.5" /> },
  { id: 'Near screen', label: 'From Screen', icon: <Disc className="h-3.5 w-3.5" /> },
  { id: 'Balcony', label: 'Balcony', icon: <Layers className="h-3.5 w-3.5" /> },
  { id: 'Top view', label: 'Top view', icon: <Camera className="h-3.5 w-3.5" /> },
  { id: 'My Seat', label: 'Seat view', icon: <UserCheck className="h-3.5 w-3.5" /> },
];

export default function CameraPresetBar({ showId, cleanView = false, onAlert }: CameraPresetBarProps) {
  const cameraPreset = useBookingStore((s) => s.cameraPreset);
  const setCameraPreset = useBookingStore((s) => s.setCameraPreset);
  const activeSeat = useBookingStore((s) => s.activeSeatEyeView);
  const setActiveSeatEyeView = useBookingStore((s) => s.setActiveSeatEyeView);
  const soundEnabled = useBookingStore((s) => s.soundEnabled);
  const toggleSound = useBookingStore((s) => s.toggleSound);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const setSelectedSeats = useBookingStore((s) => s.setSelectedSeats);

  const [bestQty, setBestQty] = useState(2);
  const [loadingBest, setLoadingBest] = useState(false);

  if (cleanView) return null;

  const handleFindBestSeats = async () => {
    if (!showId) return;
    setLoadingBest(true);
    try {
      const best = await getBestSeats(showId, bestQty);
      if (best && best.length > 0) {
        setSelectedSeats(best);
        if (onAlert) {
          onAlert(`Selected ${best.length} prime center seats: ${best.join(', ')}`);
        }
      }
    } catch (err) {
      if (onAlert) {
        onAlert('Could not find contiguous center seats for this quantity.');
      }
    } finally {
      setLoadingBest(false);
    }
  };

  return (
    <div className="absolute top-20 sm:top-24 left-3 sm:left-6 right-3 sm:right-6 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
      {/* Left: Camera Presets Chips */}
      <div className="flex items-center gap-1 rounded-xl border border-white/6 bg-[#08090C]/90 p-1.5 backdrop-blur-xl shadow-xl pointer-events-auto">
        {PRESETS.map((p) => {
          const isActive = cameraPreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                if (p.id === 'My Seat') {
                  const targetSeat = activeSeat || selectedSeats[0] || 'F13';
                  setActiveSeatEyeView(targetSeat);
                } else {
                  setCameraPreset(p.id);
                }
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                isActive
                  ? 'bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/40'
                  : 'text-gray-400 hover:text-white'
              }`}
              title={p.label}
            >
              {p.icon}
              <span className="hidden md:inline">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: Best Seats Finder & Sound Toggle */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Best Seats Finder */}
        <div className="flex items-center rounded-xl border border-white/6 bg-[#08090C]/90 p-1 backdrop-blur-xl shadow-xl">
          <select
            value={bestQty}
            onChange={(e) => setBestQty(Number(e.target.value))}
            className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-300 focus:outline-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n} className="bg-[#08090C] text-white">
                {n} {n === 1 ? 'Seat' : 'Seats'}
              </option>
            ))}
          </select>
          <button
            onClick={handleFindBestSeats}
            disabled={loadingBest || !showId}
            className="flex items-center gap-1.5 rounded-lg bg-[#e8b634] px-3 py-1 text-xs font-semibold text-black transition-colors hover:bg-[#d9a826] disabled:opacity-50"
          >
            <span>Best seats</span>
          </button>
        </div>

        {/* 3D Screen Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 rounded-xl border border-white/6 p-2 backdrop-blur-xl shadow-xl transition-colors ${
            soundEnabled
              ? 'bg-white/10 text-white font-semibold'
              : 'bg-[#08090C]/90 text-gray-400 hover:text-white'
          }`}
          title={soundEnabled ? 'Mute 3D Trailer Audio' : 'Unmute 3D Trailer Audio'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline text-xs">
            {soundEnabled ? 'Sound on' : 'Sound off'}
          </span>
        </button>
      </div>
    </div>
  );
}
