'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Preloader from '@/components/Preloader';
import HeroSection from '@/components/HeroSection';
import MovieRow from '@/components/MovieRow';
import MovieFiltersAndGrid from '@/components/MovieFiltersAndGrid';
import TheatresSection from '@/components/TheatresSection';
import { getMovies, getTheatres } from '@/lib/api';
import { Movie, Theatre } from '@/types';

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  // Load initial movies & theatres in the background while preloader is running
  useEffect(() => {
    async function loadData() {
      try {
        const [mList, tList] = await Promise.all([getMovies(), getTheatres()]);
        setMovies(mList);
        setTheatres(tList);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsDataReady(true);
      }
    }
    loadData();
  }, []);

  // Stable callback so preloader never resets or unmounts early
  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
  }, []);

  // Curated Coming Soon row:
  // 1) OM
  // 2) Aakasamlo Oka Tara
  // 3) Ramayana
  // Followed by other upcoming/anticipated titles
  const upcoming = useMemo(() => {
    if (!movies.length) return [];

    const om = movies.find(
      (m) => m.title.toLowerCase().startsWith('om') || m.title.toLowerCase().includes('battle within')
    );
    const aakasamlo = movies.find(
      (m) => m.title.toLowerCase().includes('aakasam') || m.title.toLowerCase().includes('okathara')
    );
    const ramayana = movies.find((m) => m.title.toLowerCase().includes('ramayana'));

    const priorityIds = new Set([om?.id, aakasamlo?.id, ramayana?.id].filter(Boolean));

    // Other anticipated upcoming titles
    const otherUpcomingKeywords = ['og', 'kantara', 'jailer', 'hit:', 'dhurandhar', 'karuppu'];
    const otherUpcoming = movies.filter((m) => {
      if (priorityIds.has(m.id)) return false;
      return otherUpcomingKeywords.some((kw) => m.title.toLowerCase().includes(kw));
    });

    const result: Movie[] = [];
    if (om) result.push(om);
    if (aakasamlo) result.push(aakasamlo);
    if (ramayana) result.push(ramayana);

    return [...result, ...otherUpcoming];
  }, [movies]);

  // Curated Trending Now row (current in-theatre blockbusters & top hits, distinct with NO overlap)
  const trending = useMemo(() => {
    if (!movies.length) return [];
    const upcomingIds = new Set(upcoming.map((m) => m.id));

    return movies
      .filter((m) => !upcomingIds.has(m.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }, [movies, upcoming]);

  return (
    <>
      {showPreloader && (
        <Preloader onComplete={handlePreloaderComplete} isDataReady={isDataReady} />
      )}

      <div className="flex min-h-screen flex-col bg-[#fafafa] dark:bg-[#07080B] text-slate-900 dark:text-white transition-colors duration-200">
        <HeroSection movies={movies} />
        <div id="trending" className="pt-6 sm:pt-12">
          {trending.length > 0 && (
            <MovieRow title="Trending Now" subtitle="Top Rated in Theatres" movies={trending} />
          )}
        </div>
        <div id="upcoming" className="mt-2 sm:mt-4">
          {upcoming.length > 0 && (
            <MovieRow title="Coming Soon" subtitle="Anticipated Releases" movies={upcoming} />
          )}
        </div>
        <div className="mt-6 border-t border-slate-200 dark:border-white/10">
          <MovieFiltersAndGrid movies={movies} />
        </div>
        <TheatresSection theatres={theatres} />
      </div>
    </>
  );
}
