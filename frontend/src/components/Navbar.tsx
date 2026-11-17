'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Ticket, MapPin, ChevronDown, User, Sun, Moon, X, Menu, LogOut, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { label: 'Now Showing', href: '/#movies' },
  { label: 'Coming Soon', href: '/#upcoming' },
  { label: 'Cinemas', href: '/#theatres' },
  { label: 'Offers', href: '/#offers' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, openAuthModal, logout } = useAuth();

  const [ticketCount, setTicketCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cinevista_my_tickets');
      if (stored) {
        const list = JSON.parse(stored);
        setTicketCount(list.length);
      }
    } catch {}
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl bg-white/95 dark:bg-[#07080B]/90 border-slate-200 dark:border-white/10 shadow-xs transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        {/* Brand + Desktop Links */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="rounded-xl bg-[#f5c518] px-2.5 py-1 text-xs font-black tracking-widest text-black uppercase shadow-md shadow-[#f5c518]/20">
              CINEVISTA
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-slate-300"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden lg:flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-slate-300"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* City Selector */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white cursor-pointer transition-colors shadow-2xs">
            <MapPin className="h-3.5 w-3.5 text-[#f5c518]" />
            <span>Vijayawada</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-[#f5c518]" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {/* My Tickets Link */}
          <Link
            href="/tickets"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white transition-all shadow-2xs"
          >
            <Ticket className="h-3.5 w-3.5 text-[#f5c518] shrink-0" />
            <span className="hidden sm:inline">My Tickets</span>
            {ticketCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f5c518] px-1 text-[10px] font-bold text-black">
                {ticketCount}
              </span>
            )}
          </Link>

          {/* User Account / Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            {user ? (
              // Authenticated User Avatar Pill
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white/10 border border-slate-700 dark:border-white/20 pl-1 pr-2.5 py-1 text-xs font-bold text-white shadow-xs hover:border-[#f5c518] transition-all"
                title="Account Menu"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5c518] text-black font-black text-[11px] uppercase">
                  {user.username.charAt(0)}
                </div>
                <span className="hidden md:inline max-w-[90px] truncate">{user.username}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            ) : (
              // Guest "Sign In" Button
              <button
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f5c518] hover:bg-[#d4a52e] text-black px-3.5 py-1.5 text-xs font-bold shadow-md shadow-[#f5c518]/20 transition-all"
                title="Sign In / Register"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {userDropdownOpen && user && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1017] p-2 shadow-2xl z-50 text-slate-900 dark:text-white animate-fade-in">
                <div className="p-3 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate">{user.username}</p>
                    <span className="rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] px-1.5 py-0.5">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                </div>

                <div className="p-1 space-y-1 text-xs font-semibold">
                  <Link
                    href="/tickets"
                    className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <Ticket className="h-3.5 w-3.5 text-[#f5c518]" />
                    <span>My Admission Passes</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-white/10 px-4 py-2.5 bg-white dark:bg-[#07080B]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search movies, theatres..."
              className="w-full rounded-full border pl-8 pr-4 py-1.5 text-xs border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#07080B] px-4 py-3 shadow-lg">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
