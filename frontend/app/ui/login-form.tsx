'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ButtonGlimmer } from './button-glimmer';
import { login } from '@/app/actions/auth';
import Captcha from './captcha';
import { useState } from 'react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError('');

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 font-sans">
      {/* Header - Space Terminal Style */}
      <div className="space-y-2 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-black tracking-tight text-white">
          ACCESS TERMINAL
        </h2>
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
          // Secure Authentication Required
        </p>
      </div>

      {/* Form Fields */}
      <div className="w-full space-y-5">
        {/* Email Field */}
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
            htmlFor="email"
          >
            <span className="text-blue-400">01</span> // Email Address
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              id="email"
              type="email"
              name="email"
              placeholder="user@transcendence.com"
              required
              disabled={isPending}
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
            {/* Cyber grid effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
            htmlFor="password"
          >
            <span className="text-blue-400">02</span> // Secure Key
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••••••"
              required
              minLength={6}
              disabled={isPending}
            />
            <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
            {/* Cyber grid effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
          </div>
        </div>

        {/* CAPTCHA Section */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              <span className="text-blue-400">03</span> // Verification
            </span>
          </div>
          <Captcha />
        </div>
      </div>

      {/* Submit Button - Holographic Style */}
      <ButtonGlimmer
        type="submit"
        className="w-full h-12 text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            AUTHENTICATING...
          </span>
        ) : (
          'INITIALIZE LOGIN SEQUENCE →'
        )}
      </ButtonGlimmer>

      {/* Error Message - Cyber Alert Style */}
      <div className="min-h-[2rem]" aria-live="polite" aria-atomic="true">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
            <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-red-300 mb-1">
                ACCESS DENIED
              </p>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-slate-500">System Online</span>
          </div>
          <span className="font-mono text-slate-600">v2.0.42</span>
        </div>
      </div>
    </form>
  );
}