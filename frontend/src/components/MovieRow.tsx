'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/types';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
}

export default function MovieRow({ title, subtitle, movies }: MovieRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-end justify-between gap-4">
        <div>
          {subtitle && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8b634]">
              {subtitle}
            </p>
          )}
          <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h2>
        </div>

        {/* Scroll Buttons (Desktop only, mobile users swipe naturally) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/10 transition-all hover:text-slate-900 dark:hover:text-white active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/10 transition-all hover:text-slate-900 dark:hover:text-white active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroller - 100% Guaranteed Visible & Touch-Swipeable */}
      <div
        ref={scrollerRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="group w-36 xs:w-40 sm:w-48 md:w-52 shrink-0 snap-start overflow-hidden rounded-2xl bg-white dark:bg-[#0e1017] shadow-sm border border-slate-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-400/50"
          >
            {/* Cinema 2:3 aspect ratio ensures poster fits without distortion */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = movie.posterUrl.replace('/media/posters/', '/posters/');
                  }
                }}
              />
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-slate-950/80 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-amber-400 backdrop-blur-sm border border-white/10 shadow-xs">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {movie.rating.toFixed(1)}
              </span>
            </div>

            {/* Movie Info */}
            <div className="p-2.5 sm:p-3.5">
              <h3 className="font-display truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                {movie.title}
              </h3>
              <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate max-w-[65%]">{movie.genre}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {movie.durationMinutes}m
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
