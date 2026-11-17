'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import anime from 'animejs';
import { Search, Compass, X, Star, Clock, Globe } from 'lucide-react';
import { Movie } from '@/types';

interface MovieFiltersAndGridProps {
  movies: Movie[];
}

export default function MovieFiltersAndGrid({ movies }: MovieFiltersAndGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const sectionRef = useRef<HTMLElement>(null);
  const revealedRef = useRef(false);

  const languages = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.language && set.add(m.language.trim()));
    return ['All', ...Array.from(set).sort()];
  }, [movies]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      if (m.genre && typeof m.genre === 'string') m.genre.split('/').forEach((g) => set.add(g.trim()));
    });
    return ['All', ...Array.from(set).sort()];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const title = m.title || '';
      const genre = m.genre || '';
      const language = m.language || '';
      const matchSearch =
        searchTerm === '' ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        language.toLowerCase().includes(searchTerm.toLowerCase());
      const matchLang = selectedLanguage === 'All' || language === selectedLanguage;
      const matchGenre = selectedGenre === 'All' || genre.includes(selectedGenre);
      return matchSearch && matchLang && matchGenre;
    });
  }, [movies, searchTerm, selectedLanguage, selectedGenre]);

  const hasActiveFilters = searchTerm !== '' || selectedLanguage !== 'All' || selectedGenre !== 'All';
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('All');
    setSelectedGenre('All');
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !revealedRef.current) {
          revealedRef.current = true;
          const head = el.querySelector('.reveal-head');
          if (head) anime({ targets: head, translateY: [32, 0], opacity: [0, 1], duration: 650, easing: 'easeOutExpo' });
          const cards = el.querySelectorAll('.reveal-card');
          if (cards.length) anime({ targets: cards, translateY: [40, 0], opacity: [0, 1], scale: [0.97, 1], delay: anime.stagger(60), duration: 600, easing: 'easeOutExpo' });
          obs.disconnect();
        }
      });
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="movies" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="reveal-head flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8b634]">Now in Theatres</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            All movies
          </h2>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, genre, language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141c] py-3.5 pl-12 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter chips - Horizontal swipeable on mobile, wrapped on tablet+ */}
      <div className="reveal-head mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
        {languages.map((lang) => {
          const isActive = selectedLanguage === lang;
          return (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`shrink-0 rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-[#e8b634] text-white dark:text-black shadow-md'
                  : 'bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              {lang}
            </button>
          );
        })}
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10 shrink-0" />
        {genres.map((g) => {
          const isActive = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`shrink-0 rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-[#e8b634] text-white dark:text-black shadow-md'
                  : 'bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              {g}
            </button>
          );
        })}
        {hasActiveFilters && (
          <button onClick={resetFilters} className="ml-2 shrink-0 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg text-slate-500 dark:text-slate-400">No movies found. Try adjusting your filters.</p>
          <button onClick={resetFilters} className="mt-5 rounded-full bg-slate-900 dark:bg-[#e8b634] px-6 py-3 text-sm font-bold text-white dark:text-black transition-colors">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="reveal-card group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#0e1017] shadow-sm border border-slate-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-400/50"
            >
              {/* Cinema 2:3 aspect ratio ensures poster fits completely without clipping */}
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
                <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-0.5 text-[11px] font-black text-amber-400 backdrop-blur-sm border border-white/10 shadow-xs">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {movie.rating.toFixed(1)}
                </span>
              </div>
              {/* Info */}
              <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
                <div>
                  <h3 className="font-display truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{movie.genre}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{movie.durationMinutes}m</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{movie.language}</span>
                  <span className="flex items-center gap-1 font-bold text-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Book <Compass className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
