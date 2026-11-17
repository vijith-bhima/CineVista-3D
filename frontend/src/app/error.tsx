'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center bg-[#08090c] text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="font-display text-xl font-bold text-white">Something went wrong</h2>
      <p className="mt-2 text-sm text-[#6b7280] max-w-sm">
        {error.message || 'An unexpected error occurred while loading this view.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-xl bg-[#e8b634] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#d6a52b] transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Try again</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return home</span>
        </Link>
      </div>
    </div>
  );
}
