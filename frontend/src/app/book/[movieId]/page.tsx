'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { X, Film, AlertCircle, Eye } from 'lucide-react';
import BookingHeader from '@/components/booking/BookingHeader';
import TopLeftMediaBar from '@/components/booking/TopLeftMediaBar';
import BottomLeftControls from '@/components/booking/BottomLeftControls';
import BottomRightControls from '@/components/booking/BottomRightControls';
import SeatTooltip from '@/components/booking/SeatTooltip';
import BottomSummaryBar from '@/components/booking/BottomSummaryBar';
import TwoDSeatMap from '@/components/booking/TwoDSeatMap';
import { getMovie, getTheatres, getShows, getSeats } from '@/lib/api';
import { Movie, Theatre, Show, Seat } from '@/types';
import { useBookingStore } from '@/store/useBookingStore';

// Dynamic import with SSR disabled for Three.js 3D Canvas
const CinemaCanvas = dynamicImport(() => import('@/three/CinemaCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#07080B]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8b634] border-t-transparent" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Loading 3D Auditorium...
        </span>
      </div>
    </div>
  ),
});

export default function BookTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = Number(params.movieId);

  const paramTheatreId = searchParams.get('theatreId');
  const paramDate = searchParams.get('date');
  const paramShowId = searchParams.get('showId');
  const paramView = searchParams.get('view');

  const setViewModeStore = useBookingStore((s) => s.setViewMode);
  useEffect(() => {
    if (paramView === '2D') {
      setViewModeStore('2D');
    }
  }, [paramView, setViewModeStore]);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const showAlert = useCallback((msg: string) => {
    setAlertMessage(msg);
    const timer = setTimeout(() => setAlertMessage(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Zustand state
  const setSelectedMovieStore = useBookingStore((s) => s.setSelectedMovie);
  const setSelectedTheatreStore = useBookingStore((s) => s.setSelectedTheatre);
  const setSelectedDateStore = useBookingStore((s) => s.setSelectedDate);
  const setSelectedShowStore = useBookingStore((s) => s.setSelectedShow);
  const isTheatreView = useBookingStore((s) => s.isTheatreView);
  const setIsTheatreView = useBookingStore((s) => s.setIsTheatreView);
  const activeSeat = useBookingStore((s) => s.activeSeatEyeView);
  const cameraPreset = useBookingStore((s) => s.cameraPreset);
  const viewMode = useBookingStore((s) => s.viewMode);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);

  // Press ESC to exit Theatre View or Seat POV
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTheatreView) {
          setIsTheatreView(false);
        } else if (cameraPreset === 'My Seat') {
          useBookingStore.getState().setCameraPreset('Overview');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTheatreView, setIsTheatreView, cameraPreset]);

  // Generate 7 days starting today
  const next7Days = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      list.push({
        label: `${dayName} ${dayNum}`,
        dateStr,
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  // 1. Initial Load: Movie & Theatres
  useEffect(() => {
    if (!movieId) return;
    const initialDate = paramDate || next7Days[0]?.dateStr || '';
    setSelectedDate(initialDate);

    Promise.all([getMovie(movieId), getTheatres()])
      .then(([m, tList]) => {
        setMovie(m);
        setSelectedMovieStore(m);
        setTheatres(tList);
        if (tList.length > 0) {
          const chosenTId = paramTheatreId ? Number(paramTheatreId) : tList[0].id;
          setSelectedTheatreId(chosenTId);
          const found = tList.find((t) => t.id === chosenTId) || tList[0];
          setSelectedTheatreStore(found);
        }
      })
      .catch((err) => {
        console.error('Failed to load movie/theatres:', err);
        setLoading(false);
      });
  }, [movieId, next7Days, paramDate, paramTheatreId, setSelectedMovieStore, setSelectedTheatreStore]);

  // 2. Fetch Shows
  useEffect(() => {
    if (!movieId || !selectedDate) return;

    getShows(movieId, selectedDate, selectedTheatreId || undefined)
      .then((sList) => {
        setShows(sList);
        if (sList.length > 0) {
          const matchingShow = paramShowId
            ? sList.find((s) => s.id === Number(paramShowId))
            : null;
          const chosenShow = matchingShow || sList[0];
          setSelectedShow(chosenShow);
          setSelectedShowStore(chosenShow);
        } else {
          setSelectedShow(null);
          setSelectedShowStore(null);
          setSeats([]);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load shows:', err);
        setLoading(false);
      });
  }, [movieId, selectedDate, selectedTheatreId, paramShowId, setSelectedShowStore]);

  // 3. Fetch Seats when Selected Show changes
  const reloadSeats = useCallback((showId: number) => {
    getSeats(showId)
      .then((seatList) => {
        setSeats(seatList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load seats:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedShow) {
      setLoading(true);
      reloadSeats(selectedShow.id);
    }
  }, [selectedShow, reloadSeats]);

  // Real-time live seat database synchronization (auto-polls PostgreSQL for seat status updates)
  useEffect(() => {
    if (!selectedShow) return;

    const syncInterval = setInterval(() => {
      getSeats(selectedShow.id)
        .then((latestSeats) => {
          setSeats((prevSeats) => {
            const hasChanged = latestSeats.some((newSeat, idx) => {
              const oldSeat = prevSeats[idx];
              return !oldSeat || oldSeat.status !== newSeat.status;
            });
            return hasChanged ? latestSeats : prevSeats;
          });
        })
        .catch(() => {});
    }, 3500);

    return () => clearInterval(syncInterval);
  }, [selectedShow]);

  const handleSelectTheatre = (tId: number) => {
    setSelectedTheatreId(tId);
    const found = theatres.find((t) => t.id === tId) || null;
    setSelectedTheatreStore(found);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedDateStore(dateStr);
  };

  const handleSelectShow = (show: Show) => {
    setSelectedShow(show);
    setSelectedShowStore(show);
  };

  const handleContinue = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8b634] border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Auditorium
          </span>
        </div>
      </div>
    );
  }

  if (!movie || !selectedShow) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-4 bg-[#FAFAFA]">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Film className="h-6 w-6 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Shows Available</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          There are no scheduled screenings for this date or theatre. Please choose another option.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-[#e8b634] px-5 py-2 text-xs font-bold text-slate-950 hover:bg-[#d8a529] transition-colors"
        >
          Return to Movies
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        isTheatreView
          ? 'fixed inset-0 z-[100] h-screen h-[100dvh] w-screen overflow-hidden bg-black'
          : 'relative h-[calc(100vh-4rem)] h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#07080B]'
      }
    >
      {/* ─── 1. 100% Full-Bleed 3D Cinema Theater Canvas (Untouched & Always Ready) ─── */}
      <div className="absolute inset-0 h-full w-full">
        <CinemaCanvas
          trailerUrl={movie?.trailerUrl || movie?.teaserUrl}
          seats={seats}
          onSeatClick={(label) => {
            const currentSelected = useBookingStore.getState().selectedSeats;
            if (currentSelected.length >= 6 && !currentSelected.includes(label)) {
              showAlert('Maximum of 6 seats can be selected per booking');
            }
          }}
        />
      </div>

      {/* ─── 2. 2D Seat Map (Clean Light BookMyShow-style view when 2D is toggled) ─── */}
      {viewMode === '2D' && !isTheatreView && (
        <TwoDSeatMap seats={seats} />
      )}

      {/* ─── Top Floating Sightline POV Mode HUD (Only when in My Seat preset) ─── */}
      {viewMode === '3D' && cameraPreset === 'My Seat' && activeSeat && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-fade-in w-full max-w-lg px-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/50 bg-black/90 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="truncate">
                <span className="text-white/70">Sitting in:</span>{' '}
                <strong className="text-emerald-300 font-extrabold text-sm">{activeSeat}</strong>
                <span className="hidden sm:inline text-white/50 text-[11px] ml-2">↔ Drag to look around</span>
              </div>
            </div>

            {/* If multiple seats selected, quick pills to toggle perspective */}
            {selectedSeats.length > 1 && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-white/50 hidden sm:inline">Switch:</span>
                {selectedSeats.map((s) => (
                  <button
                    key={s}
                    onClick={() => useBookingStore.getState().setActiveSeatEyeView(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      s === activeSeat
                        ? 'bg-emerald-500 text-black shadow'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Exit POV Button */}
            <button
              onClick={() => {
                useBookingStore.getState().setCameraPreset('Overview');
              }}
              className="flex items-center gap-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-2.5 py-1 text-xs font-bold text-white transition-all shrink-0 hover:scale-105 active:scale-95"
              title="Return to Hall Overview"
            >
              <X className="h-3.5 w-3.5" />
              <span>Exit POV</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Toast Alert Notification (Max Seats, etc.) ─── */}
      {alertMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
          <div className="rounded-2xl border border-amber-400/80 bg-black/95 px-4 py-2 text-xs font-bold text-amber-300 shadow-2xl backdrop-blur-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{alertMessage}</span>
          </div>
        </div>
      )}

      {/* ─── 3. Fullscreen Theatre Mode HUD ─── */}
      {isTheatreView ? (
        <div className="absolute top-5 right-5 z-50 flex items-center gap-3">
          <button
            onClick={() => setIsTheatreView(false)}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-xl hover:border-amber-400 hover:bg-black/95 hover:text-amber-300 transition-all group"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Theatre View Active</span>
            <span className="text-gray-400 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 ml-1">
              ESC to Exit
            </span>
            <X className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      ) : (
        <>
          {/* Top Navigation Bar: Title, Theatre, Date, Time, 3D/2D switch, Camera Presets */}
          <BookingHeader
            movieId={movieId}
            movieTitle={movie?.title || 'Loading...'}
            theatres={theatres}
            selectedTheatreId={selectedTheatreId}
            onSelectTheatre={handleSelectTheatre}
            dates={next7Days}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            shows={shows}
            selectedShowId={selectedShow?.id || null}
            onSelectShow={handleSelectShow}
          />

          {/* 3D Floating Media Bar (Play/Pause, Sound) */}
          {viewMode === '3D' && (
            <TopLeftMediaBar movieTitle={movie?.title} />
          )}

          {/* 3D Seat Tooltip on Hover */}
          {viewMode === '3D' && (
            <SeatTooltip />
          )}

          {/* 3D Bottom Left Lights & 4K badge */}
          {viewMode === '3D' && (
            <BottomLeftControls />
          )}

          {/* 3D Bottom Right Zoom & Reset controls */}
          {viewMode === '3D' && (
            <BottomRightControls />
          )}

          {/* Bottom Summary Bar: Seat Chips, Live Price Total, Expandable Breakdown, Continue CTA */}
          <BottomSummaryBar onContinue={handleContinue} />
        </>
      )}
    </div>
  );
}
