'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Printer, Ticket, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { getBooking } from '@/lib/api';
import { Booking } from '@/types';

export default function TicketConfirmationPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;

    const stored = localStorage.getItem('cinevista_my_tickets');
    if (stored) {
      try {
        const list: Booking[] = JSON.parse(stored);
        const match = list.find((b) => b.ticketId === ticketId);
        if (match) {
          setBooking(match);
          setLoading(false);
          return;
        }
      } catch {}
    }

    getBooking(ticketId)
      .then((b) => {
        setBooking(b);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching ticket:', err);
        setLoading(false);
      });
  }, [ticketId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#FAFAFA] dark:bg-[#07080B] transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8b634] border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Retrieving your ticket...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4 bg-[#FAFAFA] dark:bg-[#07080B] transition-colors duration-200">
        <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 mb-3 shadow-sm">
          <Ticket className="h-7 w-7" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Ticket Not Found</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The ticket code {ticketId} does not exist or has expired.</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-[#e8b634] px-6 py-3 text-xs font-bold text-slate-950 hover:bg-[#d8a529] transition-colors shadow-sm"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA] dark:bg-[#07080B] py-12 px-4 sm:px-6 transition-colors duration-200">
      <div className="mx-auto max-w-lg">
        {/* Confirmation Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 mb-3 shadow-xs">
            <Check className="h-7 w-7 stroke-[3]" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your admission pass is ready. Present this QR code at the cinema gate.
          </p>
        </div>

        {/* Physical Boarding Pass Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1017] shadow-xl transition-colors">
          {/* Top Accent Ribbon */}
          <div className="border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#12141c] px-6 py-3.5 flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Gate Pass</span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/30 px-2.5 py-0.5 rounded-full">
              {booking.ticketId}
            </span>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* Movie Title */}
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Feature Presentation</p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 leading-snug">
                {booking.movieTitle}
              </h2>
            </div>

            {/* Theatre & Screening Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5 font-medium">Theatre & Screen</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{booking.theatreName}</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Screen {booking.screenNumber || 2} • 4K Laser</p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5 font-medium">Date & Showtime</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{booking.showDate}</p>
                <p className="text-amber-700 dark:text-[#f5c518] font-extrabold mt-0.5">{booking.showTime}</p>
              </div>
            </div>

            {/* Reserved Seats */}
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Reserved Seats ({booking.seats.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {booking.seats.map((seat) => (
                  <span
                    key={seat}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-black text-slate-800 dark:text-white"
                  >
                    <span className="text-slate-400 dark:text-slate-500 font-medium text-[10px]">Seat</span>
                    <span>{seat}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Perforation Line with cutout notches */}
            <div className="relative py-1">
              <div className="absolute -left-9 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#FAFAFA] dark:bg-[#07080B] border border-slate-200 dark:border-white/10" />
              <div className="absolute -right-9 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#FAFAFA] dark:bg-[#07080B] border border-slate-200 dark:border-white/10" />
              <div className="border-b border-dashed border-slate-300 dark:border-white/20 w-full" />
            </div>

            {/* Total Amount & QR Code */}
            <div className="flex items-center justify-between gap-6 pt-1">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block">Total Paid</span>
                <span className="font-display text-2xl font-black text-slate-950 dark:text-[#f5c518] mt-0.5 block">
                  ₹{booking.totalAmount.toFixed(2)}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 stroke-[3]" /> Payment Successful
                </span>
              </div>

              {/* QR Code Container (always bright white background for optical scannability) */}
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  {booking.qrCodeBase64 || booking.qrCode ? (
                    <img
                      src={`data:image/png;base64,${booking.qrCodeBase64 || booking.qrCode}`}
                      alt="Booking QR code"
                      className="h-24 w-24 object-contain"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-slate-100 flex flex-col items-center justify-center text-[10px] text-slate-700 font-bold text-center">
                      <QrCode className="h-8 w-8 text-slate-800 mb-1" />
                      <span>GATE PASS</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                  Scan at entrance
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 w-full sm:flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1017] py-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#181c28] hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>Print ticket</span>
          </button>

          <Link
            href="/tickets"
            className="flex items-center justify-center gap-2 w-full sm:flex-1 rounded-xl bg-[#e8b634] py-3.5 text-xs font-bold text-slate-950 hover:bg-[#d8a529] transition-colors shadow-sm"
          >
            <Ticket className="h-4 w-4" />
            <span>My tickets</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
