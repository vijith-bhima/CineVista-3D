'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
  isDataReady?: boolean;
}

const ALL_POSTERS = [
  '/media/posters/Salar.jpg',
  '/media/posters/Kalki-2898AD.jpg',
  '/media/posters/Pushpa-2.jpg',
  '/media/posters/RRR.jpg',
  '/media/posters/KGF.jpg',
  '/media/posters/Vikram.jpg',
  '/media/posters/OG.jpg',
  '/media/posters/Amaran.jpg',
  '/media/posters/Bahubali.jpg',
  '/media/posters/kantara-2.jpg',
  '/media/posters/Dhurandhar.jpg',
  '/media/posters/saaho.jpg',
  '/media/posters/Jailer-2.jpg',
  '/media/posters/Khaithi.jpg',
  '/media/posters/Arjun-reddy.jpg',
  '/media/posters/Rangasthalam.jpg',
  '/media/posters/Ala-vikuntapuramlo.jpg',
  '/media/posters/Sita-ramam.jpg',
  '/media/posters/Major.jpg',
  '/media/posters/HIT-3.jpg',
  '/media/posters/Sarinodu.jpg',
  '/media/posters/Karrupu.jpg',
  '/media/posters/Jersy.jpg',
  '/media/posters/worldoframayan.jpg',
  '/media/posters/VIP-2.jpg',
  '/media/posters/Karthikeya-2.jpg',
  '/media/posters/maharshi-indian-movie-poster.jpg',
  '/media/posters/Irumudi.jpg',
  '/media/posters/Akasamlo-okathara.jpg',
  '/media/posters/OM.jpg',
];

function PosterCard({ src }: { src: string }) {
  return (
    <div className="relative w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 lg:w-44 lg:h-64 shrink-0 rounded-lg sm:rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow-[0_12px_28px_rgba(0,0,0,0.85)]">
      <img
        src={src}
        alt="Movie poster"
        className="h-full w-full object-cover object-top filter brightness-[0.98] contrast-[1.1]"
        loading="eager"
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.dataset.fallback) {
            target.dataset.fallback = '1';
            target.src = src.replace('/media/posters/', '/posters/');
          }
        }}
      />
      {/* Specular gloss sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      {/* Subtle border highlight */}
      <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
    </div>
  );
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Keep stable reference so parent re-renders never cancel the 3.0s timer
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Guaranteed 3.0 seconds duration, smoothly paced
  useEffect(() => {
    const TOTAL_DURATION_MS = 3000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.floor((elapsed / TOTAL_DURATION_MS) * 100));
      setProgress(currentPct);

      if (elapsed >= TOTAL_DURATION_MS) {
        clearInterval(interval);
        setDone(true);
        setTimeout(() => {
          onCompleteRef.current();
        }, 350);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  // EXACTLY 6 DISTINCT ROWS (Seamless, full-width repeating strips)
  // Each row contains 6 unique posters repeated 4 times for a smooth infinite loop
  const row1 = useMemo(() => {
    const s = [ALL_POSTERS[0], ALL_POSTERS[1], ALL_POSTERS[2], ALL_POSTERS[3], ALL_POSTERS[4], ALL_POSTERS[5]];
    return [...s, ...s, ...s, ...s];
  }, []);

  const row2 = useMemo(() => {
    const s = [ALL_POSTERS[6], ALL_POSTERS[7], ALL_POSTERS[8], ALL_POSTERS[9], ALL_POSTERS[10], ALL_POSTERS[11]];
    return [...s, ...s, ...s, ...s];
  }, []);

  const row3 = useMemo(() => {
    const s = [ALL_POSTERS[12], ALL_POSTERS[13], ALL_POSTERS[14], ALL_POSTERS[15], ALL_POSTERS[16], ALL_POSTERS[17]];
    return [...s, ...s, ...s, ...s];
  }, []);

  const row4 = useMemo(() => {
    const s = [ALL_POSTERS[18], ALL_POSTERS[19], ALL_POSTERS[20], ALL_POSTERS[21], ALL_POSTERS[22], ALL_POSTERS[23]];
    return [...s, ...s, ...s, ...s];
  }, []);

  const row5 = useMemo(() => {
    const s = [ALL_POSTERS[24], ALL_POSTERS[25], ALL_POSTERS[26], ALL_POSTERS[27], ALL_POSTERS[0], ALL_POSTERS[1]];
    return [...s, ...s, ...s, ...s];
  }, []);

  const row6 = useMemo(() => {
    const s = [ALL_POSTERS[2], ALL_POSTERS[5], ALL_POSTERS[8], ALL_POSTERS[11], ALL_POSTERS[14], ALL_POSTERS[17]];
    return [...s, ...s, ...s, ...s];
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            filter: 'blur(8px)',
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black select-none"
        >
          {/* Subtle Ambient Core Glow */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

          {/* =========================================================================
              EXACTLY 6 ROWS OF 3D MOVING POSTERS — ALL 6 CLEARLY VISIBLE ON SCREEN
              ========================================================================= */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <div
              className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-[160vw] sm:w-[140vw] shrink-0 justify-center items-center"
              style={{
                transform: 'perspective(1000px) rotateX(14deg) rotateY(-5deg) rotateZ(-8deg) scale(1.05)',
                transformOrigin: 'center center',
              }}
            >
              {/* Row 1 - Smooth Left (28s) */}
              <div className="animate-marquee-left flex gap-2 sm:gap-3 md:gap-4 w-max" style={{ animationDuration: '28s' }}>
                {row1.map((p, i) => (
                  <PosterCard key={`r1-${i}`} src={p} />
                ))}
              </div>

              {/* Row 2 - Smooth Right (31s) */}
              <div className="animate-marquee-right flex gap-2 sm:gap-3 md:gap-4 w-max" style={{ animationDuration: '31s' }}>
                {row2.map((p, i) => (
                  <PosterCard key={`r2-${i}`} src={p} />
                ))}
              </div>

              {/* Row 3 - Smooth Left (26s) */}
              <div className="animate-marquee-left flex gap-2 sm:gap-3 md:gap-4 w-max" style={{ animationDuration: '26s' }}>
                {row3.map((p, i) => (
                  <PosterCard key={`r3-${i}`} src={p} />
                ))}
              </div>

              {/* Row 4 - Smooth Right (29s) */}
              <div className="animate-marquee-right flex gap-2 sm:gap-3 md:gap-4 w-max" style={{ animationDuration: '29s' }}>
                {row4.map((p, i) => (
                  <PosterCard key={`r4-${i}`} src={p} />
                ))}
              </div>

              {/* Row 5 - Smooth Left (27s) */}
              <div className="animate-marquee-left flex gap-2 sm:gap-3 md:gap-4 w-max" style={{ animationDuration: '27s' }}>
                {row5.map((p, i) => (
                  <PosterCard key={`r5-${i}`} src={p} />
                ))}
              </div>

              {/* Row 6 - Smooth Right (30s) */}
              <div className="animate-marquee-right flex gap-2 sm:gap-3 md:gap-4 w-max" style={{ animationDuration: '30s' }}>
                {row6.map((p, i) => (
                  <PosterCard key={`r6-${i}`} src={p} />
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              CLEAN FLOATING LUXURY PROGRESS PILL AT BOTTOM (NO NAME OVERLAY, 3-SECOND TIMER)
              ========================================================================= */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <button
              onClick={() => {
                setProgress(100);
                setDone(true);
                onCompleteRef.current();
              }}
              className="flex items-center gap-3.5 rounded-full bg-black/85 border border-white/20 backdrop-blur-xl px-5 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.9)] hover:border-amber-400/60 transition-all cursor-pointer group"
              title="Click to enter immediately"
            >
              {/* Progress Line */}
              <div className="relative w-36 sm:w-48 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-[#e8b634] to-yellow-300 shadow-[0_0_12px_rgba(232,182,52,0.9)] transition-all duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Percentage Number */}
              <span className="font-mono text-xs font-bold text-white tabular-nums tracking-wider">
                {progress}%
              </span>

              {/* Glowing amber dot indicator */}
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8b634]" />
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
