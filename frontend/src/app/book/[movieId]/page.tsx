'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { X, Film } from 'lucide-react';
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

  // Press ESC to exit Theatre View
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTheatreView) {
        setIsTheatreView(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTheatreView, setIsTheatreView]);

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
        }
      })
      .catch((err) => {
        console.error('Failed to load shows:', err);
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
        />
      </div>

      {/* ─── 2. 2D Seat Map (Clean Light BookMyShow-style view when 2D is toggled) ─── */}
      {viewMode === '2D' && !isTheatreView && (
        <TwoDSeatMap seats={seats} />
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

          {/* 3D Floating Seat View Indicator */}
          {viewMode === '3D' && (cameraPreset === 'My Seat' || activeSeat) && (
            <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-800 shadow-xl backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Viewing from <strong className="text-slate-950 font-bold">{activeSeat || 'Selected Seat'}</strong> · drag or scroll to look around
                </span>
              </div>
            </div>
          )}

          {/* Bottom Summary Bar: Seat Chips, Live Price Total, Expandable Breakdown, Continue CTA */}
          <BottomSummaryBar onContinue={handleContinue} />
        </>
      )}
    </div>
  );
}
