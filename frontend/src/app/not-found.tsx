'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center bg-[#08090c] text-center px-4">
      <span className="font-display text-6xl font-black text-white/20">404</span>
      <h2 className="font-display text-xl font-bold text-white mt-3">Page not found</h2>
      <p className="mt-1 text-sm text-[#6b7280] max-w-sm">
        The screening or page you are looking for does not exist or has moved.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e8b634] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#d6a52b] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to movies</span>
      </Link>
    </div>
  );
}
