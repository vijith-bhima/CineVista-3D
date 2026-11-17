'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  Heart,
  Ticket,
  Utensils,
  Info,
  Film,
  Compass,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Tv,
  Smartphone,
  X,
} from 'lucide-react';
import { getTheatres, getMovies, getShows } from '@/lib/api';
import { Theatre, Movie, Show } from '@/types';

const THEATRE_IMAGES: Record<string, string> = {
  'CineVista Grand IMAX': '/Theater-images/CineVista Grand IMAX.jpg',
  'StarPlex Cinemas': '/Theater-images/StarPlex Cinemas.jpg',
  'Metro Cine Lounge': '/Theater-images/Metro Cine Lounge.jpg',
  'Galaxy Multiplex': '/Theater-images/Galaxy Multiplex.jpg',
  'INOX Megacity Mall': '/Theater-images/INOX Megacity Mall.jpg',
  'PVR Phoenix Plex': '/Theater-images/PVR Phoenix Plex.jpg',
  'Cinepolis': '/Theater-images/Cinepolis.jpg',
  'Trendset Mall Cinema': '/Theater-images/Trendset Mall Cinema.jpg',
  'Capital Cinemas Trendset Mall, Vijayawada': '/Theater-images/Trendset Mall Cinema.jpg',
  'PVP Square Mall': '/Theater-images/PVP Square Mall.jpg',
};

export default function TheatreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const theatreId = Number(params.id);

  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('ALL');
  const [hoveredShowId, setHoveredShowId] = useState<number | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

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
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      list.push({
        dayName,
        dayNum,
        monthName,
        dateStr,
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(next7Days[0]?.dateStr || '');

  useEffect(() => {
    if (!theatreId) return;

    Promise.all([getTheatres(), getMovies(), getShows(undefined, undefined, theatreId)])
      .then(([tList, mList, sList]) => {
        let t = tList.find((item) => item.id === theatreId) || null;
        if (t && t.name.includes('Trendset')) {
          t = { ...t, name: 'Capital Cinemas Trendset Mall, Vijayawada' };
        }
        setTheatre(t);
        setMovies(mList);
        setShows(sList);

        // Featured movie for trailer
        const featured = mList.find((m) => m.id === 4 || m.featured) || mList[0] || null;
        setFeaturedMovie(featured);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching theatre data:', err);
        setLoading(false);
      });
  }, [theatreId]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8b634] border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading Theatre</span>
        </div>
      </div>
    );
  }

  if (!theatre) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-4 bg-[#FAFAFA]">
        <Tv className="h-10 w-10 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Theatre Not Found</h2>
        <Link
          href="/"
          className="mt-4 rounded-lg bg-[#e8b634] px-5 py-2 text-xs font-bold text-black hover:bg-[#d8a529] transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const theatreImg = THEATRE_IMAGES[theatre.name] || '/Theater-images/Trendset Mall Cinema.jpg';
  const trailerVideo = featuredMovie?.teaserUrl || featuredMovie?.trailerUrl || '/media/trailers/Amaran.mp4';

  // Filter shows by selected date & format
  let filteredShows = shows.filter((s) => {
    const matchesDate = !selectedDate || s.showDate === selectedDate;
    const matchesFormat =
      selectedFormat === 'ALL' ||
      (s.format && s.format.toUpperCase().includes(selectedFormat.toUpperCase()));

    let matchesTime = true;
    if (selectedTimeSlot !== 'ALL') {
      const hour = parseInt(s.showTime.split(':')[0], 10);
      if (selectedTimeSlot === 'MORNING' && hour >= 12) matchesTime = false;
      if (selectedTimeSlot === 'AFTERNOON' && (hour < 12 || hour >= 16)) matchesTime = false;
      if (selectedTimeSlot === 'AFTER_5PM' && hour < 17) matchesTime = false;
    }

    return matchesDate && matchesFormat && matchesTime;
  });

  // If no shows match current date, fallback to all shows for this venue
  if (filteredShows.length === 0) {
    filteredShows = shows;
  }

  // Group shows by movie
  const moviesWithShows = movies
    .map((m) => {
      const mShows = filteredShows.filter((s) => s.movieId === m.id);
      return {
        movie: m,
        shows: mShows,
      };
    })
    .filter((item) => item.shows.length > 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans antialiased">
      {/* =========================================================================
          1. Fullscreen Cinema Hero with Playing Trailer
          ========================================================================= */}
      <section className="relative h-[80vh] sm:h-[86vh] w-full overflow-hidden select-none bg-black">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            key={trailerVideo}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            className="h-full w-full object-cover filter brightness-[0.9]"
            poster={featuredMovie?.posterUrl}
          >
            <source src={trailerVideo} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Top Back Link */}
        <div className="absolute top-5 left-5 sm:top-6 sm:left-8 z-20 pointer-events-auto">
          <Link
            href="/#theatres"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-black/80 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Theatres</span>
          </Link>
        </div>

        {/* Bottom Lower-Third Area: Clean Theatre Image & Details */}
        <div className="absolute bottom-8 inset-x-0 z-20 px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-end justify-between gap-6 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            {/* Theatre Architectural Photo */}
            <img
              src={theatreImg}
              alt={theatre.name}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border border-white/25 shadow-2xl flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = '/Theater-images/Trendset Mall Cinema.jpg';
              }}
            />

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white">
                <span className="rounded bg-white/20 px-2 py-0.5">
                  Multiplex
                </span>
                <span className="rounded bg-white/20 px-2 py-0.5">
                  {theatre.distanceKm} km away
                </span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-wide drop-shadow-md">
                {theatre.name}
              </h1>

              <p className="text-xs text-white/90 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#e8b634]" />
                <span>{theatre.location}</span>
              </p>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center gap-3 pointer-events-auto self-end">
            <button
              onClick={toggleAudio}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/80 transition-colors"
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4 text-gray-300" />
                  <span>Sound Off</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-[#e8b634] animate-pulse" />
                  <span>Sound On</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. Clean Sticky Date Selector Bar (Gold Active & Hover Accent)
          ========================================================================= */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 overflow-x-auto py-3 scrollbar-none">
            {next7Days.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center rounded-xl min-w-[68px] py-2 px-3 transition-all ${
                    isSelected
                      ? 'bg-[#e8b634] text-slate-950 shadow-md font-black ring-2 ring-[#e8b634]/50'
                      : 'text-slate-700 bg-white border border-slate-200 hover:border-[#e8b634] hover:bg-[#e8b634]/15 hover:text-slate-950'
                  }`}
                >
                  <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                    {d.isToday ? 'TODAY' : d.dayName}
                  </span>
                  <span className="text-lg font-black leading-tight my-0.5">
                    {d.dayNum}
                  </span>
                  <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                    {d.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. Filter Chips Bar (Gold Active & Hover Accent)
          ========================================================================= */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="text-slate-400 text-xs font-medium mr-1">Formats:</span>
            {['ALL', '3D', 'IMAX 3D', '4DX', '2D'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`rounded-full px-3.5 py-1.5 transition-all border ${
                  selectedFormat === fmt
                    ? 'bg-[#e8b634] border-[#e8b634] text-slate-950 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#e8b634] hover:bg-[#e8b634]/15 hover:text-slate-950'
                }`}
              >
                {fmt === 'ALL' ? 'All Formats' : fmt}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {[
              { label: 'Morning', val: 'MORNING' },
              { label: 'After 5 PM', val: 'AFTER_5PM' },
            ].map((slot) => (
              <button
                key={slot.val}
                onClick={() => setSelectedTimeSlot(selectedTimeSlot === slot.val ? 'ALL' : slot.val)}
                className={`rounded-full px-3.5 py-1.5 transition-all border ${
                  selectedTimeSlot === slot.val
                    ? 'bg-[#e8b634] border-[#e8b634] text-slate-950 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#e8b634] hover:bg-[#e8b634]/15 hover:text-slate-950'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Available</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Fast Filling</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Almost Full</span>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. Notice Strip
          ========================================================================= */}
      <div className="bg-slate-50 border-b border-slate-200 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#e8b634]" />
            <span className="font-semibold text-slate-800">Bookings open for shows tomorrow</span>
            <span className="hidden sm:inline text-slate-500">
              — All screenings at {theatre.name} feature 4K Christie Laser and RGB Laser projection.
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. Movies Playing at this Theatre (Clean Light Layout, Premium Showtime UI)
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-5">
          {moviesWithShows.length > 0 ? (
            moviesWithShows.map(({ movie, shows }) => (
              <div
                key={movie.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
              >
                {/* Movie Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="h-16 w-12 sm:h-20 sm:w-14 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = '1';
                          target.src = movie.posterUrl.replace('/media/posters/', '/posters/');
                        }
                      }}
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/movie/${movie.id}`}
                          className="font-extrabold text-base sm:text-lg text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {movie.title}
                        </Link>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {movie.language}
                        </span>
                        <span className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold">
                          U/A 16+
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {movie.rating.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{movie.genre}</span>
                        <span>•</span>
                        <span>{Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/movie/${movie.id}`}
                    className="self-start md:self-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors"
                  >
                    View Movie Details
                  </Link>
                </div>

                {/* Showtimes Grid */}
                <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
                  {shows.map((show, idx) => {
                    const timeFormatted = show.showTime.slice(0, 5);
                    const isImax = (show.format || theatre.formats || '').includes('IMAX');
                    const is4Dx = (show.format || theatre.formats || '').includes('4DX');
                    const price = show.basePrice || (isImax ? 380 : 250);

                    let screenTech = '3D';
                    if (idx % 3 === 0) screenTech = 'SC 4 CHRISTIE 4K';
                    else if (idx % 2 === 0) screenTech = 'VC RGB LASER 4K';
                    else if (isImax) screenTech = 'IMAX 3D';

                    return (
                      <div
                        key={show.id}
                        className="relative"
                        onMouseEnter={() => setHoveredShowId(show.id)}
                        onMouseLeave={() => setHoveredShowId(null)}
                      >
                        <Link
                          href={`/book/${movie.id}?theatreId=${theatre.id}&date=${selectedDate}&showId=${show.id}`}
                          className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-[#e8b634] hover:bg-[#e8b634]/5 px-4 sm:px-5 py-2.5 sm:py-3 text-center transition-all min-w-[130px] sm:min-w-[140px] hover:shadow-md hover:-translate-y-0.5"
                        >
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 group-hover:text-amber-700">
                            {screenTech}
                          </span>

                          <span className="text-base sm:text-lg font-black text-[#15803d] group-hover:text-emerald-700 leading-tight">
                            {timeFormatted}
                          </span>

                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-1">
                            <span>{show.format || '3D'}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">₹{price}</span>
                          </div>
                        </Link>

                        {/* Hover Tooltip */}
                        {hoveredShowId === show.id && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-xl pointer-events-none">
                            <span>Classic: ₹{price - 50} • Prime: ₹{price} • Recliner: ₹{price + 130}</span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-900" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              <Film className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <span>No shows scheduled for this date and filter. Please pick another date above.</span>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          6. Venue Guidelines Modal
          ========================================================================= */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl border border-slate-200">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <MapPin className="h-5 w-5 text-[#e8b634] flex-shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-900">{theatre.name}</h3>
                <p className="text-xs text-slate-500">{theatre.location}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Venue Guidelines</h4>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  <li>M-Ticket accepted on your mobile device.</li>
                  <li>Multi-level mall basement parking available.</li>
                  <li>Outside food and beverages are not allowed inside auditoriums.</li>
                  <li>Sanitized 3D glasses provided at entrance.</li>
                </ul>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Projection & Audio</h4>
                <p className="text-slate-600 leading-relaxed">
                  Equipped with Christie 4K Laser & VC RGB Laser projection systems with Dolby Atmos surround audio.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="rounded-lg bg-[#e8b634] px-5 py-2 text-xs font-bold text-black hover:bg-[#d8a529] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
