'use client';

import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center bg-[#08090c] text-center px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8b634] border-t-transparent mb-3" />
      <span className="text-xs text-[#6b7280]">Loading...</span>
    </div>
  );
}
