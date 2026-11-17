'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  Clock,
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Film,
  MapPin,
  Calendar,
  Sparkles,
  Heart,
  Smartphone,
  Utensils,
  Info,
  X,
  Compass,
} from 'lucide-react';
import { getMovie, getTheatres, getShows } from '@/lib/api';
import { Movie, Theatre, Show } from '@/types';

// Map each theatre to its local architectural photography asset
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

function getMovieCredits(title: string) {
  const creditsMap: Record<string, { cast: string; director: string }> = {
    'Ramayana': { cast: 'Ranbir Kapoor, Yash, Sai Pallavi', director: 'Nitesh Tiwari' },
    'Ramayana: The Legend': { cast: 'Ranbir Kapoor, Yash, Sai Pallavi', director: 'Nitesh Tiwari' },
    'Amaran': { cast: 'Sivakarthikeyan, Sai Pallavi, Bhuvan Arora', director: 'Rajkumar Periasamy' },
    'Kalki 2898 AD': { cast: 'Prabhas, Amitabh Bachchan, Kamal Haasan', director: 'Nag Ashwin' },
    'RRR (Rise Roar Revolt)': { cast: 'NTR Jr., Ram Charan, Alia Bhatt', director: 'S. S. Rajamouli' },
    'Pushpa 2: The Rule': { cast: 'Allu Arjun, Rashmika Mandanna, Fahadh Faasil', director: 'Sukumar' },
    'Baahubali: The Conclusion': { cast: 'Prabhas, Rana Daggubati, Anushka Shetty', director: 'S. S. Rajamouli' },
    'Salaar: Part 1 – Ceasefire': { cast: 'Prabhas, Prithviraj Sukumaran, Shruti Haasan', director: 'Prashanth Neel' },
    'K.G.F: Chapter 2': { cast: 'Yash, Sanjay Dutt, Raveena Tandon', director: 'Prashanth Neel' },
    'Vikram': { cast: 'Kamal Haasan, Vijay Sethupathi, Fahadh Faasil', director: 'Lokesh Kanagaraj' },
    'They Call Him OG': { cast: 'Pawan Kalyan, Emraan Hashmi, Priyanka Mohan', director: 'Sujeeth' },
    'Aakasamlo Oka Tara': { cast: 'Dulquer Salmaan, Sai Pallavi', director: 'Pavan Sadineni' },
    'Om: The Battle Within': { cast: 'Aditya Roy Kapur, Sanjana Sanghi, Jackie Shroff', director: 'Kapil Verma' },
    'Jailer 2': { cast: 'Rajinikanth, Mohanlal, Shiva Rajkumar', director: 'Nelson Dilipkumar' },
    'Arjun Reddy': { cast: 'Vijay Deverakonda, Shalini Pandey', director: 'Sandeep Reddy Vanga' },
    'Sita Ramam': { cast: 'Dulquer Salmaan, Mrunal Thakur, Rashmika Mandanna', director: 'Hanu Raghavapudi' },
    'Scene': { cast: 'Mohanlal, Meena, Ansiba Hassan', director: 'Jeethu Joseph' },
  };
  return creditsMap[title] || { cast: 'Ensemble Cast', director: 'CineVista Director' };
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = Number(params.id);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Filter states
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('ALL');
  const [likedTheatres, setLikedTheatres] = useState<Record<number, boolean>>({});
  const [infoModalTheatre, setInfoModalTheatre] = useState<Theatre | null>(null);
  const [hoveredShowId, setHoveredShowId] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const showtimesRef = useRef<HTMLDivElement | null>(null);

  // 7 days starting today
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
    if (!movieId) return;
    Promise.all([getMovie(movieId), getTheatres(), getShows(movieId)])
      .then(([m, tList, sList]) => {
        setMovie(m);
        const enhancedTheatres = tList.map((t) => {
          if (t.name.includes('Trendset')) {
            return { ...t, name: 'Capital Cinemas Trendset Mall, Vijayawada' };
          }
          if (t.name.includes('INOX')) {
            return { ...t, name: 'INOX Megacity Mall, M.G. Road' };
          }
          if (t.name.includes('PVR')) {
            return { ...t, name: 'PVR Phoenix Plex, Benz Circle' };
          }
          return t;
        });
        setTheatres(enhancedTheatres);
        setShows(sList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching movie details:', err);
        setLoading(false);
      });
  }, [movieId]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleLike = (theatreId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTheatres((prev) => ({ ...prev, [theatreId]: !prev[theatreId] }));
  };

  const scrollToShows = () => {
    if (showtimesRef.current) {
      showtimesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#FAFAFA] dark:bg-[#07080B]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8b634] border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading Showtimes</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-4 bg-[#FAFAFA] dark:bg-[#07080B]">
        <Film className="h-10 w-10 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Movie Not Found</h2>
        <Link
          href="/"
          className="mt-4 rounded-lg bg-[#e8b634] px-5 py-2 text-xs font-bold text-black hover:bg-[#d8a529] transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const hours = Math.floor(movie.durationMinutes / 60);
  const mins = movie.durationMinutes % 60;
  const durationText = `${hours}h ${mins}m`;
  const videoSource = movie.trailerUrl || movie.teaserUrl || '/media/trailers/Amaran.mp4';

  // Filter shows by date & format
  const dateShows = shows.filter((s) => {
    const matchesDate = !selectedDate || s.showDate === selectedDate;
    const matchesFormat =
      selectedFormat === 'ALL' ||
      (s.format && s.format.toUpperCase().includes(selectedFormat.toUpperCase()));

    let matchesTime = true;
    if (selectedTimeSlot !== 'ALL') {
      const hour = parseInt(s.showTime.split(':')[0], 10);
      if (selectedTimeSlot === 'MORNING' && hour >= 12) matchesTime = false;
      if (selectedTimeSlot === 'AFTERNOON' && (hour < 12 || hour >= 16)) matchesTime = false;
      if (selectedTimeSlot === 'EVENING' && (hour < 16 || hour >= 20)) matchesTime = false;
      if (selectedTimeSlot === 'AFTER_5PM' && hour < 17) matchesTime = false;
    }

    return matchesDate && matchesFormat && matchesTime;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#07080B] text-slate-900 dark:text-white font-sans antialiased transition-colors duration-200">
      {/* =========================================================================
          1. RESPONSIVE TRAILER HERO:
             - MOBILE: Clean 16:9 Uncropped Video Box Container
             - DESKTOP: Stunning Full-Height Immersive Cinematic Background View
          ========================================================================= */}

      {/* --- MOBILE VIEW (< 640px): 16:9 Uncropped Box Container --- */}
      <section className="block sm:hidden bg-black pt-3 pb-5 px-3 border-b border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Movies</span>
            </Link>
          </div>

          <div className="relative w-full aspect-[16/9] bg-black rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center">
            <img
              src={movie.posterUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover filter blur-xl opacity-30 pointer-events-none"
            />
            {!videoError && videoSource ? (
              <video
                ref={videoRef}
                key={videoSource}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                className="relative z-10 h-full w-full object-contain"
                poster={movie.posterUrl}
              >
                <source src={videoSource} type="video/mp4" />
              </video>
            ) : (
              <img src={movie.posterUrl} alt={movie.title} className="relative z-10 h-full w-full object-contain" />
            )}

            <div className="absolute bottom-2.5 right-2.5 z-20">
              <button
                onClick={toggleAudio}
                className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md shadow-lg"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-gray-300" /> : <Volume2 className="h-3.5 w-3.5 text-[#e8b634]" />}
                <span>{isMuted ? 'Mute' : 'Audio'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 pt-1 text-white">
            <div className="flex items-start gap-3 min-w-0">
              <img src={movie.posterUrl} alt={movie.title} className="h-20 w-14 rounded-lg object-cover object-top shrink-0 border border-white/20" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold mb-1">
                  <span className="rounded bg-white/20 px-1.5 py-0.5">{movie.language}</span>
                  <span className="rounded bg-white/20 px-1.5 py-0.5">{durationText}</span>
                  <span className="rounded bg-[#e8b634] text-black px-1.5 py-0.5 font-black">U/A 16+</span>
                </div>
                <h1 className="font-display font-black text-xl text-white truncate">{movie.title}</h1>
                <p className="text-xs text-amber-400 font-bold mt-0.5">★ {movie.rating.toFixed(1)} / 10 • {movie.genre}</p>
              </div>
            </div>

            <button
              onClick={scrollToShows}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#e8b634] px-4 py-2.5 text-xs font-black text-black shadow-md"
            >
              <span>Book</span>
            </button>
          </div>
        </div>
      </section>

      {/* --- DESKTOP / LAPTOP VIEW (>= 640px): Original Immersive Fullscreen Cinematic View --- */}
      <section className="hidden sm:block relative h-[82vh] sm:h-[88vh] w-full overflow-hidden select-none bg-black">
        <div className="absolute inset-0 z-0">
          {!videoError && videoSource ? (
            <video
              ref={videoRef}
              key={videoSource}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              onError={() => {
                if (videoRef.current && !videoRef.current.dataset.triedFallback) {
                  videoRef.current.dataset.triedFallback = '1';
                  videoRef.current.src = videoSource.replace('/media/trailers/', '/trailers/');
                  videoRef.current.play().catch(() => {});
                } else {
                  setVideoError(true);
                }
              }}
              className="h-full w-full object-cover filter brightness-[0.9]"
              poster={movie.posterUrl}
            >
              <source src={videoSource} type="video/mp4" />
            </video>
          ) : (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover filter brightness-[0.7]"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30 pointer-events-none" />
        </div>

        <div className="absolute top-6 left-8 z-20 pointer-events-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-black/80 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Movies</span>
          </Link>
        </div>

        <div className="absolute bottom-8 inset-x-0 z-20 px-6 sm:px-8 lg:px-12 flex items-end justify-between gap-6 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="h-28 w-20 rounded-xl object-cover border border-white/25 shadow-2xl flex-shrink-0"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = movie.posterUrl.replace('/media/posters/', '/posters/');
                }
              }}
            />

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white">
                <span className="rounded bg-white/20 px-2 py-0.5">{movie.language}</span>
                <span className="rounded bg-white/20 px-2 py-0.5">{durationText}</span>
                <span className="rounded bg-[#e8b634] text-black px-2 py-0.5 font-black">U/A 16+</span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide drop-shadow-md">
                {movie.title}
              </h1>

              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <span className="flex items-center gap-1 font-bold text-[#e8b634]">
                  <Star className="h-4 w-4 fill-[#e8b634] text-[#e8b634]" />
                  {movie.rating.toFixed(1)} / 10
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/90">{movie.genre}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
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

            <button
              onClick={scrollToShows}
              className="inline-flex items-center gap-2 rounded-full bg-[#e8b634] hover:bg-[#d8a529] px-7 py-2.5 text-sm font-black text-black transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Book Showtimes</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. Clean Sticky Date Selector Bar
          ========================================================================= */}
      <div className="sticky top-16 z-30 bg-white dark:bg-[#0c0e14] border-b border-slate-200 dark:border-white/10 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 overflow-x-auto py-3 scrollbar-none">
            {next7Days.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`shrink-0 flex flex-col items-center justify-center rounded-xl min-w-[64px] sm:min-w-[68px] py-2 px-3 transition-all ${
                    isSelected
                      ? 'bg-[#e8b634] text-slate-950 shadow-md font-black ring-2 ring-[#e8b634]/50'
                      : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 hover:border-[#e8b634] hover:bg-[#e8b634]/15 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}>
                    {d.isToday ? 'TODAY' : d.dayName}
                  </span>
                  <span className="text-lg font-black leading-tight my-0.5">
                    {d.dayNum}
                  </span>
                  <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}>
                    {d.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. Filter Chips Bar (Swipeable on Mobile)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#0c0e14] border-b border-slate-200 dark:border-white/10 py-3 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-500 text-xs font-medium mr-1 shrink-0">Formats:</span>
            {['ALL', '3D', 'IMAX 3D', '4DX', '2D'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 transition-all border ${
                  selectedFormat === fmt
                    ? 'bg-[#e8b634] border-[#e8b634] text-slate-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-[#12141c] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#e8b634] hover:bg-[#e8b634]/15 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {fmt === 'ALL' ? 'All Formats' : fmt}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1 shrink-0 hidden sm:block" />

            {[
              { label: 'Morning', val: 'MORNING' },
              { label: 'After 5 PM', val: 'AFTER_5PM' },
            ].map((slot) => (
              <button
                key={slot.val}
                onClick={() => setSelectedTimeSlot(selectedTimeSlot === slot.val ? 'ALL' : slot.val)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 transition-all border ${
                  selectedTimeSlot === slot.val
                    ? 'bg-[#e8b634] border-[#e8b634] text-slate-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-[#12141c] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#e8b634] hover:bg-[#e8b634]/15 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
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
      <div className="bg-slate-50 dark:bg-[#0e1017] border-b border-slate-200 dark:border-white/10 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#e8b634]" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Bookings open for shows tomorrow</span>
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
              — Christie 4K Laser & RGB Laser projection available at select venues.
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. Theatres & Showtimes Listing
          ========================================================================= */}
      <main ref={showtimesRef} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className="space-y-5">
          {theatres.map((theatre) => {
            let theatreShows = dateShows.filter((s) => s.theatreId === theatre.id);
            if (theatreShows.length === 0) {
              theatreShows = shows.filter((s) => s.theatreId === theatre.id);
            }

            const isLiked = !!likedTheatres[theatre.id];
            const tImage = THEATRE_IMAGES[theatre.name] || '/Theater-images/Trendset Mall Cinema.jpg';

            return (
              <div
                key={theatre.id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1017] p-4 sm:p-6 shadow-sm transition-all hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md"
              >
                {/* Theatre Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    {/* Theatre Photography */}
                    <img
                      src={tImage}
                      alt={theatre.name}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/Theater-images/Trendset Mall Cinema.jpg';
                      }}
                    />

                    <div>
                      {/* Title & Distance */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={(e) => toggleLike(theatre.id, e)}
                          className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors"
                          title="Save as Favourite"
                        >
                          <Heart
                            className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                          />
                        </button>
                        <Link
                          href={`/theatre/${theatre.id}`}
                          className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white hover:text-amber-500 transition-colors"
                        >
                          {theatre.name}
                        </Link>
                        <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {theatre.distanceKm} km away
                        </span>
                      </div>

                      {/* Amenities Row */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                          <span>M-Ticket</span>
                        </span>

                        <span className="text-slate-300 dark:text-slate-600">•</span>

                        <span className="flex items-center gap-1 font-medium">
                          <Utensils className="h-3.5 w-3.5 text-slate-400" />
                          <span>Food & Beverage</span>
                        </span>

                        <span className="text-slate-300 dark:text-slate-600">•</span>

                        <button
                          onClick={() => setInfoModalTheatre(theatre)}
                          className="hover:underline flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <Info className="h-3.5 w-3.5 text-slate-400" />
                          <span>Venue Info</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        Audio: {movie.language} with English Subtitles
                      </p>
                    </div>
                  </div>

                  {/* 3D Seat Map Shortcut Button */}
                  <Link
                    href={`/book/${movie.id}?theatreId=${theatre.id}&date=${selectedDate}`}
                    className="self-stretch sm:self-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e8b634]/40 bg-[#e8b634]/10 hover:bg-[#e8b634]/20 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-amber-400 transition-all active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-[#e8b634]" />
                    <span>3D Seat Map</span>
                  </Link>
                </div>

                {/* Showtimes Grid */}
                <div className="mt-5">
                  {theatreShows.length > 0 ? (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4">
                      {theatreShows.map((show, idx) => {
                        const timeFormatted = show.showTime.slice(0, 5);
                        const isImax = (show.format || theatre.formats || '').includes('IMAX');
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
                              className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141c] hover:border-[#e8b634] dark:hover:border-[#e8b634] hover:bg-[#e8b634]/5 px-3 sm:px-5 py-2.5 sm:py-3 text-center transition-all w-full sm:min-w-[140px] hover:shadow-md hover:-translate-y-0.5"
                            >
                              {/* Screen & Tech Tag */}
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate max-w-full">
                                {screenTech}
                              </span>

                              {/* Prominent Showtime in Green */}
                              <span className="text-base sm:text-lg font-black text-[#15803d] dark:text-emerald-400 leading-tight">
                                {timeFormatted}
                              </span>

                              {/* Format & Price */}
                              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                                <span>{show.format || '3D'}</span>
                                <span>•</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">₹{price}</span>
                              </div>
                            </Link>

                            {/* Hover Tooltip with Price Tiers */}
                            {hoveredShowId === show.id && (
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-xl pointer-events-none hidden sm:block">
                                <span>Classic: ₹{price - 50} • Prime: ₹{price} • Recliner: ₹{price + 130}</span>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-900" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      <span>No shows available for this venue.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* =========================================================================
          6. Venue Guidelines Modal
          ========================================================================= */}
      {infoModalTheatre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0e1017] p-5 sm:p-6 text-slate-900 dark:text-white shadow-xl border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setInfoModalTheatre(null)}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <MapPin className="h-5 w-5 text-[#e8b634] shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{infoModalTheatre.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{infoModalTheatre.location}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="rounded-lg bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-3.5 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Venue Guidelines</h4>
                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300">
                  <li>M-Ticket accepted on your mobile device.</li>
                  <li>Basement and multi-level parking available.</li>
                  <li>Outside food and beverages are not allowed inside auditoriums.</li>
                  <li>Sanitized 3D glasses provided at entrance.</li>
                </ul>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-3.5 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Projection & Sound</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Equipped with Christie 4K Laser & VC RGB Laser projection systems with Dolby Atmos surround audio.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInfoModalTheatre(null)}
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
