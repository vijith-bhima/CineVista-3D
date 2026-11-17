'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { MonitorPlay, Volume2, Armchair, Sparkles } from 'lucide-react';

const STATS = [
  { icon: MonitorPlay, label: '4K Laser', desc: 'Crystal-clear projection' },
  { icon: Volume2, label: 'Dolby Atmos', desc: 'Immersive 3D audio' },
  { icon: Armchair, label: 'Recliners', desc: 'Ergonomic comfort' },
  { icon: Sparkles, label: 'Real-time 3D', desc: 'Preview your exact seat' },
];

export default function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !revealedRef.current) {
          revealedRef.current = true;
          const items = el.querySelectorAll('.stat-item');
          if (items.length) anime({ targets: items, translateY: [24, 0], opacity: [0, 1], scale: [0.96, 1], delay: anime.stagger(80), duration: 550, easing: 'easeOutExpo' });
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="stat-item flex items-center gap-4 rounded-2xl bg-white dark:bg-[#0e1017] p-5 shadow-sm border border-slate-200 dark:border-white/10"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-400/20">
              <s.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white">{s.label}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
