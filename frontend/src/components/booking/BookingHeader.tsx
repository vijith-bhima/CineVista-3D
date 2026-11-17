'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Box,
  LayoutGrid,
  Eye,
  Monitor,
  Layers,
  Play,
  Square,
  Maximize2,
  ChevronDown,
  MapPin,
  Clock,
  Calendar,
} from 'lucide-react';
import { Theatre, Show, CameraPreset } from '@/types';
import { useBookingStore } from '@/store/useBookingStore';

interface BookingHeaderProps {
  movieId: number;
  movieTitle: string;
  theatres: Theatre[];
  selectedTheatreId: number | null;
  onSelectTheatre: (theatreId: number) => void;
  dates: { label: string; dateStr: string; isToday: boolean }[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  shows: Show[];
  selectedShowId: number | null;
  onSelectShow: (show: Show) => void;
}

export default function BookingHeader({
  movieId,
  movieTitle,
  theatres,
  selectedTheatreId,
  onSelectTheatre,
  dates,
  selectedDate,
  onSelectDate,
  shows,
  selectedShowId,
  onSelectShow,
}: BookingHeaderProps) {
  const cameraPreset = useBookingStore((s) => s.cameraPreset);
  const setCameraPreset = useBookingStore((s) => s.setCameraPreset);
  const isTouring = useBookingStore((s) => s.isTouring);
  const toggleTour = useBookingStore((s) => s.toggleTour);
  const viewMode = useBookingStore((s) => s.viewMode);
  const setViewMode = useBookingStore((s) => s.setViewMode);
  const activeSeat = useBookingStore((s) => s.activeSeatEyeView);
  const setIsTheatreView = useBookingStore((s) => s.setIsTheatreView);

  const selectedTheatre = theatres.find((t) => t.id === selectedTheatreId);
  const selectedShow = shows.find((s) => s.id === selectedShowId);

  // Dropdown states
  const [showTheatreDropdown, setShowTheatreDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const theatreRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (theatreRef.current && !theatreRef.current.contains(e.target as Node)) setShowTheatreDropdown(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDateDropdown(false);
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) setShowTimeDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Date';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <header className="absolute top-0 inset-x-0 z-30 pointer-events-none p-2 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        {/* ─── LEFT: Back Button + Movie Info (Floating minimal glass) ─── */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <Link
            href={`/movie/${movieId}`}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-black/70 border border-white/15 text-white/90 hover:bg-black/90 hover:text-white transition-all backdrop-blur-md shadow-lg"
            title="Back to Movie"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-white text-xs sm:text-base tracking-wide drop-shadow-sm truncate max-w-[180px] sm:max-w-none">
                {movieTitle}
              </h1>
              <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-300 border border-amber-400/30">
                {selectedShow?.format || 'IMAX 3D'}
              </span>
            </div>

            {/* Quick Details Chips */}
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              {/* Theatre Selector */}
              <div ref={theatreRef} className="relative">
                <button
                  onClick={() => {
                    setShowTheatreDropdown(!showTheatreDropdown);
                    setShowDateDropdown(false);
                    setShowTimeDropdown(false);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-black/60 border border-white/15 px-2 py-0.5 text-white/80 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md"
                >
                  <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="max-w-[110px] sm:max-w-[170px] truncate font-medium">
                    {selectedTheatre?.name || 'Select Theatre'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-white/50 shrink-0" />
                </button>

                {showTheatreDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl border border-white/15 bg-black/95 backdrop-blur-xl shadow-2xl p-1.5 z-50 max-h-60 overflow-y-auto">
                    {theatres.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTheatre(t.id);
                          setShowTheatreDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                          t.id === selectedTheatreId
                            ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold truncate">{t.name}</p>
                          <p className="text-[10px] text-white/50 truncate">{t.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Selector */}
              <div ref={dateRef} className="relative hidden xs:block">
                <button
                  onClick={() => {
                    setShowDateDropdown(!showDateDropdown);
                    setShowTheatreDropdown(false);
                    setShowTimeDropdown(false);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-black/60 border border-white/15 px-2 py-0.5 text-white/80 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md"
                >
                  <Calendar className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                  <ChevronDown className="h-3 w-3 text-white/50 shrink-0" />
                </button>

                {showDateDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 rounded-xl border border-white/15 bg-black/95 backdrop-blur-xl shadow-2xl p-1.5 z-50">
                    <div className="flex flex-col gap-1 min-w-[140px]">
                      {dates.map((d) => (
                        <button
                          key={d.dateStr}
                          onClick={() => {
                            onSelectDate(d.dateStr);
                            setShowDateDropdown(false);
                          }}
                          className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${
                            d.dateStr === selectedDate
                              ? 'bg-amber-400/20 text-amber-300 font-bold'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>{d.label}</span>
                          {d.isToday && <span className="text-[9px] bg-white/20 px-1 rounded">Today</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Showtime Selector */}
              <div ref={timeRef} className="relative">
                <button
                  onClick={() => {
                    setShowTimeDropdown(!showTimeDropdown);
                    setShowTheatreDropdown(false);
                    setShowDateDropdown(false);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-black/60 border border-white/15 px-2 py-0.5 text-white/80 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md"
                >
                  <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="font-bold text-emerald-400">{selectedShow?.showTime?.slice(0, 5) || 'Time'}</span>
                  <ChevronDown className="h-3 w-3 text-white/50 shrink-0" />
                </button>

                {showTimeDropdown && shows.length > 0 && (
                  <div className="absolute top-full left-0 mt-1.5 rounded-xl border border-white/15 bg-black/95 backdrop-blur-xl shadow-2xl p-1.5 z-50">
                    <div className="flex flex-col gap-1 min-w-[130px]">
                      {shows.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onSelectShow(s);
                            setShowTimeDropdown(false);
                          }}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                            s.id === selectedShowId
                              ? 'bg-amber-400/20 text-amber-300 font-bold'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="font-bold text-emerald-400">{s.showTime?.slice(0, 5)}</span>
                          <span className="text-[10px] text-white/50">{s.format || '3D'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Clean Docked Buttons (3D / 2D & Controls - Fully Visible on Mobile) ─── */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto self-end sm:self-center">
          {/* Mode Switch: 3D Theater / 2D Seat Map */}
          <div className="flex items-center rounded-xl bg-black/70 border border-white/15 p-1 backdrop-blur-md shadow-lg">
            <button
              onClick={() => setViewMode('3D')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] sm:text-xs font-bold transition-all ${
                viewMode === '3D'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Box className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>3D</span>
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] sm:text-xs font-bold transition-all ${
                viewMode === '2D'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>2D</span>
            </button>
          </div>

          {/* 3D-only Camera Dock: Overview, Tour, Immersion (Visible on all devices) */}
          {viewMode === '3D' && (
            <div className="flex items-center gap-1 rounded-xl bg-black/70 border border-white/15 p-1 backdrop-blur-md shadow-lg">
              <button
                onClick={() => setCameraPreset('Overview')}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] sm:text-xs font-medium transition-colors ${
                  cameraPreset === 'Overview' && !isTouring
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Overview"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Overview</span>
              </button>

              {/* Tour Button */}
              <button
                onClick={toggleTour}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold transition-colors ${
                  isTouring
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-amber-300 hover:bg-white/10'
                }`}
                title="Cinematic Hall Tour"
              >
                {isTouring ? <Square className="h-3 w-3 fill-black" /> : <Play className="h-3 w-3 fill-amber-300" />}
                <span>{isTouring ? 'Stop' : 'Tour'}</span>
              </button>

              {/* Theatre View Fullscreen */}
              <button
                onClick={() => setIsTheatreView(true)}
                className="flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                title="Enter Theatre View"
              >
                <Maximize2 className="h-3 w-3" />
                <span className="hidden sm:inline">Immersion</span>
              </button>
            </div>
          )}

          {/* Active Seat View indicator */}
          {activeSeat && viewMode === '3D' && (
            <button
              onClick={() => setCameraPreset('My Seat')}
              className={`flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-bold transition-all shadow-md backdrop-blur-md ${
                cameraPreset === 'My Seat'
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-black/70 text-white/90 border-white/15 hover:bg-black/90'
              }`}
            >
              <span>Seat {activeSeat}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
