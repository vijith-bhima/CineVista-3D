'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import anime from 'animejs';
import Link from 'next/link';
import { MapPin, Search, ArrowRight, X, Sparkles } from 'lucide-react';
import { Theatre } from '@/types';

interface TheatresSectionProps {
  theatres: Theatre[];
}

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
  'PVP Square Mall': '/Theater-images/PVP Square Mall.jpg',
};

// Format badges
function getFormatBadgeStyle(fmt: string): string {
  const f = fmt.toUpperCase().trim();
  if (f.includes('IMAX')) return 'bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800';
  if (f.includes('4DX')) return 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
  if (f.includes('ATMOS') || f.includes('DOLBY')) return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  if (f.includes('3D')) return 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  return 'bg-slate-50 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10';
}

export default function TheatresSection({ theatres }: TheatresSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const revealedRef = useRef(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Entrance animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !revealedRef.current) {
          revealedRef.current = true;
          const head = el.querySelector('.theatre-head');
          if (head) anime({ targets: head, translateY: [24, 0], opacity: [0, 1], duration: 600, easing: 'easeOutExpo' });
          const cards = el.querySelectorAll('.theatre-card');
          if (cards.length) anime({ targets: cards, translateY: [32, 0], opacity: [0, 1], delay: anime.stagger(60), duration: 550, easing: 'easeOutExpo' });
          obs.disconnect();
        }
      });
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const allFormats = useMemo(() => {
    const set = new Set<string>();
    theatres.forEach((t) => {
      (t.formats || '').split(',').map((f) => f.trim()).filter(Boolean).forEach((f) => set.add(f.toUpperCase()));
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [theatres]);

  const filteredTheatres = useMemo(() => {
    return theatres.filter((t) => {
      const name = t.name || '';
      const location = t.location || '';
      const matchSearch =
        searchQuery === '' ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFormat = selectedFormat === 'ALL' || (t.formats || '').toUpperCase().includes(selectedFormat);
      return matchSearch && matchFormat;
    });
  }, [theatres, searchQuery, selectedFormat]);

  const resetFilters = () => {
    setSelectedFormat('ALL');
    setSearchQuery('');
  };

  return (
    <section ref={sectionRef} id="theatres" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="theatre-head flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8b634]">Premium Venues</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Cinemas & Theatres
          </h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
            Experience movies in immersive 3D, Dolby Atmos, and 4K laser projection across the city's most premium multiplexes.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by theatre or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141c] py-2.5 pl-10 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Format Filter Bar - Swipeable on mobile */}
      <div className="theatre-head mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedFormat('ALL')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            selectedFormat === 'ALL'
              ? 'bg-slate-900 dark:bg-[#e8b634] text-white dark:text-black shadow-sm'
              : 'bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
          }`}
        >
          All Venues ({theatres.length})
        </button>

        {allFormats.filter((f) => f !== 'ALL').map((fmt) => {
          const count = theatres.filter((t) => t.formats.toUpperCase().includes(fmt)).length;
          const isActive = selectedFormat === fmt;
          return (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(isActive ? 'ALL' : fmt)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-[#e8b634] text-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              {fmt} <span className="opacity-60 text-[10px]">({count})</span>
            </button>
          );
        })}

        {(searchQuery || selectedFormat !== 'ALL') && (
          <button
            onClick={resetFilters}
            className="ml-2 shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Gallery / Grid of Theatres */}
      {filteredTheatres.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 py-16 text-center">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No theatres match your selection.</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Try searching for a different name or resetting the filters.</p>
          <button
            onClick={resetFilters}
            className="mt-4 rounded-xl bg-slate-900 dark:bg-[#e8b634] px-4 py-2 text-xs font-bold text-white dark:text-black shadow-sm hover:bg-slate-800 transition-all"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTheatres.map((theatre) => {
            const formats = theatre.formats.split(',').map((f) => f.trim()).filter(Boolean);
            const imageSrc = THEATRE_IMAGES[theatre.name] || '/Theater-images/CineVista Grand IMAX.jpg';

            return (
              <div
                key={theatre.id}
                className="theatre-card group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#0e1017] shadow-sm border border-slate-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400/50"
              >
                {/* Theatre Photography */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={imageSrc}
                    alt={theatre.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/Theater-images/CineVista Grand IMAX.jpg';
                    }}
                  />

                  {/* Distance Pill */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 dark:bg-black/70 dark:text-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                      <MapPin className="h-3 w-3 text-[#e8b634]" />
                      {theatre.distanceKm} km away
                    </span>
                  </div>
                </div>

                {/* Theatre Details */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    {/* Title & Location */}
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white transition-colors group-hover:text-amber-500">
                      {theatre.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{theatre.location}</span>
                    </p>

                    {/* Format Badges */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {formats.map((fmt) => (
                        <span
                          key={fmt}
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getFormatBadgeStyle(fmt)}`}
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Showtimes Link */}
                  <div className="mt-5 border-t border-slate-100 dark:border-white/10 pt-4">
                    <Link
                      href={`/theatre/${theatre.id}`}
                      className="group/btn flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 transition-all hover:bg-slate-900 dark:hover:bg-[#e8b634] hover:text-white dark:hover:text-black"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#e8b634]" />
                        <span>View Theatre & Showtimes</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
