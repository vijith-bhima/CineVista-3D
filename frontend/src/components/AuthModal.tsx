'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (authMode === 'login') {
      const res = await login(username, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to sign in');
      }
    } else {
      if (!email.includes('@')) {
        setLoading(false);
        setError('Please enter a valid email address');
        return;
      }
      const res = await register(username, email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to create account');
      }
    }
  };

  const fillDemoAccount = () => {
    setUsername('demo');
    setPassword('demo123');
    setError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1017] p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Logo badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-xl bg-[#f5c518] px-2.5 py-1 text-xs font-black tracking-widest text-black uppercase shadow-xs">
              CINEVISTA 3D
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl mt-2">
            {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            {authMode === 'login'
              ? 'Sign in to access your bookings, saved seats & e-tickets'
              : 'Join CineVista to unlock 3D seat previews and instant QR gate passes'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-white dark:bg-[#181c28] text-slate-950 dark:text-[#f5c518] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-white dark:bg-[#181c28] text-slate-950 dark:text-[#f5c518] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email for login, Username for register */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {authMode === 'login' ? 'Username or Email' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={authMode === 'login' ? 'e.g. demo or demo@cinevista.com' : 'Choose a username'}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181c28] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#e8b634] focus:outline-none focus:ring-2 focus:ring-[#e8b634]/30"
                />
              </div>
            </div>

            {/* Email (Register only) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181c28] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#e8b634] focus:outline-none focus:ring-2 focus:ring-[#e8b634]/30"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181c28] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#e8b634] focus:outline-none focus:ring-2 focus:ring-[#e8b634]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e8b634] hover:bg-[#d8a529] py-3 text-sm font-bold text-slate-950 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              ) : (
                <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Demo account quick fill button */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Evaluating or testing?</span>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <Sparkles className="h-3 w-3" />
              <span>Fill Demo Credentials</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
