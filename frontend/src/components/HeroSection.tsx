'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Compass, Play, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import anime from 'animejs';
import { Movie } from '@/types';

interface HeroSectionProps {
  movies: Movie[];
}

// 8 seconds per slide
const SLIDE_MS = 8000;

export default function HeroSection({ movies }: HeroSectionProps) {
  const [active, setActive] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Curate movie order: 1) Ramayana 2) Aakasamlo Oka Tara 3) OM 4) Remaining
  const list = useMemo(() => {
    if (!movies.length) return [];

    const ramayana = movies.find((m) => m.title.toLowerCase().includes('ramayana'));
    const aakasamlo = movies.find(
      (m) => m.title.toLowerCase().includes('aakasam') || m.title.toLowerCase().includes('okathara')
    );
    const om = movies.find(
      (m) => m.title.toLowerCase().startsWith('om') || m.title.toLowerCase().includes('battle within')
    );

    const prioritySet = new Set([ramayana?.id, aakasamlo?.id, om?.id].filter(Boolean));
    const remaining = movies.filter((m) => !prioritySet.has(m.id));

    const result: Movie[] = [];
    if (ramayana) result.push(ramayana);
    if (aakasamlo) result.push(aakasamlo);
    if (om) result.push(om);

    const featuredRemaining = remaining.filter((m) => m.featured);
    const nonFeaturedRemaining = remaining.filter((m) => !m.featured);

    return [...result, ...featuredRemaining, ...nonFeaturedRemaining];
  }, [movies]);

  const current = list[active] || null;

  const goTo = useCallback((idx: number) => {
    if (!list.length) return;
    const next = ((idx % list.length) + list.length) % list.length;
    setActive(next);
  }, [list.length]);

  // Auto-advance
  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % list.length);
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, [list.length, active]);

  // Reveal animation on slide change
  useEffect(() => {
    if (!contentRef.current) return;
    const items = contentRef.current.querySelectorAll('.hero-reveal');
    anime({
      targets: items,
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(60, { start: 60 }),
      duration: 650,
      easing: 'easeOutExpo',
    });
  }, [active]);

  if (!current) {
    return (
      <section className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-slate-950 dark:bg-[#07080B]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#e8b634]/30 border-t-[#e8b634]" />
      </section>
    );
  }

  // Max 6 visible dots on mobile to prevent overflow
  const maxDots = 7;
  const startDot = Math.max(0, Math.min(active - Math.floor(maxDots / 2), list.length - maxDots));
  const visibleDots = list.slice(startDot, startDot + maxDots);

  return (
    <section className="relative min-h-[78vh] sm:min-h-[92vh] w-full flex items-end overflow-hidden bg-slate-950 dark:bg-[#07080B]">
      {/* Horizontal Sliding Track */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {list.map((m, i) => (
            <div key={m.id} className="relative h-full w-full shrink-0 overflow-hidden">
              <img
                src={m.posterUrl}
                alt={m.title}
                className="h-full w-full object-cover object-top sm:object-center filter brightness-[0.92] sm:brightness-100"
                loading={i <= 1 ? 'eager' : 'lazy'}
                onError={(e) => {
                  const t = e.currentTarget;
                  if (!t.dataset.fallback) {
                    t.dataset.fallback = '1';
                    t.src = m.posterUrl.replace('/media/posters/', '/posters/');
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Cinematic Scrims - Brightened for crisp mobile visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 pt-24 sm:pt-36">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8">
          <div ref={contentRef} className="max-w-2xl">
            {/* Eyebrow */}
            <div className="hero-reveal flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#e8b634]">Now Showing</span>
              <span className="text-white/40">•</span>
              <span className="text-[11px] sm:text-xs font-medium text-white/75">In Theatres & 3D</span>
            </div>

            {/* Title - responsive font sizing */}
            <h1 className="hero-reveal font-display text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] break-words">
              {current.title}
            </h1>

            {/* Meta Info */}
            <div className="hero-reveal mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/90">
              <span className="flex items-center gap-1 font-bold text-[#e8b634]">
                <Star className="h-3.5 w-3.5 fill-[#e8b634]" />
                {current.rating.toFixed(1)}
              </span>
              <span className="text-white/40">•</span>
              <span>{current.genre}</span>
              <span className="text-white/40">•</span>
              <span>{Math.floor(current.durationMinutes / 60)}h {current.durationMinutes % 60}m</span>
              <span className="text-white/40">•</span>
              <span>{current.language}</span>
            </div>

            {/* Synopsis */}
            <p className="hero-reveal mt-3 sm:mt-4 line-clamp-2 sm:line-clamp-3 max-w-xl text-xs sm:text-base leading-relaxed text-white/80">
              {current.story}
            </p>

            {/* Pill CTAs - Full width on small mobile, auto on tablet+ */}
            <div className="hero-reveal mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
              <Link
                href={`/book/${current.id}`}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#e8b634] px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-black shadow-lg shadow-black/40 transition-all hover:bg-[#f3c64e] active:scale-[0.98]"
              >
                <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Book Tickets</span>
              </Link>
              <Link
                href={`/movie/${current.id}`}
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
                <span>Watch Trailer</span>
              </Link>
            </div>
          </div>

          {/* Full-Size Uncropped Poster Card (Desktop) */}
          <div className="hidden lg:block shrink-0 mb-2">
            <Link
              href={`/movie/${current.id}`}
              className="group relative block w-56 xl:w-64 aspect-[2/3] rounded-3xl overflow-hidden border border-white/20 bg-slate-900 shadow-[0_25px_60px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-105 hover:border-amber-400"
            >
              <img
                src={current.posterUrl}
                alt={current.title}
                className="h-full w-full object-cover object-top"
                onError={(e) => {
                  const t = e.currentTarget;
                  if (!t.dataset.fallback) {
                    t.dataset.fallback = '1';
                    t.src = current.posterUrl.replace('/media/posters/', '/posters/');
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs font-bold text-[#e8b634] flex items-center gap-1.5">
                  View Details & Showtimes
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Carousel Dots & Controls - Responsive */}
        <div className="mt-8 sm:mt-14 flex items-center justify-between gap-4">
          {/* Responsive Dots (Sliding window so mobile never overflows) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {visibleDots.map((m) => {
              const actualIndex = list.findIndex((x) => x.id === m.id);
              const isActive = actualIndex === active;
              return (
                <button
                  key={m.id}
                  onClick={() => goTo(actualIndex)}
                  className={`relative h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-300 focus:outline-none ${
                    isActive
                      ? 'w-6 sm:w-10 bg-white/25'
                      : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to ${m.title}`}
                >
                  {isActive && (
                    <span
                      key={`progress-${active}`}
                      className="absolute inset-0 bg-[#e8b634] rounded-full animate-hero-progress"
                    />
                  )}
                </button>
              );
            })}
            <span className="text-[10px] text-white/50 font-mono ml-2">
              {active + 1}/{list.length}
            </span>
          </div>

          {/* Arrow Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => goTo(active - 1)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => goTo(active + 1)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
