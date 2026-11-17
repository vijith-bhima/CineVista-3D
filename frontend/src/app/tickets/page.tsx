'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket, Calendar, Clock, MapPin, ArrowRight, QrCode, Eye } from 'lucide-react';
import { getBookings } from '@/lib/api';
import { Booking } from '@/types';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cinevista_my_tickets');
    let localList: Booking[] = [];
    if (stored) {
      try {
        localList = JSON.parse(stored);
      } catch {}
    }

    getBookings()
      .then((serverList) => {
        const map = new Map<string, Booking>();
        localList.forEach((b) => map.set(b.ticketId, b));
        serverList.forEach((b) => map.set(b.ticketId, b));
        const merged = Array.from(map.values());
        if (merged.length === 0) {
          merged.push({
            bookingId: 894120,
            ticketId: 'CV-RAMA98',
            showId: 101,
            movieTitle: 'Ramayana: The Legend',
            theatreName: 'INOX Megacity Mall',
            showDate: '2026-11-17',
            showTime: '10:00:00',
            seats: ['E7', 'E8'],
            totalAmount: 539.00,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString(),
            screenNumber: 2,
          });
        }
        setTickets(merged);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load tickets from server:', err);
        setTickets(localList);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#FAFAFA] dark:bg-[#07080B] transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8b634] border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA] dark:bg-[#07080B] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200 dark:border-white/10">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
              My Tickets
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {tickets.length === 1 ? '1 admission pass' : `${tickets.length} admission passes`}
            </p>
          </div>
          <Link
            href="/#movies"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e8b634] hover:text-[#d8a529] transition-colors"
          >
            <span>Browse movies</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Empty State */}
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1017] p-12 text-center shadow-sm transition-colors">
            <div className="h-14 w-14 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500">
              <Ticket className="h-7 w-7" />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">No Tickets Yet</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your booked passes with verified entrance QR codes will appear here automatically.
            </p>
            <Link
              href="/#movies"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#e8b634] px-6 py-3 text-xs font-bold text-slate-950 hover:bg-[#d8a529] transition-colors shadow-sm"
            >
              <span>Explore movies</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticketId}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1017] p-5 sm:p-6 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  {/* Left: Movie & Showtime Details */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">
                        {ticket.ticketId}
                      </span>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                      {ticket.movieTitle}
                    </h2>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium">{ticket.theatreName}</span>
                        <span className="text-slate-400">(Screen {ticket.screenNumber || 1})</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium">{ticket.showDate}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[#e8b634] font-bold">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{ticket.showTime}</span>
                      </span>
                    </div>

                    {/* Seats */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Seats:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ticket.seats.map((seat) => (
                          <span
                            key={seat}
                            className="rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-2 py-0.5 text-xs font-bold text-slate-800 dark:text-white"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-white/10 gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block">Total Paid</span>
                      <span className="font-display text-xl font-bold text-slate-950 dark:text-[#f5c518]">
                        ₹{ticket.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <Link
                      href={`/ticket/${ticket.ticketId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-[#e8b634] hover:bg-slate-800 dark:hover:bg-[#d8a529] text-white dark:text-black px-4 py-2.5 text-xs font-bold transition-colors shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View QR Pass</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
